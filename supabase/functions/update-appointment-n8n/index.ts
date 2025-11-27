import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateAppointmentPayload {
  appointment_id: string;
  appointment_date?: string;
  appointment_time?: string;
  barber_id?: string;
  service_id?: string;
  notes?: string;
  status?: string;
  client_name?: string;
  client_phone?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received appointment update request from n8n');

    const payload: UpdateAppointmentPayload = await req.json();
    console.log('Payload:', JSON.stringify(payload, null, 2));

    // Validate required fields
    if (!payload.appointment_id || payload.appointment_id.trim() === '') {
      console.error('Missing required field: appointment_id');
      return new Response(
        JSON.stringify({ 
          error: 'Missing required field: appointment_id',
          success: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate date format if provided (YYYY-MM-DD)
    if (payload.appointment_date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(payload.appointment_date)) {
        console.error('Invalid date format:', payload.appointment_date);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid appointment_date format. Expected: YYYY-MM-DD',
            success: false 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Validate time format if provided (HH:MM)
    if (payload.appointment_time) {
      const timeRegex = /^\d{2}:\d{2}$/;
      if (!timeRegex.test(payload.appointment_time)) {
        console.error('Invalid time format:', payload.appointment_time);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid appointment_time format. Expected: HH:MM',
            success: false 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if appointment exists
    const { data: existingAppointment, error: fetchError } = await supabase
      .from('appointments')
      .select('id, status')
      .eq('id', payload.appointment_id)
      .single();

    if (fetchError || !existingAppointment) {
      console.error('Appointment not found:', payload.appointment_id);
      return new Response(
        JSON.stringify({ 
          error: 'Appointment not found',
          success: false 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check for conflicts if updating barber_id, date, or time
    const isUpdatingSchedule = 
      payload.barber_id !== undefined || 
      payload.appointment_date !== undefined || 
      payload.appointment_time !== undefined;

    if (isUpdatingSchedule) {
      console.log('Checking for appointment conflicts...');
      
      // Get current appointment data to fill in missing values
      const { data: currentAppointment, error: currentError } = await supabase
        .from('appointments')
        .select('barber_id, appointment_date, appointment_time')
        .eq('id', payload.appointment_id)
        .single();

      if (currentError || !currentAppointment) {
        console.error('Error fetching current appointment:', currentError);
        return new Response(
          JSON.stringify({ 
            error: 'Error fetching current appointment data',
            success: false 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Use provided values or fall back to current values
      const checkBarberId = payload.barber_id !== undefined ? payload.barber_id : currentAppointment.barber_id;
      const checkDate = payload.appointment_date || currentAppointment.appointment_date;
      const checkTime = payload.appointment_time || currentAppointment.appointment_time;

      // Only check for conflicts if barber_id is set
      if (checkBarberId) {
        const { data: existingAppointments, error: conflictCheckError } = await supabase
          .from('appointments')
          .select('id, client_name')
          .eq('barber_id', checkBarberId)
          .eq('appointment_date', checkDate)
          .eq('appointment_time', checkTime)
          .neq('status', 'Cancelado')
          .neq('id', payload.appointment_id); // Exclude current appointment

        if (conflictCheckError) {
          console.error('Error checking for conflicts:', conflictCheckError);
          return new Response(
            JSON.stringify({ 
              error: 'Error checking for appointment conflicts',
              details: conflictCheckError.message,
              success: false 
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        if (existingAppointments && existingAppointments.length > 0) {
          console.error('Appointment conflict detected:', existingAppointments[0]);
          return new Response(
            JSON.stringify({ 
              error: 'Horário já reservado para este barbeiro',
              details: `Já existe um agendamento para ${checkDate} às ${checkTime} com este barbeiro`,
              conflicting_appointment: existingAppointments[0],
              success: false 
            }),
            { 
              status: 409, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        console.log('No conflicts found, proceeding with appointment update');
      }
      
      // Check barber availability if updating to a new time/date/barber
      console.log('Checking barber availability...');
      
      // Get the day of week from the appointment date (0 = Sunday, 6 = Saturday)
      const appointmentDate = new Date(checkDate + 'T00:00:00');
      const dayOfWeek = appointmentDate.getDay();
      
      const { data: availability, error: availabilityError } = await supabase
        .from('user_availability')
        .select('*')
        .eq('user_id', checkBarberId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true)
        .maybeSingle();

      if (availabilityError) {
        console.error('Error checking availability:', availabilityError);
        return new Response(
          JSON.stringify({ 
            error: 'Error checking barber availability',
            details: availabilityError.message,
            success: false 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      if (!availability) {
        console.error('Barber not available on this day');
        return new Response(
          JSON.stringify({ 
            error: 'Barbeiro não disponível neste dia',
            details: `O barbeiro não atende neste dia da semana`,
            success: false 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Check if appointment time is within available hours
      if (checkTime < availability.start_time || checkTime >= availability.end_time) {
        console.error('Appointment time outside available hours');
        return new Response(
          JSON.stringify({ 
            error: 'Horário fora do expediente',
            details: `O barbeiro atende das ${availability.start_time.substring(0, 5)} às ${availability.end_time.substring(0, 5)} neste dia`,
            available_hours: {
              start: availability.start_time,
              end: availability.end_time
            },
            success: false 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log('Barber is available, proceeding with appointment update');
    }

    // Prepare update data
    const updateData: any = {};
    
    if (payload.appointment_date !== undefined) {
      updateData.appointment_date = payload.appointment_date;
    }
    if (payload.appointment_time !== undefined) {
      updateData.appointment_time = payload.appointment_time;
    }
    if (payload.barber_id !== undefined) {
      updateData.barber_id = payload.barber_id || null;
    }
    if (payload.service_id !== undefined) {
      updateData.service_id = payload.service_id || null;
    }
    if (payload.notes !== undefined) {
      updateData.notes = payload.notes?.trim() || null;
    }
    if (payload.status !== undefined) {
      updateData.status = payload.status;
    }
    if (payload.client_name !== undefined) {
      updateData.client_name = payload.client_name.trim();
    }
    if (payload.client_phone !== undefined) {
      updateData.client_phone = payload.client_phone?.trim() || null;
    }

    // Find or create client if client_phone is being updated
    if (payload.client_phone !== undefined && payload.client_phone) {
      console.log('Checking for existing client with phone:', payload.client_phone);
      
      // Try to find existing client by phone
      const { data: existingClient, error: clientSearchError } = await supabase
        .from('clients')
        .select('id')
        .eq('phone', payload.client_phone.trim())
        .single();
      
      if (clientSearchError && clientSearchError.code !== 'PGRST116') {
        console.error('Error searching for client:', clientSearchError);
      }
      
      if (existingClient) {
        console.log('Found existing client:', existingClient.id);
        updateData.client_id = existingClient.id;
      } else if (payload.client_name) {
        console.log('Creating new client...');
        
        // Create new client
        const { data: newClient, error: clientCreateError } = await supabase
          .from('clients')
          .insert({
            name: payload.client_name.trim(),
            phone: payload.client_phone.trim(),
          })
          .select('id')
          .single();
        
        if (clientCreateError) {
          console.error('Error creating client:', clientCreateError);
        } else {
          console.log('Created new client:', newClient.id);
          updateData.client_id = newClient.id;
        }
      }
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      console.error('No fields to update');
      return new Response(
        JSON.stringify({ 
          error: 'No fields provided to update',
          success: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Updating appointment with data:', JSON.stringify(updateData, null, 2));

    // Update appointment
    const { data: updatedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', payload.appointment_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating appointment:', updateError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to update appointment',
          details: updateError.message,
          success: false 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Appointment updated successfully:', updatedAppointment.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Appointment updated successfully',
        data: updatedAppointment 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

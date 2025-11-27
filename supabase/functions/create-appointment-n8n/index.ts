import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AppointmentPayload {
  client_name: string;
  client_phone?: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:MM
  barber_id?: string;
  service_id?: string;
  notes?: string;
  status?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received appointment creation request from n8n');

    // Parse request body
    const payload: AppointmentPayload = await req.json();
    console.log('Payload:', JSON.stringify(payload, null, 2));

    // Validate required fields
    if (!payload.client_name || payload.client_name.trim() === '') {
      console.error('Missing required field: client_name');
      return new Response(
        JSON.stringify({ 
          error: 'Missing required field: client_name',
          success: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!payload.appointment_date) {
      console.error('Missing required field: appointment_date');
      return new Response(
        JSON.stringify({ 
          error: 'Missing required field: appointment_date (format: YYYY-MM-DD)',
          success: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!payload.appointment_time) {
      console.error('Missing required field: appointment_time');
      return new Response(
        JSON.stringify({ 
          error: 'Missing required field: appointment_time (format: HH:MM)',
          success: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate date format (YYYY-MM-DD)
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

    // Validate time format (HH:MM)
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

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check for conflicts if barber_id is provided
    if (payload.barber_id) {
      console.log('Checking for appointment conflicts...');
      
      const { data: existingAppointments, error: conflictCheckError } = await supabase
        .from('appointments')
        .select('id, client_name')
        .eq('barber_id', payload.barber_id)
        .eq('appointment_date', payload.appointment_date)
        .eq('appointment_time', payload.appointment_time)
        .neq('status', 'Cancelado');

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
            details: `Já existe um agendamento para ${payload.appointment_date} às ${payload.appointment_time} com este barbeiro`,
            conflicting_appointment: existingAppointments[0],
            success: false 
          }),
          { 
            status: 409, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log('No conflicts found, proceeding with appointment creation');
    }

    // Check barber availability if barber_id is provided
    if (payload.barber_id) {
      console.log('Checking barber availability...');
      
      // Get the day of week from the appointment date (0 = Sunday, 6 = Saturday)
      const appointmentDate = new Date(payload.appointment_date + 'T00:00:00');
      const dayOfWeek = appointmentDate.getDay();
      
      const { data: availability, error: availabilityError } = await supabase
        .from('user_availability')
        .select('*')
        .eq('user_id', payload.barber_id)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true)
        .single();

      if (availabilityError && availabilityError.code !== 'PGRST116') {
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
      const appointmentTime = payload.appointment_time;
      if (appointmentTime < availability.start_time || appointmentTime >= availability.end_time) {
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

      console.log('Barber is available, proceeding with appointment creation');
    }

    // Check if appointment is during a break
    if (payload.barber_id) {
      console.log('Checking for breaks during appointment time...');
      
      const appointmentDate = new Date(payload.appointment_date + 'T00:00:00');
      const dayOfWeek = appointmentDate.getDay();
      
      // Get availability for this day
      const { data: availability } = await supabase
        .from('user_availability')
        .select('id')
        .eq('user_id', payload.barber_id)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true)
        .single();

      if (availability) {
        // Check if appointment conflicts with any break
        const { data: breaks } = await supabase
          .from('user_breaks')
          .select('break_name, break_start_time, break_end_time')
          .eq('user_availability_id', availability.id);

        if (breaks && breaks.length > 0) {
          const appointmentTime = payload.appointment_time;
          
          for (const breakItem of breaks) {
            // Check if appointment time falls within break period
            if (appointmentTime >= breakItem.break_start_time && appointmentTime < breakItem.break_end_time) {
              console.error('Appointment conflicts with break:', breakItem.break_name);
              return new Response(
                JSON.stringify({ 
                  error: 'Horário durante intervalo',
                  details: `Este horário está durante o intervalo de ${breakItem.break_name} (${breakItem.break_start_time.substring(0, 5)} - ${breakItem.break_end_time.substring(0, 5)})`,
                  break_info: {
                    name: breakItem.break_name,
                    start: breakItem.break_start_time,
                    end: breakItem.break_end_time
                  },
                  success: false 
                }),
                { 
                  status: 400, 
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
                }
              );
            }
          }
        }
      }

      console.log('No break conflicts, proceeding with appointment creation');
    }

    // Prepare appointment data
    const appointmentData = {
      client_name: payload.client_name.trim(),
      client_phone: payload.client_phone?.trim() || null,
      appointment_date: payload.appointment_date,
      appointment_time: payload.appointment_time,
      barber_id: payload.barber_id || null,
      service_id: payload.service_id || null,
      notes: payload.notes?.trim() || null,
      status: payload.status || 'Aguardando',
    };

    console.log('Creating appointment with data:', JSON.stringify(appointmentData, null, 2));

    // Insert appointment
    const { data: appointment, error: insertError } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting appointment:', insertError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create appointment',
          details: insertError.message,
          success: false 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Appointment created successfully:', appointment.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Appointment created successfully',
        data: appointment 
      }),
      { 
        status: 201, 
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

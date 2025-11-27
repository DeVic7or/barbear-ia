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

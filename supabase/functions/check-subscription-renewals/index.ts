import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Subscription {
  id: string;
  user_id: string;
  plan_name: string;
  next_payment_date: string;
  status: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    console.log('Starting subscription renewal check...');

    // Get current date and dates for 7 days and 3 days from now
    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(now.getDate() + 7);
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(now.getDate() + 3);

    // Fetch active subscriptions with upcoming renewals (within next 7 days)
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active')
      .not('next_payment_date', 'is', null)
      .lte('next_payment_date', sevenDaysFromNow.toISOString())
      .gte('next_payment_date', now.toISOString());

    if (subscriptionsError) {
      console.error('Error fetching subscriptions:', subscriptionsError);
      throw subscriptionsError;
    }

    console.log(`Found ${subscriptions?.length || 0} subscriptions expiring soon`);

    let notificationsCreated = 0;

    // Create notifications for each subscription
    for (const subscription of subscriptions || []) {
      const nextPaymentDate = new Date(subscription.next_payment_date);
      const daysUntilRenewal = Math.ceil((nextPaymentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Check if notification already exists for this subscription
      const { data: existingNotification } = await supabase
        .from('notifications')
        .select('id')
        .eq('related_subscription_id', subscription.id)
        .eq('read', false)
        .single();

      // Skip if notification already exists
      if (existingNotification) {
        console.log(`Notification already exists for subscription ${subscription.id}`);
        continue;
      }

      let title = '';
      let message = '';
      let type = 'info';

      // Create notification based on days until renewal
      if (daysUntilRenewal <= 3) {
        title = 'Renovação iminente!';
        message = `Seu plano ${subscription.plan_name} vence em ${daysUntilRenewal} ${daysUntilRenewal === 1 ? 'dia' : 'dias'}. Não perca o acesso!`;
        type = 'warning';
      } else if (daysUntilRenewal <= 7) {
        title = 'Renovação próxima';
        message = `Seu plano ${subscription.plan_name} vence em ${daysUntilRenewal} dias. Prepare-se para renovar!`;
        type = 'info';
      }

      // Insert notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: subscription.user_id,
          title,
          message,
          type,
          related_subscription_id: subscription.id,
        });

      if (notificationError) {
        console.error(`Error creating notification for subscription ${subscription.id}:`, notificationError);
      } else {
        notificationsCreated++;
        console.log(`Created notification for subscription ${subscription.id}`);
      }
    }

    console.log(`Successfully created ${notificationsCreated} notifications`);

    return new Response(
      JSON.stringify({
        success: true,
        subscriptionsChecked: subscriptions?.length || 0,
        notificationsCreated,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('Error in check-subscription-renewals:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});

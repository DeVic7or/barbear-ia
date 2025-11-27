import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Subscription } from "@/hooks/useSubscriptions";

export const useCurrentSubscription = () => {
  const { data: subscription, isLoading } = useQuery({
    queryKey: ["currentSubscription"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Subscription | null;
    },
  });

  return {
    subscription,
    isLoading,
    isTrial: subscription?.payment_method === 'trial',
    isActive: subscription?.status === 'active',
  };
};

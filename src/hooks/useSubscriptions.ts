import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Subscription {
  id: string;
  user_id: string;
  plan_name: string;
  plan_price: number;
  status: string;
  payment_method: string;
  payment_date: string;
  next_payment_date: string | null;
  invoice_url: string | null;
  transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useSubscriptions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .order("payment_date", { ascending: false });

      if (error) throw error;
      return data as Subscription[];
    },
  });

  const createSubscription = useMutation({
    mutationFn: async (subscription: Omit<Subscription, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("subscriptions")
        .insert([{ ...subscription, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast({
        title: "Sucesso!",
        description: "Assinatura registrada com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    },
  });

  const updateSubscriptionStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from("subscriptions")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast({
        title: "Sucesso!",
        description: "Status da assinatura atualizado.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    },
  });

  return {
    subscriptions,
    isLoading,
    createSubscription,
    updateSubscriptionStatus,
  };
};

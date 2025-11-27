import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface Break {
  id: string;
  user_availability_id: string;
  break_start_time: string;
  break_end_time: string;
  break_name: string;
  created_at: string;
  updated_at: string;
}

export const useBreaks = (availabilityId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('Setting up realtime subscription for user_breaks');
    
    const channel = supabase
      .channel('breaks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_breaks'
        },
        (payload) => {
          console.log('Breaks realtime update:', payload);
          queryClient.invalidateQueries({ queryKey: ["breaks"] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up breaks realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["breaks", availabilityId],
    queryFn: async () => {
      const query = supabase
        .from("user_breaks")
        .select("*")
        .order("break_start_time", { ascending: true });

      if (availabilityId) {
        query.eq("user_availability_id", availabilityId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Break[];
    },
    enabled: !!availabilityId,
  });
};

export const useCreateBreak = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (breakData: Omit<Break, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("user_breaks")
        .insert(breakData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["breaks"] });
    },
  });
};

export const useDeleteBreak = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("user_breaks")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["breaks"] });
    },
  });
};

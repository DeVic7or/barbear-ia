import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface Availability {
  id: string;
  user_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useUserAvailability = (userId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('Setting up realtime subscription for user_availability');
    
    const channel = supabase
      .channel('availability-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_availability'
        },
        (payload) => {
          console.log('Availability realtime update:', payload);
          queryClient.invalidateQueries({ queryKey: ["availability"] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up availability realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["availability", userId],
    queryFn: async () => {
      const query = supabase
        .from("user_availability")
        .select("*")
        .order("day_of_week", { ascending: true });

      if (userId) {
        query.eq("user_id", userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Availability[];
    },
    enabled: !!userId,
  });
};

export const useCreateAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (availability: Omit<Availability, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("user_availability")
        .insert(availability)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });
};

export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Availability> & { id: string }) => {
      const { data, error } = await supabase
        .from("user_availability")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });
};

export const useDeleteAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("user_availability")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });
};

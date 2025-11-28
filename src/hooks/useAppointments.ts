import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface Appointment {
  id: string;
  client_name: string;
  client_phone: string | null;
  client_id: string | null;
  barber_id: string | null;
  service_id: string | null;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string | null;
  appointment_type: string;
  payment_method: string | null;
  barbers?: {
    name: string;
  };
  services?: {
    name: string;
    price: number;
  };
  clients?: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
  };
}

export const useAppointments = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('Setting up realtime subscription for appointments');
    
    const channel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          queryClient.invalidateQueries({ queryKey: ["appointments"] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          barbers(name),
          services(name, price),
          clients(id, name, phone, email)
        `)
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true });

      if (error) throw error;
      return data as Appointment[];
    },
  });
};

export const useCreateWalkInAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientName,
      clientPhone,
      barberId,
      serviceId,
      additionalServices,
      additionalProducts,
      paymentMethod,
      notes,
    }: {
      clientName: string;
      clientPhone: string;
      barberId: string;
      serviceId: string;
      additionalServices: string[];
      additionalProducts: { productId: string; quantity: number }[];
      paymentMethod: string;
      notes?: string;
    }) => {
      // Create appointment as completed and presencial
      const { data: appointment, error: appointmentError } = await supabase
        .from("appointments")
        .insert({
          client_name: clientName,
          client_phone: clientPhone,
          barber_id: barberId,
          service_id: serviceId,
          appointment_date: new Date().toISOString().split('T')[0],
          appointment_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
          status: "Concluído",
          appointment_type: "Presencial",
          payment_method: paymentMethod,
          notes: notes || null,
        })
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      // Add additional services
      if (additionalServices.length > 0) {
        const servicesData = additionalServices.map((serviceId) => ({
          appointment_id: appointment.id,
          service_id: serviceId,
        }));

        const { error: servicesError } = await supabase
          .from("appointment_services")
          .insert(servicesData);

        if (servicesError) throw servicesError;
      }

      // Add products
      if (additionalProducts.length > 0) {
        const productsData = additionalProducts.map((product) => ({
          appointment_id: appointment.id,
          product_id: product.productId,
          quantity: product.quantity,
        }));

        const { error: productsError } = await supabase
          .from("appointment_products")
          .insert(productsData);

        if (productsError) throw productsError;
      }

      return { success: true, appointment };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};

export const useFinalizeAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      additionalServices,
      additionalProducts,
      paymentMethod,
    }: {
      appointmentId: string;
      additionalServices: string[];
      additionalProducts: { productId: string; quantity: number }[];
      paymentMethod: string;
    }) => {
      // Update appointment status and payment method
      const { error: updateError } = await supabase
        .from("appointments")
        .update({ 
          status: "Concluído",
          payment_method: paymentMethod,
        })
        .eq("id", appointmentId);

      if (updateError) throw updateError;

      // Add additional services
      if (additionalServices.length > 0) {
        const servicesData = additionalServices.map((serviceId) => ({
          appointment_id: appointmentId,
          service_id: serviceId,
        }));

        const { error: servicesError } = await supabase
          .from("appointment_services")
          .insert(servicesData);

        if (servicesError) throw servicesError;
      }

      // Add products
      if (additionalProducts.length > 0) {
        const productsData = additionalProducts.map((product) => ({
          appointment_id: appointmentId,
          product_id: product.productId,
          quantity: product.quantity,
        }));

        const { error: productsError } = await supabase
          .from("appointment_products")
          .insert(productsData);

        if (productsError) throw productsError;
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};

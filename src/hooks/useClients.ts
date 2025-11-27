import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  birthday: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useClients = () => {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Client[];
    },
  });
};

export const useClientDetails = (clientId: string) => {
  return useQuery({
    queryKey: ["client-details", clientId],
    queryFn: async () => {
      // Get client data
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();

      if (clientError) throw clientError;

      // Get appointments history
      const { data: appointments, error: appointmentsError } = await supabase
        .from("appointments")
        .select(`
          *,
          barbers (name),
          services (name, price),
          appointment_services (
            service_id,
            services (name, price)
          ),
          appointment_products (
            quantity,
            products (name, price)
          )
        `)
        .eq("client_id", clientId)
        .order("appointment_date", { ascending: false });

      if (appointmentsError) throw appointmentsError;

      // Calculate stats
      const completedAppointments = appointments?.filter(a => a.status === "Concluído") || [];
      const totalSpent = completedAppointments.reduce((sum, apt) => {
        let total = 0;
        
        // Add main service
        if (apt.services?.price) {
          total += Number(apt.services.price);
        }
        
        // Add additional services
        apt.appointment_services?.forEach((as: any) => {
          if (as.services?.price) {
            total += Number(as.services.price);
          }
        });
        
        // Add products
        apt.appointment_products?.forEach((ap: any) => {
          if (ap.products?.price && ap.quantity) {
            total += Number(ap.products.price) * ap.quantity;
          }
        });
        
        return sum + total;
      }, 0);

      const lastAppointment = appointments?.[0];
      const avgAppointments = completedAppointments.length;

      return {
        client,
        appointments: appointments || [],
        stats: {
          totalSpent,
          totalAppointments: completedAppointments.length,
          avgAppointments,
          lastAppointment: lastAppointment?.appointment_date || null,
        },
      };
    },
    enabled: !!clientId,
  });
};

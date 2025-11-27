import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";

interface BarberCommission {
  id: string;
  name: string;
  appointments: number;
  revenue: number;
  commission: number;
  commissionPercentage: number;
}

export const useBarberCommissions = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: ["barber-commissions", dateRange?.from, dateRange?.to],
    queryFn: async () => {
      // Buscar barbeiros
      const { data: barbers, error: barbersError } = await supabase
        .from("barbers")
        .select("id, name, commission_percentage");

      if (barbersError) throw barbersError;
      if (!barbers) return [];

      // Construir query de agendamentos finalizados
      let appointmentsQuery = supabase
        .from("appointments")
        .select(`
          id,
          barber_id,
          status,
          appointment_date,
          services (price),
          appointment_services (
            service_id,
            services (price)
          ),
          appointment_products (
            product_id,
            quantity,
            products (price)
          )
        `)
        .eq("status", "Concluído");

      // Aplicar filtro de data se fornecido
      if (dateRange?.from) {
        appointmentsQuery = appointmentsQuery.gte(
          "appointment_date",
          dateRange.from.toISOString().split("T")[0]
        );
      }
      if (dateRange?.to) {
        appointmentsQuery = appointmentsQuery.lte(
          "appointment_date",
          dateRange.to.toISOString().split("T")[0]
        );
      }

      const { data: appointments, error: appointmentsError } = await appointmentsQuery;

      if (appointmentsError) throw appointmentsError;
      if (!appointments) return [];

      // Calcular comissões por barbeiro
      const commissionsMap = new Map<string, BarberCommission>();

      barbers.forEach((barber) => {
        commissionsMap.set(barber.id, {
          id: barber.id,
          name: barber.name,
          appointments: 0,
          revenue: 0,
          commission: 0,
          commissionPercentage: barber.commission_percentage,
        });
      });

      appointments.forEach((appointment) => {
        if (!appointment.barber_id) return;

        const barberData = commissionsMap.get(appointment.barber_id);
        if (!barberData) return;

        // Calcular valor total do agendamento
        let appointmentTotal = 0;

        // Serviço principal
        if (appointment.services?.price) {
          appointmentTotal += Number(appointment.services.price);
        }

        // Serviços adicionais
        if (appointment.appointment_services) {
          appointment.appointment_services.forEach((as: any) => {
            if (as.services?.price) {
              appointmentTotal += Number(as.services.price);
            }
          });
        }

        // Produtos
        if (appointment.appointment_products) {
          appointment.appointment_products.forEach((ap: any) => {
            if (ap.products?.price && ap.quantity) {
              appointmentTotal += Number(ap.products.price) * ap.quantity;
            }
          });
        }

        // Atualizar dados do barbeiro
        barberData.appointments += 1;
        barberData.revenue += appointmentTotal;
        barberData.commission += (appointmentTotal * barberData.commissionPercentage) / 100;
      });

      // Converter map para array e filtrar barbeiros sem agendamentos
      return Array.from(commissionsMap.values()).filter(b => b.appointments > 0);
    },
  });
};

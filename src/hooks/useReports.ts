import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ReportData {
  completedAppointments: {
    total: number;
    totalRevenue: number;
    averageTicket: number;
  };
  appointmentTypes: {
    presencial: {
      count: number;
      revenue: number;
      percentage: number;
    };
    virtual: {
      count: number;
      revenue: number;
      percentage: number;
    };
  };
  topProducts: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  bottomProducts: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  topServices: Array<{
    id: string;
    name: string;
    count: number;
    revenue: number;
  }>;
  bottomServices: Array<{
    id: string;
    name: string;
    count: number;
    revenue: number;
  }>;
  topBarbers: Array<{
    id: string;
    name: string;
    appointments: number;
    revenue: number;
  }>;
  bottomBarbers: Array<{
    id: string;
    name: string;
    appointments: number;
    revenue: number;
  }>;
  topTimeSlots: Array<{
    time: string;
    count: number;
  }>;
  bottomTimeSlots: Array<{
    time: string;
    count: number;
  }>;
}

export const useReports = () => {
  return useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      // Buscar todos os agendamentos concluídos
      const { data: appointments, error: appointmentsError } = await supabase
        .from("appointments")
        .select(`
          id,
          barber_id,
          service_id,
          appointment_time,
          appointment_type,
          status,
          barbers (id, name),
          services (id, name, price),
          appointment_services (
            service_id,
            services (id, name, price)
          ),
          appointment_products (
            product_id,
            quantity,
            products (id, name, price)
          )
        `)
        .eq("status", "Concluído");

      if (appointmentsError) throw appointmentsError;

      // Calcular estatísticas de agendamentos concluídos
      let totalRevenue = 0;
      let presencialCount = 0;
      let presencialRevenue = 0;
      let virtualCount = 0;
      let virtualRevenue = 0;
      const productsMap = new Map<string, { name: string; quantity: number; revenue: number }>();
      const servicesMap = new Map<string, { name: string; count: number; revenue: number }>();
      const barbersMap = new Map<string, { name: string; appointments: number; revenue: number }>();
      const timeSlotsMap = new Map<string, number>();

      appointments?.forEach((appointment: any) => {
        let appointmentTotal = 0;

        // Serviço principal
        if (appointment.services?.price) {
          const servicePrice = Number(appointment.services.price);
          appointmentTotal += servicePrice;

          const serviceId = appointment.services.id;
          const serviceName = appointment.services.name;
          const existing = servicesMap.get(serviceId) || { name: serviceName, count: 0, revenue: 0 };
          servicesMap.set(serviceId, {
            name: serviceName,
            count: existing.count + 1,
            revenue: existing.revenue + servicePrice,
          });
        }

        // Serviços adicionais
        appointment.appointment_services?.forEach((as: any) => {
          if (as.services?.price) {
            const servicePrice = Number(as.services.price);
            appointmentTotal += servicePrice;

            const serviceId = as.services.id;
            const serviceName = as.services.name;
            const existing = servicesMap.get(serviceId) || { name: serviceName, count: 0, revenue: 0 };
            servicesMap.set(serviceId, {
              name: serviceName,
              count: existing.count + 1,
              revenue: existing.revenue + servicePrice,
            });
          }
        });

        // Produtos
        appointment.appointment_products?.forEach((ap: any) => {
          if (ap.products?.price && ap.quantity) {
            const productPrice = Number(ap.products.price);
            const productTotal = productPrice * ap.quantity;
            appointmentTotal += productTotal;

            const productId = ap.products.id;
            const productName = ap.products.name;
            const existing = productsMap.get(productId) || { name: productName, quantity: 0, revenue: 0 };
            productsMap.set(productId, {
              name: productName,
              quantity: existing.quantity + ap.quantity,
              revenue: existing.revenue + productTotal,
            });
          }
        });

        totalRevenue += appointmentTotal;

        // Contabilizar por tipo de agendamento
        if (appointment.appointment_type === "Presencial") {
          presencialCount++;
          presencialRevenue += appointmentTotal;
        } else {
          virtualCount++;
          virtualRevenue += appointmentTotal;
        }

        // Contabilizar barbeiro
        if (appointment.barber_id && appointment.barbers) {
          const barberId = appointment.barber_id;
          const barberName = appointment.barbers.name;
          const existing = barbersMap.get(barberId) || { name: barberName, appointments: 0, revenue: 0 };
          barbersMap.set(barberId, {
            name: barberName,
            appointments: existing.appointments + 1,
            revenue: existing.revenue + appointmentTotal,
          });
        }

        // Contabilizar horário
        const timeSlot = appointment.appointment_time;
        timeSlotsMap.set(timeSlot, (timeSlotsMap.get(timeSlot) || 0) + 1);
      });

      // Converter maps para arrays e ordenar
      const topProducts = Array.from(productsMap.entries())
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      const bottomProducts = Array.from(productsMap.entries())
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => a.quantity - b.quantity)
        .slice(0, 5);

      const topServices = Array.from(servicesMap.entries())
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const bottomServices = Array.from(servicesMap.entries())
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => a.count - b.count)
        .slice(0, 5);

      const topBarbers = Array.from(barbersMap.entries())
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.appointments - a.appointments)
        .slice(0, 5);

      const bottomBarbers = Array.from(barbersMap.entries())
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => a.appointments - b.appointments)
        .slice(0, 5);

      const topTimeSlots = Array.from(timeSlotsMap.entries())
        .map(([time, count]) => ({ time, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const bottomTimeSlots = Array.from(timeSlotsMap.entries())
        .map(([time, count]) => ({ time, count }))
        .sort((a, b) => a.count - b.count)
        .slice(0, 5);

      const reportData: ReportData = {
        completedAppointments: {
          total: appointments?.length || 0,
          totalRevenue,
          averageTicket: appointments?.length ? totalRevenue / appointments.length : 0,
        },
        appointmentTypes: {
          presencial: {
            count: presencialCount,
            revenue: presencialRevenue,
            percentage: appointments?.length ? (presencialCount / appointments.length) * 100 : 0,
          },
          virtual: {
            count: virtualCount,
            revenue: virtualRevenue,
            percentage: appointments?.length ? (virtualCount / appointments.length) * 100 : 0,
          },
        },
        topProducts,
        bottomProducts,
        topServices,
        bottomServices,
        topBarbers,
        bottomBarbers,
        topTimeSlots,
        bottomTimeSlots,
      };

      return reportData;
    },
  });
};

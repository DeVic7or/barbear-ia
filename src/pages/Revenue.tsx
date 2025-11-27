import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DollarSign, TrendingUp, CreditCard } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { formatCurrency } from "@/lib/formatters";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Revenue = () => {
  // Buscar agendamentos concluídos com todos os serviços e produtos
  const { data: appointments } = useQuery({
    queryKey: ["completed-appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          barber_id,
          appointment_date,
          services (price),
          appointment_services (
            services (price)
          ),
          appointment_products (
            quantity,
            products (price)
          ),
          barbers (
            commission_percentage
          )
        `)
        .eq("status", "Concluído")
        .order("appointment_date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Calcular faturamento total e comissões
  const calculateRevenue = () => {
    if (!appointments) return { totalRevenue: 0, totalCommissions: 0, avgTicket: 0 };

    let totalRevenue = 0;
    let totalCommissions = 0;

    appointments.forEach((appointment: any) => {
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

      totalRevenue += appointmentTotal;

      // Calcular comissão deste agendamento
      if (appointment.barbers?.commission_percentage) {
        totalCommissions += (appointmentTotal * Number(appointment.barbers.commission_percentage)) / 100;
      }
    });

    const avgTicket = appointments.length > 0 ? totalRevenue / appointments.length : 0;

    return { totalRevenue, totalCommissions, avgTicket };
  };

  const { totalRevenue, totalCommissions, avgTicket } = calculateRevenue();
  const netProfit = totalRevenue - totalCommissions;

  // Agrupar dados por mês para o gráfico
  const getMonthlyData = () => {
    if (!appointments) return [];

    const monthlyMap = new Map<string, { revenue: number; commissions: number }>();

    appointments.forEach((appointment: any) => {
      const date = new Date(appointment.appointment_date);
      const monthKey = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

      let appointmentTotal = 0;

      // Calcular total do agendamento
      if (appointment.services?.price) {
        appointmentTotal += Number(appointment.services.price);
      }

      if (appointment.appointment_services) {
        appointment.appointment_services.forEach((as: any) => {
          if (as.services?.price) {
            appointmentTotal += Number(as.services.price);
          }
        });
      }

      if (appointment.appointment_products) {
        appointment.appointment_products.forEach((ap: any) => {
          if (ap.products?.price && ap.quantity) {
            appointmentTotal += Number(ap.products.price) * ap.quantity;
          }
        });
      }

      const commission = appointment.barbers?.commission_percentage
        ? (appointmentTotal * Number(appointment.barbers.commission_percentage)) / 100
        : 0;

      const existing = monthlyMap.get(monthKey) || { revenue: 0, commissions: 0 };
      monthlyMap.set(monthKey, {
        revenue: existing.revenue + appointmentTotal,
        commissions: existing.commissions + commission,
      });
    });

    return Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .slice(-6); // Últimos 6 meses
  };

  const monthlyData = getMonthlyData();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Faturamento</h1>
          <p className="text-muted-foreground mt-1">Análise financeira e performance da barbearia</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            title="Faturamento Total"
            value={formatCurrency(totalRevenue)}
            icon={DollarSign}
            description="Agendamentos concluídos"
          />
          <StatsCard
            title="Lucro Líquido"
            value={formatCurrency(netProfit)}
            icon={TrendingUp}
            description="Após comissões"
          />
          <StatsCard
            title="Ticket Médio"
            value={formatCurrency(avgTicket)}
            icon={CreditCard}
            description="Por atendimento"
          />
        </div>

        <Card className="border-border/40 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-foreground">Receitas vs Comissões</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="revenue" name="Receita" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="commissions" name="Comissões" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Revenue;

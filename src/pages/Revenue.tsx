import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DollarSign, TrendingUp, CreditCard, User } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { formatCurrency } from "@/lib/formatters";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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
            name,
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

  // Calcular receita por barbeiro
  const getBarberRevenue = () => {
    if (!appointments) return [];

    const barberMap = new Map<string, { 
      id: string;
      name: string; 
      revenue: number; 
      appointments: number;
      commission: number;
      commissionPercentage: number;
    }>();

    appointments.forEach((appointment: any) => {
      if (!appointment.barber_id || !appointment.barbers) return;

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

      const barberId = appointment.barber_id;
      const existing = barberMap.get(barberId);
      const commissionPercentage = Number(appointment.barbers.commission_percentage) || 0;
      const commissionAmount = (appointmentTotal * commissionPercentage) / 100;

      if (existing) {
        existing.revenue += appointmentTotal;
        existing.appointments += 1;
        existing.commission += commissionAmount;
      } else {
        // Pegar o nome do barbeiro do banco
        const barberName = appointment.barbers?.name || 'Barbeiro';
        barberMap.set(barberId, {
          id: barberId,
          name: barberName,
          revenue: appointmentTotal,
          appointments: 1,
          commission: commissionAmount,
          commissionPercentage: commissionPercentage,
        });
      }
    });

    return Array.from(barberMap.values()).sort((a, b) => b.revenue - a.revenue);
  };

  const barberRevenue = getBarberRevenue();

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

        <div className="grid gap-6 lg:grid-cols-2">
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

          <Card className="border-border/40 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-foreground">Receita por Barbeiro</CardTitle>
            </CardHeader>
            <CardContent>
              {barberRevenue.length > 0 ? (
                <div className="space-y-4">
                  {barberRevenue.map((barber) => (
                    <div 
                      key={barber.id} 
                      className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/40"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-primary/20">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {barber.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">{barber.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {barber.appointments} atendimentos
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Comissão: {barber.commissionPercentage}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(barber.revenue)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Comissão: {formatCurrency(barber.commission)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum dado disponível</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Revenue;

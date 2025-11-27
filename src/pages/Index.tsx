import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Calendar, DollarSign, TrendingUp, Users } from "lucide-react";
import { Layout } from "@/components/Layout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { AppointmentsChart } from "@/components/dashboard/AppointmentsChart";
import { BarbersList } from "@/components/dashboard/BarbersList";
import { PeriodFilter } from "@/components/dashboard/PeriodFilter";
import { CurrentPlanCard } from "@/components/dashboard/CurrentPlanCard";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { useBarberCommissions } from "@/hooks/useBarberCommissions";
import { formatCurrency } from "@/lib/formatters";

// Mock data - substituir com dados reais da API
const mockChartData = [
  { date: "01/11", appointments: 12 },
  { date: "05/11", appointments: 15 },
  { date: "10/11", appointments: 18 },
  { date: "15/11", appointments: 22 },
  { date: "20/11", appointments: 19 },
  { date: "25/11", appointments: 25 },
];

const Index = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });

  const { data: barbersData, isLoading } = useBarberCommissions(dateRange);

  const totalAppointments = barbersData?.reduce((acc, barber) => acc + barber.appointments, 0) || 0;
  const totalRevenue = barbersData?.reduce((acc, barber) => acc + barber.revenue, 0) || 0;
  const totalCommission = barbersData?.reduce((acc, barber) => acc + barber.commission, 0) || 0;

  return (
    <Layout>
      <WelcomeDialog />
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          {/* Main Content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Visão geral do desempenho da barbearia</p>
            </div>

            {/* Filtro de Período */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Período de Análise
              </h2>
              <PeriodFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total de Agendamentos"
                value={totalAppointments}
                icon={Calendar}
                trend={{ value: 12, isPositive: true }}
              />
              <StatsCard
                title="Faturamento Total"
                value={formatCurrency(totalRevenue)}
                icon={DollarSign}
                trend={{ value: 8, isPositive: true }}
              />
              <StatsCard
                title="Total em Comissões"
                value={formatCurrency(totalCommission)}
                icon={TrendingUp}
                trend={{ value: 15, isPositive: true }}
              />
              <StatsCard
                title="Barbeiros Ativos"
                value={barbersData?.length || 0}
                icon={Users}
                description="Profissionais"
              />
            </div>

            {/* Chart */}
            <AppointmentsChart data={mockChartData} />

            {/* Barbers List */}
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando comissões...</div>
            ) : barbersData && barbersData.length > 0 ? (
              <BarbersList barbers={barbersData} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum agendamento finalizado no período selecionado
              </div>
            )}
          </div>

          {/* Sidebar - Current Plan Card */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <CurrentPlanCard />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;

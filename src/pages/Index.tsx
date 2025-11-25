import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Calendar, DollarSign, TrendingUp, Users } from "lucide-react";
import { Layout } from "@/components/Layout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { AppointmentsChart } from "@/components/dashboard/AppointmentsChart";
import { BarbersList } from "@/components/dashboard/BarbersList";
import { PeriodFilter } from "@/components/dashboard/PeriodFilter";

// Mock data - substituir com dados reais da API
const mockChartData = [
  { date: "01/11", appointments: 12 },
  { date: "05/11", appointments: 15 },
  { date: "10/11", appointments: 18 },
  { date: "15/11", appointments: 22 },
  { date: "20/11", appointments: 19 },
  { date: "25/11", appointments: 25 },
];

const mockBarbers = [
  {
    id: "1",
    name: "Carlos Silva",
    appointments: 45,
    revenue: 2250,
    commission: 675,
  },
  {
    id: "2",
    name: "João Santos",
    appointments: 38,
    revenue: 1900,
    commission: 570,
  },
  {
    id: "3",
    name: "Pedro Oliveira",
    appointments: 42,
    revenue: 2100,
    commission: 630,
  },
  {
    id: "4",
    name: "Rafael Costa",
    appointments: 35,
    revenue: 1750,
    commission: 525,
  },
];

const Index = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });

  const totalAppointments = mockBarbers.reduce((acc, barber) => acc + barber.appointments, 0);
  const totalRevenue = mockBarbers.reduce((acc, barber) => acc + barber.revenue, 0);
  const totalCommission = mockBarbers.reduce((acc, barber) => acc + barber.commission, 0);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
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
            value={`R$ ${totalRevenue.toFixed(2)}`}
            icon={DollarSign}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Total em Comissões"
            value={`R$ ${totalCommission.toFixed(2)}`}
            icon={TrendingUp}
            trend={{ value: 15, isPositive: true }}
          />
          <StatsCard
            title="Barbeiros Ativos"
            value={mockBarbers.length}
            icon={Users}
            description="Profissionais"
          />
        </div>

        {/* Chart */}
        <AppointmentsChart data={mockChartData} />

        {/* Barbers List */}
        <BarbersList barbers={mockBarbers} />
      </div>
    </Layout>
  );
};

export default Index;

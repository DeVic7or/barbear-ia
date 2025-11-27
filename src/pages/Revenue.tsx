import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DollarSign, TrendingUp, CreditCard, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { formatCurrency } from "@/lib/formatters";

const mockRevenueData = [
  { month: "Jan", revenue: 8500, expenses: 3200 },
  { month: "Fev", revenue: 9200, expenses: 3500 },
  { month: "Mar", revenue: 8800, expenses: 3300 },
  { month: "Abr", revenue: 10500, expenses: 3800 },
  { month: "Mai", revenue: 11200, expenses: 4000 },
  { month: "Jun", revenue: 10800, expenses: 3900 },
];

const Revenue = () => {
  const totalRevenue = 50900;
  const totalExpenses = 21700;
  const netProfit = totalRevenue - totalExpenses;
  const avgTicket = 45.50;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Faturamento</h1>
          <p className="text-muted-foreground mt-1">Análise financeira e performance da barbearia</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Faturamento Total"
            value={formatCurrency(totalRevenue)}
            icon={DollarSign}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Lucro Líquido"
            value={formatCurrency(netProfit)}
            icon={TrendingUp}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Ticket Médio"
            value={formatCurrency(avgTicket)}
            icon={CreditCard}
            description="Por atendimento"
          />
          <StatsCard
            title="Despesas"
            value={formatCurrency(totalExpenses)}
            icon={Wallet}
            trend={{ value: 3, isPositive: false }}
          />
        </div>

        <Card className="border-border/40 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-foreground">Receitas vs Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={mockRevenueData}>
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
                <Bar dataKey="expenses" name="Despesas" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Revenue;

import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useReports } from "@/hooks/useReports";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Clock, Package, Users, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'];

const Reports = () => {
  const { data: reports, isLoading } = useReports();

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground mt-2">
              Análises e estatísticas dos agendamentos
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground mt-2">
            Análises e estatísticas dos agendamentos
          </p>
        </div>

        {/* Agendamentos Concluídos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Agendamentos Concluídos
            </CardTitle>
            <CardDescription>
              Resumo geral dos agendamentos finalizados com métricas de receita e desempenho
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total de Agendamentos</p>
                <p className="text-3xl font-bold text-foreground">
                  {reports?.completedAppointments.total || 0}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-3xl font-bold text-foreground">
                  {formatCurrency(reports?.completedAppointments.totalRevenue || 0)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-3xl font-bold text-foreground">
                  {formatCurrency(reports?.completedAppointments.averageTicket || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Relatório de Produtos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Desempenho de Produtos
            </CardTitle>
            <CardDescription>
              Análise dos produtos mais e menos vendidos com ranking de vendas e receita
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {reports?.topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum produto vendido</p>
              ) : (
                <>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[...reports?.topProducts || []].reverse()}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" className="text-xs" />
                        <YAxis dataKey="name" type="category" className="text-xs" width={90} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number, name: string) => {
                            if (name === 'quantity') return [value, 'Quantidade'];
                            if (name === 'revenue') return [formatCurrency(value), 'Receita'];
                            return [value, name];
                          }}
                        />
                        <Legend
                          formatter={(value) => {
                            if (value === 'quantity') return 'Quantidade';
                            if (value === 'revenue') return 'Receita';
                            return value;
                          }}
                        />
                        <Bar dataKey="quantity" fill={COLORS[0]} radius={[0, 4, 4, 0]} />
                        <Bar dataKey="revenue" fill={COLORS[1]} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2 pt-4 border-t">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <h4 className="font-semibold text-foreground">Top 5 Mais Vendidos</h4>
                      </div>
                      {reports?.topProducts.map((product, idx) => (
                        <div key={product.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-muted-foreground">#{idx + 1}</span>
                            <div>
                              <p className="font-medium text-foreground">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {product.quantity} unidades
                              </p>
                            </div>
                          </div>
                          <p className="font-semibold text-foreground">
                            {formatCurrency(product.revenue)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <h4 className="font-semibold text-foreground">Top 5 Menos Vendidos</h4>
                      </div>
                      {reports?.bottomProducts.map((product, idx) => (
                        <div key={product.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-muted-foreground">#{idx + 1}</span>
                            <div>
                              <p className="font-medium text-foreground">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {product.quantity} unidades
                              </p>
                            </div>
                          </div>
                          <p className="font-semibold text-foreground">
                            {formatCurrency(product.revenue)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Relatório de Serviços */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Desempenho de Serviços
            </CardTitle>
            <CardDescription>
              Ranking dos serviços mais e menos procurados com número de agendamentos e receita gerada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {reports?.topServices.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum serviço realizado</p>
              ) : (
                <>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reports?.topServices}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {reports?.topServices.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number, name: string, props: any) => {
                            return [
                              `${value} agendamentos - ${formatCurrency(props.payload.revenue)}`,
                              props.payload.name
                            ];
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 pt-4 border-t">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <h4 className="font-semibold text-foreground">Top 5 Mais Procurados</h4>
                      </div>
                      {reports?.topServices.map((service, idx) => (
                        <div key={service.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-muted-foreground">#{idx + 1}</span>
                            <div>
                              <p className="font-medium text-foreground">{service.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {service.count} agendamentos
                              </p>
                            </div>
                          </div>
                          <p className="font-semibold text-foreground">
                            {formatCurrency(service.revenue)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <h4 className="font-semibold text-foreground">Top 5 Menos Procurados</h4>
                      </div>
                      {reports?.bottomServices.map((service, idx) => (
                        <div key={service.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-muted-foreground">#{idx + 1}</span>
                            <div>
                              <p className="font-medium text-foreground">{service.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {service.count} agendamentos
                              </p>
                            </div>
                          </div>
                          <p className="font-semibold text-foreground">
                            {formatCurrency(service.revenue)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Relatório de Barbeiros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Desempenho dos Barbeiros
            </CardTitle>
            <CardDescription>
              Comparativo de barbeiros com mais e menos agendamentos concluídos e receita individual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {reports?.topBarbers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum agendamento encontrado</p>
              ) : (
                <>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={reports?.topBarbers}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number, name: string) => {
                            if (name === 'appointments') return [value, 'Agendamentos'];
                            if (name === 'revenue') return [formatCurrency(value), 'Receita'];
                            return [value, name];
                          }}
                        />
                        <Legend
                          formatter={(value) => {
                            if (value === 'appointments') return 'Agendamentos';
                            if (value === 'revenue') return 'Receita';
                            return value;
                          }}
                        />
                        <Bar dataKey="appointments" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="revenue" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 pt-4 border-t">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <h4 className="font-semibold text-foreground">Top 5 Mais Agendamentos</h4>
                      </div>
                      {reports?.topBarbers.map((barber, idx) => (
                        <div key={barber.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-muted-foreground">#{idx + 1}</span>
                            <div>
                              <p className="font-medium text-foreground">{barber.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {barber.appointments} agendamentos
                              </p>
                            </div>
                          </div>
                          <p className="font-semibold text-foreground">
                            {formatCurrency(barber.revenue)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <h4 className="font-semibold text-foreground">Top 5 Menos Agendamentos</h4>
                      </div>
                      {reports?.bottomBarbers.map((barber, idx) => (
                        <div key={barber.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-muted-foreground">#{idx + 1}</span>
                            <div>
                              <p className="font-medium text-foreground">{barber.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {barber.appointments} agendamentos
                              </p>
                            </div>
                          </div>
                          <p className="font-semibold text-foreground">
                            {formatCurrency(barber.revenue)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Relatório de Horários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Análise de Horários
            </CardTitle>
            <CardDescription>
              Horários mais e menos frequentes de agendamentos para otimizar a disponibilidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {reports?.topTimeSlots.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum horário registrado</p>
              ) : (
                <>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[...reports?.topTimeSlots || []].sort((a, b) => b.count - a.count)}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="time" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number) => [`${value} agendamentos`, 'Frequência']}
                        />
                        <Bar dataKey="count" fill={COLORS[3]} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 pt-4 border-t">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <h4 className="font-semibold text-foreground">Top 5 Mais Frequentes</h4>
                      </div>
                      {reports?.topTimeSlots.map((slot, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-muted-foreground">#{idx + 1}</span>
                            <p className="font-medium text-foreground">{slot.time}</p>
                          </div>
                          <p className="font-semibold text-foreground">{slot.count} agendamentos</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <h4 className="font-semibold text-foreground">Top 5 Menos Frequentes</h4>
                      </div>
                      {reports?.bottomTimeSlots.map((slot, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-muted-foreground">#{idx + 1}</span>
                            <p className="font-medium text-foreground">{slot.time}</p>
                          </div>
                          <p className="font-semibold text-foreground">{slot.count} agendamentos</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;

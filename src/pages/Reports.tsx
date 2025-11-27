import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useReports } from "@/hooks/useReports";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Package, Users, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

const Reports = () => {
  const { data: reports, isLoading } = useReports();

  if (isLoading) {
    return (
      <Layout>
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Relatórios</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Análises e estatísticas dos agendamentos
            </p>
          </div>
          <div className="grid gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
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
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-muted-foreground">Total de Agendamentos</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">
                  {reports?.completedAppointments.total || 0}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">
                  {formatCurrency(reports?.completedAppointments.totalRevenue || 0)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">
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
            {reports?.topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum produto vendido</p>
            ) : (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <h4 className="text-sm sm:text-base font-semibold text-foreground">Top 5 Mais Vendidos</h4>
                  </div>
                  {reports?.topProducts.map((product, idx) => (
                    <div key={product.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-base sm:text-lg font-bold text-muted-foreground flex-shrink-0">#{idx + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground text-sm sm:text-base truncate">{product.name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {product.quantity} unidades
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-foreground text-sm sm:text-base flex-shrink-0">
                        {formatCurrency(product.revenue)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <h4 className="text-sm sm:text-base font-semibold text-foreground">Top 5 Menos Vendidos</h4>
                  </div>
                  {reports?.bottomProducts.map((product, idx) => (
                    <div key={product.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-base sm:text-lg font-bold text-muted-foreground flex-shrink-0">#{idx + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground text-sm sm:text-base truncate">{product.name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {product.quantity} unidades
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-foreground text-sm sm:text-base flex-shrink-0">
                        {formatCurrency(product.revenue)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            {reports?.topServices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum serviço realizado</p>
            ) : (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <h4 className="text-sm sm:text-base font-semibold text-foreground">Top 5 Mais Procurados</h4>
                  </div>
                  {reports?.topServices.map((service, idx) => (
                    <div key={service.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-base sm:text-lg font-bold text-muted-foreground flex-shrink-0">#{idx + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground text-sm sm:text-base truncate">{service.name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {service.count} agendamentos
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-foreground text-sm sm:text-base flex-shrink-0">
                        {formatCurrency(service.revenue)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <h4 className="text-sm sm:text-base font-semibold text-foreground">Top 5 Menos Procurados</h4>
                  </div>
                  {reports?.bottomServices.map((service, idx) => (
                    <div key={service.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-base sm:text-lg font-bold text-muted-foreground flex-shrink-0">#{idx + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground text-sm sm:text-base truncate">{service.name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {service.count} agendamentos
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-foreground text-sm sm:text-base flex-shrink-0">
                        {formatCurrency(service.revenue)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            {reports?.topBarbers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum agendamento encontrado</p>
            ) : (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <h4 className="text-sm sm:text-base font-semibold text-foreground">Top 5 Mais Agendamentos</h4>
                  </div>
                  {reports?.topBarbers.map((barber, idx) => (
                    <div key={barber.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-base sm:text-lg font-bold text-muted-foreground flex-shrink-0">#{idx + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground text-sm sm:text-base truncate">{barber.name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {barber.appointments} agendamentos
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-foreground text-sm sm:text-base flex-shrink-0">
                        {formatCurrency(barber.revenue)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <h4 className="text-sm sm:text-base font-semibold text-foreground">Top 5 Menos Agendamentos</h4>
                  </div>
                  {reports?.bottomBarbers.map((barber, idx) => (
                    <div key={barber.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-base sm:text-lg font-bold text-muted-foreground flex-shrink-0">#{idx + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground text-sm sm:text-base truncate">{barber.name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {barber.appointments} agendamentos
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-foreground text-sm sm:text-base flex-shrink-0">
                        {formatCurrency(barber.revenue)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Relatório de Horários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Análise de Horários
            </CardTitle>
            <CardDescription>
              Horários mais e menos frequentes de agendamentos para otimizar a disponibilidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reports?.topTimeSlots.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum horário registrado</p>
            ) : (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <h4 className="text-sm sm:text-base font-semibold text-foreground">Top 5 Mais Frequentes</h4>
                  </div>
                  {reports?.topTimeSlots.map((slot, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-base sm:text-lg font-bold text-muted-foreground flex-shrink-0">#{idx + 1}</span>
                        <p className="font-medium text-foreground text-sm sm:text-base">{slot.time}</p>
                      </div>
                      <p className="font-semibold text-foreground text-sm sm:text-base flex-shrink-0">{slot.count} agendamentos</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <h4 className="text-sm sm:text-base font-semibold text-foreground">Top 5 Menos Frequentes</h4>
                  </div>
                  {reports?.bottomTimeSlots.map((slot, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-base sm:text-lg font-bold text-muted-foreground flex-shrink-0">#{idx + 1}</span>
                        <p className="font-medium text-foreground text-sm sm:text-base">{slot.time}</p>
                      </div>
                      <p className="font-semibold text-foreground text-sm sm:text-base flex-shrink-0">{slot.count} agendamentos</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;

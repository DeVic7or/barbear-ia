import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useReports } from "@/hooks/useReports";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Clock, Package, Users, Calendar } from "lucide-react";

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
                  R$ {reports?.completedAppointments.totalRevenue.toFixed(2) || "0.00"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-3xl font-bold text-foreground">
                  R$ {reports?.completedAppointments.averageTicket.toFixed(2) || "0.00"}
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
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <h4 className="font-semibold text-foreground">Mais Vendidos</h4>
                </div>
                {reports?.topProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum produto vendido</p>
                ) : (
                  reports?.topProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.quantity} unidades
                        </p>
                      </div>
                      <p className="font-semibold text-foreground">
                        R$ {product.revenue.toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <h4 className="font-semibold text-foreground">Menos Vendidos</h4>
                </div>
                {reports?.bottomProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum produto vendido</p>
                ) : (
                  reports?.bottomProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.quantity} unidades
                        </p>
                      </div>
                      <p className="font-semibold text-foreground">
                        R$ {product.revenue.toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
              </div>
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
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <h4 className="font-semibold text-foreground">Mais Procurados</h4>
                </div>
                {reports?.topServices.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum serviço realizado</p>
                ) : (
                  reports?.topServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {service.count} agendamentos
                        </p>
                      </div>
                      <p className="font-semibold text-foreground">
                        R$ {service.revenue.toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <h4 className="font-semibold text-foreground">Menos Procurados</h4>
                </div>
                {reports?.bottomServices.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum serviço realizado</p>
                ) : (
                  reports?.bottomServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {service.count} agendamentos
                        </p>
                      </div>
                      <p className="font-semibold text-foreground">
                        R$ {service.revenue.toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
              </div>
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
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <h4 className="font-semibold text-foreground">Mais Agendamentos</h4>
                </div>
                {reports?.topBarbers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum agendamento encontrado</p>
                ) : (
                  reports?.topBarbers.map((barber) => (
                    <div key={barber.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{barber.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {barber.appointments} agendamentos
                        </p>
                      </div>
                      <p className="font-semibold text-foreground">
                        R$ {barber.revenue.toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <h4 className="font-semibold text-foreground">Menos Agendamentos</h4>
                </div>
                {reports?.bottomBarbers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum agendamento encontrado</p>
                ) : (
                  reports?.bottomBarbers.map((barber) => (
                    <div key={barber.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{barber.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {barber.appointments} agendamentos
                        </p>
                      </div>
                      <p className="font-semibold text-foreground">
                        R$ {barber.revenue.toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
              </div>
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
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <h4 className="font-semibold text-foreground">Mais Frequentes</h4>
                </div>
                {reports?.topTimeSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum horário registrado</p>
                ) : (
                  reports?.topTimeSlots.map((slot, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <p className="font-medium text-foreground">{slot.time}</p>
                      <p className="font-semibold text-foreground">{slot.count} agendamentos</p>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <h4 className="font-semibold text-foreground">Menos Frequentes</h4>
                </div>
                {reports?.bottomTimeSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum horário registrado</p>
                ) : (
                  reports?.bottomTimeSlots.map((slot, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <p className="font-medium text-foreground">{slot.time}</p>
                      <p className="font-semibold text-foreground">{slot.count} agendamentos</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;

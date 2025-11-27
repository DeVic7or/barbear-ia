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
            <CardDescription>Resumo geral dos agendamentos finalizados</CardDescription>
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

        <div className="grid gap-6 md:grid-cols-2">
          {/* Produtos Mais Vendidos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Produtos Mais Vendidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports?.topProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum produto vendido</p>
                ) : (
                  reports?.topProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.quantity} unidades vendidas
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-foreground">
                        R$ {product.revenue.toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Produtos Menos Vendidos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Produtos Menos Vendidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports?.bottomProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum produto vendido</p>
                ) : (
                  reports?.bottomProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.quantity} unidades vendidas
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-foreground">
                        R$ {product.revenue.toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Serviços Mais Procurados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Serviços Mais Procurados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports?.topServices.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum serviço realizado</p>
                ) : (
                  reports?.topServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">{service.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {service.count} agendamentos
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-foreground">
                        R$ {service.revenue.toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Serviços Menos Procurados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Serviços Menos Procurados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports?.bottomServices.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum serviço realizado</p>
                ) : (
                  reports?.bottomServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">{service.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {service.count} agendamentos
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-foreground">
                        R$ {service.revenue.toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Barbeiros com Mais Agendamentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Barbeiros com Mais Agendamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports?.topBarbers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum agendamento encontrado</p>
                ) : (
                  reports?.topBarbers.map((barber) => (
                    <div key={barber.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">{barber.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {barber.appointments} agendamentos
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-foreground">
                        R$ {barber.revenue.toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Barbeiros com Menos Agendamentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Barbeiros com Menos Agendamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports?.bottomBarbers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum agendamento encontrado</p>
                ) : (
                  reports?.bottomBarbers.map((barber) => (
                    <div key={barber.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">{barber.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {barber.appointments} agendamentos
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-foreground">
                        R$ {barber.revenue.toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Horários Mais Frequentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Horários Mais Frequentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports?.topTimeSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum horário registrado</p>
                ) : (
                  reports?.topTimeSlots.map((slot, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium text-foreground">{slot.time}</p>
                      </div>
                      <p className="font-semibold text-foreground">{slot.count} agendamentos</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Horários Menos Frequentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Horários Menos Frequentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports?.bottomTimeSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum horário registrado</p>
                ) : (
                  reports?.bottomTimeSlots.map((slot, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium text-foreground">{slot.time}</p>
                      </div>
                      <p className="font-semibold text-foreground">{slot.count} agendamentos</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;

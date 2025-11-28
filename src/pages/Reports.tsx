import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useReports } from "@/hooks/useReports";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Package, Users, Calendar, Monitor, Store, Clock, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { useRef } from "react";

const Reports = () => {
  const { data: reports, isLoading } = useReports();
  
  // Refs para cada seção
  const completedRef = useRef<HTMLDivElement>(null);
  const typesRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const barbersRef = useRef<HTMLDivElement>(null);
  const timeSlotsRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const reportCategories = [
    {
      title: "Agendamentos Concluídos",
      description: "Resumo geral dos agendamentos finalizados",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      ref: completedRef,
      stats: reports ? `${reports.completedAppointments.total} agendamentos` : "-",
    },
    {
      title: "Presencial vs Virtual",
      description: "Comparativo entre tipos de agendamento",
      icon: Monitor,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      ref: typesRef,
      stats: reports ? `${reports.appointmentTypes.presencial.count} presenciais` : "-",
    },
    {
      title: "Desempenho de Produtos",
      description: "Produtos mais e menos vendidos",
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
      ref: productsRef,
      stats: reports?.topProducts[0] ? `Top: ${reports.topProducts[0].name}` : "-",
    },
    {
      title: "Desempenho de Serviços",
      description: "Serviços mais e menos procurados",
      icon: Store,
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30",
      ref: servicesRef,
      stats: reports?.topServices[0] ? `Top: ${reports.topServices[0].name}` : "-",
    },
    {
      title: "Desempenho dos Barbeiros",
      description: "Comparativo de agendamentos por barbeiro",
      icon: Users,
      color: "text-pink-600",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/30",
      ref: barbersRef,
      stats: reports?.topBarbers[0] ? `Top: ${reports.topBarbers[0].name}` : "-",
    },
    {
      title: "Análise de Horários",
      description: "Horários mais e menos frequentes",
      icon: Clock,
      color: "text-cyan-600",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
      ref: timeSlotsRef,
      stats: reports?.topTimeSlots[0] ? `Mais frequente: ${reports.topTimeSlots[0].time}` : "-",
    },
  ];

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
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Análises e estatísticas dos agendamentos
          </p>
        </div>

        {/* Grade de Categorias */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {reportCategories.map((category, idx) => {
            const Icon = category.icon;
            return (
              <Card
                key={idx}
                className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 ${category.borderColor} ${category.bgColor}`}
                onClick={() => scrollToSection(category.ref)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${category.bgColor}`}>
                          <Icon className={`h-5 w-5 ${category.color}`} />
                        </div>
                        <h3 className="font-bold text-foreground">{category.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {category.description}
                      </p>
                      <p className={`text-sm font-semibold ${category.color}`}>
                        {category.stats}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Agendamentos Concluídos */}
        <div ref={completedRef} className="scroll-mt-6">
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
        </div>

        {/* Relatório de Tipos de Agendamento */}
        <div ref={typesRef} className="scroll-mt-6">
          <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Agendamentos: Presencial vs Virtual
            </CardTitle>
            <CardDescription>
              Comparativo entre agendamentos presenciais e virtuais com quantidade e receita
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Presencial */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-blue-500/10 border-2 border-blue-500/30">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-blue-500/20">
                      <Store className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-foreground">Presencial</h4>
                      <p className="text-sm text-muted-foreground">
                        {reports?.appointmentTypes.presencial.percentage.toFixed(1)}% do total
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 pl-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Quantidade</span>
                    <span className="text-2xl font-bold text-foreground">
                      {reports?.appointmentTypes.presencial.count || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Receita</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(reports?.appointmentTypes.presencial.revenue || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Ticket Médio</span>
                    <span className="text-lg font-semibold text-foreground">
                      {formatCurrency(
                        reports?.appointmentTypes.presencial.count
                          ? reports.appointmentTypes.presencial.revenue / reports.appointmentTypes.presencial.count
                          : 0
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Virtual */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-purple-500/10 border-2 border-purple-500/30">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-purple-500/20">
                      <Monitor className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-foreground">Virtual</h4>
                      <p className="text-sm text-muted-foreground">
                        {reports?.appointmentTypes.virtual.percentage.toFixed(1)}% do total
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 pl-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Quantidade</span>
                    <span className="text-2xl font-bold text-foreground">
                      {reports?.appointmentTypes.virtual.count || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Receita</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {formatCurrency(reports?.appointmentTypes.virtual.revenue || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Ticket Médio</span>
                    <span className="text-lg font-semibold text-foreground">
                      {formatCurrency(
                        reports?.appointmentTypes.virtual.count
                          ? reports.appointmentTypes.virtual.revenue / reports.appointmentTypes.virtual.count
                          : 0
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Relatório de Produtos */}
        <div ref={productsRef} className="scroll-mt-6">
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
        </div>

        {/* Relatório de Serviços */}
        <div ref={servicesRef} className="scroll-mt-6">
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
        </div>

        {/* Relatório de Barbeiros */}
        <div ref={barbersRef} className="scroll-mt-6">
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
        </div>

        {/* Relatório de Horários */}
        <div ref={timeSlotsRef} className="scroll-mt-6">
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
      </div>
    </Layout>
  );
};

export default Reports;

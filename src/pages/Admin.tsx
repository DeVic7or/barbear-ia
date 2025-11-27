import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/formatters";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Users, DollarSign, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Subscription } from "@/hooks/useSubscriptions";

const Admin = () => {
  const { data: allSubscriptions = [], isLoading } = useQuery({
    queryKey: ["adminSubscriptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Subscription[];
    },
  });

  const activeSubscriptions = allSubscriptions.filter(s => s.status === 'active');
  const expiringSubscriptions = activeSubscriptions.filter(s => {
    if (!s.next_payment_date) return false;
    const days = differenceInDays(new Date(s.next_payment_date), new Date());
    return days <= 7 && days >= 0;
  });

  const totalRevenue = activeSubscriptions.reduce((sum, sub) => sum + Number(sub.plan_price), 0);
  const monthlyRecurring = totalRevenue;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Ativo", variant: "default" as const, icon: CheckCircle2 },
      pending: { label: "Pendente", variant: "secondary" as const, icon: Clock },
      cancelled: { label: "Cancelado", variant: "destructive" as const, icon: AlertTriangle },
      expired: { label: "Expirado", variant: "outline" as const, icon: Clock },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getDaysUntilRenewal = (nextPaymentDate: string | null) => {
    if (!nextPaymentDate) return null;
    const days = differenceInDays(new Date(nextPaymentDate), new Date());
    return days;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6 p-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Administrativo</h1>
          <p className="text-muted-foreground mt-2">
            Visão geral de todas as assinaturas e status de renovação
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Assinaturas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allSubscriptions.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeSubscriptions.length} ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Mensal (MRR)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(monthlyRecurring)}</div>
              <p className="text-xs text-muted-foreground">
                {activeSubscriptions.length} assinaturas ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Renovações Próximas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expiringSubscriptions.length}</div>
              <p className="text-xs text-muted-foreground">
                Nos próximos 7 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Retenção</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {allSubscriptions.length > 0 
                  ? Math.round((activeSubscriptions.length / allSubscriptions.length) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                De todas as assinaturas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subscriptions List */}
        <Card>
          <CardHeader>
            <CardTitle>Todas as Assinaturas</CardTitle>
            <CardDescription>
              Visão completa de todas as assinaturas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allSubscriptions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Nenhuma assinatura encontrada
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Plano</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Valor</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Próxima Renovação</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Dias até Vencer</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Criado em</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allSubscriptions.map((subscription) => {
                        const daysUntilRenewal = getDaysUntilRenewal(subscription.next_payment_date);
                        const isExpiringSoon = daysUntilRenewal !== null && daysUntilRenewal <= 7 && daysUntilRenewal >= 0;
                        
                        return (
                          <tr key={subscription.id} className="border-b border-border/40 hover:bg-muted/30">
                            <td className="p-3">
                              <div className="font-medium">{subscription.plan_name}</div>
                            </td>
                            <td className="p-3">
                              <div className="font-semibold">{formatCurrency(Number(subscription.plan_price))}</div>
                              <div className="text-xs text-muted-foreground">/mês</div>
                            </td>
                            <td className="p-3">
                              {getStatusBadge(subscription.status)}
                            </td>
                            <td className="p-3">
                              {subscription.next_payment_date ? (
                                <div className="text-sm">
                                  {format(new Date(subscription.next_payment_date), "dd/MM/yyyy", { locale: ptBR })}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </td>
                            <td className="p-3">
                              {daysUntilRenewal !== null ? (
                                <div className={`text-sm font-medium ${
                                  isExpiringSoon ? 'text-destructive' : 'text-foreground'
                                }`}>
                                  {daysUntilRenewal} dias
                                  {isExpiringSoon && (
                                    <AlertTriangle className="h-3 w-3 inline ml-1" />
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(subscription.created_at), "dd/MM/yyyy", { locale: ptBR })}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expiring Soon Section */}
        {expiringSubscriptions.length > 0 && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Atenção: Renovações Próximas
              </CardTitle>
              <CardDescription>
                Estas assinaturas vencem nos próximos 7 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expiringSubscriptions.map((subscription) => {
                  const days = getDaysUntilRenewal(subscription.next_payment_date);
                  return (
                    <div key={subscription.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                      <div>
                        <div className="font-medium">{subscription.plan_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(Number(subscription.plan_price))}/mês
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-destructive">
                          Vence em {days} {days === 1 ? 'dia' : 'dias'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {subscription.next_payment_date && format(new Date(subscription.next_payment_date), "dd/MM/yyyy")}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Admin;

import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { formatCurrency } from "@/lib/formatters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Download, CreditCard, Clock, CheckCircle2, XCircle } from "lucide-react";

const Payments = () => {
  const { subscriptions, isLoading } = useSubscriptions();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Ativo", variant: "default" as const, icon: CheckCircle2 },
      pending: { label: "Pendente", variant: "secondary" as const, icon: Clock },
      cancelled: { label: "Cancelado", variant: "destructive" as const, icon: XCircle },
      expired: { label: "Expirado", variant: "outline" as const, icon: XCircle },
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

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      pix: "PIX",
      credit_card: "Cartão de Crédito",
      boleto: "Boleto",
    };
    return methods[method] || method;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6 p-6">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Histórico de Pagamentos</h1>
          <p className="text-muted-foreground mt-2">
            Visualize suas assinaturas e faturas
          </p>
        </div>

        {subscriptions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhuma assinatura encontrada
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Você ainda não possui nenhuma assinatura ativa. Visite a página de planos para escolher o melhor para você.
              </p>
              <Button className="mt-6" onClick={() => window.location.href = "/planos"}>
                Ver Planos Disponíveis
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {subscriptions.map((subscription) => (
              <Card key={subscription.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">Plano {subscription.plan_name}</CardTitle>
                      <CardDescription className="mt-1">
                        Método de pagamento: {getPaymentMethodLabel(subscription.payment_method)}
                      </CardDescription>
                    </div>
                    {getStatusBadge(subscription.status)}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Valor</p>
                      <p className="text-2xl font-bold text-foreground">
                        {formatCurrency(Number(subscription.plan_price))}
                      </p>
                      <p className="text-xs text-muted-foreground">/mês</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Data do Pagamento</p>
                      <p className="text-base font-medium text-foreground">
                        {format(new Date(subscription.payment_date), "dd 'de' MMMM 'de' yyyy", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>

                    {subscription.next_payment_date && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Próximo Pagamento</p>
                        <p className="text-base font-medium text-foreground">
                          {format(new Date(subscription.next_payment_date), "dd 'de' MMMM 'de' yyyy", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    )}

                    {subscription.transaction_id && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">ID da Transação</p>
                        <p className="text-xs font-mono text-foreground break-all">
                          {subscription.transaction_id}
                        </p>
                      </div>
                    )}
                  </div>

                  {subscription.invoice_url && (
                    <div className="mt-6 pt-6 border-t border-border/40">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <Download className="h-4 w-4 mr-2" />
                        Baixar Fatura
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Precisa de ajuda?
            </CardTitle>
            <CardDescription>
              Entre em contato conosco para questões sobre pagamentos e faturas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Falar com Suporte</Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Payments;

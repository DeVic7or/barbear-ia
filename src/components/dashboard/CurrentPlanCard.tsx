import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentSubscription } from "@/hooks/useCurrentSubscription";
import { formatCurrency } from "@/lib/formatters";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CreditCard, Calendar, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CurrentPlanCard = () => {
  const { subscription, isLoading, isTrial } = useCurrentSubscription();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-10" />
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Sem Plano Ativo
          </CardTitle>
          <CardDescription>
            Você não possui um plano ativo no momento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate("/planos")} className="w-full">
            Ver Planos Disponíveis
          </Button>
        </CardContent>
      </Card>
    );
  }

  const daysUntilExpiration = subscription.next_payment_date
    ? differenceInDays(new Date(subscription.next_payment_date), new Date())
    : null;

  const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration <= 3;

  return (
    <Card className={isExpiringSoon ? "border-destructive/50 bg-destructive/5" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Plano Atual
            </CardTitle>
            <CardDescription className="mt-1">
              {isTrial ? "Período de teste gratuito" : "Seu plano ativo"}
            </CardDescription>
          </div>
          <Badge variant={isTrial ? "secondary" : "default"}>
            {subscription.status === "active" ? "Ativo" : "Inativo"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Plano</p>
              <p className="text-lg font-semibold text-foreground">
                {subscription.plan_name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Valor</p>
              <p className="text-lg font-semibold text-foreground">
                {isTrial ? "Grátis" : formatCurrency(Number(subscription.plan_price))}
              </p>
              {!isTrial && <p className="text-xs text-muted-foreground">/mês</p>}
            </div>
          </div>

          {subscription.next_payment_date && (
            <div className={`flex items-start gap-3 p-4 rounded-lg ${
              isExpiringSoon ? "bg-destructive/10 border border-destructive/20" : "bg-muted/50"
            }`}>
              <Calendar className={`h-5 w-5 mt-0.5 ${
                isExpiringSoon ? "text-destructive" : "text-muted-foreground"
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {isTrial ? "Trial expira em:" : "Próxima renovação:"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(new Date(subscription.next_payment_date), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </p>
                {daysUntilExpiration !== null && (
                  <p className={`text-sm font-medium mt-1 ${
                    isExpiringSoon ? "text-destructive" : "text-foreground"
                  }`}>
                    {daysUntilExpiration === 0 ? "Expira hoje!" : 
                     daysUntilExpiration === 1 ? "Expira amanhã!" :
                     `${daysUntilExpiration} dias restantes`}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {isTrial && (
          <Button onClick={() => navigate("/planos")} className="w-full" variant="default">
            Assinar um Plano
          </Button>
        )}

        {!isTrial && (
          <Button onClick={() => navigate("/pagamentos")} variant="outline" className="w-full">
            Ver Histórico de Pagamentos
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

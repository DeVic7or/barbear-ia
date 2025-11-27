import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentSubscription } from "@/hooks/useCurrentSubscription";
import { formatCurrency } from "@/lib/formatters";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CreditCard, Calendar, AlertTriangle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CurrentPlanBanner = () => {
  const { subscription, isLoading, isTrial } = useCurrentSubscription();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-6">
            <Skeleton className="h-20 flex-1" />
            <Skeleton className="h-10 w-40" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">Sem Plano Ativo</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Você não possui um plano ativo no momento
                </p>
              </div>
            </div>
            <Button onClick={() => navigate("/planos")} size="lg">
              Ver Planos Disponíveis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const daysUntilExpiration = subscription.next_payment_date
    ? differenceInDays(new Date(subscription.next_payment_date), new Date())
    : null;

  const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration <= 3;

  return (
    <Card className={isExpiringSoon ? "border-destructive/50 bg-destructive/5" : "bg-gradient-to-r from-primary/5 to-primary/10"}>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left Section - Plan Info */}
          <div className="flex items-start gap-4 flex-1">
            <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <CreditCard className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-bold text-foreground text-xl">
                  {subscription.plan_name}
                </h3>
                <Badge variant={isTrial ? "secondary" : "default"}>
                  {subscription.status === "active" ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {isTrial ? "Período de teste gratuito - Aproveite todos os recursos!" : "Seu plano ativo com todos os recursos"}
              </p>
            </div>
          </div>

          {/* Middle Section - Price and Date */}
          <div className="flex items-center gap-6 lg:gap-8">
            {/* Price */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Valor</p>
              <p className="text-2xl font-bold text-foreground">
                {isTrial ? "Grátis" : formatCurrency(Number(subscription.plan_price))}
              </p>
              {!isTrial && <p className="text-xs text-muted-foreground">/mês</p>}
            </div>

            {/* Divider */}
            <div className="h-12 w-px bg-border" />

            {/* Expiration */}
            {subscription.next_payment_date && (
              <div className={`text-center ${isExpiringSoon ? "animate-pulse" : ""}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className={`h-4 w-4 ${
                    isExpiringSoon ? "text-destructive" : "text-muted-foreground"
                  }`} />
                  <p className="text-sm text-muted-foreground">
                    {isTrial ? "Trial expira em" : "Próxima renovação"}
                  </p>
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {format(new Date(subscription.next_payment_date), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </p>
                {daysUntilExpiration !== null && (
                  <p className={`text-xs font-medium mt-1 ${
                    isExpiringSoon ? "text-destructive" : "text-muted-foreground"
                  }`}>
                    {daysUntilExpiration === 0 ? "Expira hoje!" : 
                     daysUntilExpiration === 1 ? "Expira amanhã!" :
                     `${daysUntilExpiration} dias restantes`}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Section - CTA */}
          <div className="flex items-center gap-3">
            {isTrial ? (
              <Button onClick={() => navigate("/planos")} size="lg" className="gap-2">
                Assinar um Plano
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => navigate("/pagamentos")} variant="outline" size="lg" className="gap-2">
                Ver Pagamentos
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

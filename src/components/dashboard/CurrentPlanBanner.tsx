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
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <Skeleton className="h-20 w-full sm:flex-1" />
            <Skeleton className="h-10 w-full sm:w-40" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-start gap-3 w-full">
              <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-base sm:text-lg">Sem Plano Ativo</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Você não possui um plano ativo no momento
                </p>
              </div>
            </div>
            <Button onClick={() => navigate("/planos")} size="lg" className="w-full sm:w-auto">
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
      <CardContent className="p-4 sm:p-6">
        {/* Mobile: Stack Vertically | Desktop: Horizontal Distribution */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
          {/* Plan Info Section */}
          <div className="flex items-start gap-3 sm:gap-4 lg:flex-shrink-0">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <CreditCard className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <h3 className="font-bold text-foreground text-lg sm:text-xl">
                  {subscription.plan_name}
                </h3>
                <Badge variant={isTrial ? "secondary" : "default"} className="text-xs">
                  {subscription.status === "active" ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {isTrial ? "Período de teste gratuito - Aproveite!" : "Seu plano ativo"}
              </p>
            </div>
          </div>

          {/* Stats Section - Horizontal on all sizes */}
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 lg:flex-1 lg:justify-center">
            {/* Price */}
            <div className="text-left sm:text-center">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Valor</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {isTrial ? "Grátis" : formatCurrency(Number(subscription.plan_price))}
              </p>
              {!isTrial && <p className="text-xs text-muted-foreground">/mês</p>}
            </div>

            {/* Divider */}
            <div className="h-12 w-px bg-border" />

            {/* Expiration */}
            {subscription.next_payment_date && (
              <div className={`text-left sm:text-center ${isExpiringSoon ? "animate-pulse" : ""}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className={`h-3 w-3 sm:h-4 sm:w-4 ${
                    isExpiringSoon ? "text-destructive" : "text-muted-foreground"
                  }`} />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {isTrial ? "Expira em" : "Renovação"}
                  </p>
                </div>
                <p className="text-base sm:text-lg font-semibold text-foreground">
                  {format(new Date(subscription.next_payment_date), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </p>
                {daysUntilExpiration !== null && (
                  <p className={`text-xs font-medium mt-1 ${
                    isExpiringSoon ? "text-destructive" : "text-muted-foreground"
                  }`}>
                    {daysUntilExpiration === 0 ? "Hoje!" : 
                     daysUntilExpiration === 1 ? "Amanhã!" :
                     `${daysUntilExpiration} dias`}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* CTA Button */}
          {isTrial ? (
            <Button onClick={() => navigate("/planos")} size="lg" className="w-full sm:w-auto lg:flex-shrink-0 gap-2">
              Assinar um Plano
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={() => navigate("/pagamentos")} variant="outline" size="lg" className="w-full sm:w-auto lg:flex-shrink-0 gap-2">
              Ver Pagamentos
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

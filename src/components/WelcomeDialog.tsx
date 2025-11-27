import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { useCurrentSubscription } from "@/hooks/useCurrentSubscription";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PartyPopper, Calendar } from "lucide-react";

export const WelcomeDialog = () => {
  const { shouldShowWelcome, markFirstLoginShown } = useProfile();
  const { subscription, isTrial } = useCurrentSubscription();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (shouldShowWelcome && isTrial && subscription) {
      setIsOpen(true);
    }
  }, [shouldShowWelcome, isTrial, subscription]);

  const handleClose = () => {
    setIsOpen(false);
    markFirstLoginShown.mutate();
  };

  if (!subscription || !isTrial) return null;

  const trialEndDate = subscription.next_payment_date 
    ? new Date(subscription.next_payment_date)
    : addDays(new Date(), 7);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <PartyPopper className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Bem-vindo ao Barber Manager! 🎉
          </DialogTitle>
          <DialogDescription className="text-center text-base mt-2">
            Estamos muito felizes em ter você conosco!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-primary/10 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <p className="font-semibold text-foreground text-lg">
                Período de Trial Gratuito
              </p>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Você tem acesso completo e gratuito à plataforma por
            </p>
            <p className="text-center text-3xl font-bold text-primary">
              7 dias
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-foreground text-center">
              Seu trial expira em:
            </p>
            <p className="text-center text-lg font-semibold text-foreground">
              {format(trialEndDate, "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </p>
            <p className="text-xs text-muted-foreground text-center">
              às {format(trialEndDate, "HH:mm", { locale: ptBR })}
            </p>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Aproveite todos os recursos da plataforma durante este período!
            </p>
            <p className="mt-2">
              Após o trial, escolha o plano ideal para continuar usando.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} className="w-full" size="lg">
            Começar a Usar Agora
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

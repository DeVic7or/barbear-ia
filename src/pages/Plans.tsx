import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptions } from "@/hooks/useSubscriptions";

const Plans = () => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string } | null>(null);
  const { toast } = useToast();
  const { createSubscription } = useSubscriptions();

  const pixCode = "00020126330014BR.GOV.BCB.PIX0111123456789015204000053039865802BR5913Barber Manager6009Sao Paulo62070503***6304ABCD";

  const handlePlanSelect = (planName: string, planPrice: string) => {
    setSelectedPlan({ name: planName, price: planPrice });
    setIsPaymentModalOpen(true);
  };

  const handleCopyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    toast({
      title: "Código copiado!",
      description: "O código PIX foi copiado para a área de transferência.",
    });
  };

  const handleConfirmPayment = () => {
    if (!selectedPlan) return;

    const priceValue = parseFloat(selectedPlan.price.replace("R$ ", "").replace(",", "."));
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    createSubscription.mutate({
      plan_name: selectedPlan.name,
      plan_price: priceValue,
      status: "active",
      payment_method: "pix",
      payment_date: new Date().toISOString(),
      next_payment_date: nextMonth.toISOString(),
      invoice_url: null,
      transaction_id: `PIX-${Date.now()}`,
    });

    setIsPaymentModalOpen(false);
    toast({
      title: "Pagamento confirmado!",
      description: "Sua assinatura foi ativada com sucesso.",
    });
  };

  const plans = [
    {
      name: "Básico",
      price: "R$ 99,90",
      period: "/mês",
      description: "Perfeito para barbearias iniciantes",
      popular: false,
      features: [
        "Até 3 barbeiros",
        "Agendamentos ilimitados",
        "Relatórios básicos",
      ],
    },
    {
      name: "Profissional",
      price: "R$ 199,90",
      period: "/mês",
      description: "Ideal para barbearias em crescimento",
      popular: true,
      features: [
        "Até 10 barbeiros",
        "Agendamentos ilimitados",
        "Relatórios avançados",
        "Suporte prioritário",
        "Assistência com IA",
        "Integração WhatsApp",
        "Gestão de produtos",
        "Comissões automáticas",
      ],
    },
    {
      name: "Empresarial",
      price: "R$ 399,90",
      period: "/mês",
      description: "Para redes e grandes estabelecimentos",
      popular: false,
      features: [
        "Barbeiros ilimitados",
        "Agendamentos ilimitados",
        "Relatórios personalizados",
        "Suporte 24/7",
        "Integração completa",
        "Gestão multi-unidades",
        "API de integração",
        "Treinamento dedicado",
      ],
    },
  ];

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Planos e Preços</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Escolha o plano ideal para sua barbearia
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.popular
                  ? "border-primary shadow-lg relative flex flex-col"
                  : "border-border/40 flex flex-col"
              }
            >
              {plan.popular && (
                <div className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground text-xs sm:text-sm">
                    Mais Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
                <div className="mt-3 sm:mt-4">
                  <span className="text-3xl sm:text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-sm sm:text-base text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 flex-grow flex flex-col p-4 sm:p-6 pt-0">
                <ul className="space-y-2 sm:space-y-3 flex-grow">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full mt-auto"
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                  onClick={() => handlePlanSelect(plan.name, plan.price)}
                >
                  {plan.popular ? "Assinar Agora" : "Escolher Plano"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-muted/50">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Precisa de algo personalizado?</CardTitle>
            <CardDescription className="text-sm">
              Entre em contato conosco para criar um plano sob medida para sua barbearia
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <Button variant="outline" className="w-full sm:w-auto">Falar com Especialista</Button>
          </CardContent>
        </Card>

        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Pagamento via PIX</DialogTitle>
              <DialogDescription className="text-sm">
                Plano selecionado: {selectedPlan?.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 sm:space-y-6">
              {/* QR Code Mockup */}
              <div className="flex justify-center">
                <div className="w-48 h-48 sm:w-64 sm:h-64 bg-background border-2 border-border rounded-lg flex items-center justify-center">
                  <div className="w-44 h-44 sm:w-56 sm:h-56 bg-foreground/10 rounded grid grid-cols-8 gap-1 p-2">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div
                        key={i}
                        className={`${
                          Math.random() > 0.5 ? "bg-foreground" : "bg-transparent"
                        } rounded-sm`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* PIX Copia e Cola */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">
                  PIX Copia e Cola
                </label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={pixCode}
                    className="font-mono text-[10px] sm:text-xs"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopyPixCode}
                    className="flex-shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Clique no botão para copiar o código PIX
                </p>
              </div>

              {/* Confirm Payment Button */}
              <Button 
                className="w-full" 
                onClick={handleConfirmPayment}
                disabled={createSubscription.isPending}
                size="lg"
              >
                {createSubscription.isPending ? "Processando..." : "Confirmar Pagamento"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Plans;

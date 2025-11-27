import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const Plans = () => {
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
        "Suporte por email",
        "App mobile",
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
        "App mobile",
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
        "App mobile white-label",
        "Integração completa",
        "Gestão multi-unidades",
        "API de integração",
        "Treinamento dedicado",
      ],
    },
  ];

  return (
    <Layout>
      <div className="space-y-8 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Planos e Preços</h1>
          <p className="text-muted-foreground mt-2">
            Escolha o plano ideal para sua barbearia
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.popular
                  ? "border-primary shadow-lg relative"
                  : "border-border/40"
              }
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Mais Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  {plan.popular ? "Assinar Agora" : "Escolher Plano"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>Precisa de algo personalizado?</CardTitle>
            <CardDescription>
              Entre em contato conosco para criar um plano sob medida para sua barbearia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Falar com Especialista</Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Plans;

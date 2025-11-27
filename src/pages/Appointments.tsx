import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Calendar, Clock, User } from "lucide-react";

const mockAppointments = [
  {
    id: "1",
    client: "João da Silva",
    barber: "Carlos Silva",
    service: "Corte + Barba",
    date: "2024-11-25",
    time: "14:00",
    status: "Confirmado",
    price: 50,
  },
  {
    id: "2",
    client: "Maria Santos",
    barber: "João Santos",
    service: "Corte",
    date: "2024-11-25",
    time: "15:00",
    status: "Aguardando",
    price: 35,
  },
  {
    id: "3",
    client: "Pedro Costa",
    barber: "Pedro Oliveira",
    service: "Degradê",
    date: "2024-11-25",
    time: "16:00",
    status: "Confirmado",
    price: 40,
  },
  {
    id: "4",
    client: "Ana Lima",
    barber: "Carlos Silva",
    service: "Corte Feminino",
    date: "2024-11-26",
    time: "10:00",
    status: "Confirmado",
    price: 45,
  },
];

const Appointments = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmado":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "Aguardando":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "Cancelado":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agendamentos</h1>
            <p className="text-muted-foreground mt-1">Gerencie todos os agendamentos da barbearia</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>

        <Card className="border-border/40 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Próximos Agendamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border/40 hover:bg-secondary/80 transition-all"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {appointment.client.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{appointment.client}</h3>
                      <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{appointment.barber}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(appointment.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{appointment.time}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{appointment.service}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">
                        R$ {appointment.price.toFixed(2)}
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Appointments;

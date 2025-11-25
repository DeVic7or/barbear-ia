import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Barber {
  id: string;
  name: string;
  avatar?: string;
  appointments: number;
  revenue: number;
  commission: number;
}

interface BarbersListProps {
  barbers: Barber[];
}

export function BarbersList({ barbers }: BarbersListProps) {
  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-foreground">Comissões por Barbeiro</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {barbers.map((barber) => (
            <div
              key={barber.id}
              className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border/40 transition-all hover:bg-secondary/80"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarImage src={barber.avatar} alt={barber.name} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {barber.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground">{barber.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {barber.appointments} agendamentos
                  </p>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="text-lg font-bold text-foreground">
                  R$ {barber.commission.toFixed(2)}
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                  R$ {barber.revenue.toFixed(2)} faturado
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Mail, Phone, Edit } from "lucide-react";

const mockBarbers = [
  {
    id: "1",
    name: "Carlos Silva",
    email: "carlos@example.com",
    phone: "(11) 98765-4321",
    specialties: ["Corte", "Barba", "Degradê"],
    status: "Ativo",
  },
  {
    id: "2",
    name: "João Santos",
    email: "joao@example.com",
    phone: "(11) 98765-4322",
    specialties: ["Corte", "Barba"],
    status: "Ativo",
  },
  {
    id: "3",
    name: "Pedro Oliveira",
    email: "pedro@example.com",
    phone: "(11) 98765-4323",
    specialties: ["Corte", "Degradê", "Químicas"],
    status: "Ativo",
  },
];

const Barbers = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Barbeiros</h1>
            <p className="text-muted-foreground mt-1">Gerencie sua equipe de profissionais</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Barbeiro
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockBarbers.map((barber) => (
            <Card key={barber.id} className="border-border/40 bg-card/50 backdrop-blur hover:bg-card/80 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                      <AvatarImage src="" alt={barber.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {barber.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{barber.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1 bg-primary/10 text-primary">
                        {barber.status}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="hover:bg-secondary/80">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{barber.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{barber.phone}</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {barber.specialties.map((specialty) => (
                    <Badge key={specialty} variant="outline">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Barbers;

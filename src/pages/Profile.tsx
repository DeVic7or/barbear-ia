import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Camera, Save } from "lucide-react";

const Profile = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Perfil</h1>
            <p className="text-muted-foreground mt-1">Gerencie suas informações pessoais e preferências</p>
          </div>

          <Card className="border-border/40 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-primary/20">
                    <AvatarImage src="" alt="Profile" />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                      AD
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-lg"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Foto de Perfil</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Clique no ícone para alterar sua foto
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" placeholder="Seu nome" defaultValue="Admin User" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" placeholder="seu@email.com" defaultValue="admin@barber.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" placeholder="(11) 98765-4321" defaultValue="(11) 98765-4321" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Cargo</Label>
                  <Input id="role" placeholder="Seu cargo" defaultValue="Administrador" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Informações da Barbearia</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="barber-name">Nome da Barbearia</Label>
                    <Input id="barber-name" placeholder="Nome da barbearia" defaultValue="Barber Shop Premium" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barber-phone">Telefone Comercial</Label>
                    <Input id="barber-phone" placeholder="(11) 3456-7890" defaultValue="(11) 3456-7890" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input id="address" placeholder="Rua, número, bairro" defaultValue="Rua das Flores, 123 - Centro" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button variant="outline">Cancelar</Button>
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;

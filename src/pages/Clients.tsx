import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useClients, useCreateClient } from "@/hooks/useClients";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Phone, Plus, Star } from "lucide-react";
import { ClientFormDialog } from "@/components/clients/ClientFormDialog";
import { ClientDetailsModal } from "@/components/clients/ClientDetailsModal";

const Clients = () => {
  const { data: clients, isLoading } = useClients();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const createClient = useCreateClient();

  const handleCreateClient = (data: any) => {
    createClient.mutate(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
      },
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Clientes</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Gerenciar e visualizar informações dos clientes
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Clientes</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Gerenciar e visualizar informações dos clientes
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Cadastrar Cliente
          </Button>
        </div>

        {/* Cards de Clientes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {clients?.map((client) => (
            <Card
              key={client.id}
              className="cursor-pointer transition-all hover:shadow-md hover:ring-2 hover:ring-primary"
              onClick={() => {
                setSelectedClientId(client.id);
                setIsDetailsModalOpen(true);
              }}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {client.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="w-full">
                    <h3 className="font-semibold text-foreground truncate">{client.name}</h3>
                    <p className="text-sm text-muted-foreground truncate flex items-center justify-center gap-1">
                      <Phone className="h-3 w-3" />
                      {client.phone}
                    </p>
                  </div>
                  <Separator />
                  <div className="w-full">
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <Star className="h-4 w-4 fill-primary" />
                      <span className="text-lg font-bold">{client.appointment_count}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {client.appointment_count === 1 ? "agendamento" : "agendamentos"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <ClientDetailsModal
        clientId={selectedClientId}
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
      />

      <ClientFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleCreateClient}
        isLoading={createClient.isPending}
      />
    </Layout>
  );
};

export default Clients;

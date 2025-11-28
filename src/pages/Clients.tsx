import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { useClients, useCreateClient } from "@/hooks/useClients";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Plus, Star, Search } from "lucide-react";
import { ClientFormDialog } from "@/components/clients/ClientFormDialog";
import { ClientDetailsModal } from "@/components/clients/ClientDetailsModal";

const Clients = () => {
  const { data: clients, isLoading } = useClients();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const createClient = useCreateClient();

  // Filter clients based on search term
  const filteredClients = useMemo(() => {
    if (!clients) return [];
    
    const term = searchTerm.trim().toLowerCase();
    if (!term) return clients;

    return clients.filter((client) => {
      const nameMatch = client.name.toLowerCase().includes(term);
      const phoneMatch = client.phone.toLowerCase().includes(term);
      return nameMatch || phoneMatch;
    });
  }, [clients, searchTerm]);

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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 sm:p-6">
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

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            maxLength={100}
          />
        </div>

        {/* Cards de Clientes */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {filteredClients.length === 0 && searchTerm ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <p>Nenhum cliente encontrado para "{searchTerm}"</p>
            </div>
          ) : (
            filteredClients.map((client) => (
            <Card
              key={client.id}
              className="cursor-pointer transition-all hover:shadow-md hover:ring-2 hover:ring-primary"
              onClick={() => {
                setSelectedClientId(client.id);
                setIsDetailsModalOpen(true);
              }}
            >
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col items-center text-center gap-2 sm:gap-3">
                  <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-base sm:text-xl">
                      {client.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="w-full">
                    <h3 className="font-semibold text-foreground truncate text-sm sm:text-base">{client.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate flex items-center justify-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span className="hidden sm:inline">{client.phone}</span>
                      <span className="sm:hidden">{client.phone.slice(0, 9)}...</span>
                    </p>
                  </div>
                  <Separator className="hidden sm:block" />
                  <div className="w-full">
                    <div className="flex items-center justify-center gap-1 sm:gap-2 text-primary">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-primary" />
                      <span className="text-base sm:text-lg font-bold">{client.appointment_count}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                      {client.appointment_count === 1 ? "agendamento" : "agendamentos"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            ))
          )}
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

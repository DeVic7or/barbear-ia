import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useClients, useClientDetails, useCreateClient } from "@/hooks/useClients";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User, Phone, Mail, Calendar, TrendingUp, Clock, DollarSign, Plus, Star } from "lucide-react";
import { ClientFormDialog } from "@/components/clients/ClientFormDialog";

const Clients = () => {
  const { data: clients, isLoading } = useClients();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: clientDetails, isLoading: isLoadingDetails } = useClientDetails(selectedClientId || "");
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
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedClientId === client.id
                  ? "ring-2 ring-primary shadow-lg"
                  : ""
              }`}
              onClick={() => setSelectedClientId(client.id)}
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

        {/* Detalhes do Cliente */}
        {selectedClientId && (
        <div className="space-y-6 mt-8">
          {!selectedClientId ? (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione um cliente para ver os detalhes</p>
                </div>
              </CardContent>
            </Card>
          ) : isLoadingDetails ? (
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ) : clientDetails ? (
            <>
              {/* Informações do Cliente */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-foreground">Informações do Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Nome</p>
                        <p className="font-medium text-foreground">{clientDetails.client.name}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Telefone</p>
                        <p className="font-medium text-foreground">{clientDetails.client.phone}</p>
                      </div>
                    </div>
                    {clientDetails.client.email && (
                      <>
                        <Separator />
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium text-foreground">{clientDetails.client.email}</p>
                          </div>
                        </div>
                      </>
                    )}
                    {clientDetails.client.birthday && (
                      <>
                        <Separator />
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Aniversário</p>
                            <p className="font-medium text-foreground">
                              {format(new Date(clientDetails.client.birthday), "dd 'de' MMMM", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <DollarSign className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Gasto</p>
                        <p className="text-lg font-bold text-foreground">
                          {formatCurrency(clientDetails.stats.totalSpent)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Agendamentos</p>
                        <p className="text-lg font-bold text-foreground">
                          {clientDetails.stats.totalAppointments}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Último Agendamento</p>
                        <p className="text-lg font-bold text-foreground">
                          {clientDetails.stats.lastAppointment
                            ? format(new Date(clientDetails.stats.lastAppointment), "dd/MM/yy")
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Ticket Médio</p>
                        <p className="text-lg font-bold text-foreground">
                          {formatCurrency(
                            clientDetails.stats.totalAppointments > 0
                              ? clientDetails.stats.totalSpent / clientDetails.stats.totalAppointments
                              : 0
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Histórico de Agendamentos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-foreground">Histórico de Agendamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {clientDetails.appointments.map((appointment: any) => {
                      let total = 0;
                      if (appointment.services?.price) {
                        total += Number(appointment.services.price);
                      }
                      appointment.appointment_services?.forEach((as: any) => {
                        if (as.services?.price) {
                          total += Number(as.services.price);
                        }
                      });
                      appointment.appointment_products?.forEach((ap: any) => {
                        if (ap.products?.price && ap.quantity) {
                          total += Number(ap.products.price) * ap.quantity;
                        }
                      });

                      return (
                        <div
                          key={appointment.id}
                          className="p-4 rounded-lg border bg-card border-border"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-foreground">
                                {format(new Date(appointment.appointment_date), "dd/MM/yyyy", { locale: ptBR })} - {appointment.appointment_time}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Barbeiro: {appointment.barbers?.name || "N/A"}
                              </p>
                            </div>
                            <Badge variant={appointment.status === "Concluído" ? "default" : "secondary"}>
                              {appointment.status}
                            </Badge>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground">
                              {appointment.services?.name || "Serviço"}
                            </p>
                            <p className="font-medium text-foreground">{formatCurrency(total)}</p>
                          </div>
                        </div>
                      );
                    })}
                    {clientDetails.appointments.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhum agendamento encontrado
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
        )}
      </div>

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

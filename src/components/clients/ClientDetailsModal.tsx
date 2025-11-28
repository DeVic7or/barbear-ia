import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User, Phone, Mail, Calendar, TrendingUp, Clock, DollarSign } from "lucide-react";
import { useClientDetails } from "@/hooks/useClients";

interface ClientDetailsModalProps {
  clientId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ClientDetailsModal = ({ clientId, open, onOpenChange }: ClientDetailsModalProps) => {
  const { data: clientDetails, isLoading } = useClientDetails(clientId || "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Cliente</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : clientDetails ? (
          <div className="space-y-6">
            {/* Informações do Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Informações Pessoais</CardTitle>
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

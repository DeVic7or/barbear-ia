import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, Clock, User, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { AppointmentDetailsModal } from "@/components/appointments/AppointmentDetailsModal";
import { NewAppointmentDialog } from "@/components/appointments/NewAppointmentDialog";
import { useAppointments } from "@/hooks/useAppointments";
import { formatCurrency } from "@/lib/formatters";

const Appointments = () => {
  const { data: appointments, isLoading } = useAppointments();
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false);

  // Filtrar agendamentos por status
  const confirmedAppointments = useMemo(() => 
    appointments?.filter(apt => apt.status === "Confirmado") || [],
    [appointments]
  );

  const completedAppointments = useMemo(() => 
    appointments?.filter(apt => apt.status === "Concluído") || [],
    [appointments]
  );

  const cancelledAppointments = useMemo(() => 
    appointments?.filter(apt => apt.status === "Cancelado") || [],
    [appointments]
  );

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

  const renderAppointmentCard = (appointment: any) => (
    <div
      key={appointment.id}
      onClick={() => setSelectedAppointment(appointment)}
      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-secondary/50 border border-border/40 hover:bg-secondary/80 transition-all cursor-pointer"
    >
      <div className="flex items-center gap-3 sm:gap-4 w-full sm:flex-1">
        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-primary/20 flex-shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm">
            {appointment.client_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm sm:text-base">{appointment.client_name}</h3>
          <div className="flex flex-wrap gap-2 sm:gap-3 mt-1 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{appointment.barbers?.name || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(appointment.appointment_date).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{appointment.appointment_time}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{appointment.services?.name || 'N/A'}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-lg font-bold text-foreground">
            {formatCurrency(appointment.services?.price || 0)}
          </div>
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status}
          </Badge>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agendamentos</h1>
            <p className="text-muted-foreground mt-1">Gerencie todos os agendamentos da barbearia</p>
          </div>
          <Button className="gap-2" onClick={() => setNewAppointmentOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>

        <Tabs defaultValue="confirmed" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="confirmed" className="gap-2">
              <Calendar className="h-4 w-4" />
              Próximos
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Concluídos
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="gap-2">
              <XCircle className="h-4 w-4" />
              Cancelados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="confirmed" className="mt-6">
            <Card className="border-border/40 bg-card/50 backdrop-blur">
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : confirmedAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {confirmedAppointments.map(renderAppointmentCard)}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum agendamento confirmado
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <Card className="border-border/40 bg-card/50 backdrop-blur">
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : completedAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {completedAppointments.map(renderAppointmentCard)}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum agendamento concluído
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cancelled" className="mt-6">
            <Card className="border-border/40 bg-card/50 backdrop-blur">
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : cancelledAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {cancelledAppointments.map(renderAppointmentCard)}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum agendamento cancelado
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <AppointmentDetailsModal
          appointment={selectedAppointment}
          open={!!selectedAppointment}
          onOpenChange={(open) => !open && setSelectedAppointment(null)}
        />

        <NewAppointmentDialog
          open={newAppointmentOpen}
          onOpenChange={setNewAppointmentOpen}
        />
      </div>
    </Layout>
  );
};

export default Appointments;

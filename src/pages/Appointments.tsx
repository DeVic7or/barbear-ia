import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, Clock, User, Loader2, CheckCircle2, XCircle, Phone, Monitor, Store } from "lucide-react";
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
      className="group p-4 sm:p-5 rounded-xl bg-card border-2 border-border hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        {/* Avatar e Info Principal */}
        <div className="flex items-start gap-4 flex-1">
          <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border-2 border-primary/30 flex-shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
              {appointment.client_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0 space-y-2">
            {/* Nome do Cliente e Tipo */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                {appointment.client_name}
              </h3>
              <Badge 
                variant="outline" 
                className={`${
                  appointment.appointment_type === "Presencial" 
                    ? "bg-blue-500/10 text-blue-600 border-blue-500/30" 
                    : "bg-purple-500/10 text-purple-600 border-purple-500/30"
                }`}
              >
                {appointment.appointment_type === "Presencial" ? (
                  <>
                    <Store className="h-3 w-3 mr-1" />
                    Presencial
                  </>
                ) : (
                  <>
                    <Monitor className="h-3 w-3 mr-1" />
                    Virtual
                  </>
                )}
              </Badge>
            </div>
            
            {/* Telefone */}
            {appointment.client_phone && (
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span className="font-medium">{appointment.client_phone}</span>
              </div>
            )}
            
            {/* Informações do Agendamento */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium">{appointment.barbers?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium">{new Date(appointment.appointment_date).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium">{appointment.appointment_time}</span>
              </div>
            </div>
            
            {/* Serviço */}
            <div className="inline-block px-3 py-1 bg-primary/10 rounded-full">
              <p className="text-sm font-medium text-primary">{appointment.services?.name || 'N/A'}</p>
            </div>
          </div>
        </div>
        
        {/* Preço e Status */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:min-w-[120px]">
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">Valor</p>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(appointment.services?.price || 0)}
            </div>
          </div>
          <Badge className={`${getStatusColor(appointment.status)} px-3 py-1 text-sm font-semibold`}>
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

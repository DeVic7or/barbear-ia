import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Scissors, DollarSign } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Appointment {
  id: string;
  client: string;
  barber: string;
  service: string;
  date: string;
  time: string;
  status: "agendado" | "em_execucao" | "executado";
  price: number;
}

interface AppointmentCardProps {
  appointment: Appointment;
}

const getStatusLabel = (status: string) => {
  const labels = {
    agendado: "Agendado",
    em_execucao: "Em Execução",
    executado: "Executado",
  };
  return labels[status as keyof typeof labels] || status;
};

const getStatusColor = (status: string) => {
  const colors = {
    agendado: "bg-blue-500/20 text-blue-600 border-blue-500/30",
    em_execucao: "bg-orange-500/20 text-orange-600 border-orange-500/30",
    executado: "bg-green-500/20 text-green-600 border-green-500/30",
  };
  return colors[status as keyof typeof colors] || "";
};

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: appointment.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="cursor-grab active:cursor-grabbing border-border/40 bg-card/50 backdrop-blur hover:bg-card/80 transition-all">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {appointment.client.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">{appointment.client}</p>
                <p className="text-sm text-muted-foreground">{appointment.barber}</p>
              </div>
            </div>
            <Badge className={getStatusColor(appointment.status)} variant="outline">
              {getStatusLabel(appointment.status)}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Scissors className="h-4 w-4 text-primary" />
              <span>{appointment.service}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{appointment.date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              <span>{appointment.time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <DollarSign className="h-4 w-4 text-primary" />
              <span>R$ {appointment.price.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

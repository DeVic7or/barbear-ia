import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { AppointmentCard } from "./AppointmentCard";

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

interface KanbanColumnProps {
  id: string;
  title: string;
  appointments: Appointment[];
  color: string;
}

export function KanbanColumn({ id, title, appointments, color }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <Card
      className={`border-border/40 bg-card/30 backdrop-blur transition-all ${
        isOver ? "ring-2 ring-primary" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            {title}
          </CardTitle>
          <Badge variant="secondary" className={color}>
            {appointments.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={setNodeRef}
          className="space-y-3 min-h-[400px]"
        >
          <SortableContext
            items={appointments.map((a) => a.id)}
            strategy={verticalListSortingStrategy}
          >
            {appointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </SortableContext>
          {appointments.length === 0 && (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
              Nenhum agendamento
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import { PeriodFilter } from "@/components/dashboard/PeriodFilter";
import { KanbanColumn } from "@/components/appointments/KanbanColumn";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";

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

// Mock data
const initialAppointments: Appointment[] = [
  {
    id: "1",
    client: "João Silva",
    barber: "Carlos Silva",
    service: "Corte + Barba",
    date: "15/11/2024",
    time: "09:00",
    status: "agendado",
    price: 50.0,
  },
  {
    id: "2",
    client: "Pedro Santos",
    barber: "João Santos",
    service: "Corte Degradê",
    date: "15/11/2024",
    time: "10:00",
    status: "agendado",
    price: 35.0,
  },
  {
    id: "3",
    client: "Lucas Oliveira",
    barber: "Pedro Oliveira",
    service: "Barba",
    date: "15/11/2024",
    time: "11:00",
    status: "em_execucao",
    price: 25.0,
  },
  {
    id: "4",
    client: "Rafael Costa",
    barber: "Rafael Costa",
    service: "Corte Social",
    date: "15/11/2024",
    time: "14:00",
    status: "em_execucao",
    price: 40.0,
  },
  {
    id: "5",
    client: "Marcos Lima",
    barber: "Carlos Silva",
    service: "Corte + Barba",
    date: "14/11/2024",
    time: "16:00",
    status: "executado",
    price: 50.0,
  },
  {
    id: "6",
    client: "André Souza",
    barber: "João Santos",
    service: "Desenho de Barba",
    date: "14/11/2024",
    time: "15:00",
    status: "executado",
    price: 30.0,
  },
];

const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const appointmentId = active.id as string;
    const newStatus = over.id as "agendado" | "em_execucao" | "executado";

    setAppointments((appointments) =>
      appointments.map((appointment) =>
        appointment.id === appointmentId
          ? { ...appointment, status: newStatus }
          : appointment
      )
    );

    setActiveId(null);
  };

  const agendadoAppointments = appointments.filter((a) => a.status === "agendado");
  const emExecucaoAppointments = appointments.filter((a) => a.status === "em_execucao");
  const executadoAppointments = appointments.filter((a) => a.status === "executado");

  const activeAppointment = appointments.find((a) => a.id === activeId);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agendamentos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seus agendamentos em tempo real
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>

        {/* Filtro de Período */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Período de Análise
          </h2>
          <PeriodFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
        </div>

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <KanbanColumn
              id="agendado"
              title="Agendado"
              appointments={agendadoAppointments}
              color="bg-blue-500/20 text-blue-600"
            />
            <KanbanColumn
              id="em_execucao"
              title="Em Execução"
              appointments={emExecucaoAppointments}
              color="bg-orange-500/20 text-orange-600"
            />
            <KanbanColumn
              id="executado"
              title="Executado"
              appointments={executadoAppointments}
              color="bg-green-500/20 text-green-600"
            />
          </div>

          <DragOverlay>
            {activeAppointment ? (
              <AppointmentCard appointment={activeAppointment} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </Layout>
  );
};

export default Appointments;

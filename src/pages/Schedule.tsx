import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useUserAvailability, useCreateAvailability, useUpdateAvailability, useDeleteAvailability } from "@/hooks/useAvailability";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

const Schedule = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const { data: availability, isLoading } = useUserAvailability(userId || undefined);
  const createAvailability = useCreateAvailability();
  const updateAvailability = useUpdateAvailability();
  const deleteAvailability = useDeleteAvailability();
  const { toast } = useToast();

  const [newSchedule, setNewSchedule] = useState<{
    day_of_week: number;
    start_time: string;
    end_time: string;
  }>({
    day_of_week: 1,
    start_time: "09:00",
    end_time: "18:00",
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  const handleAddSchedule = async () => {
    if (!userId) return;

    // Validar horários
    if (newSchedule.start_time >= newSchedule.end_time) {
      toast({
        title: "Erro",
        description: "O horário de início deve ser anterior ao horário de término",
        variant: "destructive",
      });
      return;
    }

    // Verificar se já existe disponibilidade para esse dia
    const existingDay = availability?.find(a => a.day_of_week === newSchedule.day_of_week);
    if (existingDay) {
      toast({
        title: "Erro",
        description: "Já existe um horário configurado para este dia",
        variant: "destructive",
      });
      return;
    }

    try {
      await createAvailability.mutateAsync({
        user_id: userId,
        day_of_week: newSchedule.day_of_week,
        start_time: newSchedule.start_time,
        end_time: newSchedule.end_time,
        is_active: true,
      });

      toast({
        title: "Sucesso",
        description: "Horário adicionado com sucesso",
      });

      // Reset form
      setNewSchedule({
        day_of_week: 1,
        start_time: "09:00",
        end_time: "18:00",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao adicionar horário",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await updateAvailability.mutateAsync({
        id,
        is_active: !currentActive,
      });

      toast({
        title: "Sucesso",
        description: currentActive ? "Dia desativado" : "Dia ativado",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar disponibilidade",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAvailability.mutateAsync(id);
      toast({
        title: "Sucesso",
        description: "Horário removido com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao remover horário",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Minha Agenda</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Configure seus dias e horários de atendimento
          </p>
        </div>

        {/* Add New Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Plus className="h-5 w-5" />
              Adicionar Horário
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Defina um novo dia e horário de disponibilidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="day" className="text-xs sm:text-sm">Dia da Semana</Label>
                <select
                  id="day"
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background"
                  value={newSchedule.day_of_week}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, day_of_week: parseInt(e.target.value) })
                  }
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start-time" className="text-xs sm:text-sm">Horário Início</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={newSchedule.start_time}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, start_time: e.target.value })
                  }
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-time" className="text-xs sm:text-sm">Horário Término</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={newSchedule.end_time}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, end_time: e.target.value })
                  }
                  className="text-sm"
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleAddSchedule}
                  disabled={createAvailability.isPending}
                  className="w-full"
                  size="default"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Calendar className="h-5 w-5" />
              Horários Configurados
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Seus dias e horários de atendimento ativos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!availability || availability.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Nenhum horário configurado ainda
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {availability.map((schedule) => {
                  const dayInfo = DAYS_OF_WEEK.find((d) => d.value === schedule.day_of_week);
                  return (
                    <div
                      key={schedule.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg bg-card"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground text-sm sm:text-base">
                            {dayInfo?.label}
                          </h4>
                          {!schedule.is_active && (
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                              Inativo
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                          {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`active-${schedule.id}`} className="text-xs sm:text-sm cursor-pointer">
                            {schedule.is_active ? "Ativo" : "Inativo"}
                          </Label>
                          <Switch
                            id={`active-${schedule.id}`}
                            checked={schedule.is_active}
                            onCheckedChange={() =>
                              handleToggleActive(schedule.id, schedule.is_active)
                            }
                          />
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(schedule.id)}
                          disabled={deleteAvailability.isPending}
                          className="h-8 w-8 sm:h-9 sm:w-9"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Schedule;

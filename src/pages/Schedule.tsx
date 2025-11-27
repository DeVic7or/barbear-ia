import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useUserAvailability, useCreateAvailability, useUpdateAvailability, useDeleteAvailability } from "@/hooks/useAvailability";
import { useBreaks, useCreateBreak, useDeleteBreak } from "@/hooks/useBreaks";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Plus, Trash2, Copy, Coffee } from "lucide-react";
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

  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [sourceToCopy, setSourceToCopy] = useState<{
    day_of_week: number;
    start_time: string;
    end_time: string;
  } | null>(null);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const [breakDialogOpen, setBreakDialogOpen] = useState(false);
  const [selectedAvailabilityForBreak, setSelectedAvailabilityForBreak] = useState<string | null>(null);
  const [newBreak, setNewBreak] = useState({
    break_name: "Almoço",
    break_start_time: "12:00",
    break_end_time: "13:00",
  });

  const { data: breaksData } = useBreaks(selectedAvailabilityForBreak || undefined);
  const createBreak = useCreateBreak();
  const deleteBreak = useDeleteBreak();

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

  const handleOpenCopyDialog = (schedule: { day_of_week: number; start_time: string; end_time: string }) => {
    setSourceToCopy(schedule);
    setSelectedDays([]);
    setCopyDialogOpen(true);
  };

  const handleToggleDay = (dayValue: number) => {
    setSelectedDays(prev => 
      prev.includes(dayValue) 
        ? prev.filter(d => d !== dayValue)
        : [...prev, dayValue]
    );
  };

  const handleCopyToSelectedDays = async () => {
    if (!userId || !sourceToCopy || selectedDays.length === 0) return;

    try {
      for (const dayOfWeek of selectedDays) {
        // Check if availability already exists for this day
        const existing = availability?.find(a => a.day_of_week === dayOfWeek);

        if (existing) {
          // Update existing
          await updateAvailability.mutateAsync({
            id: existing.id,
            start_time: sourceToCopy.start_time,
            end_time: sourceToCopy.end_time,
            is_active: true,
          });
        } else {
          // Create new
          await createAvailability.mutateAsync({
            user_id: userId,
            day_of_week: dayOfWeek,
            start_time: sourceToCopy.start_time,
            end_time: sourceToCopy.end_time,
            is_active: true,
          });
        }
      }

      toast({
        title: "Sucesso",
        description: `Horário copiado para ${selectedDays.length} dia(s)`,
      });

      setCopyDialogOpen(false);
      setSelectedDays([]);
      setSourceToCopy(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao copiar horários",
        variant: "destructive",
      });
    }
  };

  const handleOpenBreakDialog = (availabilityId: string) => {
    setSelectedAvailabilityForBreak(availabilityId);
    setNewBreak({
      break_name: "Almoço",
      break_start_time: "12:00",
      break_end_time: "13:00",
    });
    setBreakDialogOpen(true);
  };

  const handleAddBreak = async () => {
    if (!selectedAvailabilityForBreak) return;

    // Validar horários
    if (newBreak.break_start_time >= newBreak.break_end_time) {
      toast({
        title: "Erro",
        description: "O horário de início deve ser anterior ao horário de término",
        variant: "destructive",
      });
      return;
    }

    try {
      await createBreak.mutateAsync({
        user_availability_id: selectedAvailabilityForBreak,
        break_name: newBreak.break_name.trim() || "Intervalo",
        break_start_time: newBreak.break_start_time,
        break_end_time: newBreak.break_end_time,
      });

      toast({
        title: "Sucesso",
        description: "Intervalo adicionado com sucesso",
      });

      setBreakDialogOpen(false);
      setNewBreak({
        break_name: "Almoço",
        break_start_time: "12:00",
        break_end_time: "13:00",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao adicionar intervalo",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBreak = async (breakId: string) => {
    try {
      await deleteBreak.mutateAsync(breakId);
      toast({
        title: "Sucesso",
        description: "Intervalo removido",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao remover intervalo",
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
                    <Card key={schedule.id} className="p-3 sm:p-4">
                      <div className="flex flex-col gap-3">
                        {/* Main Schedule Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

                          <div className="flex items-center gap-2 sm:gap-3">
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
                              variant="outline"
                              size="icon"
                              onClick={() => handleOpenCopyDialog({
                                day_of_week: schedule.day_of_week,
                                start_time: schedule.start_time,
                                end_time: schedule.end_time
                              })}
                              title="Copiar para outros dias"
                              className="h-8 w-8 sm:h-9 sm:w-9"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>

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

                        {/* Breaks Section */}
                        <div className="border-t pt-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                              <Coffee className="h-3 w-3 sm:h-4 sm:w-4" />
                              Intervalos
                            </Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenBreakDialog(schedule.id)}
                              className="h-7 text-xs"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Adicionar
                            </Button>
                          </div>

                          <BreaksList 
                            availabilityId={schedule.id} 
                            onDelete={handleDeleteBreak}
                            isDeleting={deleteBreak.isPending}
                          />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Copy Dialog */}
        <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Copiar Horário</DialogTitle>
              <DialogDescription>
                Selecione os dias para copiar o horário de{" "}
                <strong>
                  {sourceToCopy && DAYS_OF_WEEK.find(d => d.value === sourceToCopy.day_of_week)?.label}
                </strong>
                {sourceToCopy && (
                  <span className="block mt-1 text-xs">
                    ({sourceToCopy.start_time.substring(0, 5)} - {sourceToCopy.end_time.substring(0, 5)})
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4 max-h-[300px] overflow-y-auto">
              {DAYS_OF_WEEK.filter(day => day.value !== sourceToCopy?.day_of_week).map((day) => {
                const hasExisting = availability?.find(a => a.day_of_week === day.value);
                return (
                  <div key={day.value} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                    <Checkbox
                      id={`day-${day.value}`}
                      checked={selectedDays.includes(day.value)}
                      onCheckedChange={() => handleToggleDay(day.value)}
                    />
                    <Label
                      htmlFor={`day-${day.value}`}
                      className="flex-1 cursor-pointer text-sm"
                    >
                      {day.label}
                      {hasExisting && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (substituirá {hasExisting.start_time.substring(0, 5)} - {hasExisting.end_time.substring(0, 5)})
                        </span>
                      )}
                    </Label>
                  </div>
                );
              })}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setCopyDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCopyToSelectedDays}
                disabled={selectedDays.length === 0 || createAvailability.isPending || updateAvailability.isPending}
              >
                Copiar para {selectedDays.length} dia(s)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Break Dialog */}
        <Dialog open={breakDialogOpen} onOpenChange={setBreakDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Intervalo</DialogTitle>
              <DialogDescription>
                Defina um intervalo durante o expediente (ex: almoço, pausa)
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="break-name">Nome do Intervalo</Label>
                <Input
                  id="break-name"
                  value={newBreak.break_name}
                  onChange={(e) => setNewBreak({ ...newBreak, break_name: e.target.value })}
                  placeholder="Ex: Almoço, Pausa"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="break-start">Início</Label>
                  <Input
                    id="break-start"
                    type="time"
                    value={newBreak.break_start_time}
                    onChange={(e) => setNewBreak({ ...newBreak, break_start_time: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="break-end">Término</Label>
                  <Input
                    id="break-end"
                    type="time"
                    value={newBreak.break_end_time}
                    onChange={(e) => setNewBreak({ ...newBreak, break_end_time: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setBreakDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddBreak} disabled={createBreak.isPending}>
                Adicionar Intervalo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

// Component to display breaks list
const BreaksList = ({ 
  availabilityId, 
  onDelete, 
  isDeleting 
}: { 
  availabilityId: string; 
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) => {
  const { data: breaks, isLoading } = useBreaks(availabilityId);

  if (isLoading) {
    return <Skeleton className="h-8 w-full" />;
  }

  if (!breaks || breaks.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic">
        Nenhum intervalo configurado
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      {breaks.map((breakItem) => (
        <div
          key={breakItem.id}
          className="flex items-center justify-between text-xs p-2 rounded bg-muted/50"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Coffee className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
            <span className="font-medium truncate">{breakItem.break_name}</span>
            <span className="text-muted-foreground flex-shrink-0">
              {breakItem.break_start_time.substring(0, 5)} - {breakItem.break_end_time.substring(0, 5)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(breakItem.id)}
            disabled={isDeleting}
            className="h-6 w-6 flex-shrink-0"
          >
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default Schedule;

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  User,
  Plus,
  Trash2,
  DollarSign,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useServices } from "@/hooks/useServices";
import { useProducts } from "@/hooks/useProducts";
import { useFinalizeAppointment, Appointment } from "@/hooks/useAppointments";

interface AppointmentDetailsModalProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppointmentDetailsModal({
  appointment,
  open,
  onOpenChange,
}: AppointmentDetailsModalProps) {
  const [additionalServiceIds, setAdditionalServiceIds] = useState<string[]>([]);
  const [additionalProductIds, setAdditionalProductIds] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();
  
  const { data: services = [] } = useServices();
  const { data: products = [] } = useProducts();
  const finalizeAppointment = useFinalizeAppointment();

  if (!appointment) return null;

  const addService = (serviceId: string) => {
    if (!additionalServiceIds.includes(serviceId)) {
      setAdditionalServiceIds([...additionalServiceIds, serviceId]);
    }
  };

  const removeService = (serviceId: string) => {
    setAdditionalServiceIds(additionalServiceIds.filter((id) => id !== serviceId));
  };

  const addProduct = (productId: string) => {
    if (!additionalProductIds.includes(productId)) {
      setAdditionalProductIds([...additionalProductIds, productId]);
    }
  };

  const removeProduct = (productId: string) => {
    setAdditionalProductIds(additionalProductIds.filter((id) => id !== productId));
  };

  const additionalServices = services.filter((s) =>
    additionalServiceIds.includes(s.id)
  );
  const additionalProducts = products.filter((p) =>
    additionalProductIds.includes(p.id)
  );

  const mainServicePrice = appointment.services?.price || 0;
  const additionalServicesTotal = additionalServices.reduce(
    (sum, s) => sum + Number(s.price),
    0
  );
  const additionalProductsTotal = additionalProducts.reduce(
    (sum, p) => sum + Number(p.price),
    0
  );
  const totalPrice = mainServicePrice + additionalServicesTotal + additionalProductsTotal;

  const handleFinalize = async () => {
    try {
      await finalizeAppointment.mutateAsync({
        appointmentId: appointment.id,
        additionalServices: additionalServiceIds,
        additionalProducts: additionalProductIds.map((id) => ({
          productId: id,
          quantity: 1,
        })),
      });

      toast({
        title: "Agendamento finalizado!",
        description: `Total: R$ ${totalPrice.toFixed(2)}`,
      });
      
      setAdditionalServiceIds([]);
      setAdditionalProductIds([]);
      setShowConfirmDialog(false);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao finalizar agendamento",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmado":
        return "bg-green-500/10 text-green-500";
      case "Aguardando":
        return "bg-yellow-500/10 text-yellow-500";
      case "Cancelado":
        return "bg-red-500/10 text-red-500";
      case "Concluído":
        return "bg-blue-500/10 text-blue-500";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Detalhes do Agendamento</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Client Info */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {appointment.client_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{appointment.client_name}</h3>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{appointment.barbers?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(appointment.appointment_date).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{appointment.appointment_time}</span>
                  </div>
                </div>
              </div>
              <Badge className={getStatusColor(appointment.status)}>
                {appointment.status}
              </Badge>
            </div>

            <Separator />

            {/* Main Service */}
            <div>
              <h4 className="font-semibold mb-3">Serviço Principal</h4>
              <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                <span>{appointment.services?.name || 'N/A'}</span>
                <span className="font-semibold">
                  R$ {mainServicePrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Additional Services */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">Serviços Adicionais</h4>
              </div>
              <div className="space-y-2 mb-3">
                {additionalServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg"
                  >
                    <span>{service.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        R$ {Number(service.price).toFixed(2)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeService(service.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {services
                  .filter(
                    (s) =>
                      s.id !== appointment.service_id &&
                      !additionalServiceIds.includes(s.id)
                  )
                  .map((service) => (
                    <Button
                      key={service.id}
                      variant="outline"
                      size="sm"
                      onClick={() => addService(service.id)}
                      className="gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      {service.name} - R$ {Number(service.price).toFixed(2)}
                    </Button>
                  ))}
              </div>
            </div>

            {/* Additional Products */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">Produtos</h4>
              </div>
              <div className="space-y-2 mb-3">
                {additionalProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg"
                  >
                    <span>{product.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        R$ {Number(product.price).toFixed(2)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {products
                  .filter((p) => !additionalProductIds.includes(p.id))
                  .map((product) => (
                    <Button
                      key={product.id}
                      variant="outline"
                      size="sm"
                      onClick={() => addProduct(product.id)}
                      className="gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      {product.name} - R$ {Number(product.price).toFixed(2)}
                    </Button>
                  ))}
              </div>
            </div>

            <Separator />

            {/* Total */}
            <div className="flex justify-between items-center text-xl font-bold p-4 bg-primary/10 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <span>Total</span>
              </div>
              <span>R$ {totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => setShowConfirmDialog(true)}
              disabled={appointment.status === "Concluído"}
            >
              Finalizar Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar finalização</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a finalizar este agendamento.
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Cliente:</span>
                  <span className="font-semibold">{appointment.client_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Serviço principal:</span>
                  <span className="font-semibold">{appointment.services?.name}</span>
                </div>
                {additionalServices.length > 0 && (
                  <div className="flex justify-between">
                    <span>Serviços adicionais:</span>
                    <span className="font-semibold">
                      {additionalServices.length}
                    </span>
                  </div>
                )}
                {additionalProducts.length > 0 && (
                  <div className="flex justify-between">
                    <span>Produtos:</span>
                    <span className="font-semibold">
                      {additionalProducts.length}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span>R$ {totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinalize}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

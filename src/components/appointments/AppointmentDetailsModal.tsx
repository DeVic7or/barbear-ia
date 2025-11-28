import { useState } from "react";
import { formatCurrency } from "@/lib/formatters";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Calendar,
  Clock,
  User,
  Plus,
  Trash2,
  DollarSign,
  QrCode,
  CreditCard,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useServices } from "@/hooks/useServices";
import { useProducts, Product } from "@/hooks/useProducts";
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
  const [additionalProducts, setAdditionalProducts] = useState<{ productId: string; quantity: number }[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
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
    if (!additionalProducts.find(p => p.productId === productId)) {
      setAdditionalProducts([...additionalProducts, { productId, quantity: 1 }]);
    }
  };

  const removeProduct = (productId: string) => {
    setAdditionalProducts(additionalProducts.filter((p) => p.productId !== productId));
  };

  const updateProductQuantity = (productId: string, delta: number) => {
    setAdditionalProducts(additionalProducts.map(p => {
      if (p.productId === productId) {
        const newQuantity = Math.max(1, p.quantity + delta);
        return { ...p, quantity: newQuantity };
      }
      return p;
    }));
  };

  const additionalServices = services.filter((s) =>
    additionalServiceIds.includes(s.id)
  );
  const selectedProducts = additionalProducts.map(ap => {
    const product = products.find(p => p.id === ap.productId);
    return product ? { ...product, quantity: ap.quantity } : null;
  }).filter(Boolean) as (Product & { quantity: number })[];

  const mainServicePrice = appointment.services?.price || 0;
  const additionalServicesTotal = additionalServices.reduce(
    (sum, s) => sum + Number(s.price),
    0
  );
  const additionalProductsTotal = selectedProducts.reduce(
    (sum, p) => sum + (Number(p.price) * p.quantity),
    0
  );
  const totalPrice = mainServicePrice + additionalServicesTotal + additionalProductsTotal;

  const handleFinalize = async () => {
    if (!paymentMethod) {
      toast({
        title: "Forma de pagamento obrigatória",
        description: "Selecione uma forma de pagamento para continuar",
        variant: "destructive",
      });
      return;
    }

    try {
      await finalizeAppointment.mutateAsync({
        appointmentId: appointment.id,
        additionalServices: additionalServiceIds,
        additionalProducts: additionalProducts,
        paymentMethod,
      });

      toast({
        title: "Agendamento finalizado!",
        description: `Total: ${formatCurrency(totalPrice)} - ${paymentMethod === 'pix' ? 'PIX' : 'Cartão de Crédito'}`,
      });
      
      setAdditionalServiceIds([]);
      setAdditionalProducts([]);
      setPaymentMethod("");
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
                  {formatCurrency(mainServicePrice)}
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
                        {formatCurrency(Number(service.price))}
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
                      {service.name} - {formatCurrency(Number(service.price))}
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
                {selectedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg"
                  >
                    <span>{product.name}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-background/50 rounded-md px-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateProductQuantity(product.id, -1)}
                        >
                          <span className="text-lg">−</span>
                        </Button>
                        <span className="w-8 text-center font-medium">{product.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateProductQuantity(product.id, 1)}
                        >
                          <span className="text-lg">+</span>
                        </Button>
                      </div>
                      <span className="font-semibold min-w-[80px] text-right">
                        {formatCurrency(Number(product.price) * product.quantity)}
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
                  .filter((p) => !additionalProducts.find(ap => ap.productId === p.id))
                  .map((product) => (
                    <Button
                      key={product.id}
                      variant="outline"
                      size="sm"
                      onClick={() => addProduct(product.id)}
                      className="gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      {product.name} - {formatCurrency(Number(product.price))}
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
              <span>{formatCurrency(totalPrice)}</span>
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
                {selectedProducts.length > 0 && (
                  <div className="flex justify-between">
                    <span>Produtos:</span>
                    <span className="font-semibold">
                      {selectedProducts.reduce((sum, p) => sum + p.quantity, 0)} unidades
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Label className="text-base font-semibold">Forma de Pagamento *</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div 
                    className="flex items-center space-x-3 p-3 rounded-lg border border-input hover:bg-accent hover:border-primary cursor-pointer transition-all group"
                    onClick={() => setPaymentMethod("pix")}
                  >
                    <QrCode className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <RadioGroupItem value="pix" id="pix" />
                    <Label htmlFor="pix" className="flex-1 cursor-pointer group-hover:text-foreground group-hover:font-semibold transition-all">PIX</Label>
                  </div>
                  <div 
                    className="flex items-center space-x-3 p-3 rounded-lg border border-input hover:bg-accent hover:border-primary cursor-pointer transition-all group"
                    onClick={() => setPaymentMethod("credit_card")}
                  >
                    <CreditCard className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <RadioGroupItem value="credit_card" id="credit_card" />
                    <Label htmlFor="credit_card" className="flex-1 cursor-pointer group-hover:text-foreground group-hover:font-semibold transition-all">Cartão de Crédito</Label>
                  </div>
                </RadioGroup>
                {!paymentMethod && (
                  <p className="text-sm text-destructive">Selecione uma forma de pagamento</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPaymentMethod("")}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinalize} disabled={!paymentMethod}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

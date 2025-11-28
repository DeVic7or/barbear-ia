import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Minus, QrCode, CreditCard, DollarSign, Banknote } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCreateWalkInAppointment } from "@/hooks/useAppointments";
import { useServices } from "@/hooks/useServices";
import { useProducts, type Product } from "@/hooks/useProducts";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/formatters";

interface NewAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewAppointmentDialog = ({ open, onOpenChange }: NewAppointmentDialogProps) => {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [barberId, setBarberId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [additionalServices, setAdditionalServices] = useState<string[]>([]);
  const [additionalProducts, setAdditionalProducts] = useState<{ productId: string; quantity: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");

  const { data: barbers } = useQuery({
    queryKey: ["barbers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("barbers").select("*").eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: services } = useServices();
  const { data: products } = useProducts();
  const createWalkIn = useCreateWalkInAppointment();

  const mainService = services?.find((s) => s.id === serviceId);
  const selectedAdditionalServices = services?.filter((s) => additionalServices.includes(s.id)) || [];

  const totalPrice = 
    (mainService?.price || 0) +
    selectedAdditionalServices.reduce((sum, s) => sum + s.price, 0) +
    additionalProducts.reduce((sum, p) => {
      const product = products?.find((prod) => prod.id === p.productId);
      return sum + (product?.price || 0) * p.quantity;
    }, 0);

  const handleSubmit = async () => {
    if (!clientName || !clientPhone || !barberId || !serviceId || !paymentMethod) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await createWalkIn.mutateAsync({
        clientName,
        clientPhone,
        barberId,
        serviceId,
        additionalServices,
        additionalProducts,
        paymentMethod,
        notes,
      });

      toast.success("Atendimento presencial registrado com sucesso!");
      onOpenChange(false);
      
      // Reset form
      setClientName("");
      setClientPhone("");
      setBarberId("");
      setServiceId("");
      setAdditionalServices([]);
      setAdditionalProducts([]);
      setPaymentMethod("");
      setNotes("");
    } catch (error) {
      toast.error("Erro ao registrar atendimento");
      console.error(error);
    }
  };

  const addProduct = (productId: string) => {
    setAdditionalProducts([...additionalProducts, { productId, quantity: 1 }]);
  };

  const removeProduct = (productId: string) => {
    setAdditionalProducts(additionalProducts.filter((p) => p.productId !== productId));
  };

  const updateProductQuantity = (productId: string, delta: number) => {
    setAdditionalProducts(
      additionalProducts.map((p) =>
        p.productId === productId
          ? { ...p, quantity: Math.max(1, p.quantity + delta) }
          : p
      )
    );
  };

  const getProductQuantity = (productId: string) => {
    return additionalProducts.find((p) => p.productId === productId)?.quantity || 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Atendimento Presencial</DialogTitle>
          <DialogDescription>
            Registre um atendimento presencial. O agendamento será automaticamente concluído.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Cliente */}
          <div className="space-y-2">
            <Label htmlFor="client-name">Nome do Cliente *</Label>
            <Input
              id="client-name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Nome completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-phone">Telefone *</Label>
            <Input
              id="client-phone"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>

          {/* Barbeiro */}
          <div className="space-y-2">
            <Label htmlFor="barber">Barbeiro *</Label>
            <Select value={barberId} onValueChange={setBarberId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o barbeiro" />
              </SelectTrigger>
              <SelectContent>
                {barbers?.map((barber) => (
                  <SelectItem key={barber.id} value={barber.id}>
                    {barber.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Serviço Principal */}
          <div className="space-y-2">
            <Label htmlFor="service">Serviço Principal *</Label>
            <Select value={serviceId} onValueChange={setServiceId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o serviço" />
              </SelectTrigger>
              <SelectContent>
                {services?.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} - {formatCurrency(service.price)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Serviços Adicionais */}
          <div className="space-y-2">
            <Label>Serviços Adicionais</Label>
            <div className="flex flex-wrap gap-2">
              {services
                ?.filter((s) => s.id !== serviceId)
                .map((service) => {
                  const isSelected = additionalServices.includes(service.id);
                  return (
                    <Badge
                      key={service.id}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (isSelected) {
                          setAdditionalServices(additionalServices.filter((id) => id !== service.id));
                        } else {
                          setAdditionalServices([...additionalServices, service.id]);
                        }
                      }}
                    >
                      {service.name} - {formatCurrency(service.price)}
                    </Badge>
                  );
                })}
            </div>
          </div>

          {/* Produtos */}
          <div className="space-y-2">
            <Label>Produtos Vendidos</Label>
            <div className="space-y-2">
              {products?.map((product: Product) => {
                const quantity = getProductQuantity(product.id);
                const isAdded = quantity > 0;

                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-secondary/20"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(product.price)} • Estoque: {product.stock_quantity}
                      </p>
                    </div>
                    {isAdded ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => updateProductQuantity(product.id, -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => updateProductQuantity(product.id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeProduct(product.id)}
                        >
                          Remover
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" onClick={() => addProduct(product.id)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div className="space-y-3">
            <Label>Forma de Pagamento *</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`group flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                    paymentMethod === "PIX"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary"
                  }`}
                  onClick={() => setPaymentMethod("PIX")}
                >
                  <RadioGroupItem value="PIX" id="pix" />
                  <QrCode className={`h-5 w-5 ${paymentMethod === "PIX" ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                  <Label
                    htmlFor="pix"
                    className={`cursor-pointer transition-all ${
                      paymentMethod === "PIX" ? "text-foreground font-semibold" : "group-hover:text-foreground group-hover:font-semibold"
                    }`}
                  >
                    PIX
                  </Label>
                </div>

                <div
                  className={`group flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                    paymentMethod === "Crédito"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary"
                  }`}
                  onClick={() => setPaymentMethod("Crédito")}
                >
                  <RadioGroupItem value="Crédito" id="credito" />
                  <CreditCard className={`h-5 w-5 ${paymentMethod === "Crédito" ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                  <Label
                    htmlFor="credito"
                    className={`cursor-pointer transition-all ${
                      paymentMethod === "Crédito" ? "text-foreground font-semibold" : "group-hover:text-foreground group-hover:font-semibold"
                    }`}
                  >
                    Crédito
                  </Label>
                </div>

                <div
                  className={`group flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                    paymentMethod === "Débito"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary"
                  }`}
                  onClick={() => setPaymentMethod("Débito")}
                >
                  <RadioGroupItem value="Débito" id="debito" />
                  <CreditCard className={`h-5 w-5 ${paymentMethod === "Débito" ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                  <Label
                    htmlFor="debito"
                    className={`cursor-pointer transition-all ${
                      paymentMethod === "Débito" ? "text-foreground font-semibold" : "group-hover:text-foreground group-hover:font-semibold"
                    }`}
                  >
                    Débito
                  </Label>
                </div>

                <div
                  className={`group flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                    paymentMethod === "Dinheiro"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary"
                  }`}
                  onClick={() => setPaymentMethod("Dinheiro")}
                >
                  <RadioGroupItem value="Dinheiro" id="dinheiro" />
                  <Banknote className={`h-5 w-5 ${paymentMethod === "Dinheiro" ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                  <Label
                    htmlFor="dinheiro"
                    className={`cursor-pointer transition-all ${
                      paymentMethod === "Dinheiro" ? "text-foreground font-semibold" : "group-hover:text-foreground group-hover:font-semibold"
                    }`}
                  >
                    Dinheiro
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre o atendimento"
              rows={3}
            />
          </div>

          {/* Resumo */}
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Serviço Principal:</span>
              <span className="font-semibold">{formatCurrency(mainService?.price || 0)}</span>
            </div>
            {selectedAdditionalServices.length > 0 && (
              <div className="flex justify-between text-sm">
                <span>Serviços Adicionais:</span>
                <span className="font-semibold">
                  {formatCurrency(selectedAdditionalServices.reduce((sum, s) => sum + s.price, 0))}
                </span>
              </div>
            )}
            {additionalProducts.length > 0 && (
              <div className="flex justify-between text-sm">
                <span>
                  Produtos ({additionalProducts.reduce((sum, p) => sum + p.quantity, 0)} un.):
                </span>
                <span className="font-semibold">
                  {formatCurrency(
                    additionalProducts.reduce((sum, p) => {
                      const product = products?.find((prod) => prod.id === p.productId);
                      return sum + (product?.price || 0) * p.quantity;
                    }, 0)
                  )}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total:</span>
              <span className="text-primary">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={createWalkIn.isPending}>
            {createWalkIn.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Registrar Atendimento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

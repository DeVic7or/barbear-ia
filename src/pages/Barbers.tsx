import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Phone, Edit, Percent, Trash2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";

const barberSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  phone: z.string().min(1, "Telefone é obrigatório").max(20),
  commission_percentage: z.coerce.number().min(0, "Comissão deve ser no mínimo 0%").max(100, "Comissão deve ser no máximo 100%"),
});

type BarberFormData = z.infer<typeof barberSchema>;

const Barbers = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [barberToDelete, setBarberToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<BarberFormData>({
    resolver: zodResolver(barberSchema),
    defaultValues: {
      name: "",
      phone: "",
      commission_percentage: 0,
    },
  });

  const { data: barbers, isLoading } = useQuery({
    queryKey: ["barbers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("barbers")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const addBarberMutation = useMutation({
    mutationFn: async (data: BarberFormData) => {
      const { error } = await supabase
        .from("barbers")
        .insert([{
          name: data.name,
          phone: data.phone,
          commission_percentage: data.commission_percentage,
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barbers"] });
      toast({
        title: "Sucesso!",
        description: "Barbeiro adicionado com sucesso.",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o barbeiro. Tente novamente.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const deleteBarberMutation = useMutation({
    mutationFn: async (barberId: string) => {
      const { error } = await supabase
        .from("barbers")
        .delete()
        .eq("id", barberId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barbers"] });
      toast({
        title: "Sucesso!",
        description: "Barbeiro excluído com sucesso.",
      });
      setBarberToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o barbeiro. Tente novamente.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const onSubmit = (data: BarberFormData) => {
    addBarberMutation.mutate(data);
  };

  const handleDeleteBarber = () => {
    if (barberToDelete) {
      deleteBarberMutation.mutate(barberToDelete);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Barbeiros</h1>
            <p className="text-muted-foreground mt-1">Gerencie sua equipe de profissionais</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Barbeiro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Barbeiro</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 00000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="commission_percentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comissão (%)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={addBarberMutation.isPending}>
                      {addBarberMutation.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : barbers && barbers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {barbers.map((barber) => (
              <Card key={barber.id} className="border-border/40 bg-card/50 backdrop-blur hover:bg-card/80 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-2 border-primary/20">
                        <AvatarImage src="" alt={barber.name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-lg">
                          {barber.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{barber.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1 bg-primary/10 text-primary">
                          Ativo
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="hover:bg-secondary/80">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setBarberToDelete(barber.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{barber.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Percent className="h-4 w-4" />
                    <span>Comissão: {barber.commission_percentage}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum barbeiro cadastrado ainda.</p>
            <p className="text-sm text-muted-foreground mt-2">Clique em "Adicionar Barbeiro" para começar.</p>
          </div>
        )}
      </div>

      <AlertDialog open={!!barberToDelete} onOpenChange={(open) => !open && setBarberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este barbeiro? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteBarber}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Barbers;

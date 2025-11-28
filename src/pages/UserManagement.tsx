import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, UserCog, Mail, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppRole } from "@/hooks/useUserRole";
import { NewUserDialog } from "@/components/users/NewUserDialog";

interface UserWithRole {
  id: string;
  created_at: string;
  email: string;
  roles: { role: AppRole }[];
}

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Buscar todos os usuários com seus roles através da edge function
  const { data: users, isLoading } = useQuery({
    queryKey: ["users-with-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-users");

      if (error) {
        console.error("Error calling get-users function:", error);
        throw error;
      }

      if (!data || !data.users) {
        throw new Error("Nenhum usuário retornado");
      }

      return data.users as UserWithRole[];
    },
  });

  // Atribuir role a um usuário
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      // Verificar se o usuário já tem esse role
      const { data: existingRoles } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .eq("role", role)
        .maybeSingle();

      if (existingRoles) {
        throw new Error("Usuário já possui este papel");
      }

      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
      toast.success("Papel atribuído com sucesso!");
      setSelectedUserId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atribuir papel");
    },
  });

  // Remover role de um usuário
  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
      toast.success("Papel removido com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao remover papel");
    },
  });

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "gerente":
        return "default";
      case "barbeiro":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleLabel = (role: AppRole) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "gerente":
        return "Gerente";
      case "barbeiro":
        return "Barbeiro";
      case "user":
        return "Usuário";
      default:
        return role;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Gerenciar Usuários</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Atribua papéis aos usuários do sistema
            </p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Gerenciar Usuários</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Atribua papéis aos usuários do sistema
            </p>
          </div>
          <NewUserDialog />
        </div>

        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <UserCog className="h-5 w-5" />
              Usuários do Sistema
            </CardTitle>
            <CardDescription className="text-sm">
              Total de {users?.length || 0} usuários cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3 sm:space-y-4">
              {users?.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-4 sm:pt-6 sm:px-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-sm font-medium break-all">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">
                            Cadastrado em{" "}
                            {new Date(user.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {user.roles.length > 0 ? (
                            user.roles.map((roleObj, idx) => (
                              <Badge
                                key={idx}
                                variant={getRoleBadgeVariant(roleObj.role)}
                                className="flex items-center gap-1"
                              >
                                <Shield className="h-3 w-3" />
                                {getRoleLabel(roleObj.role)}
                                <button
                                  onClick={() =>
                                    removeRoleMutation.mutate({
                                      userId: user.id,
                                      role: roleObj.role,
                                    })
                                  }
                                  className="ml-1 hover:text-destructive"
                                  aria-label="Remover papel"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline">Sem papéis atribuídos</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Select
                          value={selectedUserId === user.id ? "selected" : ""}
                          onValueChange={(value) => {
                            if (value) {
                              assignRoleMutation.mutate({
                                userId: user.id,
                                role: value as AppRole,
                              });
                            }
                          }}
                        >
                          <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Atribuir papel" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="barbeiro">Barbeiro</SelectItem>
                            <SelectItem value="gerente">Gerente</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

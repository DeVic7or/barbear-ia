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

interface UserWithRole {
  id: string;
  created_at: string;
  email: string;
  roles: { role: AppRole }[];
}

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Buscar todos os usuários com seus roles
  const { data: users, isLoading } = useQuery({
    queryKey: ["users-with-roles"],
    queryFn: async () => {
      // Buscar todos os profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, created_at");

      if (profilesError) throw profilesError;

      // Buscar usuários do auth
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Usuário não autenticado");

      // Para cada profile, buscar o email e roles
      const usersWithRoles = await Promise.all(
        profiles.map(async (profile) => {
          // Buscar roles do usuário
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", profile.id);

          // Buscar email do usuário (fazemos isso através de uma edge function ou assumimos que está no metadata)
          // Por enquanto, vamos usar um placeholder
          return {
            id: profile.id,
            created_at: profile.created_at,
            email: profile.id.substring(0, 8) + "...", // Placeholder
            roles: roles || [],
          };
        })
      );

      return usersWithRoles as UserWithRole[];
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
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
            <p className="text-muted-foreground">
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
          <p className="text-muted-foreground">
            Atribua papéis aos usuários do sistema
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Usuários do Sistema
            </CardTitle>
            <CardDescription>
              Total de {users?.length || 0} usuários cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users?.map((user) => (
                <Card key={user.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-sm">{user.id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
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
                      <div className="flex items-center gap-2">
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
                          <SelectTrigger className="w-[180px]">
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

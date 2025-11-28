import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Shield, UserCog, Mail, Calendar, Search } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");

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

  // Filtrar usuários com base no termo de busca
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!searchTerm.trim()) return users;

    const lowerSearch = searchTerm.toLowerCase();
    return users.filter((user) => {
      // Buscar por email
      const matchesEmail = user.email.toLowerCase().includes(lowerSearch);
      
      // Buscar por papel
      const matchesRole = user.roles.some((roleObj) =>
        getRoleLabel(roleObj.role).toLowerCase().includes(lowerSearch)
      );

      return matchesEmail || matchesRole;
    });
  }, [users, searchTerm]);

  if (isLoading) {
    return (
      <Layout>
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
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
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Usuários do Sistema
            </CardTitle>
            <CardDescription>
              Total de {filteredUsers.length} de {users?.length || 0} usuários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por email ou papel..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum usuário encontrado
                </div>
              ) : (
                filteredUsers.map((user) => (
                <Card key={user.id}>
                  <CardContent className="pt-6">
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
              )))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

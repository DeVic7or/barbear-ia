import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = 'admin' | 'user';

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export const useUserRole = () => {
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["userRoles"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data as UserRole[];
    },
  });

  const isAdmin = roles.some(role => role.role === 'admin');
  const hasRole = (role: AppRole) => roles.some(r => r.role === role);

  return {
    roles,
    isAdmin,
    hasRole,
    isLoading,
  };
};

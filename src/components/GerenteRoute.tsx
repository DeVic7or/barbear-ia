import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { Skeleton } from "@/components/ui/skeleton";

interface GerenteRouteProps {
  children: React.ReactNode;
}

export const GerenteRoute = ({ children }: GerenteRouteProps) => {
  const { isGerente, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-full max-w-md p-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!isGerente) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

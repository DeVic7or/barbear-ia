import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AIChatbot } from "@/components/AIChatbot";
import { NotificationsPopover } from "@/components/NotificationsPopover";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/auth");
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full">
          <header className="h-14 sm:h-16 border-b border-border/40 bg-card/30 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between px-3 sm:px-4">
            <SidebarTrigger className="hover:bg-secondary/80 transition-colors">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <div className="flex items-center gap-1 sm:gap-2">
              <NotificationsPopover />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-1 sm:gap-2 h-9 px-2 sm:px-3"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
        </div>
        <AIChatbot />
      </div>
    </SidebarProvider>
  );
}

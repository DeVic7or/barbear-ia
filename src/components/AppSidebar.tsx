import { Home, Users, Calendar, DollarSign, Package, UserCircle, Scissors, FileText, CreditCard, Receipt, Shield, CalendarClock, User, BarChart3, CalendarDays, UserCog, Bot } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { isGerente } = useUserRole();

  const isActive = (path: string) => currentPath === path;

  // Páginas acessíveis para todos
  const commonPages = [
    { title: "Início", url: "/", icon: Home },
    { title: "Clientes", url: "/clientes", icon: User },
    { title: "Agendamentos", url: "/agendamentos", icon: Calendar },
    { title: "Produtos", url: "/produtos", icon: Package },
    { title: "Perfil", url: "/perfil", icon: UserCircle },
  ];

  // Páginas exclusivas para gerentes
  const gerentePages = [
    { title: "Agenda", url: "/agenda", icon: CalendarDays },
    { title: "Barbeiros", url: "/barbeiros", icon: Scissors },
    { title: "Faturamento", url: "/faturamento", icon: DollarSign },
    { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
    { title: "Planos", url: "/planos", icon: CreditCard },
    { title: "Pagamentos", url: "/pagamentos", icon: Receipt },
    { title: "Agente", url: "/agente", icon: Bot },
  ];

  const menuItems = isGerente 
    ? [...commonPages.slice(0, 3), ...gerentePages, ...commonPages.slice(3)]
    : commonPages;

  return (
    <Sidebar className={open ? "w-64" : "w-16"}>
      <SidebarContent>
        {/* Logo/Header */}
        <div className={open ? "p-4 border-b border-border/40" : "p-2 border-b border-border/40 flex justify-center"}>
          <div className={open ? "flex items-center gap-3" : "flex items-center"}>
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Scissors className="h-6 w-6 text-primary-foreground" />
            </div>
            {open && (
              <div className="overflow-hidden">
                <h2 className="font-bold text-foreground text-lg">Barber</h2>
                <p className="text-xs text-muted-foreground">Dashboard</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={!open ? "sr-only" : ""}>
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavLink
                    to={item.url}
                    end
                    className={open 
                      ? "flex items-center px-4 py-3 hover:bg-secondary/80 transition-colors rounded-md" 
                      : "flex items-center justify-center px-2 py-3 hover:bg-secondary/80 transition-colors rounded-md mx-auto w-12"
                    }
                    activeClassName={open
                      ? "bg-primary/10 text-primary font-medium border-l-4 border-primary"
                      : "bg-primary/10 text-primary font-medium"
                    }
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {open && <span className="ml-3">{item.title}</span>}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section */}
        {isGerente && (
          <SidebarGroup>
            <SidebarGroupLabel className={!open ? "sr-only" : ""}>
              Administração
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <NavLink
                    to="/usuarios"
                    end
                    className={open 
                      ? "flex items-center px-4 py-3 hover:bg-secondary/80 transition-colors rounded-md" 
                      : "flex items-center justify-center px-2 py-3 hover:bg-secondary/80 transition-colors rounded-md mx-auto w-12"
                    }
                    activeClassName={open
                      ? "bg-primary/10 text-primary font-medium border-l-4 border-primary"
                      : "bg-primary/10 text-primary font-medium"
                    }
                  >
                    <UserCog className="h-5 w-5 flex-shrink-0" />
                    {open && <span className="ml-3">Usuários</span>}
                  </NavLink>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <NavLink
                    to="/admin"
                    end
                    className={open 
                      ? "flex items-center px-4 py-3 hover:bg-secondary/80 transition-colors rounded-md" 
                      : "flex items-center justify-center px-2 py-3 hover:bg-secondary/80 transition-colors rounded-md mx-auto w-12"
                    }
                    activeClassName={open
                      ? "bg-primary/10 text-primary font-medium border-l-4 border-primary"
                      : "bg-primary/10 text-primary font-medium"
                    }
                  >
                    <Shield className="h-5 w-5 flex-shrink-0" />
                    {open && <span className="ml-3">Admin</span>}
                  </NavLink>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

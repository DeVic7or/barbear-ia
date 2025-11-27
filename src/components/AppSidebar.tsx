import { Home, Users, Calendar, DollarSign, Package, UserCircle, Scissors } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";

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

const menuItems = [
  { title: "Início", url: "/", icon: Home },
  { title: "Barbeiros", url: "/barbeiros", icon: Users },
  { title: "Agendamentos", url: "/agendamentos", icon: Calendar },
  { title: "Faturamento", url: "/faturamento", icon: DollarSign },
  { title: "Produtos", url: "/produtos", icon: Package },
  { title: "Perfil", url: "/perfil", icon: UserCircle },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

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
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={open 
                        ? "hover:bg-secondary/80 transition-colors" 
                        : "hover:bg-secondary/80 transition-colors flex justify-center"
                      }
                      activeClassName={open
                        ? "bg-primary/10 text-primary font-medium border-l-4 border-primary"
                        : "bg-primary/10 text-primary font-medium"
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {open && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

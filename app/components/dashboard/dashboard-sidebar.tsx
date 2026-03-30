"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  Calendar,
  FileText,
  Home,
  Settings,
  Upload,
  User,
  CreditCard,
  Bell,
  HelpCircle,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
/****************************************************************************************************************************/
/** Interfaz para items del menú con soporte para disabled */
interface MenuItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  disabled?: boolean;
}
/****************************************************************************************************************************/
export default function DashboardSidebar() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar(); // Acceso al estado del sidebar para móviles

  /** Verifica si la ruta está activa */
  const isActive = (path: string) => {
    // Si la ruta a comprobar es la raíz (Panel), solo debe estar activa si el pathname es exactamente igual
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    // Para el resto de rutas (Subir análisis, Historial, etc), comprobamos si es igual o si empieza por ella
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  // solo "Panel" habilitado, el resto desactivado temporalmente
  const menuItems: MenuItem[] = [
    {
      title: "Panel",
      icon: Home,
      href: "/dashboard",
      disabled: false,
    },
    {
      title: "Subir análisis",
      icon: Upload,
      href: "/dashboard/upload",
      disabled: false,
    },
    {
      title: "Historial",
      icon: FileText,
      href: "/dashboard/history",
      disabled: false,
    },
    {
      title: "Estadísticas",
      icon: BarChart3,
      href: "/dashboard/stats",
      disabled: false,
    },
    {
      title: "Calendario",
      icon: Calendar,
      href: "/dashboard/calendar",
      disabled: false,
    },
    {
      title: "Perfil",
      icon: User,
      href: "/dashboard/profile",
      disabled: false,
    },
    {
      title: "Suscripción",
      icon: CreditCard,
      href: "/dashboard/subscription",
      disabled: false,
    },
    {
      title: "Notificaciones",
      icon: Bell,
      href: "/dashboard/notifications",
      disabled: false,
    },
    {
      title: "Configuración",
      icon: Settings,
      href: "/dashboard/settings",
      disabled: false,
    },
  ];

  //JSX
  return (
    <Sidebar>
      <SidebarHeader className="flex flex-col items-start px-6 py-8 border-b border-sidebar-border/50 bg-sidebar/50 backdrop-blur-sm">
        <Link href="/dashboard" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
            <span className="text-xs font-black">AB</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-sidebar-foreground">
            IAnalytic<span className="text-primary">Blood</span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-3 pt-6">
        <SidebarMenu className="gap-1.5">
          {menuItems.map((item) => {
            const active = isActive(item.href);

            // Items desactivados con tooltip "Próximamente"
            if (item.disabled) {
              return (
                <SidebarMenuItem key={item.href}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="flex w-full items-center gap-3 rounded-xl p-2.5 text-sm text-sidebar-foreground/30 
                        cursor-not-allowed select-none transition-all"
                        aria-disabled="true"
                      >
                        <item.icon className="h-5 w-5 opacity-40" />
                        <span className="font-medium">{item.title}</span>
                        <Lock className="h-3.5 w-3.5 ml-auto opacity-20" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="bg-sidebar-foreground text-sidebar-background rounded-lg border-0 shadow-xl"
                    >
                      <p className="text-xs font-bold">Próximamente</p>
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              );
            }

            // Item activo con estilo premium refinado
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={item.title}
                  className="h-11 rounded-xl transition-all duration-200"
                >
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (isMobile) setOpenMobile(false); // Cerrar sidebar tras click en móvil
                    }}
                    className={cn(
                      "flex items-center gap-3 px-3 transition-all duration-300 group",
                      active
                        ? "bg-primary/10 text-primary font-bold shadow-[0_0_20px_rgba(var(--primary),0.05)] border-l-2 border-primary"
                        : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                        active ? "text-primary" : "text-sidebar-foreground/40",
                      )}
                    />
                    <span className="tracking-tight">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      {/* Separador visual antes del footer */}
      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Ayuda">
              <Link
                href="/dashboard/help"
                onClick={() => {
                  if (isMobile) setOpenMobile(false);
                }}
              >
                <HelpCircle className="h-5 w-5" />
                <span>Ayuda</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
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
  /** Verifica si la ruta está activa */
  const isActive = (path: string) => {
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
      disabled: true,
    },
    {
      title: "Historial",
      icon: FileText,
      href: "/dashboard/history",
      disabled: true,
    },
    {
      title: "Estadísticas",
      icon: BarChart3,
      href: "/dashboard/stats",
      disabled: true,
    },
    {
      title: "Calendario",
      icon: Calendar,
      href: "/dashboard/calendar",
      disabled: true,
    },
    {
      title: "Perfil",
      icon: User,
      href: "/dashboard/profile",
      disabled: true,
    },
    {
      title: "Suscripción",
      icon: CreditCard,
      href: "/dashboard/subscription",
      disabled: true,
    },
    {
      title: "Notificaciones",
      icon: Bell,
      href: "/dashboard/notifications",
      disabled: true,
    },
    {
      title: "Configuración",
      icon: Settings,
      href: "/dashboard/settings",
      disabled: true,
    },
  ];

  //JSX
  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-center py-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <span className="text-xl font-bold gradient-text">IAnalyticBlood</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            const active = isActive(item.href);

            // Items desactivados con tooltip "Próximamente"
            if (item.disabled) {
              return (
                <SidebarMenuItem key={item.href}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="flex w-full items-center gap-2 rounded-md p-2 text-sm text-muted-foreground/50 
                        cursor-not-allowed select-none"
                        aria-disabled="true"
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                        <Lock className="h-3 w-3 ml-auto opacity-40" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="text-xs">Próximamente</p>
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              );
            }

            // Item activo con gradiente premium del proyecto
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                  <Link
                    href={item.href}
                    className={
                      active
                        ? "!bg-gradient-to-r !from-primary/20 !to-secondary/10 !text-primary !font-semibold !border-l-2 !border-primary"
                        : ""
                    }
                  >
                    <item.icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
                    <span className={active ? "gradient-text font-semibold" : ""}>
                      {item.title}
                    </span>
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
              <Link href="/dashboard/help">
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

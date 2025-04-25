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
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

export default function DashboardSidebar({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const menuItems = [
    {
      title: "Panel",
      icon: Home,
      href: "/dashboard",
    },
    {
      title: "Subir análisis",
      icon: Upload,
      href: "/dashboard/upload",
    },
    {
      title: "Historial",
      icon: FileText,
      href: "/dashboard/history",
    },
    {
      title: "Estadísticas",
      icon: BarChart3,
      href: "/dashboard/stats",
    },
    {
      title: "Calendario",
      icon: Calendar,
      href: "/dashboard/calendar",
    },
    {
      title: "Perfil",
      icon: User,
      href: "/dashboard/profile",
    },
    {
      title: "Suscripción",
      icon: CreditCard,
      href: "/dashboard/subscription",
    },
    {
      title: "Notificaciones",
      icon: Bell,
      href: "/dashboard/notifications",
    },
    {
      title: "Configuración",
      icon: Settings,
      href: "/dashboard/settings",
    },
  ];

  return (
    <SidebarProvider open={open} onOpenChange={onOpenChange}>
      <Sidebar>
        <SidebarHeader className="flex items-center justify-center py-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold gradient-text">IAnalyticBlood</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.title}>
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
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
    </SidebarProvider>
  );
}

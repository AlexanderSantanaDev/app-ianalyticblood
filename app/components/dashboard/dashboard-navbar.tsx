"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Menu,
  Search,
  LogOut,
  FileText,
  Activity,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { logout } from "@/lib/api/auth";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { useSidebar } from "@/components/ui/sidebar";
/****************************************************************************************************************************/
// Estados
export default function DashboardNavbar() {
  1;
  // Todos los Hooks se llaman al inicio, antes de cualquier condicional
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { isMobile, toggleSidebar } = useSidebar(); // Obtener toggleSidebar del contexto
  /****************************************************************************************************************************/
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  /****************************************************************************************************************************/
  // Métodos
  /** Obtiene el título de la página actual. */
  const getPageTitle = () => {
    const path = pathname.split("/").pop();
    if (!path || path === "dashboard") return "Panel de Control";
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  /** Obtiene las iniciales del nombre del usuario. */
  const getInitials = (str = "") =>
    str
      .split(/\s+/)
      .map((w) => w[0] || "")
      .join("")
      .toUpperCase()
      .slice(0, 2);

  // Renderizado condicional después de todos los Hooks
  if (status === "loading") {
    return (
      <div className="fixed top-0 left-0 right-0 h-16 bg-background border-b flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  const user = session?.user;
  const avatar = user?.image ?? undefined;
  const name = user?.name ?? user?.email ?? "Usuario";
  /****************************************************************************************************************************/
  //JSX
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? "bg-background/80 backdrop-blur-md shadow-md" : "bg-background"
      }`}
    >
      <div className="flex items-center justify-between px-4 h-16 border-b">
        <div className="flex items-center">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          )}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold gradient-text hidden md:inline-block">
              IAnalyticBlood
            </span>
            <span className="text-xl font-bold gradient-text md:hidden">AB</span>
          </Link>
          <span className="hidden md:inline-block mx-4 text-muted-foreground">|</span>
          <span className="hidden md:inline-block text-lg font-medium">{getPageTitle()}</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Barra de búsqueda */}
          {!isMobile && (
            <div className="relative mr-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Buscar..."
                className="pl-10 w-[200px] lg:w-[300px] h-9"
                onClick={() => setIsSearchOpen(true)}
              />
            </div>
          )}

          {/* Diálogo de búsqueda para móviles */}
          {isMobile && (
            <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Buscar</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Buscar</DialogTitle>
                  <DialogDescription>Busca análisis, funciones o configuraciones</DialogDescription>
                </DialogHeader>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input type="search" placeholder="Buscar..." className="pl-10" autoFocus />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Búsquedas recientes</h4>
                  <div className="space-y-1">
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      Análisis de sangre completo
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      Configuración de perfil
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      Historial de análisis
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Notificaciones */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Bell className="h-5 w-5" />
                <Badge
                  className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px] bg-primary
                 text-white border-2 border-background"
                >
                  3
                </Badge>
                <span className="sr-only">Notificaciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[380px] p-0 rounded-2xl overflow-hidden border-border/60 shadow-2xl"
            >
              <div className="p-4 bg-muted/30 border-b flex items-center justify-between">
                <DropdownMenuLabel className="p-0 font-bold text-base">
                  Notificaciones
                </DropdownMenuLabel>
                <Badge
                  variant="outline"
                  className="bg-primary/5 text-primary border-primary/20 text-[10px] px-2 py-0"
                >
                  3 Nuevas
                </Badge>
              </div>

              <div className="max-h-[400px] overflow-y-auto divide-y divide-border/40">
                {[
                  {
                    title: "Análisis completado",
                    description: "Tu informe de sangre ha sido procesado correctamente por la IA.",
                    time: "Hace 5 min",
                    isNew: true,
                    icon: <FileText className="h-4 w-4 text-blue-500" />,
                    bg: "bg-blue-500/10",
                  },
                  {
                    title: "Atención Requerida",
                    description: "Se han detectado biomarcadores fuera del rango normal.",
                    time: "Hace 3 horas",
                    isNew: true,
                    icon: <Activity className="h-4 w-4 text-red-500" />,
                    bg: "bg-red-500/10",
                  },
                  {
                    title: "Nueva actualización",
                    description: "Añadido soporte para exportación de PDF avanzado.",
                    time: "Hace 1 día",
                    isNew: false,
                    icon: <ShieldCheck className="h-4 w-4 text-purple-500" />,
                    bg: "bg-purple-500/10",
                  },
                ].map((notification, index) => (
                  <div
                    key={index}
                    className="p-4 hover:bg-muted/50 cursor-pointer transition-colors group flex gap-3"
                  >
                    <div
                      className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${notification.bg}`}
                    >
                      {notification.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <p className="font-bold text-sm truncate pr-4">{notification.title}</p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {notification.time}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {notification.description}
                      </p>
                      {notification.isNew && (
                        <div className="mt-2 flex items-center gap-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">
                            Nuevo
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-muted/20 border-t">
                <Button
                  variant="ghost"
                  className="w-full justify-center text-xs font-bold hover:bg-primary/5 hover:text-primary rounded-xl"
                  asChild
                >
                  <Link href="/dashboard/notifications" className="flex items-center gap-2">
                    Ver todas las notificaciones
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Selector de tema */}
          <ModeToggle />

          {/* Menú de usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  {avatar && <AvatarImage src={avatar} alt={name} />}
                  <AvatarFallback>{getInitials(name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{name.replace(/\b\w/g, (c) => c.toUpperCase())}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">Perfil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Configuración</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/subscription">Suscripción</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

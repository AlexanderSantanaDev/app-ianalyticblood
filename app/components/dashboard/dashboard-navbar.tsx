"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, Search, LogOut } from "lucide-react";
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
import { useMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";

interface DashboardNavbarProps {
  onToggleSidebar: () => void;
}

export default function DashboardNavbar({ onToggleSidebar }: DashboardNavbarProps) {
  // Todos los Hooks se llaman al inicio, antes de cualquier condicional
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isMobile = useMobile(); // --> Esta es la modificación: mover useMobile aquí para que se llame siempre

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Función para obtener el título de la página actual basado en la ruta
  const getPageTitle = () => {
    const path = pathname.split("/").pop();
    if (!path || path === "dashboard") return "Panel de Control";
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? "bg-background/80 backdrop-blur-md shadow-md" : "bg-background"
      }`}
    >
      <div className="flex items-center justify-between px-4 h-16 border-b">
        <div className="flex items-center">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="mr-2">
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
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  3
                </Badge>
                <span className="sr-only">Notificaciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {[
                {
                  title: "Análisis completado",
                  description: "Tu análisis de sangre ha sido procesado correctamente.",
                  time: "Hace 5 minutos",
                  isNew: true,
                },
                {
                  title: "Recordatorio",
                  description: "Tienes un análisis programado para mañana.",
                  time: "Hace 3 horas",
                  isNew: true,
                },
                {
                  title: "Actualización de la plataforma",
                  description: "Hemos añadido nuevas funcionalidades a la plataforma.",
                  time: "Hace 1 día",
                  isNew: true,
                },
              ].map((notification, index) => (
                <div key={index} className="p-3 hover:bg-muted cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-muted-foreground">{notification.time}</span>
                      {notification.isNew && (
                        <Badge variant="default" className="mt-1 h-auto py-0 px-1.5 text-[10px]">
                          Nuevo
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <DropdownMenuSeparator />
              <Button variant="ghost" className="w-full justify-center text-sm" asChild>
                <Link href="/dashboard/notifications">Ver todas las notificaciones</Link>
              </Button>
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

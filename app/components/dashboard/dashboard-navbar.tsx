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
  LayoutDashboard,
  Upload,
  History,
  BarChart3,
  CalendarDays,
  UserCircle,
  CreditCard,
  BellRing,
  Settings2,
  HelpCircle,
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { useSidebar } from "@/components/ui/sidebar";
import DashboardSearch from "@/components/dashboard/dashboard-search";
/****************************************************************************************************************************/
// Estados
export default function DashboardNavbar() {
  1;
  // Todos los Hooks se llaman al inicio, antes de cualquier condicional
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  //  Detectar plataforma para mostrar atajo correcto en el hint del buscador
  const [isMac, setIsMac] = useState(true);
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

  // Detectar Mac vs Windows/Linux una sola vez al montar
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPod|iPad/.test(navigator.userAgent));
  }, []);
  /****************************************************************************************************************************/
  /** Mapa de rutas con nombre propio en español e icono por sección. */
  const PAGE_MAP: Record<string, { label: string; Icon: React.ElementType }> = {
    dashboard: { label: "Panel de Control", Icon: LayoutDashboard },
    upload: { label: "Subir análisis", Icon: Upload },
    history: { label: "Historial", Icon: History },
    stats: { label: "Estadísticas", Icon: BarChart3 },
    calendar: { label: "Calendario", Icon: CalendarDays },
    profile: { label: "Mi Perfil", Icon: UserCircle },
    subscription: { label: "Suscripción", Icon: CreditCard },
    notifications: { label: "Notificaciones", Icon: BellRing },
    settings: { label: "Configuración", Icon: Settings2 },
    help: { label: "Centro de ayuda", Icon: HelpCircle },
  };

  /** Obtiene el meta de la página actual */
  const getPageMeta = () => {
    const segment = pathname.split("/").pop() ?? "dashboard";
    return PAGE_MAP[segment] ?? PAGE_MAP["dashboard"];
  };

  /** Obtiene las iniciales del nombre del usuario. */
  const getInitials = (str = "") =>
    str
      .split(/\s+/)
      .map((w) => w[0] || "")
      .join("")
      .toUpperCase()
      .slice(0, 2);

  // Mientras carga.. mostramos skeleton
  if (status === "loading") {
    return (
      <header className="fixed top-0 left-0 right-0 z-40 bg-background border-b">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Logo skeleton */}
          <div className="flex items-center gap-3">
            <div className="w-24 h-5 bg-muted rounded-lg animate-pulse" />
            <span className="hidden md:inline-block text-muted/30">|</span>
            <div className="hidden md:block w-32 h-4 bg-muted rounded-md animate-pulse" />
          </div>
          {/* Actions skeleton */}
          <div className="flex items-center gap-2">
            <div className="hidden md:block w-[200px] lg:w-[280px] h-9 bg-muted rounded-lg animate-pulse" />
            <div className="w-9 h-9 bg-muted rounded-lg animate-pulse" />
            <div className="w-9 h-9 bg-muted rounded-lg animate-pulse" />
            <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
          </div>
        </div>
        {/* Barra de carga inferior sutil */}
        <div className="h-[2px] w-full bg-muted overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary/60 via-secondary/60 to-primary/60 rounded-full animate-pulse"
            style={{ width: "60%" }}
          />
        </div>
      </header>
    );
  }

  const user = session?.user;
  const avatar = user?.image ?? undefined;
  const name = user?.name ?? user?.email ?? "Usuario";
  // Obtiene meta (label + Icon) de la página actual
  const { label: pageLabel, Icon: PageIcon } = getPageMeta();
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
          {/* Separador + título con icono de la sección activa */}
          <span className="hidden md:inline-block mx-4 text-muted-foreground/30">|</span>
          <div className="hidden md:flex items-center gap-2">
            <PageIcon className="h-4 w-4 text-primary/70" />
            <span className="text-sm font-semibold text-foreground/80 tracking-tight">
              {pageLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Buscador desktop — abre el command palette premium al hacer click */}
          {!isMobile && (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="relative mr-2 flex items-center gap-2 h-9 pl-3 pr-4 rounded-xl bg-muted/50 hover:bg-muted/80 border 
              border-border/50 hover:border-primary/20 transition-all duration-200 w-[200px] lg:w-[280px] group"
            >
              <Search className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary/60 transition-colors shrink-0" />
              <span
                className="text-xs text-muted-foreground/50 group-hover:text-muted-foreground/70 flex-1 text-left transition-colors 
              tracking-tight"
              >
                Buscar...
              </span>
              {/* Hint dinámico según plataforma: ⌘K en Mac, Ctrl K en Windows/Linux (Estilo Unificado) */}
              <kbd
                className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted/80 text-muted-foreground/70 
              text-[10px] font-mono border border-border/50 shadow-sm transition-colors group-hover:border-primary/30"
              >
                {isMac ? "\u2318K" : "Ctrl K"}
              </kbd>
            </button>
          )}

          {/* Botón de búsqueda en móvil — mismo command palette */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              className="hover:bg-primary/10 hover:text-primary transition-colors rounded-xl"
            >
              <Search className="h-4.5 w-4.5" />
              <span className="sr-only">Buscar</span>
            </Button>
          )}

          {/* Command Palette premium — unificado para desktop y móvil */}
          <DashboardSearch open={isSearchOpen} onOpenChange={setIsSearchOpen} />

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

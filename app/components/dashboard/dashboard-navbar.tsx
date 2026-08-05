"use client";

import { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Menu,
  Search,
  LogOut,
  Command,
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
  Info,
  Zap,
  Crown,
  PlayCircle,
} from "lucide-react";
import { logout } from "@/lib/api/auth";
import { ModeToggle } from "@/components/mode-toggle";
import { cn, formatTimeAgo } from "@/lib/utils";
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
import GlobalAnalysisIndicator from "@/components/dashboard/global-analysis-indicator";
import SubscriptionBadge from "@/components/dashboard/subscription-badge";
import { useNotifications } from "@/hooks/notification-context";
import { useAnalysis } from "@/hooks/analysis-context";
/****************************************************************************************************************************/
// Constantes hoistedas fuera del componente para evitar recreación en cada render
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

// Función utilitaria hoistedada fuera del componente
const getInitials = (str = "") =>
  str
    .split(/\s+/)
    .map((w) => w[0] || "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
/****************************************************************************************************************************/
// Estados
function DashboardNavbarComponent() {
  // Todos los Hooks se llaman al inicio, antes de cualquier condicional
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  //  Detectar plataforma para mostrar atajo correcto en el hint del buscador
  const [isMac, setIsMac] = useState(true);
  const pathname = usePathname();
  const { data: session, status, update: updateSession } = useSession();
  const { isMobile, toggleSidebar } = useSidebar();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { isAnalyzing, analysisCount: reactiveAnalysisCount } = useAnalysis(); // Detectamos si hay un análisis activo y el contador reactivo
  /****************************************************************************************************************************/
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPod|iPad/.test(navigator.userAgent));
  }, []);
  /****************************************************************************************************************************/
  // getPageMeta usa constante hoistedada
  const getPageMeta = () => {
    const segment = pathname.split("/").pop() ?? "dashboard";
    return PAGE_MAP[segment] ?? PAGE_MAP["dashboard"];
  };

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
  const plan = user?.plan || "free";
  const isPremium = plan === "premium" || plan === "enterprise";
  // Usamos el contador reactivo del contexto para respuesta instantánea
  const analysisCount = reactiveAnalysisCount;
  const percentage = Math.min((analysisCount / 5) * 100, 100);

  // Obtiene meta (label + Icon) de la página actual
  const { label: pageLabel, Icon: PageIcon } = getPageMeta();
  /****************************************************************************************************************************/
  //JSX
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md shadow-md"
          : "bg-background"
      }`}
    >
      <div className="flex items-center justify-between px-4 h-16 border-b">
        <div className="flex items-center">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="mr-2"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          )}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold gradient-text hidden md:inline-block">
              IAnalyticBlood
            </span>
            <span className="text-xl font-bold gradient-text md:hidden">
              AB
            </span>
          </Link>
          {/* Separador + título con icono de la sección activa */}
          <span className="hidden md:inline-block mx-4 text-muted-foreground/30">
            |
          </span>
          <div className="hidden md:flex items-center gap-2">
            <PageIcon className="h-4 w-4 text-primary/70" />
            <span className="text-sm font-semibold text-foreground/80 tracking-tight">
              {pageLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Buscador desktop — abre el command palette al hacer click */}
          {!isMobile && (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="relative mr-2 flex items-center gap-2 h-9 pl-3 pr-4 rounded-xl bg-muted/50 hover:bg-muted/80 border 
              border-border/50 hover:border-primary/20 transition-all duration-200 w-[200px] lg:w-[280px] group"
            >
              <Search className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary/60 transition-colors shrink-0" />
              <span
                className="text-xs text-muted-foreground/50 group-hover:text-muted-foreground/70 flex-1 text-left 
                transition-colors tracking-tight"
              >
                Buscar...
              </span>
              <kbd
                className="hidden lg:inline-flex items-center gap-[2px] px-1.5 py-0.5 rounded-md bg-muted/80 text-muted-foreground/70 
              text-[10px] font-mono border border-border/50 shadow-sm transition-colors group-hover:border-primary/30"
              >
                {isMac ? (
                  <>
                    <Command className="w-[10px] h-[10px]" />
                    <span>K</span>
                  </>
                ) : (
                  "Ctrl K"
                )}
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

          {/* Command Palette — unificado para desktop y móvil */}
          <DashboardSearch open={isSearchOpen} onOpenChange={setIsSearchOpen} />

          {/* Indicador Global de Análisis (IA) */}
          <GlobalAnalysisIndicator />

          {/* El badge ahora desaparece en Desktop (lg:hidden) y durante análisis activo. Oculto en móvil por el nuevo diseño de avatar */}
          {!isAnalyzing && !isMobile && (
            <div className="flex items-center lg:hidden">
              <SubscriptionBadge className={isMobile ? "mr-1 h-8" : "mr-2"} />
            </div>
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
                {unreadCount > 0 && (
                  <span
                    className={`
                      absolute -top-1.5 -right-1.5
                      flex items-center justify-center
                      min-w-[18px] h-[18px] px-[3px]
                      rounded-full
                      bg-gradient-to-br from-primary to-secondary
                      text-white !text-[9px] font-extrabold leading-none tracking-tight
                      ring-2 ring-background
                      shadow-[0_2px_8px_rgba(139,92,246,0.5)]
                      animate-in zoom-in duration-300
                      select-none pointer-events-none
                    `}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
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
                {unreadCount > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-primary/5 text-primary border-primary/20 text-[10px] px-2 py-0"
                  >
                    {unreadCount} Nuevas
                  </Badge>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto divide-y divide-border/40">
                {notifications.length > 0 ? (
                  notifications.slice(0, 4).map((notification) => {
                    const getIconMeta = (type: string) => {
                      switch (type) {
                        case "analysis":
                          return {
                            icon: (
                              <FileText className="h-4 w-4 text-blue-500" />
                            ),
                            bg: "bg-blue-500/10",
                          };
                        case "health":
                          return {
                            icon: <Activity className="h-4 w-4 text-red-500" />,
                            bg: "bg-red-500/10",
                          };
                        case "security":
                          return {
                            icon: (
                              <ShieldCheck className="h-4 w-4 text-purple-500" />
                            ),
                            bg: "bg-purple-500/10",
                          };
                        default:
                          return {
                            icon: <Info className="h-4 w-4 text-amber-500" />,
                            bg: "bg-amber-500/10",
                          };
                      }
                    };
                    const meta = getIconMeta(notification.type);
                    return (
                      <Link
                        key={notification.id}
                        href="/dashboard/notifications"
                        className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors group flex gap-3 ${
                          !notification.read ? "bg-primary/5" : ""
                        }`}
                        onClick={() =>
                          !notification.read && markAsRead(notification.id)
                        }
                      >
                        <div
                          className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${meta.bg}`}
                        >
                          {meta.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-0.5">
                            <p
                              className={`font-bold text-sm truncate pr-4 ${
                                !notification.read
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {notification.title}
                            </p>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {notification.description}
                          </p>
                          {!notification.read && (
                            <div className="mt-2 flex items-center gap-1">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">
                                Nuevo
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="py-12 p-6 text-center space-y-3">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto opacity-20">
                      <Bell className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No tienes notificaciones pendientes.
                    </p>
                  </div>
                )}
              </div>

              <div className="p-3 bg-muted/20 border-t">
                <Button
                  variant="ghost"
                  className="w-full justify-center text-xs font-bold hover:bg-primary/5 hover:text-primary rounded-xl"
                  asChild
                >
                  <Link
                    href="/dashboard/notifications"
                    className="flex items-center gap-2"
                  >
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
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full relative"
              >
                <div className="relative">
                  <Avatar className="h-8 w-8 border border-border/50">
                    {avatar && <AvatarImage src={avatar} alt={name} />}
                    <AvatarFallback className="bg-primary/5 text-primary font-bold">
                      {getInitials(name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Indicador de membresía sobre el avatar (Solo Móvil) */}
                  {isMobile && (
                    <div className="absolute -top-1 -right-1.5 z-10 flex items-center justify-center">
                      {isPremium ? (
                        <Crown
                          className="h-3.5 w-3.5 text-amber-500 fill-amber-500 animate-pulse 
                        drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                        />
                      ) : (
                        <div className="relative flex items-center justify-center w-3.5 h-3.5 overflow-hidden">
                          {/* Capa de fondo (Silueta del rayo siempre visible) */}
                          <Zap className="h-3.5 w-3.5 text-slate-300 dark:text-white/20 absolute" />

                          {/* Capa de energía dinámica (Se llena según uso) */}
                          <motion.div
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
                            animate={{
                              clipPath:
                                percentage >= 100
                                  ? "inset(-10% -10% -10% -10%)" // Forzamos visibilidad total al 100%
                                  : `inset(${100 - percentage}% 0% 0% 0%)`,
                            }}
                            transition={{
                              type: "spring",
                              damping: 30,
                              stiffness: 100,
                            }}
                          >
                            <Zap
                              className={cn(
                                "h-3.5 w-3.5 text-orange-500 fill-orange-500 transition-all duration-700",
                                percentage >= 100 &&
                                  "drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]",
                              )}
                            />
                          </motion.div>

                          {/* Sutil glow perimetral si hay energía */}
                          {percentage > 0 && (
                            <motion.div
                              animate={{ opacity: [0.2, 0.4, 0.2] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="absolute inset-0 bg-orange-500/10 blur-[2px] rounded-full -z-10"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {name.replace(/\b\w/g, (c) => c.toUpperCase())}
              </DropdownMenuLabel>
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
              <DropdownMenuItem
                onClick={() => {
                  let tourId = "home";
                  const lastSegment = pathname.split("/").pop();
                  if (lastSegment && lastSegment !== "dashboard") {
                    tourId = lastSegment;
                  }
                  const event = new CustomEvent(`start_tour_${tourId}`);
                  window.dispatchEvent(event);
                }}
                className="cursor-pointer text-primary"
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Repetir Tutorial
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

// React.memo para evitar re-renders innecesarios cuando el padre re-renderiza
const DashboardNavbar = memo(DashboardNavbarComponent);
export default DashboardNavbar;

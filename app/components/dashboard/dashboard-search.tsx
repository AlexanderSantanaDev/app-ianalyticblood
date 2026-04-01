"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
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
  FileText,
  Zap,
  ArrowRight,
  Clock,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/notification-context";
/****************************************************************************************************************************/
/** Interfaz para el componente DashboardSearch. */
interface SearchItem {
  id: string;
  label: string;
  description?: string;
  href: string;
  icon: React.ElementType;
  category: "navigation" | "action" | "recent";
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}

/** Interfaz para el componente DashboardSearch. */
interface DashboardSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/****************************************************************************************************************************/
/** Datos estáticos de navegación del dashboard. */
const NAV_ITEMS: SearchItem[] = [
  {
    id: "nav-dashboard",
    label: "Panel de Control",
    description: "Vista general e indicadores clave",
    href: "/dashboard",
    icon: LayoutDashboard,
    category: "navigation",
  },
  {
    id: "nav-upload",
    label: "Subir análisis",
    description: "Adjunta un PDF o imagen de informe de sangre",
    href: "/dashboard/upload",
    icon: Upload,
    category: "navigation",
    badge: "IA",
    badgeVariant: "default",
  },
  {
    id: "nav-history",
    label: "Historial",
    description: "Todos tus análisis anteriores",
    href: "/dashboard/history",
    icon: History,
    category: "navigation",
  },
  {
    id: "nav-stats",
    label: "Estadísticas",
    description: "Gráficos y tendencias de tus biomarcadores",
    href: "/dashboard/stats",
    icon: BarChart3,
    category: "navigation",
  },
  {
    id: "nav-calendar",
    label: "Calendario",
    description: "Recordatorios y análisis programados",
    href: "/dashboard/calendar",
    icon: CalendarDays,
    category: "navigation",
  },
  {
    id: "nav-profile",
    label: "Mi Perfil",
    description: "Datos personales y datos médicos",
    href: "/dashboard/profile",
    icon: UserCircle,
    category: "navigation",
  },
  {
    id: "nav-subscription",
    label: "Suscripción",
    description: "Plan actual, facturación y upgrades",
    href: "/dashboard/subscription",
    icon: CreditCard,
    category: "navigation",
  },
  {
    id: "nav-notifications",
    label: "Notificaciones",
    description: "Alertas y novedades de tu cuenta",
    href: "/dashboard/notifications",
    icon: BellRing,
    category: "navigation",
  },
  {
    id: "nav-settings",
    label: "Configuración",
    description: "Seguridad, preferencias y cuenta",
    href: "/dashboard/settings",
    icon: Settings2,
    category: "navigation",
  },
  {
    id: "nav-help",
    label: "Centro de ayuda",
    description: "Documentación y soporte técnico",
    href: "/dashboard/help",
    icon: HelpCircle,
    category: "navigation",
  },
];

/** Acciones rápidas del dashboard. */
const ACTION_ITEMS: SearchItem[] = [
  {
    id: "action-upload",
    label: "Subir nuevo análisis",
    description: "Analiza tu informe de sangre con IA",
    href: "/dashboard/upload",
    icon: Upload,
    category: "action",
    badge: "Nuevo",
    badgeVariant: "default",
  },
  {
    id: "action-history",
    label: "Ver último análisis",
    description: "Consulta tu análisis más reciente",
    href: "/dashboard/history",
    icon: FileText,
    category: "action",
  },
  {
    id: "action-stats",
    label: "Ver mis estadísticas",
    description: "Evolución de biomarcadores en el tiempo",
    href: "/dashboard/stats",
    icon: Zap,
    category: "action",
  },
  {
    id: "action-profile",
    label: "Editar perfil",
    description: "Actualiza tus datos médicos y personales",
    href: "/dashboard/profile",
    icon: UserCircle,
    category: "action",
  },
  {
    id: "action-settings",
    label: "Ir a Configuración",
    description: "Seguridad, 2FA y preferencias",
    href: "/dashboard/settings",
    icon: Settings2,
    category: "action",
  },
];

const RECENT_ITEMS: SearchItem[] = [
  {
    id: "recent-1",
    label: "Análisis de sangre completo",
    description: "Historial",
    href: "/dashboard/history",
    icon: Clock,
    category: "recent",
  },
  {
    id: "recent-2",
    label: "Configuración de perfil",
    description: "Perfil",
    href: "/dashboard/profile",
    icon: Clock,
    category: "recent",
  },
  {
    id: "recent-3",
    label: "Estadísticas mensuales",
    description: "Estadísticas",
    href: "/dashboard/stats",
    icon: Clock,
    category: "recent",
  },
];

/****************************************************************************************************************************/
export default function DashboardSearch({ open, onOpenChange }: DashboardSearchProps) {
  const router = useRouter();
  const { unreadCount } = useNotifications();
  const [query, setQuery] = useState("");
  // Indice de ítem actualmente enfocado con flechas (-1 = sin selección)
  const [focusedIndex, setFocusedIndex] = useState(-1);
  // Detección de plataforma para mostrar el atajo correcto (Mac vs Win/Linux)
  const [isMac, setIsMac] = useState(true);

  // Re-mapear NAV_ITEMS para que el contador de notificaciones sea real
  const dynamicNavItems = useMemo(() => {
    return NAV_ITEMS.map((item) => {
      if (item.id === "nav-notifications") {
        return {
          ...item,
          badge: unreadCount > 0 ? unreadCount.toString() : undefined,
        };
      }
      return item;
    });
  }, [unreadCount]);
  /****************************************************************************************************************************/
  // Hooks
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Detectar plataforma una sola vez al montar
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPod|iPad/.test(navigator.userAgent));
  }, []);

  // Ctrl+K funciona en TODOS los sistemas (Mac usa ⌘K también por convención)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange]);

  // Limpiar estado al cerrar el dialog
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setQuery("");
        setFocusedIndex(-1);
      }, 200);
    }
  }, [open]);
  /****************************************************************************************************************************/
  // Métodos
  /** Filtra los items por query. */
  const filterItems = useCallback((items: SearchItem[], q: string) => {
    if (!q.trim()) return items;
    const lower = q.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(lower) ||
        (item.description?.toLowerCase().includes(lower) ?? false),
    );
  }, []);
  // Filtra usando los items dinámicos.
  const filteredNav = filterItems(dynamicNavItems, query);
  const filteredActions = filterItems(ACTION_ITEMS, query);
  const showRecent = !query.trim();
  const hasResults = filteredNav.length > 0 || filteredActions.length > 0;

  /** lista plana de TODOS los ítems visibles, para mapear el focusedIndex. */
  const allVisibleItems = useMemo<SearchItem[]>(() => {
    if (showRecent) {
      return [...RECENT_ITEMS, ...filteredNav, ...filteredActions];
    }
    return [...filteredNav, ...filteredActions];
  }, [showRecent, filteredNav, filteredActions]);

  // Resetear índice al cambiar la búsqueda
  useEffect(() => {
    setFocusedIndex(-1);
    itemRefs.current = [];
  }, [query]);

  // Auto-scroll al ítem enfocado para que siempre sea visible
  useEffect(() => {
    if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [focusedIndex]);

  /** Navega y cierra en un solo paso. */
  const handleSelect = useCallback(
    (href: string) => {
      onOpenChange(false);
      router.push(href);
    },
    [onOpenChange, router],
  );

  /** Gestión completa de teclado — flechas arriba/abajo + Enter para navegar. */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const total = allVisibleItems.length;
    if (total === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % total);
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev <= 0 ? total - 1 : prev - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && allVisibleItems[focusedIndex]) {
          handleSelect(allVisibleItems[focusedIndex].href);
        }
        break;
      case "Escape":
        onOpenChange(false);
        break;
    }
  };

  /****************************************************************************************************************************/
  // JSX
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Command palette posicionado en la parte superior de la pantalla */}
      <DialogContent
        className={cn(
          "p-0 gap-0 overflow-hidden max-w-[640px] w-[92vw]",
          "bg-background/95 backdrop-blur-2xl",
          "border border-border/60 shadow-2xl shadow-primary/10",
          "rounded-2xl",
          "!top-[15%] !translate-y-0",
        )}
      >
        {/* Área de input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50">
          <Search className="h-[18px] w-[18px] shrink-0 text-muted-foreground/60" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Busca secciones, análisis o acciones..."
            autoFocus
            className={cn(
              "flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50",
              "outline-none border-none ring-0 focus:ring-0 focus:outline-none",
              "tracking-tight",
            )}
          />
          {/* Atajo de teclado — Estilo unificado y posicionado a la izquierda de la 'X' para evitar solapamiento */}
          <div className="hidden sm:flex items-center gap-1 pr-8">
            <kbd
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted/80 text-muted-foreground/70 text-[10px] 
            font-mono border border-border/50 shadow-sm"
            >
              {/* Muestra ⌘K en Mac y Ctrl K en Windows/Linux */}
              {isMac ? "⌘K" : "Ctrl K"}
            </kbd>
          </div>
        </div>

        {/* Lista de resultados con scroll */}
        <div
          ref={scrollContainerRef}
          className="max-h-[420px] overflow-y-auto overscroll-contain py-2"
        >
          {/* Estado vacío */}
          {!hasResults && query.trim() && (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                <Search className="h-5 w-5 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-semibold text-foreground/60">Sin resultados</p>
              <p className="text-xs text-muted-foreground mt-1">
                No encontramos nada para &quot;{query}&quot;
              </p>
            </div>
          )}

          {/* Sección: Búsquedas recientes */}
          {showRecent && (
            <SearchSection title="Recientes" icon={Clock}>
              {RECENT_ITEMS.map((item, idx) => (
                <SearchResultItem
                  key={item.id}
                  item={item}
                  isFocused={focusedIndex === idx}
                  onSelect={handleSelect}
                  onMouseEnter={() => setFocusedIndex(idx)}
                  ref={(el) => {
                    itemRefs.current[idx] = el;
                  }}
                />
              ))}
            </SearchSection>
          )}

          {/* Sección: Navegación */}
          {filteredNav.length > 0 && (
            <SearchSection title="Secciones" icon={LayoutDashboard}>
              {filteredNav.map((item, idx) => {
                const globalIdx = showRecent ? RECENT_ITEMS.length + idx : idx;
                return (
                  <SearchResultItem
                    key={item.id}
                    item={item}
                    isFocused={focusedIndex === globalIdx}
                    onSelect={handleSelect}
                    onMouseEnter={() => setFocusedIndex(globalIdx)}
                    ref={(el) => {
                      itemRefs.current[globalIdx] = el;
                    }}
                  />
                );
              })}
            </SearchSection>
          )}

          {/* Sección: Acciones rápidas */}
          {filteredActions.length > 0 && (
            <SearchSection title="Acciones rápidas" icon={Zap}>
              {filteredActions.map((item, idx) => {
                const globalIdx = showRecent
                  ? RECENT_ITEMS.length + filteredNav.length + idx
                  : filteredNav.length + idx;
                return (
                  <SearchResultItem
                    key={item.id}
                    item={item}
                    isFocused={focusedIndex === globalIdx}
                    onSelect={handleSelect}
                    onMouseEnter={() => setFocusedIndex(globalIdx)}
                    ref={(el) => {
                      itemRefs.current[globalIdx] = el;
                    }}
                  />
                );
              })}
            </SearchSection>
          )}
        </div>

        {/* Footer solo visible en desktop — en móvil no hay teclado físico */}
        <div className="hidden sm:flex items-center justify-between px-4 py-2.5 border-t border-border/40 bg-muted/20">
          <div className="flex items-center gap-2">
            <kbd
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground/60 text-[10px] 
            font-mono border border-border/60"
            >
              ↑↓ navegar
            </kbd>
            <kbd
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground/60 text-[10px] 
            font-mono border border-border/60"
            >
              ↵ abrir
            </kbd>
            <kbd
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground/60 text-[10px] 
            font-mono border border-border/60"
            >
              esc cerrar
            </kbd>
          </div>
          <p className="text-[10px] text-muted-foreground/50 font-medium tracking-tight">
            iAnalytic<span className="text-primary/60">Blood</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/****************************************************************************************************************************/
// Sub-componentes internos
function SearchSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-1">
      <div className="flex items-center gap-2 px-4 py-1.5 mb-0.5">
        <Icon className="h-3 w-3 text-muted-foreground/40" />
        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

import { forwardRef } from "react";

/** SearchResultItem acepta ref (para scroll automático) + isFocused + onMouseEnter. */
const SearchResultItem = forwardRef<
  HTMLButtonElement,
  {
    item: SearchItem;
    isFocused: boolean;
    onSelect: (href: string) => void;
    onMouseEnter: () => void;
  }
>(({ item, isFocused, onSelect, onMouseEnter }, ref) => {
  const Icon = item.icon;

  return (
    <button
      ref={ref}
      onClick={() => onSelect(item.href)}
      onMouseEnter={onMouseEnter}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 text-left",
        "transition-colors duration-100 group outline-none",
        // isFocused aplica estilo de foco visual para navegación con flechas
        isFocused
          ? "bg-primary/[0.08] border-l-2 border-primary/60"
          : "hover:bg-primary/5 border-l-2 border-transparent",
      )}
    >
      {/* Icono */}
      <div
        className={cn(
          "h-8 w-8 rounded-xl border flex items-center justify-center shrink-0 transition-colors duration-150",
          isFocused
            ? "bg-primary/10 border-primary/20"
            : "bg-muted/50 border-border/40 group-hover:bg-primary/10 group-hover:border-primary/20",
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4 transition-colors duration-150",
            isFocused ? "text-primary/70" : "text-muted-foreground/60 group-hover:text-primary/70",
          )}
        />
      </div>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium truncate transition-colors",
              isFocused ? "text-foreground" : "text-foreground/80 group-hover:text-foreground",
            )}
          >
            {item.label}
          </span>
          {item.badge && (
            <Badge
              variant="outline"
              className="text-[9px] px-1.5 py-0 h-4 border-primary/30 bg-primary/5 text-primary font-bold shrink-0"
            >
              {item.badge}
            </Badge>
          )}
        </div>
        {item.description && (
          <p
            className={cn(
              "text-xs truncate mt-0.5 transition-colors",
              isFocused
                ? "text-muted-foreground/70"
                : "text-muted-foreground/50 group-hover:text-muted-foreground/70",
            )}
          >
            {item.description}
          </p>
        )}
      </div>

      {/* Flecha */}
      <ArrowRight
        className={cn(
          "h-3.5 w-3.5 shrink-0 transition-all duration-150",
          isFocused
            ? "text-primary/50 translate-x-0.5"
            : "text-muted-foreground/20 group-hover:text-primary/50 group-hover:translate-x-0.5",
        )}
      />
    </button>
  );
});

SearchResultItem.displayName = "SearchResultItem";

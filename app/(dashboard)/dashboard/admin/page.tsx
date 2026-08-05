"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useMobile as useIsMobile } from "@/hooks/use-mobile";

import {
  Users,
  Activity,
  TrendingUp,
  ShieldCheck,
  Cpu,
  Globe,
  Crown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Calendar,
  Zap,
  Server,
  LayoutGrid,
  LayoutList,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TourGuide } from "@/components/dashboard/tour-guide";
import { adminSteps } from "@/lib/tour-steps";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { AdminMetrics, AdminUser, SystemHealth } from "@/lib/api/admin";
import {
  getAdminMetrics,
  getAdminUsers,
  getSystemHealth,
  updateUserPlan,
  updateUserStatus,
} from "@/lib/api/admin";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
/***********************************************************************************************************************/
// Colores de la paleta de la app
const PLAN_COLORS: Record<string, string> = {
  free: "#6b7280",
  premium: "#a855f7",
  enterprise: "#f59e0b",
};

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  premium: "Premium",
  enterprise: "Enterprise",
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: typeof CheckCircle2 }
> = {
  active: { label: "Activo", color: "text-emerald-400", icon: CheckCircle2 },
  inactive: { label: "Inactivo", color: "text-gray-400", icon: XCircle },
  suspended: {
    label: "Suspendido",
    color: "text-red-400",
    icon: AlertTriangle,
  },
};

// Tipos locales
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { value: number; positive: boolean };
  accent?: string;
  loading?: boolean;
}
/***********************************************************************************************************************/
// Componente MetricCard
function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accent = "from-primary/20 to-primary/5",
  loading,
}: MetricCardProps) {
  if (loading) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Cards con glassmorphism ligero y glow de acento de marca */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 group overflow-hidden relative">
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            accent,
          )}
        />
        <CardContent className="p-6 relative">
          <div className="flex items-start justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">
              {title}
            </span>
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="text-3xl font-black tracking-tight text-foreground mb-1">
            {typeof value === "number" ? value.toLocaleString("es-ES") : value}
          </div>
          <div className="flex items-center gap-2">
            {trend && (
              <span
                className={cn(
                  "text-xs font-semibold",
                  trend.positive ? "text-emerald-400" : "text-red-400",
                )}
              >
                {trend.positive ? "+" : ""}
                {trend.value}%
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/** Componente SystemHealthCard. */
function SystemHealthCard({
  health,
  loading,
}: {
  health: SystemHealth | null;
  loading: boolean;
}) {
  if (loading || !health) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <Skeleton className="h-4 w-32 mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-3 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusMap: Record<
    SystemHealth["status"],
    { color: string; label: string; dot: string }
  > = {
    healthy: {
      color: "text-emerald-400",
      label: "Operativo",
      dot: "bg-emerald-400",
    },
    degraded: {
      color: "text-amber-400",
      label: "Degradado",
      dot: "bg-amber-400",
    },
    down: { color: "text-red-400", label: "Caído", dot: "bg-red-400" },
  };
  const s = statusMap[health.status];

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Server className="h-4 w-4 text-primary" />
            Estado del Sistema
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full animate-pulse", s.dot)} />
            <span className={cn("text-xs font-bold", s.color)}>{s.label}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {[
          {
            label: "Latencia API",
            value: `${health.api_latency_ms} ms`,
            ok: health.api_latency_ms < 300,
          },
          {
            label: "Base de datos",
            value: health.db_connected ? "Conectada" : "Desconectada",
            ok: health.db_connected,
          },
          {
            label: "Servicio de IA",
            value: health.ai_service_available ? "Disponible" : "No disponible",
            ok: health.ai_service_available,
          },
          {
            label: "Uptime",
            value: `${Math.floor(health.uptime_seconds / 3600)}h ${Math.floor((health.uptime_seconds % 3600) / 60)}m`,
            ok: true,
          },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{item.label}</span>
            <span
              className={cn(
                "text-xs font-semibold",
                item.ok ? "text-emerald-400" : "text-red-400",
              )}
            >
              {item.value}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/** Componente UserRow. */
function UserRow({
  user,
  token,
  onUpdate,
}: {
  user: AdminUser;
  token: string;
  onUpdate: () => void;
}) {
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const statusCfg = STATUS_CONFIG[user.status] ?? STATUS_CONFIG.active;
  const StatusIcon = statusCfg.icon;

  const handlePlanChange = async (plan: string) => {
    setLoadingPlan(true);
    try {
      await updateUserPlan(
        token,
        user.id,
        plan as "free" | "premium" | "enterprise",
      );
      toast.success(`Plan de ${user.name} actualizado a ${PLAN_LABELS[plan]}`);
      onUpdate();
    } catch {
      toast.error("No se pudo actualizar el plan. Inténtalo de nuevo.");
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleStatusToggle = async () => {
    const newStatus = user.status === "active" ? "suspended" : "active";
    setLoadingStatus(true);
    try {
      await updateUserStatus(token, user.id, newStatus);
      toast.success(
        `Usuario ${newStatus === "active" ? "reactivado" : "suspendido"} correctamente.`,
      );
      onUpdate();
    } catch {
      toast.error("No se pudo actualizar el estado. Inténtalo de nuevo.");
    } finally {
      setLoadingStatus(false);
    }
  };

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-border/30 hover:bg-muted/30 transition-colors group"
    >
      {/* Avatar + info */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center 
          justify-center text-white text-xs font-bold shrink-0"
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground truncate max-w-[140px]">
              {user.name}
            </div>
            <div className="text-xs text-muted-foreground truncate max-w-[140px]">
              {user.email}
            </div>
          </div>
        </div>
      </td>

      {/* Plan */}
      <td className="px-4 py-3">
        <Select
          value={user.plan}
          onValueChange={handlePlanChange}
          disabled={loadingPlan}
        >
          <SelectTrigger className="h-7 text-xs w-28 border-border/50 bg-background/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PLAN_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key} className="text-xs">
                <span style={{ color: PLAN_COLORS[key] }}>●</span> {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>

      {/* Estado */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <StatusIcon className={cn("h-3.5 w-3.5", statusCfg.color)} />
          <span className={cn("text-xs font-medium", statusCfg.color)}>
            {statusCfg.label}
          </span>
        </div>
      </td>

      {/* Análisis */}
      <td className="px-4 py-3 text-center">
        <span className="text-sm font-bold text-foreground">
          {user.analysis_count}
        </span>
      </td>

      {/* Provider */}
      <td className="px-4 py-3">
        <Badge
          variant="outline"
          className="text-[10px] font-medium border-border/50"
        >
          {user.provider === "google" ? "Google" : "Manual"}
        </Badge>
      </td>

      {/* Fecha creación */}
      <td className="px-4 py-3">
        <span className="text-xs text-muted-foreground">
          {format(parseISO(user.created_at), "dd/MM/yyyy", { locale: es })}
        </span>
      </td>

      {/* Acciones */}
      <td className="px-4 py-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "h-7 px-2 text-xs",
                user.status === "active"
                  ? "hover:text-red-400 hover:bg-red-400/10"
                  : "hover:text-emerald-400 hover:bg-emerald-400/10",
              )}
              onClick={handleStatusToggle}
              disabled={loadingStatus}
            >
              {loadingStatus ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : user.status === "active" ? (
                <XCircle className="h-3 w-3" />
              ) : (
                <CheckCircle2 className="h-3 w-3" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            {user.status === "active"
              ? "Suspender usuario"
              : "Reactivar usuario"}
          </TooltipContent>
        </Tooltip>
      </td>
    </motion.tr>
  );
}

/** UserCard — vista de tarjeta premium para el modo grid en móvil y desktop.
    Muestra toda la información del usuario con diseño glassmorphism coherente con la app.
*/
function UserCard({
  user,
  token,
  onUpdate,
}: {
  user: AdminUser;
  token: string;
  onUpdate: () => void;
}) {
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const statusCfg = STATUS_CONFIG[user.status] ?? STATUS_CONFIG.active;
  const StatusIcon = statusCfg.icon;

  /** Maneja el cambio de plan del usuario */
  const handlePlanChange = async (plan: string) => {
    setLoadingPlan(true);
    try {
      await updateUserPlan(
        token,
        user.id,
        plan as "free" | "premium" | "enterprise",
      );
      toast.success(`Plan de ${user.name} actualizado a ${PLAN_LABELS[plan]}`);
      onUpdate();
    } catch {
      toast.error("No se pudo actualizar el plan. Inténtalo de nuevo.");
    } finally {
      setLoadingPlan(false);
    }
  };

  /** Maneja el cambio de estado del usuario */
  const handleStatusToggle = async () => {
    const newStatus = user.status === "active" ? "suspended" : "active";
    setLoadingStatus(true);
    try {
      await updateUserStatus(token, user.id, newStatus);
      toast.success(
        `Usuario ${newStatus === "active" ? "reactivado" : "suspendido"} correctamente.`,
      );
      onUpdate();
    } catch {
      toast.error("No se pudo actualizar el estado. Inténtalo de nuevo.");
    } finally {
      setLoadingStatus(false);
    }
  };

  // Render
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5 
        hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
    >
      {/* Dot indicador de estado */}
      <span
        className={cn(
          "absolute top-4 right-4 w-2.5 h-2.5 rounded-full",
          user.status === "active"
            ? "bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.4)]"
            : user.status === "suspended"
              ? "bg-red-400 shadow-[0_0_6px_2px_rgba(248,113,113,0.4)]"
              : "bg-gray-400",
        )}
      />

      {/* Avatar + nombre + email */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center 
          justify-center text-white text-sm font-extrabold shrink-0 shadow-md"
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-foreground truncate">
            {user.name}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {user.email}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <StatusIcon className={cn("h-3 w-3", statusCfg.color)} />
            <span className={cn("text-[10px] font-semibold", statusCfg.color)}>
              {statusCfg.label}
            </span>
          </div>
        </div>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-muted/40 rounded-xl p-2 text-center">
          <div className="text-lg font-black text-foreground">
            {user.analysis_count}
          </div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-wide">
            Análisis
          </div>
        </div>
        <div className="bg-muted/40 rounded-xl p-2 text-center">
          <div
            className="text-xs font-bold truncate"
            style={{ color: PLAN_COLORS[user.plan] ?? "currentColor" }}
          >
            {PLAN_LABELS[user.plan] ?? user.plan}
          </div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-wide">
            Plan
          </div>
        </div>
        <div className="bg-muted/40 rounded-xl p-2 text-center">
          <div className="text-[10px] font-semibold text-foreground">
            {user.provider === "google" ? "Google" : "Manual"}
          </div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-wide">
            Auth
          </div>
        </div>
      </div>

      {/* Fecha */}
      <div className="text-[10px] text-muted-foreground mb-4">
        Registrado:{" "}
        <span className="font-medium text-foreground">
          {format(parseISO(user.created_at), "dd MMM yyyy", { locale: es })}
        </span>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2">
        {/* Cambiar plan */}
        <Select
          value={user.plan}
          onValueChange={handlePlanChange}
          disabled={loadingPlan}
        >
          <SelectTrigger className="h-8 text-xs flex-1 border-border/50 bg-background/50 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PLAN_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key} className="text-xs">
                <span style={{ color: PLAN_COLORS[key] }}>●</span> {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Toggle estado */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "h-8 w-8 p-0 rounded-xl shrink-0 border border-border/40",
                user.status === "active"
                  ? "hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/30"
                  : "hover:text-emerald-400 hover:bg-emerald-400/10 hover:border-emerald-400/30",
              )}
              onClick={handleStatusToggle}
              disabled={loadingStatus}
            >
              {loadingStatus ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : user.status === "active" ? (
                <XCircle className="h-3.5 w-3.5" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={6} className="z-[9999]">
            {user.status === "active"
              ? "Suspender usuario"
              : "Reactivar usuario"}
          </TooltipContent>
        </Tooltip>
      </div>
    </motion.div>
  );
}

/** Página principal de Admin */
export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isMobile = useIsMobile();

  // doble verificación de seguridad en cliente
  const isAdmin = session?.user?.role === "admin";
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "analytics"
  >("overview");
  // Siempre empieza en tabla; el useEffect lo corrige a grid en cuanto
  // isMobile se resuelve realmente tras la hidratación (evita SSR mismatch)
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // sincronizar viewMode con el tamaño real de pantalla post-hidratación
  useEffect(() => {
    setViewMode(isMobile ? "grid" : "table");
  }, [isMobile]);

  const PAGE_SIZE = 20;
  const token = session?.accessToken ?? "";

  // Redirige si no es admin
  useEffect(() => {
    if (status === "authenticated" && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [status, isAdmin, router]);

  /** Carga métricas del dashboard */
  const fetchMetrics = useCallback(async () => {
    if (!token) return;
    setLoadingMetrics(true);
    try {
      const data = await getAdminMetrics(token);
      setMetrics(data);
    } catch {
      toast.error("No se pudieron cargar las métricas del panel.");
    } finally {
      setLoadingMetrics(false);
    }
  }, [token]);

  /** Carga estado del sistema */
  const fetchHealth = useCallback(async () => {
    if (!token) return;
    setLoadingHealth(true);
    try {
      const data = await getSystemHealth(token);
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setLoadingHealth(false);
    }
  }, [token]);

  /** Carga usuarios */
  const fetchUsers = useCallback(async (silent: boolean = false) => {
    if (!token) return;
    if (silent !== true) setLoadingUsers(true);
    try {
      const data = await getAdminUsers(token, page, PAGE_SIZE, search);
      setUsers(data.users);
      setTotalUsers(data.total);
    } catch {
      toast.error("No se pudieron cargar los usuarios.");
    } finally {
      if (silent !== true) setLoadingUsers(false);
    }
  }, [token, page, search]);

  useEffect(() => {
    if (isAdmin && token) {
      fetchMetrics();
      fetchHealth();
    }
  }, [isAdmin, token, fetchMetrics, fetchHealth]);

  useEffect(() => {
    if (isAdmin && token) {
      fetchUsers();
    }
  }, [isAdmin, token, page, search, fetchUsers]);

  // Debounce de búsqueda
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setSearch(searchInput);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Guard simplificado — el middleware garantiza autenticación,
  // el isAdmin guard de abajo maneja el acceso. Eliminamos el spinner de status='loading'
  // que causaba el parpadeo en cada navegación
  if (status !== "authenticated") return null;

  // Guard cliente
  if (!isAdmin) return null;

  // Datos derivados para los gráficos
  const planPieData = metrics
    ? Object.entries(metrics.users_by_plan).map(([key, count]) => ({
        name: PLAN_LABELS[key],
        value: count,
        color: PLAN_COLORS[key],
      }))
    : [];

  const totalPages = Math.ceil(totalUsers / PAGE_SIZE);

  // JSX
  return (
    <div className="space-y-8 py-6">
      <TourGuide steps={adminSteps} pageId="admin" />
      {/* Header del panel de admin */}
      <div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent border 
      border-amber-500/20 px-6 py-7"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-5 w-5 text-amber-400" />
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs font-bold">
                ACCESO RESTRINGIDO — SOLO ADMIN
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
              Panel de <span className="text-amber-400">Administración</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gestión global de usuarios, métricas de la plataforma y estado del
              sistema.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchMetrics();
              fetchHealth();
              fetchUsers();
            }}
            className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Actualizar datos
          </Button>
        </div>
      </div>

      {/* Tabs de navegación interna */}
      <div id="tour-admin-tabs" className="flex gap-1 p-1 bg-muted/40 rounded-xl w-fit border border-border/40">
        {(
          [
            { key: "overview", label: "Resumen", icon: BarChart3 },
            { key: "users", label: "Usuarios", icon: Users },
            { key: "analytics", label: "Analíticas", icon: Activity },
          ] as const
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              activeTab === key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* TAB: RESUMEN */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* KPI Cards */}
            {/* Métricas clave de la plataforma — diseño con cards de glassmorphism */}
            <div id="tour-admin-stats" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <MetricCard
                title="Usuarios totales"
                value={metrics?.total_users ?? 0}
                subtitle="usuarios registrados"
                icon={Users}
                loading={loadingMetrics}
                accent="from-blue-500/10 to-blue-500/5"
              />
              <MetricCard
                title="Activos hoy"
                value={metrics?.active_users_today ?? 0}
                subtitle={`${metrics?.active_users_week ?? 0} esta semana`}
                icon={Activity}
                loading={loadingMetrics}
                accent="from-emerald-500/10 to-emerald-500/5"
              />
              <MetricCard
                title="Análisis totales"
                value={metrics?.total_analyses ?? 0}
                subtitle={`${metrics?.analyses_today ?? 0} hoy`}
                icon={TrendingUp}
                loading={loadingMetrics}
                accent="from-primary/10 to-primary/5"
              />
              {/* Ingresos muestra Stripe pendiente si es 0 en vez de €0.00 confuso */}
              <MetricCard
                title="Ingresos del mes"
                value={
                  metrics && metrics.revenue_month > 0
                    ? `${metrics.revenue_month.toLocaleString("es-ES", { minimumFractionDigits: 2 })} €`
                    : "Stripe pendiente"
                }
                subtitle="facturación mensual"
                icon={Crown}
                loading={loadingMetrics}
                accent="from-amber-500/10 to-amber-500/5"
              />
            </div>

            {/* Segunda fila */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Distribución de planes — PieChart */}
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    Distribución de Planes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingMetrics ? (
                    <Skeleton className="h-40 w-full rounded-xl" />
                  ) : planPieData.every((d) => d.value === 0) ? (
                    // Estado vacío elegante para el pie chart cuando no hay datos de planes
                    <div className="flex flex-col items-center justify-center h-40 gap-2">
                      <Globe className="h-8 w-8 text-muted-foreground/30" />
                      <p className="text-xs text-muted-foreground text-center">
                        Sin distribución de planes aún
                      </p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={planPieData.filter((d) => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {planPieData
                            .filter((d) => d.value > 0)
                            .map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                        </Pie>
                        <Legend
                          iconSize={8}
                          iconType="circle"
                          formatter={(value) => (
                            <span className="text-xs text-muted-foreground">
                              {value}
                            </span>
                          )}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Estado del sistema */}
              <SystemHealthCard health={health} loading={loadingHealth} />

              {/* Top usuarios */}
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Top Usuarios por Análisis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingMetrics ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-7 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(metrics?.top_users ?? []).slice(0, 5).map((u, i) => (
                        <div key={u.id} className="flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground w-4">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-foreground truncate">
                              {u.name}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-[10px] border-primary/30 text-primary shrink-0"
                          >
                            {u.analysis_count} análisis
                          </Badge>
                        </div>
                      ))}
                      {(!metrics?.top_users ||
                        metrics.top_users.length === 0) && (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          Sin datos aún
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* TAB: USUARIOS */}
        {activeTab === "users" && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Gestión de Usuarios
                </h2>
                <p className="text-sm text-muted-foreground">
                  {totalUsers.toLocaleString("es-ES")} usuarios registrados en
                  la plataforma
                </p>
              </div>
              {/* Toggle tabla / grid — se muestra junto al buscador */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar usuario..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-8 h-9 text-sm w-52 bg-background/50 border-border/50"
                  />
                </div>

                {/* Toggle vista tabla/grid */}
                <div className="flex items-center bg-muted/40 border border-border/40 rounded-xl p-0.5 gap-0.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setViewMode("table")}
                        className={cn(
                          "h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-200",
                          viewMode === "table"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                        aria-label="Vista de tabla"
                      >
                        <LayoutList className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Vista tabla</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setViewMode("grid")}
                        className={cn(
                          "h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-200",
                          viewMode === "grid"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                        aria-label="Vista de tarjetas"
                      >
                        <LayoutGrid className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      Vista tarjetas
                    </TooltipContent>
                  </Tooltip>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-1.5 text-muted-foreground"
                  onClick={() => fetchUsers()}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Vista tabla (desktop por defecto) */}
            {viewMode === "table" && (
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/30">
                        {[
                          "Usuario",
                          "Plan",
                          "Estado",
                          "Análisis",
                          "Proveedor",
                          "Registro",
                          "Acciones",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loadingUsers
                        ? [...Array(8)].map((_, i) => (
                            <tr key={i} className="border-b border-border/20">
                              {[...Array(7)].map((_, j) => (
                                <td key={j} className="px-4 py-3">
                                  <Skeleton className="h-5 w-full max-w-[100px]" />
                                </td>
                              ))}
                            </tr>
                          ))
                        : users.map((user) => (
                            <UserRow
                              key={user.id}
                              user={user}
                              token={token}
                              onUpdate={() => fetchUsers(true)}
                            />
                          ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-border/30">
                    <span className="text-xs text-muted-foreground">
                      Página {page} de {totalPages} · {totalUsers} usuarios
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="h-7 w-7 p-0"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="h-7 w-7 p-0"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Vista grid de tarjetas — por defecto en móvil */}
            {viewMode === "grid" && (
              <>
                {loadingUsers ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-card/80 border border-border/50 rounded-2xl p-5 space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
                          <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-3.5 w-24" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <Skeleton className="h-14 rounded-xl" />
                          <Skeleton className="h-14 rounded-xl" />
                          <Skeleton className="h-14 rounded-xl" />
                        </div>
                        <Skeleton className="h-8 w-full rounded-xl" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {users.map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        token={token}
                        onUpdate={() => fetchUsers(true)}
                      />
                    ))}
                  </div>
                )}

                {/* Paginación bajo el grid */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">
                      Página {page} de {totalPages} · {totalUsers} usuarios
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="h-7 w-7 p-0"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="h-7 w-7 p-0"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* TAB: ANALÍTICAS */}
        {activeTab === "analytics" && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Gráfico de análisis por día */}
            {/* AreaChart para mostrar la actividad de análisis en los últimos 30 días */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  {/* título actualizado a 90 días para coherencia con el backend */}
                  Análisis por Día — Últimos 90 días
                </CardTitle>
                <CardDescription className="text-xs">
                  Volumen de análisis de sangre procesados diariamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingMetrics ? (
                  <Skeleton className="h-64 w-full rounded-xl" />
                ) : !metrics?.analyses_per_day?.length ? (
                  // Estado vacío elegante cuando no hay análisis en los últimos 90 días
                  <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <Activity className="h-10 w-10 text-muted-foreground/20" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">
                        Sin datos de análisis recientes
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        Los gráficos aparecerán cuando los usuarios realicen
                        análisis
                      </p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={metrics.analyses_per_day}>
                      <defs>
                        <linearGradient
                          id="analysisGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        opacity={0.4}
                      />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(v) =>
                          format(parseISO(v), "dd/MM", { locale: es })
                        }
                        tick={{
                          fontSize: 11,
                          fill: "hsl(var(--muted-foreground))",
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{
                          fontSize: 11,
                          fill: "hsl(var(--muted-foreground))",
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "10px",
                          fontSize: "12px",
                        }}
                        labelFormatter={(v) =>
                          format(parseISO(String(v)), "dd MMMM yyyy", {
                            locale: es,
                          })
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        name="Análisis"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#analysisGrad)"
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Gráfico de nuevos usuarios por día */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-400" />
                  {/* Título actualizado a 90 días */}
                  Nuevos Usuarios por Día — Últimos 90 días
                </CardTitle>
                <CardDescription className="text-xs">
                  Ritmo de adquisición de usuarios en la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingMetrics ? (
                  <Skeleton className="h-52 w-full rounded-xl" />
                ) : !metrics?.new_users_per_day?.length ? (
                  // Estado vacío elegante para el gráfico de nuevos usuarios
                  <div className="flex flex-col items-center justify-center h-52 gap-3">
                    <Users className="h-10 w-10 text-muted-foreground/20" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">
                        Sin registros recientes
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        Los nuevos registros aparecerán aquí en tiempo real
                      </p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={metrics.new_users_per_day}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        opacity={0.4}
                      />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(v) =>
                          format(parseISO(v), "dd/MM", { locale: es })
                        }
                        tick={{
                          fontSize: 11,
                          fill: "hsl(var(--muted-foreground))",
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{
                          fontSize: 11,
                          fill: "hsl(var(--muted-foreground))",
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "10px",
                          fontSize: "12px",
                        }}
                        labelFormatter={(v) =>
                          format(parseISO(String(v)), "dd MMMM yyyy", {
                            locale: es,
                          })
                        }
                      />
                      <Bar
                        dataKey="count"
                        name="Nuevos usuarios"
                        fill="#10b981"
                        radius={[3, 3, 0, 0]}
                        opacity={0.85}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Stats secundarios */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MetricCard
                title="Análisis esta semana"
                value={metrics?.analyses_week ?? 0}
                subtitle="últimos 7 días"
                icon={Calendar}
                loading={loadingMetrics}
              />
              <MetricCard
                title="Usuarios con Google"
                value={metrics?.users_by_provider?.google ?? 0}
                subtitle={`${metrics?.users_by_provider?.credentials ?? 0} manuales`}
                icon={Globe}
                loading={loadingMetrics}
              />
              <MetricCard
                title="Activos esta semana"
                value={metrics?.active_users_week ?? 0}
                subtitle="usuarios únicos"
                icon={Cpu}
                loading={loadingMetrics}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

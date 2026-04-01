"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  Trash2,
  FileText,
  Activity,
  ShieldCheck,
  Clock,
  Info,
  MoreVertical,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

/***********************************************************************************************************************/
/** Tipos. */
type NotificationType = "analysis" | "health" | "system" | "security";

/** Interfaz de notificaciones. */
interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
  priority: "low" | "medium" | "high";
}

/** Notificaciones iniciales. Mock */
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "analysis",
    title: "Análisis completado",
    description:
      "Tu informe del 28 de marzo ha sido procesado. La IA ha detectado mejoras en tus niveles de hierro.",
    time: "Hace 15 min",
    read: false,
    priority: "low",
  },
  {
    id: "2",
    type: "health",
    title: "Atención Requerida",
    description:
      "Niveles de Vitamina D por debajo del rango recomendado. Revisa las sugerencias nutritivas.",
    time: "Hace 2 horas",
    read: false,
    priority: "high",
  },
  {
    id: "3",
    type: "security",
    title: "Nuevo inicio de sesión",
    description: "Se detectó un acceso desde un dispositivo Mac OS en Madrid, España.",
    time: "Hace 5 horas",
    read: true,
    priority: "medium",
  },
  {
    id: "4",
    type: "system",
    title: "Actualización de la plataforma",
    description:
      "Hemos integrado soporte para nuevos biomarcadores de tiroides en el motor DeepSeek.",
    time: "Ayer",
    read: true,
    priority: "low",
  },
  {
    id: "5",
    type: "analysis",
    title: "Análisis programado",
    description:
      "Recuerda que mañana tienes tu chequeo trimestral. Ayunas de 8 horas recomendadas.",
    time: "Hace 2 días",
    read: true,
    priority: "low",
  },
];
/***********************************************************************************************************************/
export default function NotificationsPage() {
  // Estados
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<string>("all");

  // Filtros
  const filteredNotifications = notifications.filter((n) =>
    filter === "all" ? true : n.type === filter,
  );

  // Contador de notificaciones no leídas
  const unreadCount = notifications.filter((n) => !n.read).length;
  /***********************************************************************************************************************/
  // Métodos
  /** Marcar todas las notificaciones como leídas. */
  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    toast.success("Todas las notificaciones marcadas como leídas");
  };

  /** Elimina una notificación. */
  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    toast.info("Notificación eliminada");
  };

  /** Alterna el estado de lectura de una notificación. */
  const toggleRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
  };

  /** Obtiene el icono correspondiente al tipo de notificación. */
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "analysis":
        return <FileText className="w-5 h-5 text-blue-500" />;
      case "health":
        return <Activity className="w-5 h-5 text-red-500" />;
      case "security":
        return <ShieldCheck className="w-5 h-5 text-purple-500" />;
      case "system":
        return <Info className="w-5 h-5 text-amber-500" />;
    }
  };
  /***********************************************************************************************************************/
  //JSX
  return (
    <div className="pt-8 pb-12 min-h-[calc(100dvh-4rem)]">
      <div className="container mx-auto px-4 max-w-5xl w-full">
        {/* Header Premium */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20 shadow-sm">
                <Bell className="w-6 h-6" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Notificaciones</h1>
            </div>
            <p className="text-muted-foreground text-lg sm:ml-[3.5rem] ml-0 max-w-2xl">
              Mantente al día con tus análisis, alertas de salud e inicios de sesión.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="rounded-xl border-primary/20 hover:bg-primary/5 text-primary"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Marcar todo como leído
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl hover:bg-red-500/10 hover:text-red-500"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>

        {/* Categories & Listing */}
        <div className="space-y-6">
          <div className="w-full">
            <Tabs value={filter} onValueChange={setFilter} className="w-full">
              <TabsList
                className="bg-transparent border-none p-0 h-auto w-full grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-row gap-2 
              sm:gap-3 mb-2"
              >
                <TabsTrigger
                  value="all"
                  className="relative group h-auto py-3 px-4 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm 
                  hover:bg-card/60 transition-all duration-300 data-[state=active]:bg-primary/5 data-[state=active]:border-primary/40 
                  data-[state=active]:shadow-lg data-[state=active]:shadow-primary/5 flex items-center justify-center gap-2.5 col-span-2 
                  sm:col-span-1"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-data-[state=active]:text-primary transition-colors" />
                  <span className="font-semibold text-sm">Todas</span>
                  {unreadCount > 0 && (
                    <Badge className="ml-0.5 bg-primary/20 text-primary border-primary/20 text-[10px] sm:text-xs h-4 px-1.5 min-w-4 flex-shrink-0">
                      {unreadCount}
                    </Badge>
                  )}
                  {filter === "all" && (
                    <motion.div
                      layoutId="activeTabNotification"
                      className="absolute inset-0 rounded-2xl border-2 border-primary/20 z-[-1]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </TabsTrigger>

                {[
                  { id: "analysis", label: "Análisis", icon: FileText, color: "text-blue-500" },
                  { id: "health", label: "Salud", icon: Activity, color: "text-red-500" },
                  {
                    id: "security",
                    label: "Seguridad",
                    icon: ShieldCheck,
                    color: "text-purple-500",
                  },
                  { id: "system", label: "Sistema", icon: Info, color: "text-amber-500" },
                ].map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <TabsTrigger
                      key={cat.id}
                      value={cat.id}
                      className="relative group h-auto py-3 px-4 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm 
                      hover:bg-card/60 transition-all duration-300 data-[state=active]:bg-primary/5 data-[state=active]:border-primary/40 
                      data-[state=active]:shadow-lg data-[state=active]:shadow-primary/5 flex items-center justify-center gap-2.5 flex-1"
                    >
                      <Icon
                        className={`w-4 h-4 sm:w-5 sm:h-5 group-data-[state=active]:${cat.color} text-muted-foreground transition-colors`}
                      />
                      <span className="font-semibold text-sm">{cat.label}</span>
                      {filter === cat.id && (
                        <motion.div
                          layoutId="activeTabNotification"
                          className="absolute inset-0 rounded-2xl border-2 border-primary/20 z-[-1]"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>

          <Card className="border-border/60 shadow-xl shadow-background/5 rounded-3xl overflow-hidden backdrop-blur-sm bg-card/80">
            <CardHeader className="bg-muted/30 border-b py-4 px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="font-bold text-[10px] sm:text-sm text-muted-foreground uppercase tracking-widest">
                  {filter === "all" ? "Historial Reciente" : `Filtro: ${filter.toUpperCase()}`}
                </h3>
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  Actualizado hace un momento
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                <AnimatePresence initial={false} mode="popLayout">
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notif) => (
                      <motion.div
                        key={notif.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                        transition={{ duration: 0.2 }}
                        className={`group p-4 sm:p-6 flex gap-3 sm:gap-5 transition-colors items-start ${
                          notif.read
                            ? "bg-transparent opacity-70"
                            : "bg-primary/5 hover:bg-primary/10"
                        }`}
                      >
                        <div
                          className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl shrink-0 shadow-sm relative ${
                            notif.read ? "bg-muted" : "bg-background"
                          }`}
                        >
                          {/* Redimensionamos el icono para móvil */}
                          <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                            {getIcon(notif.type)}
                          </div>
                          {!notif.read && (
                            <span
                              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 
                            border-background animate-pulse"
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 pt-0.5 sm:pt-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1">
                            <h4
                              className={`font-bold transition-all text-sm sm:text-base leading-tight ${
                                notif.read ? "text-muted-foreground" : "text-foreground"
                              }`}
                            >
                              {notif.title}
                            </h4>
                            <span className="text-[10px] sm:text-[11px] text-muted-foreground whitespace-nowrap">
                              {notif.time}
                            </span>
                          </div>
                          <p
                            className={`text-xs sm:text-sm leading-relaxed max-w-2xl transition-all line-clamp-3 sm:line-clamp-none ${
                              notif.read ? "text-muted-foreground/80" : "text-foreground/90"
                            }`}
                          >
                            {notif.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3">
                            {notif.priority === "high" && (
                              <Badge
                                variant="destructive"
                                className="text-[8px] sm:text-[9px] uppercase tracking-tighter h-5 px-1.5 font-black"
                              >
                                ALTA PRIORIDAD
                              </Badge>
                            )}
                            <button
                              onClick={() => toggleRead(notif.id)}
                              className="text-[10px] sm:text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                            >
                              <Check className="w-3 h-3" />
                              {notif.read ? "Marcar como no leído" : "Marcar como leído"}
                            </button>
                          </div>
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg"
                              >
                                <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl p-1">
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive rounded-lg gap-2 text-xs sm:text-sm"
                                onClick={() => deleteNotification(notif.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-20 text-center space-y-4"
                    >
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8 text-muted-foreground opacity-20" />
                      </div>
                      <h3 className="text-xl font-bold text-muted-foreground">
                        No hay notificaciones
                      </h3>
                      <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                        Por ahora estás al día. Las alertas importantes aparecerán aquí.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setFilter("all")}
                        className="mt-4 rounded-xl"
                      >
                        Ver historial completo
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

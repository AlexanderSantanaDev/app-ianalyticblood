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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { formatTimeAgo } from "@/lib/utils";
import { useNotifications, NotificationType } from "@/hooks/notification-context";
/***********************************************************************************************************************/
export default function NotificationsPage() {
  // Consumir el estado global de notificaciones
  const { notifications, unreadCount, toggleRead, deleteNotification, markAllAsRead, clearAll } =
    useNotifications();
  const [filter, setFilter] = useState<string>("all");

  // Filtros aplicados al estado global
  const filteredNotifications = notifications.filter((n) =>
    filter === "all" ? true : n.type === filter,
  );
  /***********************************************************************************************************************/
  // Métodos
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
            {notifications.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-3xl border-border/60">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-bold">
                      ¿Vaciar notificaciones?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-base text-muted-foreground">
                      Esta acción eliminará permanentemente todo tu historial de alertas y análisis
                      recientes. No se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-3">
                    <AlertDialogCancel className="rounded-xl font-bold">Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={clearAll}
                      className="rounded-xl bg-red-500 hover:bg-red-600 font-bold"
                    >
                      Sí, vaciar todo
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
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
                            {formatTimeAgo(notif.timestamp)}
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

                        <div className="lg:opacity-0 lg:group-hover:opacity-100 opacity-100 transition-opacity">
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
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-24 text-center space-y-6"
                    >
                      <div className="relative mx-auto w-24 h-24 mb-2">
                        <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-20" />
                        <div
                          className="relative w-full h-full bg-muted/50 rounded-full flex items-center justify-center border 
                        border-dashed border-border/80"
                        >
                          <Bell className="w-10 h-10 text-muted-foreground opacity-30" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-foreground">Todo en orden ✅</h3>
                        <p className="text-muted-foreground text-base max-w-sm mx-auto leading-relaxed">
                          Has gestionado todas tus notificaciones. Por ahora estás al día con tu
                          salud y seguridad.
                        </p>
                      </div>
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          onClick={() => setFilter("all")}
                          className="rounded-xl px-8 font-bold border-primary/20 hover:bg-primary/5 text-primary"
                        >
                          Ver historial completo
                        </Button>
                      </div>
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

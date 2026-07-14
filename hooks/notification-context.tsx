"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

/***********************************************************************************************************************/
/** Tipos. */
export type NotificationType = "analysis" | "health" | "system" | "security";

/** Interfaz de Notificación. */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  priority: "low" | "medium" | "high";
}

/** Interfaz del Contexto. */
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<Notification, "id" | "read" | "timestamp">,
    options?: { skipToast?: boolean },
  ) => void;
  markAsRead: (id: string) => void;
  toggleRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

/** Notificaciones iniciales (Bandeja limpia para usuario real). */
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "system_welcome",
    type: "system",
    title: "Bienvenido a iAnalytic Blood",
    description:
      "Tu cuenta ha sido activada con éxito. Ya puedes subir tus primeros informes metabólicos para que la IA los procese.",
    timestamp: new Date(),
    read: false,
    priority: "low",
  },
];
/** Contexto de Notificaciones. */
const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

/** Proveedor de Notificaciones. */
export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { status } = useSession(); // 🛡️ Verificamos si realmente tiene sesión activa

  // Carga inicial de datos desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ianalytic_notifications");
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp), // Hidratar las fechas
        }));
        setNotifications(parsed);
      } catch (e) {
        setNotifications(INITIAL_NOTIFICATIONS);
      }
    } else {
      setNotifications(INITIAL_NOTIFICATIONS);
    }
    setIsLoaded(true);
  }, []);

  // Persistencia automática cada vez que cambien las notificaciones
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        "ianalytic_notifications",
        JSON.stringify(notifications),
      );
    }
  }, [notifications, isLoaded]);

  const alertScheduledRef = useRef(false);

  // Sistema de seguridad dinámico (detecta OS real y ubicación, solo si hace login)
  useEffect(() => {
    if (isLoaded && status === "authenticated" && !alertScheduledRef.current) {
      const hasSessionAlert = sessionStorage.getItem("ianalytic_session_alert");
      if (!hasSessionAlert) {
        alertScheduledRef.current = true;
        // Marca inmediatamente en sessionStorage para evitar múltiples ejecuciones
        sessionStorage.setItem("ianalytic_session_alert", "true");

        // Detección dinámica del entorno en lugar de mocks
        const ua = navigator.userAgent;
        let os = "un dispositivo nuevo";
        if (/Mac/i.test(ua)) os = "Mac OS";
        else if (/Windows/i.test(ua)) os = "Windows";
        else if (/Linux/i.test(ua)) os = "Linux";
        else if (/Android/i.test(ua)) os = "Android";
        else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";

        let loc = "tu ubicación";
        try {
          // Acercamiento elegante a la ciudad/espacio horario
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (tz && tz.includes("/")) {
            loc = tz.split("/")[1].replace(/_/g, " ");
          }
        } catch (e) {}

        setTimeout(() => {
          addNotification({
            type: "security",
            title: "Nuevo inicio de sesión detectado",
            description: `Se ha detectado un acceso desde ${os} cerca de ${loc}. Si no has sido tú, revisa tu seguridad en las preferencias de cuenta.`,
            priority: "high",
          });
        }, 3000); // 3 segundos después de entrar al dashboard
      }
    }
  }, [isLoaded, status]);

  // Contador automático de no leídas
  const unreadCount = notifications.filter((n) => !n.read).length;

  /** Añadir nueva notificación dinámica */
  const addNotification = (
    n: Omit<Notification, "id" | "read" | "timestamp">,
    options: { skipToast?: boolean } = {},
  ) => {
    const newNotif: Notification = {
      ...n,
      id: Math.random().toString(36).substring(2, 9),
      read: false,
      timestamp: new Date(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Solo mostramos toast si no se pide silencio explícito
    if (!options.skipToast) {
      toast.info(newNotif.title, {
        description: newNotif.description,
      });
    }
  };

  /** Marcar una como leída. */
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  /** Alternar estado de lectura. */
  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
    );
  };

  /** Eliminar una notificación. */
  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.info("Notificación eliminada");
  };

  /** Marcar todas como leídas. */
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("Todas las notificaciones leídas");
  };

  /** Vaciar todo el historial. */
  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem("ianalytic_notifications");
    toast.success("Historial vaciado");
  };
  /****************************************************************************************************************************/
  //JX
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification, // ✨ Nueva funcionalidad inyectada
        markAsRead,
        toggleRead,
        deleteNotification,
        markAllAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

/** Hook personalizado para usar notificaciones. */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
}

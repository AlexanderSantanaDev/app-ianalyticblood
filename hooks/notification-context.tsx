"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

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
  addNotification: (notification: Omit<Notification, "id" | "read" | "timestamp">) => void;
  markAsRead: (id: string) => void;
  toggleRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

/** Notificaciones iniciales mejoradas. */
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "analysis",
    title: "Análisis completado",
    description:
      "Tu informe del 28 de marzo ha sido procesado. La IA ha detectado mejoras en tus niveles de hierro.",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // Hace 15 min
    read: false,
    priority: "low",
  },
  {
    id: "2",
    type: "health",
    title: "Atención Requerida",
    description:
      "Niveles de Vitamina D por debajo del rango recomendado. Revisa las sugerencias nutritivas.",
    timestamp: new Date(Date.now() - 1000 * 60 * 120), // Hace 2 horas
    read: false,
    priority: "high",
  },
  {
    id: "3",
    type: "security",
    title: "Nuevo inicio de sesión",
    description: "Se detectó un acceso desde un dispositivo Mac OS en Madrid, España.",
    timestamp: new Date(Date.now() - 1000 * 60 * 300), // Hace 5 horas
    read: true,
    priority: "medium",
  },
  {
    id: "4",
    type: "system",
    title: "Actualización de la plataforma",
    description:
      "Hemos integrado soporte para nuevos biomarcadores de tiroides en el motor DeepSeek.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // Ayer
    read: true,
    priority: "low",
  },
];
/** Contexto de Notificaciones. */
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/** Proveedor de Notificaciones. */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

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
      localStorage.setItem("ianalytic_notifications", JSON.stringify(notifications));
    }
  }, [notifications, isLoaded]);

  // Simular alerta de seguridad (solo una vez por sesión para realismo)
  useEffect(() => {
    if (isLoaded) {
      const hasSessionAlert = sessionStorage.getItem("ianalytic_session_alert");
      if (!hasSessionAlert) {
        setTimeout(() => {
          addNotification({
            type: "security",
            title: "Nuevo inicio de sesión detectado",
            description:
              "Se ha detectado un acceso desde un dispositivo Mac OS en Madrid, España. Si no has sido tú, revisa tu seguridad.",
            priority: "high",
          });
          sessionStorage.setItem("ianalytic_session_alert", "true");
        }, 3000); // 3 segundos después de cargar
      }
    }
  }, [isLoaded]);

  // Contador automático de no leídas
  const unreadCount = notifications.filter((n) => !n.read).length;

  /** Añadir nueva notificación dinámica */
  const addNotification = (n: Omit<Notification, "id" | "read" | "timestamp">) => {
    const newNotif: Notification = {
      ...n,
      id: Math.random().toString(36).substring(2, 9),
      read: false,
      timestamp: new Date(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Solo mostramos toast si no es una carga inicial silenciosa
    toast.info(newNotif.title, {
      description: newNotif.description,
    });
  };

  /** Marcar una como leída. */
  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  /** Alternar estado de lectura. */
  const toggleRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
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
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

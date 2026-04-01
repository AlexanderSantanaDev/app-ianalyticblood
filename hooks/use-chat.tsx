"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useApiFetch } from "@/lib/api/client";
/****************************************************************************************************************************/
/** Interface para mensajes */
interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

/** Interface para el contexto del chat */
interface ChatContextType {
  messages: Message[];
  isOpen: boolean;
  isTyping: boolean;
  isLimitReached: boolean; // Estado para control de límites
  setIsOpen: (open: boolean) => void;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
}

/** Contexto del chat. */
const ChatContext = createContext<ChatContextType | undefined>(undefined);
/** Límite de mensajes para invitados. */
const GUEST_LIMIT = 3;
/****************************************************************************************************************************/
/** Provider del chat. */
export const ChatProvider = ({ children }: { children: ReactNode }) => {
  // Estados
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [guestMessagesCount, setGuestMessagesCount] = useState(0);
  const apiFetch = useApiFetch();
  /****************************************************************************************************************************/
  // Hooks
  // Cargar historial y contador de localStorage al iniciar
  useEffect(() => {
    const savedChat = localStorage.getItem("ab-chat-history");
    const savedCount = localStorage.getItem("ab-guest-chat-count");

    if (savedChat) {
      try {
        setMessages(JSON.parse(savedChat));
      } catch (e) {
        console.error("Error al cargar historial de chat:", e);
      }
    }

    if (savedCount) {
      setGuestMessagesCount(parseInt(savedCount, 10));
    }
  }, []);

  // Guardar historial al cambiar
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("ab-chat-history", JSON.stringify(messages));
    }
  }, [messages]);

  // Guardar contador de invitados
  useEffect(() => {
    localStorage.setItem("ab-guest-chat-count", guestMessagesCount.toString());
  }, [guestMessagesCount]);
  /****************************************************************************************************************************/
  // Métodos
  /** Limpiar historial de chat. */
  const clearChat = useCallback(() => {
    setMessages([]);
    localStorage.removeItem("ab-chat-history");
  }, []);

  // Verificar si el límite de mensajes ha sido alcanzado
  const isLimitReached = status === "unauthenticated" && guestMessagesCount >= GUEST_LIMIT;

  /** Enviar mensaje al chat. */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLimitReached) return; // Bloquear si el límite se alcanzó

      const userMsg: Message = {
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      // Si es invitado, incrementamos su contador
      if (status === "unauthenticated") {
        setGuestMessagesCount((prev) => prev + 1);
      }

      try {
        // Llamada al api
        const response = await apiFetch<{ status: string; reply: string }>("/chat", {
          method: "POST",
          body: JSON.stringify({
            messages: [...messages, userMsg].map(({ role, content }) => ({ role, content })),
          }),
        });

        const assistantMsg: Message = {
          role: "assistant",
          content: response.reply,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (error) {
        console.error("Error en el chat:", error);
        const errorMsg: Message = {
          role: "assistant",
          content:
            "Lo siento, hubo un error al conectar con mi cerebro clínico. Inténtalo de nuevo.",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsTyping(false);
      }
    },
    [messages, apiFetch, status, guestMessagesCount, isLimitReached],
  );
  /****************************************************************************************************************************/
  //JSX
  return (
    <ChatContext.Provider
      value={{
        messages,
        isOpen,
        isTyping,
        isLimitReached, // Exportamos el estado de límite
        setIsOpen,
        sendMessage,
        clearChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

/** Hook para usar el chat. */
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat debe usarse dentro de un ChatProvider");
  }
  return context;
};

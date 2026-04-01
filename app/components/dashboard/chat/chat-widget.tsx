"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, User, Sparkles, Trash2, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@/hooks/use-chat";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
/****************************************************************************************************************************/
/** Icono de Robot AI personalizado. */
const RobotIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("text-white", className)}
  >
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" />
    <line x1="16" y1="16" x2="16" y2="16" />
  </svg>
);
/****************************************************************************************************************************/
export default function ChatWidget() {
  // Estados
  const { messages, isOpen, setIsOpen, sendMessage, isTyping, clearChat, isLimitReached } =
    useChat();
  const isMobile = useMobile();
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  /****************************************************************************************************************************/
  // Hooks
  // Hook para montar el componente.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Hook para hacer scroll al final del chat.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);
  /****************************************************************************************************************************/
  // Métodos
  /** Método para enviar un mensaje. */
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping || isLimitReached) return;
    const msg = input.trim();
    setInput("");
    await sendMessage(msg);
  };
  // Renderizado condicional.
  if (!mounted) return null;
  /****************************************************************************************************************************/
  //JSX
  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-4 pointer-events-none w-[calc(100%-2rem)] sm:w-auto",
        isOpen && "pointer-events-auto",
      )}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              height: isMinimized ? "80px" : isMobile ? "500px" : "600px",
              width: isMobile ? "100%" : "400px",
            }}
            exit={{ opacity: 0, scale: 0.8, y: 40 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={cn(
              "overflow-hidden rounded-[2.5rem] bg-background/90 backdrop-blur-3xl border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] flex flex-col w-full",
              isMinimized ? "h-20" : "h-[600px]",
            )}
          >
            {/* Header del Chat */}
            <div className="p-6 bg-primary/5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary via-secondary to-primary flex items-center 
                justify-center shadow-lg shadow-primary/30 animate-pulse-slow"
                >
                  <RobotIcon size={24} />
                </div>
                <div>
                  <h3
                    className="text-sm font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground 
                  to-foreground/70"
                  >
                    IAnalytic Assistant
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-[10px] text-primary/80 font-bold uppercase tracking-widest">
                      IA Especializada • Online
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-9 w-9 rounded-xl hover:bg-white/5"
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearChat}
                  title="Limpiar historial"
                  className="h-9 w-9 rounded-xl hover:bg-red-500/10 text-red-500/80"
                >
                  <Trash2 size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-9 w-9 rounded-xl hover:bg-white/5"
                >
                  <X size={18} />
                </Button>
              </div>
            </div>

            {/* Cuerpo del Chat */}
            {!isMinimized && (
              <>
                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none"
                >
                  {messages.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12 space-y-5"
                    >
                      <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto border border-primary/10">
                        <RobotIcon size={36} className="text-primary/40" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground px-6 leading-relaxed">
                          Hola, soy el asistente especializado de IAnalytic Blood.
                        </p>
                        <p className="text-xs text-muted-foreground px-8">
                          Interpreto tus análisis de sangre con precisión clínica. ¿Tienes alguna
                          pregunta?
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "flex w-full gap-3",
                        msg.role === "user" ? "flex-row-reverse" : "flex-row",
                      )}
                    >
                      {/* Avatar */}
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/10",
                          msg.role === "user" ? "bg-secondary/20" : "bg-primary/20",
                        )}
                      >
                        {msg.role === "user" ? (
                          <User size={14} className="text-secondary" />
                        ) : (
                          <RobotIcon size={14} className="text-primary" />
                        )}
                      </div>

                      {/* Burbuja */}
                      <div
                        className={cn(
                          "max-w-[80%] p-4 text-sm leading-relaxed shadow-sm",
                          msg.role === "user"
                            ? "bg-primary text-white rounded-2xl rounded-tr-none shadow-lg shadow-primary/20"
                            : "bg-muted/40 border border-white/5 rounded-2xl rounded-tl-none backdrop-blur-md",
                        )}
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-white/10">
                        <RobotIcon size={14} className="text-primary" />
                      </div>
                      <div className="bg-muted/40 border border-white/5 rounded-2xl rounded-tl-none p-4 flex gap-1.5 items-center">
                        <motion.span
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="w-1.5 h-1.5 rounded-full bg-primary"
                        />
                        <motion.span
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                          className="w-1.5 h-1.5 rounded-full bg-primary"
                        />
                        <motion.span
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                          className="w-1.5 h-1.5 rounded-full bg-primary"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Footer del Chat - Input / Limit UI */}
                <div className="p-6 border-t border-white/5 bg-background/40 backdrop-blur-md">
                  {isLimitReached ? (
                    // Interfaz de límite alcanzado
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 text-center">
                        <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
                        <p className="text-sm font-bold text-foreground">
                          Has alcanzado el límite gratuito
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Regístrate para obtener análisis ilimitados y funciones avanzadas.
                        </p>
                      </div>
                      <Button
                        className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-xl 
                        shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                        onClick={() => (window.location.href = "/register")}
                      >
                        Registrarse Ahora
                      </Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSend} className="flex gap-3">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isTyping ? "Razonando clínica..." : "Escribe tu consulta..."}
                        disabled={isTyping}
                        className="h-12 rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 transition-all text-sm px-5"
                      />
                      <Button
                        type="submit"
                        size="icon"
                        disabled={isTyping || !input.trim()}
                        className={cn(
                          "h-12 w-12 shrink-0 rounded-2xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all",
                          isTyping && "opacity-50 scale-95",
                        )}
                      >
                        <Send size={18} />
                      </Button>
                    </form>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón Lanzador Premium */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "pointer-events-auto h-14 w-14 sm:h-16 sm:w-16 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-primary via-secondary to-primary flex items-center justify-center text-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] shadow-primary/40 group relative overflow-hidden border border-white/10",
          isOpen && "sm:rounded-[2.5rem]",
        )}
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />

        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={isMobile ? 20 : 28} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
            >
              <RobotIcon size={isMobile ? 26 : 32} />
            </motion.div>
          )}
        </AnimatePresence>

        {!isOpen && (
          <div
            className="absolute top-0 right-0 h-3 w-3 sm:h-4 sm:w-4 bg-primary border-2 border-background rounded-full 
          translate-x-1/4 -translate-y-1/4 animate-pulse"
          />
        )}
      </motion.button>
    </div>
  );
}

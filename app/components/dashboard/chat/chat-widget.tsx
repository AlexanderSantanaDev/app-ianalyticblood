"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, Sparkles, Trash2, Maximize2, Minimize2 } from "lucide-react";
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
    className={cn("text-white shrink-0", className)}
  >
    {/* Antenas Cibernéticas desplazadas hacia abajo para centrado perfecto */}
    <motion.path
      d="M8 8L6 4M16 8L18 4"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeOpacity="0.6"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
    <motion.circle
      cx="6"
      cy="4"
      r="0.8"
      fill="white"
      animate={{ scale: [1, 1.5, 1] }}
      transition={{ duration: 1, repeat: Infinity }}
    />
    <motion.circle
      cx="18"
      cy="4"
      r="0.8"
      fill="white"
      animate={{ scale: [1, 1.5, 1] }}
      transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
    />

    {/* Cabeza de Robot Centrada Verticalmente (Shifted down +2) */}
    <motion.path
      d="M12 6C7.5 6 4 8.5 4 12.5V16.5C4 18.5 5.5 20 7.5 20H16.5C18.5 20 20 18.5 20 16.5V12.5C20 8.5 16.5 6 12 6Z"
      fill="currentColor"
      fillOpacity="0.12"
      stroke="currentColor"
      strokeWidth="0.8"
      strokeOpacity="0.4"
      animate={{ y: [0, -0.5, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />

    {/* Visor de alta definición desplazado */}
    <rect x="5" y="11" width="14" height="4" rx="2" fill="currentColor" fillOpacity="0.2" />
    <motion.rect
      x="6"
      y="12"
      width="12"
      height="2"
      rx="1"
      fill="currentColor"
      fillOpacity="0.3"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
    />

    {/* Línea de escaneo dinámica desplazada */}
    <motion.rect
      x="7"
      y="12.5"
      width="3"
      height="1"
      rx="0.5"
      fill="white"
      animate={{ x: [0, 7, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
    />

    {/* Núcleo Central de Datos desplazado */}
    <motion.circle
      cx="12"
      cy="17.5"
      r="1.2"
      fill="white"
      className="shadow-[0_0_12px_rgba(255,255,255,1)]"
      animate={{ scale: [1, 1.4, 1] }}
      transition={{ duration: 1.2, repeat: Infinity }}
    />

    {/* Reflejo de Lente Superior desplazado */}
    <path
      d="M9 7C11 6.5 13 6.5 15 7"
      stroke="white"
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeOpacity="0.2"
    />
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
        "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3 sm:gap-4 pointer-events-none w-[calc(100%-2rem)] sm:w-auto",
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
              height: isMinimized ? "auto" : isMobile ? "500px" : "600px",
              width: isMobile ? "100%" : "400px",
            }}
            exit={{ opacity: 0, scale: 0.8, y: 40 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={cn(
              "overflow-hidden bg-background/90 backdrop-blur-3xl border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] flex flex-col w-full",
              isMinimized ? "rounded-full" : "rounded-[2.5rem]"
            )}
          >
            {/* Header del Chat */}
            <div className={cn(
              "pl-5 pr-3 py-4 bg-primary/5 flex items-center justify-between transition-colors",
              !isMinimized && "border-b border-white/5"
            )}>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary via-secondary to-primary flex items-center 
                justify-center shadow-lg shadow-primary/20 animate-pulse-slow shrink-0"
                >
                  <RobotIcon size={20} />
                </div>
                <div className="min-w-0">
                  <h3
                    className="text-sm font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground 
                  to-foreground/70 truncate"
                  >
                    IAnalytic Assistant
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                    <p
                      className="text-[10px] text-primary/80 font-bold uppercase tracking-widest whitespace-nowrap overflow-hidden 
                    text-ellipsis"
                    >
                      IA Especializada • Online
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-8 w-8 rounded-lg hover:bg-white/5 transition-colors"
                >
                  {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X size={16} />
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

                {/* Footer del Chat */}
                <div className="py-6 pl-1 pr-[10px] border-t border-white/5 bg-background/40 backdrop-blur-md">
                  {isLimitReached ? (
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
                    <form onSubmit={handleSend} className="flex gap-2 items-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={clearChat}
                        title="Limpiar conversación"
                        className="h-10 w-10 shrink-0 rounded-xl hover:bg-red-500/10 text-red-500/40 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={18} />
                      </Button>

                      <div className="relative flex-1">
                        <Input
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder={isTyping ? "Razonando clínica..." : "Escribe tu consulta..."}
                          disabled={isTyping}
                          className="h-12 rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 transition-all text-sm px-5"
                        />
                      </div>

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

      {/* Lanzador con Tecnología "Liquid Glass" y Núcleo Neural Vivo */}
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "pointer-events-auto h-14 w-14 sm:h-16 sm:w-16 rounded-[2rem] flex items-center justify-center text-white relative group",
            "bg-gradient-to-br from-primary to-secondary shadow-[0_20px_50px_-12px_rgba(var(--primary-rgb),0.6)]",
            "border border-white/20 transition-all duration-500 hover:shadow-primary/50",
            isOpen && "rounded-full rotate-90",
          )}
        >
          <div
            className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 
            rounded-full transition-opacity duration-500"
          />

          {/* Anillo de energía pulsátil perimetral */}
          <div
            className="absolute -inset-[1.5px] bg-gradient-to-r from-primary/60 via-secondary/60 to-primary/60 rounded-[inherit] 
            opacity-20 group-hover:opacity-60 blur-sm animate-pulse-slow"
          />

          <AnimatePresence mode="wait">
            <motion.div
              key="open"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="relative z-10"
            >
              <RobotIcon size={isMobile ? 46 : 56} />
            </motion.div>
          </AnimatePresence>

          {/* Indicador de Actividad "Neural" */}
          <span
            className="absolute top-4 right-4 h-2.5 w-2.5 bg-primary rounded-full shadow-[0_0_15px_4px_rgba(var(--primary-rgb),1)] 
            animate-ping"
          />
        </motion.button>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
/****************************************************************************************************************************/
export default function NavigationLoader() {
  // Estados
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const prevPath = useRef(pathname);
  /****************************************************************************************************************************/
  // Hooks
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Detecta el cambio de ruta y activa el loader automáticamente
  useEffect(() => {
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;

    // Limpia timers anteriores
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Inicia la secuencia de carga
    setProgress(0);
    setLoading(true);

    // Simula progreso rápido y natural (no llega al 100% solo, espera su tiempo)
    let current = 0;
    intervalRef.current = setInterval(() => {
      current += Math.random() * 18 + 5;
      if (current >= 90) {
        current = 90;
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
      setProgress(current);
    }, 120);

    // Completa al 100% y se apaga suavemente
    timerRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 400);
    }, 600);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pathname]);
  /****************************************************************************************************************************/
  //JSX
  return (
    <AnimatePresence>
      {loading && (
        <>
          {/* Barra de progreso premium top con gradiente de marca iAnalytic Blood */}
          <motion.div
            className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Barra principal */}
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-secondary to-primary rounded-full"
              style={{
                width: `${progress}%`,
                boxShadow: "0 0 16px 1px hsl(var(--primary) / 0.7)",
                transition: "width 0.14s ease-out",
              }}
            />
            {/* Destello brillante deslizante al borde de la barra */}
            <motion.div
              className="absolute top-0 h-full w-16 bg-gradient-to-r from-transparent via-white/70 to-transparent rounded-full"
              style={{
                left: `calc(${progress}% - 4rem)`,
                transition: "left 0.14s ease-out",
              }}
            />
          </motion.div>

          {/* Pill flotante premium en esquina inferior derecha */}
          <motion.div
            className="fixed bottom-6 right-6 z-[9999] pointer-events-none"
            initial={{ opacity: 0, y: 20, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
          >
            <div
              className="flex items-center gap-3 bg-background/95 backdrop-blur-2xl border border-border/60 rounded-2xl px-4 
            py-2.5 shadow-2xl shadow-primary/10"
            >
              {/* Spinner cónico animado tipo health-tech, creado en CSS/Framer */}
              <div className="relative w-[22px] h-[22px] flex-shrink-0">
                {/* Halo exterior pulsante */}
                <motion.div
                  className="absolute inset-[-3px] rounded-full"
                  style={{
                    background: "conic-gradient(hsl(var(--primary) / 0.2), transparent)",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                {/* Anillo principal giratorio con gradiente de marca */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent 0%, hsl(var(--primary)) 40%, hsl(var(--secondary)) 75%, transparent 100%)",
                    mask: "radial-gradient(transparent 42%, black 43%)",
                    WebkitMask: "radial-gradient(transparent 42%, black 43%)",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
                />
                {/* Punto brillante central */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                    style={{ boxShadow: "0 0 8px 1px hsl(var(--primary))" }}
                  />
                </div>
              </div>

              {/* Texto + puntos animados */}
              <div className="flex items-center gap-1.5 select-none">
                <span className="text-xs font-semibold text-foreground/75 tracking-tight">
                  Navegando
                </span>
                <span className="flex items-center gap-[3px]">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="block w-[3px] h-[3px] rounded-full bg-primary"
                      animate={{ opacity: [0.2, 1, 0.2], y: [0, -2, 0] }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.16,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

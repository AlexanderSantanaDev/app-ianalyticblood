"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
/****************************************************************************************************************************/
export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Solo mostramos el banner si no existe la cookie/localstorage de consentimiento
    const consent = localStorage.getItem("ianalytic_cookie_consent");
    if (!consent) {
      // Pequeño delay para que no aparezca de golpe al cargar la página
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  /** Acepta las cookies y cierra el banner. */
  const handleAccept = () => {
    localStorage.setItem("ianalytic_cookie_consent", "accepted");
    setIsVisible(false);
  };

  /** Rechaza las cookies y cierra el banner. */
  const handleDecline = () => {
    localStorage.setItem("ianalytic_cookie_consent", "declined");
    setIsVisible(false);
  };
  /****************************************************************************************************************************/
  // JSx
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[9999]"
        >
          <div className="bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl shadow-black/10 rounded-[1.5rem] p-5 sm:p-6 flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-full shrink-0">
                <Cookie className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm mb-1">Privacidad y Cookies</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Utilizamos cookies estrictamente necesarias para el
                  funcionamiento seguro de tu cuenta y sesión. También
                  utilizamos cookies analíticas anónimas para mejorar nuestra
                  plataforma.{" "}
                  <Link
                    href="/cookies"
                    className="text-primary hover:underline font-medium"
                  >
                    Leer más
                  </Link>
                  .
                </p>
              </div>
              <button
                onClick={handleDecline}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label="Cerrar banner de cookies"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDecline}
                className="flex-1 rounded-xl text-xs h-9"
              >
                Rechazar no esenciales
              </Button>
              <Button
                size="sm"
                onClick={handleAccept}
                className="flex-1 rounded-xl text-xs h-9 shadow-md shadow-primary/20"
              >
                Aceptar todas
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

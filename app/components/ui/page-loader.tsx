"use client";

import { motion } from "framer-motion";
import { Droplet, Sparkles } from "lucide-react";
/***********************************************************************************************************************/
export function PageLoader() {
  return (
    <div className="pt-32 pb-20 min-h-[100dvh] flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-32 h-32 rounded-full bg-primary/10 blur-2xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2,
          }}
          className="absolute w-20 h-20 rounded-full bg-secondary/10 blur-xl"
        />

        {/* Caja principal del icono con Glassmorphism */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative z-10 w-16 h-16 bg-background/50 backdrop-blur-md border border-white/10 dark:border-white/5 shadow-2xl 
          shadow-primary/20 rounded-2xl flex items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-secondary/20" />

          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex items-center justify-center"
          >
            <Droplet className="w-7 h-7 text-primary absolute opacity-80" />
            <Sparkles className="w-4 h-4 text-secondary absolute ml-5 -mt-4 opacity-90" />
          </motion.div>
        </motion.div>
      </div>

      {/* ✨ Texto elegante */}
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="mt-8 flex flex-col items-center gap-1"
      >
        <p className="text-xs font-semibold tracking-[0.2em] text-foreground/80 uppercase">
          Procesando
        </p>
        <div className="flex gap-1">
          <div
            className="w-1 h-1 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-1 h-1 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-1 h-1 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </motion.div>
    </div>
  );
}

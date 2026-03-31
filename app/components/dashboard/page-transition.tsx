"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
/****************************************************************************************************************************/
/** Interfaz para el componente PageTransition. */
interface PageTransitionProps {
  children: ReactNode;
}

/** Variantes de animación — fade suave + leve desplazamiento vertical */
const variants = {
  hidden: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};
/****************************************************************************************************************************/
/** Componente PageTransition. */
export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  /****************************************************************************************************************************/
  //JSX
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname} // key = pathname fuerza remount en cada cambio de ruta
        variants={variants}
        initial="hidden"
        animate="enter"
        exit="exit"
        transition={{
          duration: 0.22,
          ease: [0.25, 0.46, 0.45, 0.94], // cubic-bezier tipo iOS
        }}
        className="flex-1 flex flex-col min-h-0"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

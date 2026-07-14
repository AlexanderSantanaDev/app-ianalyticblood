"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
/****************************************************************************************************************************/
/** Interfaz para el componente PageTransition. */
interface PageTransitionProps {
  children: ReactNode;
}

// Animación simplificada — solo fade, sin desplazamiento vertical.
const variants = {
  hidden: { opacity: 0 },
  enter: { opacity: 1 },
  exit: { opacity: 0 },
};
/****************************************************************************************************************************/
/** Componente PageTransition. */
export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  /****************************************************************************************************************************/
  //JSX
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="hidden"
        animate="enter"
        exit="exit"
        transition={{
          duration: 0.15,
          ease: "easeInOut",
        }}
        className="flex-1 flex flex-col min-h-0"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

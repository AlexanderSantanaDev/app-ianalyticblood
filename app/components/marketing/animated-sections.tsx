"use client";

import { motion, useAnimation, useInView, type MotionProps } from "framer-motion";
import { useRef, useEffect, type ReactNode } from "react";

/**
 * Props:
 * – children  (lo que envuelves)
 * – delay     (retraso base de la animación)
 * – …cualquier otra prop válida de motion.div (className, initial, animate, transition…)
 */
type AnimateOnScrollProps = {
  children: ReactNode;
  delay?: number;
} & MotionProps &
  React.HTMLAttributes<HTMLDivElement>;

export const AnimateOnScroll = ({
  children,
  delay = 0,
  ...rest // ← aquí recogemos todas las props extra
}: AnimateOnScrollProps) => {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (isInView) controls.start("visible");
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      /**
       * Si el usuario ya pasa "variants" lo respetamos;
       * si no, usamos el default fade-up.
       */
      variants={
        rest.variants ?? {
          hidden: { opacity: 0, y: 30 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, delay },
          },
        }
      }
      {...rest}
    >
      {children}
    </motion.div>
  );
};

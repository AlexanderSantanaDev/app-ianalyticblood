import type React from "react";
import { toast as sonnerToast } from "sonner";
/***********************************************************************************************************************/
type ToastProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
};
/***********************************************************************************************************************/
// Redirigimos todas las notificaciones del sistema antiguo (Radix) a Sonner
// Esto soluciona que no se vieran los toasts y además les da un aspecto muchísimo más premium y fluido.
const customToast = (props: ToastProps) => {
  if (props.variant === "destructive") {
    return sonnerToast.error(props.title, { description: props.description });
  }
  if (props.variant === "success" || String(props.title).includes("✔")) {
    return sonnerToast.success(props.title, { description: props.description });
  }
  return sonnerToast(props.title, { description: props.description });
};

/** Exporta las funciones para usarlas en la aplicación */
const useToast = () => {
  return {
    toast: customToast,
    dismiss: sonnerToast.dismiss,
    success: (props: Omit<ToastProps, "variant">) =>
      customToast({ ...props, variant: "success" }),
    error: (props: Omit<ToastProps, "variant">) =>
      customToast({ ...props, variant: "destructive" }),
  };
};

export { useToast, customToast as toast };

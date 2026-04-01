import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/****************************************************************************************************************************/
/** Une clases de Tailwind de forma segura */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatea una fecha a estilo "hace cuánto tiempo" */
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Ahora mismo";
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
  if (diffInSeconds < 172800) return "Ayer";
  return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
}

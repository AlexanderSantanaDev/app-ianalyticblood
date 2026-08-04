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
  if (diffInSeconds < 86400)
    return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
  if (diffInSeconds < 172800) return "Ayer";
  return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
}

/** Helper para parsear fechas UTC del backend Python correctamente. */
export function parseUTCDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  // Si ya tiene sufijo Z o tiene offset +/-HH:MM, no tocamos nada
  const hasTimezone = /Z$|[+-]\d{2}:\d{2}$/.test(dateStr.trim());
  return hasTimezone ? new Date(dateStr) : new Date(dateStr + "Z");
}

import { getSession } from "next-auth/react";
import { z } from "zod";
const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

/************************************************************************************************************/
/** Recupera el JWT guardado en localStorage */
function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

/** Pequeño wrapper de fetch con JSON por defecto y token Bearer */
export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const session = await getSession();
  const token = session?.accessToken;
  const headers: HeadersInit = {
    ...(options.headers || {}),
    ...(options.body instanceof FormData || options.body instanceof URLSearchParams
      ? {} // dejamos que el browser ponga boundary
      : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // Intenta parsear siempre en json
  const data = (await res.json()) as any;

  if (!res.ok) {
    // Lanza con detalle de FastAPI
    throw new Error(data.detail || "Error de red");
  }

  return data as T;
}

/* Helpers shorthands */
export const get = <T>(p: string) => apiFetch<T>(p);
export const post = <T>(p: string, body: any, isForm = false) =>
  apiFetch<T>(p, {
    method: "POST",
    body: isForm ? body /* url-encoded */ : JSON.stringify(body),
  });
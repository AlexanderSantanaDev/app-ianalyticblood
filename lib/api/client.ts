import { useSession, signOut } from "next-auth/react";
import { useCallback } from "react";
import { toast } from "sonner";
/****************************************************************************************************************************/
const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

// Mutex para evitar race conditions en token refresh concurrente
let refreshPromise: Promise<{
  access_token: string;
  refresh_token: string;
}> | null = null;

// lag global de deduplicación para el toast de sesión expirada.
// Cuando múltiples peticiones concurrentes fallan a la vez (fetchMetrics + fetchHealth + fetchUsers),
// solo se muestra UN toast y se ejecuta UN signOut, no 3.
let sessionExpiredHandled = false;
/****************************************************************************************************************************/
/** Función para rutas públicas (sin autenticación). */
export async function publicApiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
    ...(options.body instanceof FormData ||
    options.body instanceof URLSearchParams
      ? {}
      : { "Content-Type": "application/json" }),
  };

  // Soporte para override de URL (útil para el bug de DNS en Auth)
  let baseUrl = API_BASE;
  if (headers["x-api-url-override"]) {
    baseUrl = headers["x-api-url-override"];
    delete headers["x-api-url-override"]; // No queremos enviarlo al backend real
  }

  const res = await fetch(`${baseUrl}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Error de red");
  }

  return data as T;
}

/** Hook para obtener apiFetch con autenticación. */
export function useApiFetch() {
  const { data: session, status } = useSession();

  // apiFetch envuelto en useCallback para estabilizar referencia y evitar re-renders cascading
  const apiFetch = useCallback(
    async <T = unknown>(
      path: string,
      options: RequestInit = {},
    ): Promise<T> => {
      // Si la sesión no está cargada, esperar
      if (status === "loading") {
        console.warn(
          "⚠️ [API] apiFetch invocada mientras la sesión aún cargaba. Abortando solicitud.",
        );
        throw new Error(
          "La sesión aún se está cargando. Por favor, espera un momento.",
        );
      }

      const accessToken = session?.accessToken;
      // console.log("Estado de la sesión:", status);
      // console.log("Access Token usado:", accessToken);

      // 🛡️ Si no hay access token pero la sesión está autenticada, cerrar sesión (deduplicado)
      if (!accessToken && status === "authenticated") {
        console.error(
          "No access token available despite authenticated session",
        );
        if (!sessionExpiredHandled) {
          sessionExpiredHandled = true;
          toast.error("Sesión inválida. Por favor, inicia sesión nuevamente.");
          // Pequeño delay para que el toast sea visible antes del redirect
          setTimeout(() => signOut({ callbackUrl: "/login" }), 800);
        }
        throw new Error("No access token available");
      }

      // Agregar headers
      const headers: Record<string, string> = {
        ...((options.headers as Record<string, string>) || {}),
        ...(options.body instanceof FormData ||
        options.body instanceof URLSearchParams
          ? {}
          : { "Content-Type": "application/json" }),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      };

      let res = await fetch(`${API_BASE}${path}`, { ...options, headers });
      //console.log("Respuesta inicial:", res.status, res.statusText);

      // Si el token ha expirado, intentar refrescarlo
      if (res.status === 401 && session?.refreshToken) {
        // Mutex — si ya hay un refresh en curso, esperar a que termine
        if (!refreshPromise) {
          refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.refreshToken}`,
            },
          })
            .then(async (refreshRes) => {
              if (!refreshRes.ok) {
                throw new Error("Refresh failed");
              }
              return refreshRes.json();
            })
            .finally(() => {
              refreshPromise = null; // Liberar mutex al completar
            });
        }

        try {
          const data = await refreshPromise;
          // Actualizar sesión con los nuevos tokens
          session.accessToken = data.access_token;
          session.refreshToken = data.refresh_token;
          headers.Authorization = `Bearer ${data.access_token}`;
          res = await fetch(`${API_BASE}${path}`, { ...options, headers });
        } catch {
          // Deduplicación del toast de sesión expirada.
          // fetchMetrics, fetchHealth y fetchUsers se lanzan en paralelo → sin este guard
          // se mostrarían 3 toasts idénticos y se llamaría a signOut 3 veces.
          if (!sessionExpiredHandled) {
            sessionExpiredHandled = true;
            toast.error(
              "Sesión expirada. Por favor, inicia sesión nuevamente.",
              {
                id: "session-expired", // sonner deduplica por id: mismo toast no se repite
              },
            );
            // Delay mínimo para que el toast sea legible antes de redirigir
            setTimeout(() => signOut({ callbackUrl: "/login" }), 800);
          }
          throw new Error(
            "Sesión expirada. Por favor, inicia sesión nuevamente.",
          );
        }
      }

      const data = await res.json();

      // Si la respuesta no es exitosa, lanzar error
      if (!res.ok) {
        console.error("Error en la solicitud:", data.detail);
        throw new Error(data.detail || "Error de red");
      }

      // Retornar los datos
      return data as T;
    },
    [session, status],
  );

  return apiFetch;
}

/** Utilidad post pública (sin autenticación). */
export const post = <T>(p: string, body: any, isForm = false) =>
  publicApiFetch<T>(p, {
    method: "POST",
    body: isForm ? body : JSON.stringify(body),
  });

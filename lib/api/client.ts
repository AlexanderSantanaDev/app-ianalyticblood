import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";
/****************************************************************************************************************************/
const API_BASE = process.env.NEXT_PUBLIC_API_URL!;
/****************************************************************************************************************************/
/** Función para rutas públicas (sin autenticación). */
export async function publicApiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
    ...(options.body instanceof FormData || options.body instanceof URLSearchParams
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

  /** Hook para obtener apiFetch con autenticación. */
  const apiFetch = async <T = unknown>(path: string, options: RequestInit = {}): Promise<T> => {
    if (status === "loading") {
      console.log("Esperando a que la sesión se cargue...");
      return new Promise((resolve) => {
        const checkSession = setInterval(() => {
          if (status !== "loading") {
            clearInterval(checkSession);
            resolve(apiFetch(path, options));
          }
        }, 100);
      });
    }

    const accessToken = session?.accessToken;
    // console.log("Estado de la sesión:", status);
    // console.log("Access Token usado:", accessToken);

    // Si no hay access token pero la sesión está autenticada, cerrar sesión
    if (!accessToken && status === "authenticated") {
      console.error("No access token available despite authenticated session");
      toast.error("Sesión inválida. Por favor, inicia sesión nuevamente.");
      await signOut({ callbackUrl: "/login" });
      throw new Error("No access token available");
    }

    // Agregar headers
    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string>) || {}),
      ...(options.body instanceof FormData || options.body instanceof URLSearchParams
        ? {}
        : { "Content-Type": "application/json" }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };

    let res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    //console.log("Respuesta inicial:", res.status, res.statusText);

    // Si el token ha expirado, intentar refrescarlo
    if (res.status === 401 && session?.refreshToken) {
      console.log("Intentando refrescar el token...");
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.refreshToken}`,
        },
      });

      // Si el token se refrescó correctamente, actualizar la sesión
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        console.log("Nuevo access token obtenido:", data.access_token);
        // Actualizamos la sesión con los nuevos tokens
        session.accessToken = data.access_token;
        session.refreshToken = data.refresh_token;
        headers.Authorization = `Bearer ${data.access_token}`;
        res = await fetch(`${API_BASE}${path}`, { ...options, headers });
      } else {
        console.error("Fallo al refrescar el token:", refreshRes.status);
        toast.error("Sesión expirada. Por favor, inicia sesión nuevamente.");
        await signOut({ callbackUrl: "/login" });
        throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
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
  };

  return apiFetch;
}

/** Utilidad get. */
export const get = <T>(p: string) => {
  const apiFetch = useApiFetch();
  return apiFetch<T>(p);
};

/** Utilidad post. */
export const post = <T>(p: string, body: any, isForm = false) =>
  publicApiFetch<T>(p, {
    method: "POST",
    body: isForm ? body : JSON.stringify(body),
  });

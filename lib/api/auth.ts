import { signOut } from "next-auth/react";
import { post } from "./client";
import type { RegisterBody } from "./types";
import { redirect } from "next/navigation";

/** Registro */
export async function register(body: RegisterBody) {
  return post<{ status: "success"; user_id: string }>("/auth/register", body);
}

/** Logout */
export async function logout() {
  await signOut({ redirect: false });
  redirect("/login");
}

/** Tipos tipados para el payload y respuesta del cambio de contraseña. */
export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  status: "success";
  message: string;
}
/***********************************************************************************************************************/
/** Función para cambiar la contraseña del usuario autenticado.
    Debe llamarse con el apiFetch autenticado del hook useApiFetch().
    NO usar la función post() pública — esta ruta requiere JWT válido.
 */
export async function changePassword(
  apiFetch: <T>(path: string, options?: RequestInit) => Promise<T>,
  payload: ChangePasswordPayload,
): Promise<ChangePasswordResponse> {
  // La petición va al backend Python con el Bearer token del usuario
  return apiFetch<ChangePasswordResponse>("/auth/change-password", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/** Elimina permanentemente la cuenta y todos los datos del usuario. */
export async function deleteAccount(
  apiFetch: <T>(path: string, options?: RequestInit) => Promise<T>,
): Promise<{ status: "success"; message: string }> {
  return apiFetch("/auth/me", { method: "DELETE" });
}

/** Solicita la exportación de todos los datos del usuario.
    El backend devuelve un JSON con cabecera Content-Disposition para descarga.
    En el frontend se activa la descarga del fichero.
 */
export async function requestDataExport(accessToken: string): Promise<void> {
  // Usamos fetch directo con el token para poder leer el blob binario
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me/export`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { detail?: string }).detail || "Error al exportar datos.",
    );
  }

  // Obtener el nombre de fichero de la cabecera si existe
  const disposition = res.headers.get("Content-Disposition") || "";
  const nameMatch = disposition.match(/filename=([^;]+)/);
  const fileName = nameMatch
    ? nameMatch[1].trim()
    : "ianalyticblood_export.json";

  // Forzar descarga en el navegador
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

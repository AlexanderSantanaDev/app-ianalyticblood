import { post } from "./client";
import type { RegisterBody, LoginResponse } from "./types";

/************************************************************************************************************/
/** Registro  */
export async function register(body: RegisterBody) {
  return post<{ status: "success"; user_id: string }>("/auth/register", body);
}

/** Logout */
export function logout() {
  if (typeof window !== "undefined") localStorage.removeItem("access_token");
}
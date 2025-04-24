import { post } from "./client";
import type { RegisterBody, LoginResponse } from "./types";

/************************************************************************************************************/
/** Registro  */
export async function register(body: RegisterBody) {
  return post<{ status: "success"; user_id: string }>("/auth/register", body);
}

/** Login */
export async function login(email: string, password: string) {
  // FastAPI espera x-www-form-urlencoded
  const form = new FormData();
  form.append("username", email);
  form.append("password", password);

  const res = await post<LoginResponse>("/auth/login", form, true);

  // Guarda token en localStorage para uso posterior
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", res.access_token);
  }
  return res;
}

/** Logout */
export function logout() {
  if (typeof window !== "undefined") localStorage.removeItem("access_token");
}
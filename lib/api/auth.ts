import { signOut } from "next-auth/react";
import { post } from "./client";
import type { RegisterBody, LoginResponse } from "./types";
import { redirect } from "next/navigation";

/************************************************************************************************************/
/** Registro  */
export async function register(body: RegisterBody) {
  return post<{ status: "success"; user_id: string }>("/auth/register", body);
}

/** Logout */
export async function logout() {
  // 1. Esperamos a que NextAuth envíe la cabecera Set-Cookie
  await signOut({ redirect: false });

  // 2. Una vez vacía la cookie, navegamos al login
  redirect("/login");
}
import { signOut } from "next-auth/react";
import { post } from "./client";
import type { RegisterBody, LoginResponse } from "./types";
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
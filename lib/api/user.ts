"use client";

import { useApiFetch } from "./client";
import { User } from "./types";

/** Centralizada la lógica de gestión de perfil. */
export function useUserApi() {
  const apiFetch = useApiFetch();

  /** Obtener el perfil del usuario actual */
  const getMe = async () => {
    return await apiFetch<User>("/auth/me");
  };

  /** Actualizar datos del perfil. */
  const updateMe = async (data: Partial<User>) => {
    return await apiFetch<{ status: string; message: string }>("/auth/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  };

  return {
    getMe,
    updateMe,
  };
}

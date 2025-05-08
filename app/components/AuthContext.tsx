"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (access: string, refresh: string) => void;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession(); // ➡️ Obtenemos la sesión de next-auth
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  // ➡️ Sincronizamos los tokens con la sesión de next-auth al cargar o cambiar
  useEffect(() => {
    if (status === "authenticated" && session?.accessToken && session?.refreshToken) {
      setAccessToken(session.accessToken);
      setRefreshToken(session.refreshToken);
    }
  }, [session, status]);

  const setTokens = (access: string, refresh: string) => {
    setAccessToken(access);
    setRefreshToken(refresh);
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) return null;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
      });
      if (!res.ok) throw new Error("No se pudo renovar el token");
      const data = await res.json();
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token); // Actualizamos también el refresh token
      return data.access_token;
    } catch (error) {
      console.error("Error al renovar el token:", error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ accessToken, refreshToken, setTokens, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};

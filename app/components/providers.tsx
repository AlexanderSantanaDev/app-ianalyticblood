"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "sonner";
import { AuthProvider } from "./AuthContext";
/****************************************************************************************************************************/
/** Componente que envuelve la aplicación con los proveedores necesarios. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors closeButton expand={false} theme="system" />
        </ThemeProvider>
      </AuthProvider>
    </SessionProvider>
  );
}

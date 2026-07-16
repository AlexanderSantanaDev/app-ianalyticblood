"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "sonner";
import { AuthProvider } from "./AuthContext";
import { AnalysisProvider } from "@/hooks/analysis-context";
import { ChatProvider } from "@/hooks/use-chat";
import { NotificationProvider } from "@/hooks/notification-context";
import { PlanProvider } from "@/hooks/plan-context";
/****************************************************************************************************************************/
/** Componente que envuelve la aplicación con los proveedores necesarios. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <NotificationProvider>
          <AnalysisProvider>
            {/*  PlanProvider envuelve todo para compartir el plan real entre sidebar y páginas */}
            <PlanProvider>
              <ChatProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
                >
                  {children}
                  <Toaster
                    position="top-right"
                    richColors
                    closeButton
                    expand={false}
                    theme="system"
                  />
                </ThemeProvider>
              </ChatProvider>
            </PlanProvider>
          </AnalysisProvider>
        </NotificationProvider>
      </AuthProvider>
    </SessionProvider>
  );
}

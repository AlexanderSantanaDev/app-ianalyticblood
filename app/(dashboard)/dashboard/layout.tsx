"use client";

import { useState, useEffect } from "react";
import DashboardNavbar from "@/components/dashboard/dashboard-navbar";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import DashboardFooter from "@/components/dashboard/dashboard-footer";
import { useMobile } from "hooks/use-mobile";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { LoadingProvider, useLoading } from "hooks/loading-context";
import { ReactNode } from "react";
/****************************************************************************************************************************/
/** Contenido del dashboard. */
const DashboardContent = ({
  children,
  setSidebarOpen,
  isOpen,
}: {
  children: ReactNode;
  setSidebarOpen: (open: boolean) => void;
  isOpen: boolean;
}) => {
  // Estados
  const { isLoading } = useLoading();

  // JSX
  return (
    <>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar open={isOpen} onOpenChange={(open) => setSidebarOpen(open)} />
        <div className="flex-1 flex flex-col">
          <DashboardNavbar onToggleSidebar={() => setSidebarOpen(!isOpen)} />
          <main className="flex-1 pt-16 px-4 md:px-6 lg:px-8 pb-8">{children}</main>
          {/* Footer compacto del dashboard. */}
          <DashboardFooter />
        </div>
        <Toaster />
      </div>
    </>
  );
};

/** Layout principal del dashboard. */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMobile();
  // En escritorio abierta por defecto, en móvil cerrada por defecto
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const isOpen = sidebarOpen;

  //JSX
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <LoadingProvider>
        {" "}
        {/* Envolvemos el contenido con el LoadingProvider */}
        <DashboardContent setSidebarOpen={setSidebarOpen} isOpen={isOpen}>
          {children}
        </DashboardContent>
      </LoadingProvider>
    </ThemeProvider>
  );
}

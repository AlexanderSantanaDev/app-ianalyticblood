"use client";

import { useState } from "react";
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
  sidebarOpen,
}: {
  children: ReactNode;
  setSidebarOpen: (open: boolean) => void;
  isOpen: boolean;
  sidebarOpen: boolean;
}) => {
  // Estados
  const { isLoading } = useLoading();

  // JSX
  return (
    <>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar open={isOpen} onOpenChange={(open) => setSidebarOpen(open)} />
        <div className="flex-1 flex flex-col">
          <DashboardNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useMobile();
  // En móviles, la barra lateral está cerrada por defecto
  const isOpen = isMobile ? false : sidebarOpen;

  //JSX
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <LoadingProvider>
        {" "}
        {/* 👈 Envolvemos el contenido con el LoadingProvider */}
        <DashboardContent setSidebarOpen={setSidebarOpen} isOpen={isOpen} sidebarOpen={sidebarOpen}>
          {children}
        </DashboardContent>
      </LoadingProvider>
    </ThemeProvider>
  );
}

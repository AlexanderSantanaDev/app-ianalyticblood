"use client";

import { useState } from "react";
import DashboardNavbar from "@/components/dashboard/dashboard-navbar";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import { useMobile } from "hooks/use-mobile";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { LoadingProvider, useLoading } from "hooks/loading-context";
import { Loader } from "@/components/ui/loader";
import { ReactNode } from "react";

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
  const { isLoading } = useLoading();

  return (
    <>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar open={isOpen} onOpenChange={(open) => setSidebarOpen(open)} />
        <div className="flex-1 flex flex-col">
          <DashboardNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 pt-16 px-4 md:px-6 lg:px-8 pb-8">{children}</main>
        </div>
        <Toaster />
      </div>
      {/* {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex flex-col gap-12 items-center">
            <Loader />
            <p className="mt-4 text-white text-lg font-medium">Analizando...</p>
          </div>
        </div>
      )} */}
    </>
  );
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useMobile();

  // En móviles, la barra lateral está cerrada por defecto
  const isOpen = isMobile ? false : sidebarOpen;

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

"use client";

import { useState } from "react";
import DashboardNavbar from "@/components/dashboard/dashboard-navbar";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import { useMobile } from "hooks/use-mobile";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useMobile();

  // En móviles, la barra lateral está cerrada por defecto
  const isOpen = isMobile ? false : sidebarOpen;

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar open={isOpen} onOpenChange={setSidebarOpen} />
        <div className="flex-1 flex flex-col">
          <DashboardNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 pt-16 px-4 md:px-6 lg:px-8 pb-8">{children}</main>
        </div>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

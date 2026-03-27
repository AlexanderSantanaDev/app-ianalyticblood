"use client";

import DashboardNavbar from "@/components/dashboard/dashboard-navbar";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import DashboardFooter from "@/components/dashboard/dashboard-footer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { LoadingProvider } from "@/hooks/loading-context";
import { ReactNode } from "react";
/****************************************************************************************************************************/
/** Contenido del dashboard. */
const DashboardContent = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardNavbar />
        <main className="flex-1 pt-16 px-4 md:px-6 lg:px-8 pb-8">{children}</main>
        <DashboardFooter />
      </div>
    </div>
  );
};

/** Layout principal del dashboard. */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <LoadingProvider>
        <SidebarProvider defaultOpen={true}>
          <DashboardContent>{children}</DashboardContent>
        </SidebarProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
}

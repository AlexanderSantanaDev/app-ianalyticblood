"use client";

import DashboardNavbar from "@/components/dashboard/dashboard-navbar";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import DashboardFooter from "@/components/dashboard/dashboard-footer";
import NavigationLoader from "@/components/dashboard/navigation-loader";
import PageTransition from "@/components/dashboard/page-transition";
import { SidebarProvider } from "@/components/ui/sidebar";
import { LoadingProvider } from "@/hooks/loading-context";
import { useBrowserGuard } from "@/hooks/use-browser-guard";
import { ReactNode } from "react";
/****************************************************************************************************************************/
/** Contenido del dashboard. */
const DashboardContent = ({ children }: { children: ReactNode }) => {
  // Activamos la protección anti-DevTools / anti-click-derecho en TODO el dashboard.
  const guardDisabled =
    process.env.NEXT_PUBLIC_DISABLE_BROWSER_GUARD === "true";
  useBrowserGuard({ enabled: !guardDisabled });

  return (
    <div className="flex min-h-[100dvh] w-full bg-background">
      {/* NavigationLoader: barra top + pill flotante en cada cambio de ruta */}
      <NavigationLoader />
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardNavbar />
        {/* PageTransition envuelve el contenido para fade + slide entre secciones */}
        <main className="flex-1 pt-16 flex flex-col">
          <PageTransition>
            <div className="flex-1 px-[5px] md:px-6 lg:px-8 pb-8">
              {children}
            </div>
          </PageTransition>
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
};

/** Layout principal del dashboard. */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <LoadingProvider>
      <SidebarProvider defaultOpen={true}>
        <DashboardContent>{children}</DashboardContent>
      </SidebarProvider>
    </LoadingProvider>
  );
}

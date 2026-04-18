"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Crown, ArrowUpRight, Sparkles, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react"; // hooks para sincronización
import { getDashboardStats } from "@/lib/api/analysis"; // Importada función de stats
import { useApiFetch } from "@/lib/api/client"; // Hook para peticiones autenticadas
/***********************************************************************************************************************/
export function PlanStatusCard({ className }: { className?: string }) {
  // Hooks
  const { data: session, update: updateSession } = useSession();
  const apiFetch = useApiFetch(); // Hook para peticiones autenticadas
  const plan = session?.user?.plan || "free";
  const isPremium = plan === "premium" || plan === "enterprise";
  const currentCount = session?.user?.analysis_count || 0;
  const [isSyncing, setIsSyncing] = useState(false);

  // Sincronización automática silenciosa y por eventos
  useEffect(() => {
    // 1. Sincronización inicial si el contador está en 0 pero hay sesión activa
    const syncInitial = async () => {
      if (session?.user?.email && currentCount === 0) {
        try {
          const stats = await getDashboardStats(apiFetch);
          if (stats.analyses_total > 0) {
            await updateSession({ analysis_count: stats.analyses_total });
          }
        } catch (e) {
          console.error("[SIDEBAR] Error en sincronización inicial:", e);
        }
      }
    };

    // 2. Listener para eventos de análisis finalizado
    const handleAnalysisCompleted = async (e: any) => {
      const newCount = e.detail?.count;
      console.log("[SIDEBAR] Análisis detectado vía evento. Sincronizando sesión...", newCount);
      // Forzamos actualización de sesión con el nuevo dato
      await updateSession({ analysis_count: newCount });
    };

    syncInitial();
    window.addEventListener("ianalytic:analysis-completed", handleAnalysisCompleted);

    return () => {
      window.removeEventListener("ianalytic:analysis-completed", handleAnalysisCompleted);
    };
  }, [session?.user?.email, currentCount, updateSession, apiFetch]);
  /***********************************************************************************************************************/
  //JSX
  return (
    <div className={cn("w-full px-1 py-0.5", className)}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative overflow-hidden rounded-xl p-3 transition-all duration-500",
          "border border-white/5 bg-white/[0.02] backdrop-blur-md shadow-lg",
          isPremium ? "border-primary/20 bg-primary/5" : "border-white/5 shadow-none",
        )}
      >
        {/* Icono Corona */}
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-500",
                isPremium
                  ? "bg-amber-500/20 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                  : "bg-white/5 text-muted-foreground/60 border border-white/5",
              )}
            >
              {isPremium ? (
                <Crown className="h-4 w-4 fill-amber-500 animate-pulse" />
              ) : (
                <Activity className="h-4 w-4" />
              )}
            </div>

            <div className="flex flex-col transition-all duration-300">
              <span className="text-[7px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 leading-none mb-0.5">
                Membresía
              </span>
              <div className="flex items-center gap-1.5">
                <h4
                  className={cn(
                    "text-[10px] sm:text-xs font-black uppercase tracking-tight leading-none",
                    isPremium ? "text-white" : "text-white/60",
                  )}
                >
                  {plan === "free" ? "Básico" : plan}
                </h4>
              </div>
            </div>
          </div>
        </div>

        {/* Simplificación extrema para ahorrar espacio vertical */}
        <div className="mt-3 px-0.5">
          {!isPremium ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[8px] font-bold text-muted-foreground/50 uppercase">
                <span>Usage IA</span>
                <span className="text-white/60 font-black tracking-widest text-[9px]">
                  {session?.user?.analysis_count || 0}/5
                </span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(((session?.user?.analysis_count || 0) / 5) * 100, 100)}%`,
                  }}
                  className={cn(
                    "h-full transition-all duration-500",
                    (session?.user?.analysis_count || 0) >= 5
                      ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"
                      : "bg-primary",
                  )}
                />
              </div>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="w-full h-7 text-[8px] font-black tracking-[0.1em] border-primary/20 hover:bg-primary/10 
                text-primary transition-all rounded-md"
              >
                <Link
                  href="/dashboard/subscription"
                  className="flex items-center justify-center gap-1"
                >
                  MEJORAR
                  <Sparkles className="h-2.5 w-2.5" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-muted-foreground/60 font-medium italic">
                Estatus: Activo
              </span>
              <Link
                href="/dashboard/subscription"
                className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
              >
                <ArrowUpRight className="h-3 w-3 text-primary" />
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

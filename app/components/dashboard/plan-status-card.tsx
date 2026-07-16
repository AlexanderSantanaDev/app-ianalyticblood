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
import { useAnalysis } from "@/hooks/analysis-context"; // Hook de análisis reactivo
import { usePlan } from "@/hooks/plan-context"; // Plan global reactivo (no depende del JWT)
/***********************************************************************************************************************/
export function PlanStatusCard({ className }: { className?: string }) {
  // Hooks
  const { data: session, status, update: updateSession } = useSession();
  const apiFetch = useApiFetch(); // Hook para peticiones autenticadas
  const { analysisCount: reactiveAnalysisCount } = useAnalysis(); // Contador reactivo instantáneo
  // Leemos el plan del contexto global (se actualiza al instante tras cambios de suscripción)
  const { plan } = usePlan();
  const isPremium = plan === "premium" || plan === "enterprise";
  // El contador prioritario es el reactivo del contexto
  const currentCount = reactiveAnalysisCount;
  const [isSyncing, setIsSyncing] = useState(false);

  // Sincronización automática silenciosa y por eventos
  useEffect(() => {
    // 1. Sincronización inicial silenciosa solo si no tenemos datos
    const syncInitial = async () => {
      if (status === "loading") return;

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

    syncInitial();
  }, [session?.user?.email, status, currentCount, updateSession, apiFetch]);
  /***********************************************************************************************************************/
  //JSX
  return (
    <div className={cn("w-full px-1 py-0.5", className)}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative overflow-hidden rounded-xl p-3 transition-all duration-500",
          "border backdrop-blur-md",
          isPremium
            ? "border-primary/20 bg-primary/[0.03] dark:bg-primary/5 shadow-[0_0_20px_rgba(var(--primary),0.05)]"
            : "border-slate-200/60 dark:border-white/5 bg-white dark:bg-white/[0.02] shadow-sm dark:shadow-none",
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
                  : "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-muted-foreground/60 border border-slate-200/50 dark:border-white/5",
              )}
            >
              {isPremium ? (
                <Crown className="h-4 w-4 fill-amber-500 animate-pulse" />
              ) : (
                <Activity className="h-4 w-4" />
              )}
            </div>

            <div className="flex flex-col transition-all duration-300">
              <span
                className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-400 
                dark:text-muted-foreground/40 leading-none mb-0.5"
              >
                Membresía
              </span>
              <div className="flex items-center gap-1.5">
                <h4
                  className={cn(
                    "text-[10px] sm:text-xs font-black uppercase tracking-tight leading-none",
                    isPremium
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-white/60",
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
              <div
                className="flex justify-between items-center text-[8px] font-bold text-slate-400 
              dark:text-muted-foreground/50 uppercase"
              >
                <span>Usage IA</span>
                <span className="text-slate-600 dark:text-white/60 font-black tracking-widest text-[9px]">
                  {currentCount}/5
                </span>
              </div>
              <div className="h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min((currentCount / 5) * 100, 100)}%`,
                  }}
                  className={cn(
                    "h-full transition-all duration-500",
                    currentCount >= 5
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
              <span className="text-[9px] text-slate-500 dark:text-muted-foreground/60 font-medium italic">
                Estatus: Activo
              </span>
              <Link
                href="/dashboard/subscription"
                className="p-1.5 rounded-md bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10
                 transition-colors"
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

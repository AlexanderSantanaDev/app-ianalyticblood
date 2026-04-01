"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Activity,
  AlertTriangle,
  HeartPulse,
  Info,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useApiFetch } from "@/lib/api/client";
import { getAnalyses, getDashboardStats } from "@/lib/api/analysis";
import type { AnalysisDoc } from "@/lib/api/types";
import StatsCharts from "@/components/dashboard/stats-charts";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
/***********************************************************************************************************************/
// Helpers
/** Helper para obtener el color del score de salud. */
function getHealthScoreColor(score: number) {
  if (score >= 80) return "text-green-500";
  if (score >= 50) return "text-yellow-500";
  return "text-red-500";
}

/** Helper para obtener el gradiente del score de salud. */
function getHealthScoreGradient(score: number) {
  if (score >= 80) return "from-green-500 to-emerald-400";
  if (score >= 50) return "from-yellow-500 to-orange-400";
  return "from-red-500 to-pink-500";
}
/***********************************************************************************************************************/
/** Skeleton para el estado de carga del dashboard. */
function StatsSkeleton() {
  return (
    <div className="pt-8 md:pt-12 pb-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-10 w-10 rounded-full mb-4" />
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    </div>
  );
}
/***********************************************************************************************************************/
export default function StatsPage() {
  // Estados
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    analyses: AnalysisDoc[];
    stats: any;
  } | null>(null);
  /****************************************************************************************************************************/
  // Hooks
  const apiFetch = useApiFetch();
  const { status } = useSession();

  // Fetch Data
  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);
  /****************************************************************************************************************************/
  // Métodos
  /** Función para obtener los datos del dashboard. */
  const fetchData = async () => {
    setLoading(true);
    try {
      const [analysesRes, statsRes] = await Promise.all([
        getAnalyses(apiFetch, 0, 50),
        getDashboardStats(apiFetch),
      ]);
      setData({
        analyses: analysesRes.data || [],
        stats: statsRes,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /** Función para calcular las métricas derivadas globales. */
  const metrics = useMemo(() => {
    if (!data || !data.analyses.length) return null;

    const allAnalyses = data.analyses.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    const lastAnalysis = allAnalyses[allAnalyses.length - 1];

    let totalParams = 0;
    let normalParams = 0;
    let attentionParams = 0;
    let alertParams = 0;

    Object.values(lastAnalysis.parameters).forEach((param: any) => {
      totalParams++;
      if (param.status === "normal") normalParams++;
      else if (param.status === "attention") attentionParams++;
      else if (param.status === "alert" || param.status === "high" || param.status === "low")
        alertParams++;
    });

    const healthScore = totalParams > 0 ? Math.round((normalParams / totalParams) * 100) : 0;

    const uniqueBiomarkersTracked = new Set<string>();
    allAnalyses.forEach((a) => {
      Object.keys(a.parameters).forEach((k) => uniqueBiomarkersTracked.add(k));
    });

    return {
      totalParams,
      normalParams,
      attentionParams,
      alertParams,
      healthScore,
      uniqueBiomarkersTracked: uniqueBiomarkersTracked.size,
      lastDate: new Date(lastAnalysis.date),
    };
  }, [data]);

  // Renderizado condicional
  if (status === "loading" || loading) {
    return <StatsSkeleton />;
  }

  // Renderizado cuando no hay datos
  if (!data || data.analyses.length === 0) {
    return (
      <div className="pt-20 pb-12 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
        <div className="container mx-auto px-4 max-w-lg text-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <BarChart3 className="w-12 h-12 text-muted-foreground/50" />
          </div>
          <h1 className="text-3xl font-bold mb-4">No hay datos suficientes</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Necesitas subir al menos un análisis de sangre para que la IA genere tus estadísticas y
            gráficas de evolución a lo largo del tiempo.
          </p>
          <a
            href="/dashboard/upload"
            className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-gradient-to-r from-primary to-secondary
             text-white font-semibold shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity"
          >
            Subir mi primer análisis
          </a>
        </div>
      </div>
    );
  }

  /****************************************************************************************************************************/
  //JSX
  return (
    <div className="pt-8 md:pt-12 pb-12 min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl w-full">
        {/* Header Premium */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-sm border border-primary/20">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Estadísticas</h1>
          </div>
          <p className="text-muted-foreground text-lg ml-[3.5rem] leading-relaxed max-w-3xl">
            Panorámica avanzada de salud. Analizamos la tendencia histórica de tus{" "}
            <strong className="text-foreground">{metrics?.uniqueBiomarkersTracked}</strong>{" "}
            biomarcadores basándonos en tu clínica.
          </p>
        </motion.div>

        {/* Global Performance Cards */}
        {metrics && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12"
          >
            {/* Health Score Card */}
            <Card className="relative overflow-hidden border-border/50 group hover:shadow-lg transition-all">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${getHealthScoreGradient(
                  metrics.healthScore,
                )} opacity-5 group-hover:opacity-10 transition-opacity`}
              ></div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`p-3 rounded-full bg-background border shadow-sm ${getHealthScoreColor(
                      metrics.healthScore,
                    )}`}
                  >
                    <HeartPulse className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Score
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-4xl font-black tracking-tighter">
                    {metrics.healthScore}
                    <span className="text-xl text-muted-foreground font-normal">/100</span>
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">Índice Vital Global</p>
                </div>
                <div className="mt-5">
                  <Progress
                    value={metrics.healthScore}
                    className={`h-2 [&>div]:bg-gradient-to-r [&>div]:${getHealthScoreGradient(
                      metrics.healthScore,
                    )}`}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Normales */}
            <Card className="border-border/50 hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 shadow-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold">{metrics.normalParams}</h3>
                  <p className="text-sm text-muted-foreground font-medium">Marcadores Normales</p>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
                  En el último informe ({metrics.lastDate.toLocaleDateString("es-ES")})
                </div>
              </CardContent>
            </Card>

            {/* Atención */}
            <Card className="border-border/50 hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div
                    className="p-3 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border border-yellow-500/20 
                  shadow-sm"
                  >
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold">{metrics.attentionParams}</h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Marcadores en Atención
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
                  Requieren seguimiento moderado
                </div>
              </CardContent>
            </Card>

            {/* Alertas */}
            <Card className="border-border/50 hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-full bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20 shadow-sm">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold">{metrics.alertParams}</h3>
                  <p className="text-sm text-muted-foreground font-medium">Marcadores Críticos</p>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
                  Desviación significativa detectada
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Gráficos Detallados (Reutiliza el super componente de Recharts) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-6 ml-1">
            <h2 className="text-2xl font-bold tracking-tight">Evolución Clínica Estricta</h2>
            <TooltipWrapper content="Representación de las curvas de tendencia históricas filtrando valores erráticos.">
              <Info className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipWrapper>
          </div>

          <div className="bg-card border border-border/60 rounded-3xl p-4 sm:p-6 shadow-sm">
            <StatsCharts analyses={data.analyses} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function TooltipWrapper({ children, content }: { children: React.ReactNode; content: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs text-center border-primary/20 bg-background/95 backdrop-blur-md"
        >
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  Download,
  Inbox,
  Eye,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  DashboardStats,
  getAnalysesSummary,
  getDashboardStats,
  getAnalysis,
  getAnalyses,
} from "@/lib/api/analysis";
import { useApiFetch } from "@/lib/api/client";
import { useSession } from "next-auth/react";
import { AnalysisSummary } from "@/types/dashboard";
import { AnalysisDoc } from "@/lib/api/types";
import { FileUpload } from "@/components/dashboard/file-upload";
import { AnalysisDetailDialog } from "@/components/dashboard/analysis-detail-dialog";
import StatsCharts from "@/components/dashboard/stats-charts";
import { toast } from "sonner";
import { downloadAnalysisAsPDF } from "@/lib/api/download-analysis";
/***********************************************************************************************************************/
/** Helper para badge de nivel de alerta. */
function getAlertBadgeClasses(level: string) {
  switch (level) {
    case "normal":
      return "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20";
    case "attention":
      return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20";
    default:
      return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20";
  }
}

/** Helper para label de nivel de alerta. */
function getAlertLabel(level: string) {
  switch (level) {
    case "normal":
      return "Normal";
    case "attention":
      return "Atención";
    default:
      return "Alerta";
  }
}

/** Helper para icono de nivel de alerta. */
function getAlertIcon(level: string) {
  switch (level) {
    case "normal":
      return CheckCircle;
    case "attention":
      return Clock;
    default:
      return AlertCircle;
  }
}

/***********************************************************************************************************************/
/** Skeleton para el estado de carga del dashboard. */
function DashboardSkeleton() {
  return (
    <div className="pt-8 md:pt-12 pb-2">
      <div className="container mx-auto px-4">
        {/* Header skeleton */}
        <div className="mb-6 md:mb-8 text-center sm:text-left">
          <Skeleton className="h-9 w-64 mb-2 mx-auto sm:mx-0" />
          <Skeleton className="h-5 w-full max-w-sm mx-auto sm:mx-0" />
        </div>
        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Tabs skeleton */}
        <Skeleton className="h-10 w-full mb-8 rounded-lg" />
        {/* Content skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72 mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full rounded-xl" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
/***********************************************************************************************************************/
export default function DashboardPage() {
  // Estados
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<AnalysisSummary[]>([]);
  const [historyData, setHistoryData] = useState<AnalysisSummary[]>([]);
  const [allAnalyses, setAllAnalyses] = useState<AnalysisDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upload" | "history" | "insights">(
    "upload",
  );
  // Estados para el dialog de detalle
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(
    null,
  );
  /***********************************************************************************************************************/
  // Hooks
  const apiFetch = useApiFetch();
  const { data: session, status } = useSession();
  // Hook para obtener los datos del dashboard
  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);
  /***********************************************************************************************************************/
  // Métodos
  /** Función para obtener los datos del dashboard. */
  const fetchData = async () => {
    if (status !== "authenticated") return;
    setLoading(true);
    try {
      // Traemos datos para recientes (3), historial (20) y todas para stats (50)
      const [statsRes, recentRes, historyRes, allRes] = await Promise.all([
        getDashboardStats(apiFetch),
        getAnalysesSummary(apiFetch, 0, 3),
        getAnalysesSummary(apiFetch, 0, 20),
        getAnalyses(apiFetch, 0, 50),
      ]);
      setStats(statsRes);
      setRecent(recentRes);
      setHistoryData(historyRes);
      setAllAnalyses(allRes.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /** Handler para abrir detalle de un análisis. */
  const handleViewDetails = useCallback((id: string) => {
    setSelectedAnalysisId(id);
    setDetailDialogOpen(true);
  }, []);

  /** Handler para descargar un análisis. */
  const handleDownload = useCallback(
    async (id: string) => {
      try {
        const res = await getAnalysis(apiFetch, id);
        await downloadAnalysisAsPDF(res.data);
        toast.success("Informe descargado correctamente");
      } catch (err: any) {
        console.error(err);
        toast.error("Error al descargar el informe");
      }
    },
    [apiFetch],
  );

  /** Badge de estado general. */
  const generalStateBadge = useMemo(() => {
    if (!stats) return null;
    const st = stats.general_state.toLowerCase();
    if (st.includes("saludable") || st === "—")
      return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100";
    if (st.includes("riesgo"))
      return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100";
    return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100";
  }, [stats]);

  // Loading
  if (status === "loading" || loading) {
    return <DashboardSkeleton />;
  }

  /** Handler para subir un archivo. */
  const handleFileUpload = (file: File) => {
    console.log("Archivo subido:", file);
    fetchData();
  };

  // Nombre del usuario desde la sesión
  const userName = session?.user?.name || "Usuario";

  /***********************************************************************************************************************/
  //JSX
  return (
    <div className="pt-8 md:pt-12 pb-2">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold mb-2">Bienvenido, {userName}</h1>
          <p className="text-muted-foreground mb-8">
            {stats?.analyses_total
              ? "Gestiona tus análisis de sangre y obtén información valiosa sobre tu salud."
              : "Aún no has subido ningún análisis. ¡Empieza cargando tu primer PDF o imagen! 🚀"}
          </p>

          {/* Stats cards con animación */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Análisis realizados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="text-4xl font-bold mr-4">
                      {stats?.analyses_total ?? 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stats?.analyses_this_month ? (
                        <div className="flex items-center text-green-600">
                          <span className="mr-1">
                            +{stats.analyses_this_month}
                          </span>
                          <span>este mes</span>
                        </div>
                      ) : (
                        <span>—</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Estado general</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div
                      className={`rounded-full w-10 h-10 flex items-center justify-center mr-4 ${generalStateBadge}`}
                    >
                      {stats?.general_state && stats.general_state !== "—" ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <Inbox className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {stats?.general_state && stats.general_state !== "—"
                          ? stats.general_state
                          : "Sin datos"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stats?.general_state && stats.general_state !== "—"
                          ? "Basado en tus últimos análisis"
                          : "Sube tu primer informe"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    Próximo recordatorio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="rounded-full w-10 h-10 flex items-center justify-center bg-primary/20 text-primary mr-4">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {stats?.next_reminder
                          ? new Date(stats.next_reminder).toLocaleDateString(
                              "es-ES",
                            )
                          : "—"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stats?.next_reminder
                          ? "Analítica programada"
                          : "Se mostrará tras tu primer análisis"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Tabs con contenido mejorado */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as any)}
            className="mb-8"
          >
            <TabsList
              className="flex w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] 
            [scrollbar-width:none] justify-start sm:grid sm:grid-cols-3 h-auto p-1 bg-muted rounded-xl mb-8"
            >
              <TabsTrigger
                value="upload"
                className="whitespace-nowrap px-4 py-2 text-sm sm:text-base"
              >
                Subir análisis
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="whitespace-nowrap px-4 py-2 text-sm sm:text-base"
              >
                Historial
              </TabsTrigger>
              <TabsTrigger
                value="insights"
                className="whitespace-nowrap px-4 py-2 text-sm sm:text-base"
              >
                Estadísticas
              </TabsTrigger>
            </TabsList>

            {/* TAB: Subir análisis */}
            <TabsContent value="upload" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Subir nuevo análisis</CardTitle>
                  <CardDescription>
                    PDF o imagen - extracción automática con IA 🧠
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload onUpload={handleFileUpload} />
                </CardContent>
              </Card>

              {/* Análisis recientes mejorados con más info y botones funcionales */}
              <div>
                <h3 className="text-xl font-bold mb-4">Análisis recientes</h3>
                {recent.length ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {recent.map((analysis) => {
                      const Icon = getAlertIcon(analysis.alert_level);
                      return (
                        <Card
                          key={analysis.id}
                          className="hover:shadow-lg transition-all duration-300 group"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex items-start gap-3 min-w-0">
                                {/* Icono de estado a la izquierda */}
                                <div
                                  className={`rounded-full w-9 h-9 flex-shrink-0 flex items-center justify-center 
                                    mt-0.5 ${getAlertBadgeClasses(analysis.alert_level)}`}
                                >
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                  <CardTitle className="text-base">
                                    Análisis{" "}
                                    {new Date(analysis.date).toLocaleDateString(
                                      "es-ES",
                                      {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      },
                                    )}
                                  </CardTitle>
                                  {/* Fecha relativa */}
                                  <CardDescription className="text-xs mt-0.5">
                                    {new Date(analysis.date).toLocaleTimeString(
                                      "es-ES",
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )}
                                  </CardDescription>
                                </div>
                              </div>
                              {/* Badge */}
                              <span
                                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold 
                                  flex-shrink-0 ${getAlertBadgeClasses(analysis.alert_level)}`}
                              >
                                {getAlertLabel(analysis.alert_level)}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            {/* Summary truncado a 2 líneas */}
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                              {analysis.summary}
                            </p>
                            {/* Botones funcionales */}
                            <div className="flex gap-2 mt-2 sm:mt-0">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 hover:border-primary/50 hover:text-primary transition-colors h-9 sm:h-10"
                                onClick={() => handleViewDetails(analysis.id)}
                              >
                                <Eye className="h-4 w-4 sm:mr-1.5" />
                                <span className="sm:hidden ml-1">Ver</span>
                                <span className="hidden sm:inline">
                                  Ver detalles
                                </span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 hover:border-primary/50 hover:text-primary transition-colors h-9 sm:h-10"
                                onClick={() => handleDownload(analysis.id)}
                              >
                                <Download className="h-4 w-4 sm:mr-1.5" />
                                <span className="sm:hidden ml-1">PDF</span>
                                <span className="hidden sm:inline">
                                  Descargar
                                </span>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg">
                    <Inbox className="w-10 h-10 mb-4 text-muted-foreground" />
                    <p className="font-medium">
                      Todavía no hay análisis recientes
                    </p>
                    <p className="text-muted-foreground text-sm mt-2">
                      Cuando subas tu primer archivo, aparecerá aquí.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB: Historial — datos reales de la API */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de análisis</CardTitle>
                  <CardDescription>
                    Visualiza todos tus análisis anteriores y su evolución.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {historyData.length > 0 ? (
                    <div className="space-y-4">
                      {historyData.map((analysis) => {
                        const Icon = getAlertIcon(analysis.alert_level);
                        return (
                          <div
                            key={analysis.id}
                            className="flex items-start border-b border-border pb-6 last:border-0 last:pb-0 gap-3 sm:gap-4 group"
                          >
                            {/* Icono izquierdo (solo desktop, en móvil lo movemos a la derecha del título) */}
                            <div
                              className={`hidden sm:flex rounded-full w-10 h-10 flex-shrink-0 items-center justify-center mt-1 
                                 ${getAlertBadgeClasses(analysis.alert_level)}`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>

                            <div className="flex-grow min-w-0 w-full mt-1.5 sm:mt-0">
                              <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                <div className="min-w-0 w-full sm:w-auto">
                                  <div className="flex justify-between sm:justify-start items-center gap-3">
                                    <h4 className="font-bold text-base sm:text-lg group-hover:text-primary transition-colors">
                                      Análisis{" "}
                                      {new Date(
                                        analysis.date,
                                      ).toLocaleDateString("es-ES", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      })}
                                    </h4>
                                    {/* Icono de alerta en móvil (a la derecha del título) */}
                                    <div
                                      className={`sm:hidden rounded-full w-7 h-7 flex-shrink-0 flex items-center justify-center 
                                         ${getAlertBadgeClasses(analysis.alert_level)}`}
                                    >
                                      <Icon className="h-4 w-4" />
                                    </div>
                                  </div>

                                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1 sm:mt-0.5">
                                    <Clock className="h-3 w-3" />
                                    {new Date(analysis.date).toLocaleTimeString(
                                      "es-ES",
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )}
                                  </p>
                                </div>

                                {/* Botones funcionales del historial - stack en móvil */}
                                <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleViewDetails(analysis.id)
                                    }
                                    className="flex-1 sm:flex-none h-10 sm:h-9 px-4 hover:border-primary/50 hover:text-primary transition-all"
                                  >
                                    <Eye className="h-4 w-4 sm:mr-2" />
                                    <span className="sm:hidden ml-1">Ver</span>
                                    <span className="hidden sm:inline">
                                      Ver detalle
                                    </span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownload(analysis.id)}
                                    className="flex-1 sm:flex-none h-10 sm:h-9 px-4 hover:border-primary/50 hover:text-primary transition-all"
                                  >
                                    <Download className="h-4 w-4 sm:mr-2" />
                                    <span className="sm:hidden ml-1">PDF</span>
                                    <span className="hidden sm:inline">
                                      Descargar
                                    </span>
                                  </Button>
                                </div>
                              </div>

                              {/* Summary padding ajustado para que no recorte la base de las letras */}
                              <div className="mt-4 sm:mt-3 bg-muted/30 p-3.5 sm:p-4 rounded-xl border border-border/50">
                                <p className="text-sm text-muted-foreground line-clamp-4 sm:line-clamp-2 leading-loose sm:leading-relaxed">
                                  {analysis.summary}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Inbox className="w-10 h-10 mb-4 text-muted-foreground" />
                      <p className="font-medium">Sin historial</p>
                      <p className="text-muted-foreground text-sm mt-2">
                        Tus análisis aparecerán aquí cuando subas archivos.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: Estadísticas (placeholder) */}
            <TabsContent value="insights">
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas y tendencias</CardTitle>
                  <CardDescription>
                    Visualiza la evolución de tus valores a lo largo del tiempo.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-5 
                  sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
                  >
                    <div>
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Vista Rápida de Tendencias
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                        Aquí puedes ver la evolución básica de tus
                        biomarcadores. Para un desglose completo, cálculo de tu
                        Índice Vital y estado clínico, visita la sección
                        dedicada.
                      </p>
                    </div>
                    <Button
                      asChild
                      className="shrink-0 gradient-bg border-none shadow-md shadow-primary/20 hover:opacity-90"
                    >
                      <Link href="/dashboard/stats">
                        Ver todas las estadísticas
                      </Link>
                    </Button>
                  </div>
                  <StatsCharts analyses={allAnalyses} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Dialog de detalle de análisis */}
        <AnalysisDetailDialog
          analysisId={selectedAnalysisId}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
        />
      </div>
    </div>
  );
}

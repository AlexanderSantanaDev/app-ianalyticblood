"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  AlertCircle,
  Clock,
  CheckCircle,
  Inbox,
  ArrowUpDown,
  CalendarDays,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApiFetch } from "@/lib/api/client";
import { getAnalysesSummary, getAnalysis } from "@/lib/api/analysis";
import { AnalysisSummary } from "@/types/dashboard";
import { AnalysisDetailDialog } from "@/components/dashboard/analysis-detail-dialog";
import { downloadAnalysisAsPDF } from "@/lib/api/download-analysis";
import { toast } from "sonner";

/***********************************************************************************************************************/
// Helpers
/** Obtiene las clases CSS para el badge de alerta. */
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

/** Obtiene la etiqueta de alerta. */
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

/** Obtiene el icono de alerta. */
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
/** Skeleton para historial. */
function HistorySkeleton() {
  return (
    <div className="pt-12 pb-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-6 w-full max-w-sm mb-8" />

        <div className="flex bg-card border rounded-lg p-2 mb-6 gap-2">
          <Skeleton className="h-10 w-full md:w-1/2" />
          <Skeleton className="h-10 w-32 hidden md:block" />
          <Skeleton className="h-10 w-32 hidden md:block" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4 w-full">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-full max-w-md" />
                  </div>
                  <div className="hidden md:flex gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
/***********************************************************************************************************************/
// Página Principal
export default function HistoryPage() {
  // Estados
  const [data, setData] = useState<AnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);
  // Filtros y ordenamiento
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "alert">("newest");
  const [filterLevel, setFilterLevel] = useState<
    "all" | "normal" | "attention" | "alert"
  >("all");
  // Dialog detalle
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(
    null,
  );
  /***********************************************************************************************************************/
  // Hooks
  const apiFetch = useApiFetch();
  const { status } = useSession();

  // Fetch data
  const fetchData = async () => {
    if (status !== "authenticated") return;
    setLoading(true);
    try {
      const historyRes = await getAnalysesSummary(apiFetch, 0, 50); // Fetch hasta 50 para el historial real
      setData(historyRes);
    } catch (err: any) {
      console.error(err);
      toast.error("Error al cargar historial");
    } finally {
      setLoading(false);
    }
  };

  // Actualiza el fetch data cuando cambia el estado de la sesión
  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  /***********************************************************************************************************************/
  // Métodos
  /** Abre el diálogo de detalle. */
  const handleViewDetails = useCallback((id: string) => {
    setSelectedAnalysisId(id);
    setDetailDialogOpen(true);
  }, []);

  /** Descarga el análisis como PDF. */
  const handleDownload = useCallback(
    async (id: string, date: string) => {
      const loadingToast = toast.loading("Generando informe...");
      try {
        const res = await getAnalysis(apiFetch, id);
        await downloadAnalysisAsPDF(res.data);
        toast.success("Informe descargado 🎉", { id: loadingToast });
      } catch (err: any) {
        console.error(err);
        toast.error("Error al descargar el informe", { id: loadingToast });
      }
    },
    [apiFetch],
  );

  /** Filtra y ordena los datos. */
  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Búsqueda
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.summary.toLowerCase().includes(lowerSearch) ||
          format(new Date(item.date), "dd MMMM yyyy", { locale: es })
            .toLowerCase()
            .includes(lowerSearch),
      );
    }

    // Filtrar por nivel
    if (filterLevel !== "all") {
      result = result.filter((item) => item.alert_level === filterLevel);
    }

    // Ordenamiento
    result.sort((a, b) => {
      if (sortBy === "alert") {
        const getAlertOrder = (level: string): number => {
          switch (level) {
            case "alert":
              return 3;
            case "attention":
              return 2;
            case "normal":
              return 1;
            default:
              return 0;
          }
        };
        const levelA = getAlertOrder(a.alert_level);
        const levelB = getAlertOrder(b.alert_level);
        if (levelA !== levelB) return levelB - levelA; // Mayor alerta primero
        return new Date(b.date).getTime() - new Date(a.date).getTime(); // Desempata con más nuevo
      }
      if (sortBy === "oldest") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      // "newest" por defecto
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return result;
  }, [data, search, sortBy, filterLevel]);

  // Control de carga
  if (status === "loading" || loading) {
    return <HistorySkeleton />;
  }
  /***********************************************************************************************************************/
  //JSX
  return (
    <div className="pt-12 pb-12 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Historial de Análisis
            </h1>
          </div>
          <p className="text-muted-foreground text-lg sm:ml-[3.25rem] ml-0">
            Explora tus resultados médicos pasados y filtra para encontrar
            exactamente lo que buscas.
          </p>
        </motion.div>

        {/* Zona de Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-3 sm:gap-4 mb-8 bg-card border border-border/50 shadow-sm p-2 sm:p-3 rounded-2xl"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="search-history"
              name="searchHistory"
              placeholder="Buscar por resumen, fecha o estado..."
              className="pl-10 border-none bg-background/50 focus-visible:ring-1 focus-visible:ring-primary/40 h-12 text-base rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-12 px-4 rounded-xl flex-1 md:flex-none"
                >
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Ordenar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuRadioGroup
                  value={sortBy}
                  onValueChange={(v) => setSortBy(v as any)}
                >
                  <DropdownMenuRadioItem value="newest">
                    Más recientes
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="oldest">
                    Más antiguos
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="alert">
                    Mayor prioridad
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-12 px-4 rounded-xl flex-1 md:flex-none"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Filtrar nivel</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuRadioGroup
                  value={filterLevel}
                  onValueChange={(v) => setFilterLevel(v as any)}
                >
                  <DropdownMenuRadioItem value="all">
                    Ver todos
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="normal">
                    Solo Normal
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="attention">
                    Solo Atención
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="alert">
                    Solo Alertas
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        {/* Lista animada */}
        {filteredAndSortedData.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredAndSortedData.map((item, index) => {
                const Icon = getAlertIcon(item.alert_level);
                const badgeStyle = getAlertBadgeClasses(item.alert_level);
                const formattedDate = format(
                  new Date(item.date),
                  "dd MMMM yyyy",
                  { locale: es },
                );
                const formattedTime = format(new Date(item.date), "HH:mm", {
                  locale: es,
                });

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="group hover:shadow-lg hover:border-primary/20 transition-all duration-300 overflow-hidden">
                      <div
                        className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b opacity-0 group-hover:opacity-100 
                      transition-opacity from-primary to-secondary"
                      ></div>
                      <CardContent className="p-5 sm:p-6 lg:p-8">
                        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start lg:items-center justify-between">
                          {/* Info Column */}
                          <div className="flex gap-3 sm:gap-4 items-start flex-1 min-w-0 w-full">
                            <div
                              className={`p-3 sm:p-4 rounded-full flex-shrink-0 mt-1 lg:mt-0 ${badgeStyle}`}
                            >
                              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="space-y-1.5 sm:space-y-2 min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg sm:text-xl font-bold truncate">
                                  Informe Clínico
                                </h3>
                                <span
                                  className={`px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full 
                                    uppercase tracking-wider ${badgeStyle} flex-shrink-0`}
                                >
                                  {getAlertLabel(item.alert_level)}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground font-medium">
                                <span className="flex items-center gap-1.5 whitespace-nowrap">
                                  <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{" "}
                                  {formattedDate}
                                </span>
                                <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-border"></span>
                                <span className="flex items-center gap-1.5 whitespace-nowrap">
                                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{" "}
                                  {formattedTime} hs
                                </span>
                              </div>
                              <p className="text-muted-foreground pt-1 sm:pt-2 sm:line-clamp-2 leading-relaxed text-sm">
                                {item.summary}
                              </p>
                            </div>
                          </div>

                          {/* Action Column */}
                          <div className="flex gap-2 w-full lg:w-auto mt-2 lg:mt-0 pt-3 lg:pt-0 border-t lg:border-0 border-border/30">
                            <Button
                              variant="outline"
                              onClick={() => handleViewDetails(item.id)}
                              className="flex-1 lg:flex-none h-10 sm:h-11 px-3 sm:px-5 hover:bg-primary/5 hover:text-primary 
                              transition-colors hover:border-primary/30"
                            >
                              <Eye className="w-4 h-4 sm:mr-2" />
                              <span className="sm:hidden ml-1.5">Detalles</span>
                              <span className="hidden sm:inline">
                                Ver detalle
                              </span>
                            </Button>
                            <Button
                              onClick={() =>
                                handleDownload(item.id, formattedDate)
                              }
                              className="flex-1 lg:flex-none h-10 sm:h-11 px-3 sm:px-5 gradient-bg shadow-sm shadow-primary/20"
                            >
                              <Download className="w-4 h-4 sm:mr-2 text-white" />
                              <span className="sm:hidden ml-1.5 text-white">
                                PDF
                              </span>
                              <span className="hidden sm:inline text-white">
                                PDF{" "}
                              </span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center p-12 lg:p-24 border border-dashed border-border/60 rounded-2xl 
            bg-muted/10 text-center"
          >
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <Inbox className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              {data.length === 0
                ? "Aún no tienes análisis registrados. Sube tu primer informe de sangre para que la IA extraiga los valores."
                : "No hemos encontrado resultados que coincidan con la búsqueda actual."}
            </p>
            {data.length === 0 && (
              <Button
                onClick={() => (window.location.href = "/dashboard/upload")}
                className="gradient-bg h-12 px-6"
              >
                Ir a subir análisis
              </Button>
            )}
          </motion.div>
        )}
      </div>

      {/* Dialogo de Detalle */}
      <AnalysisDetailDialog
        analysisId={selectedAnalysisId}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </div>
  );
}

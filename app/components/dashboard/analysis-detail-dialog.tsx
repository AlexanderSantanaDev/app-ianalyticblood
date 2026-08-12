"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Activity,
  Stethoscope,
  FileText,
  Heart,
  Microscope,
  AlertTriangle,
  Compass,
  Lock,
  Crown,
  CircleDot,
} from "lucide-react";
import { getAnalysis } from "@/lib/api/analysis";
import { useApiFetch } from "@/lib/api/client";
import type { AnalysisDoc, AnalysisSection } from "@/lib/api/types";
import { downloadAnalysisAsPDF } from "@/lib/api/download-analysis";
import { usePlan } from "@/hooks/plan-context";

/****************************************************************************************************************************/
/** Tipado de props del dialog */
interface AnalysisDetailDialogProps {
  analysisId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Helper para el estilo del badge según alert_level. */
function getAlertBadge(level: string) {
  switch (level) {
    case "normal":
      return {
        label: "Normal",
        className: "bg-green-500/10 text-green-500 border-green-500/20",
        icon: CheckCircle,
      };
    case "attention":
      return {
        label: "Atención",
        className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        icon: Clock,
      };
    default:
      return {
        label: "Alerta",
        className: "bg-red-500/10 text-red-500 border-red-500/20",
        icon: AlertCircle,
      };
  }
}

/** Helper para el color de estado de parámetro. */
function getParamStatusColor(status: string | null) {
  switch (status) {
    case "normal":
      return "text-green-500";
    case "bajo":
      return "text-yellow-500";
    case "alto":
      return "text-orange-500";
    case "muy_alto":
      return "text-red-500";
    default:
      return "text-muted-foreground";
  }
}

/** Helper para la etiqueta de estado del parámetro. */
function getParamStatusLabel(status: string | null) {
  switch (status) {
    case "normal":
      return "Normal";
    case "bajo":
      return "Bajo";
    case "alto":
      return "Alto";
    case "muy_alto":
      return "Muy alto";
    default:
      return "—";
  }
}

/** Helper para obtener el icono de lucide-react según el nombre del icono de la sección. */
function getSectionIcon(iconName: string) {
  switch (iconName) {
    case "Activity":
      return Activity;
    case "FileText":
      return FileText;
    case "Heart":
      return Heart;
    case "Microscope":
      return Microscope;
    case "AlertTriangle":
      return AlertTriangle;
    case "Compass":
      return Compass;
    default:
      return CircleDot;
  }
}

/** Color accent por tipo de sección para darle identidad visual a cada card. */
function getSectionAccent(iconName: string): string {
  switch (iconName) {
    case "Activity":
      return "text-purple-500 bg-purple-500/10";
    case "FileText":
      return "text-blue-500 bg-blue-500/10";
    case "Heart":
      return "text-rose-500 bg-rose-500/10";
    case "Microscope":
      return "text-cyan-500 bg-cyan-500/10";
    case "AlertTriangle":
      return "text-orange-500 bg-orange-500/10";
    case "Compass":
      return "text-green-500 bg-green-500/10";
    default:
      return "text-primary bg-primary/10";
  }
}

/****************************************************************************************************************************/
const FREE_VISIBLE_COUNT = 2; // Items visibles para plan free

interface SectionCardProps {
  section: AnalysisSection;
  isFree: boolean;
}

/** Componente interno que renderiza una sección de análisis detallado.  */
function SectionCard({ section, isFree }: SectionCardProps) {
  const SectionIcon = getSectionIcon(section.icon);
  const accent = getSectionAccent(section.icon);
  const [iconColor, iconBg] = accent.split(" ");

  // En free mostramos solo FREE_VISIBLE_COUNT; en premium mostramos todos
  const visibleItems = isFree
    ? section.items.slice(0, FREE_VISIBLE_COUNT)
    : section.items;
  const hiddenItems = isFree ? section.items.slice(FREE_VISIBLE_COUNT) : [];
  const hasHidden = hiddenItems.length > 0;
  /****************************************************************************************************************************/
  // Render
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Header de la sección */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${iconBg}`}>
            <SectionIcon className={`h-4 w-4 ${iconColor}`} />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">
              {section.title}
            </p>
            <p className="text-xs text-muted-foreground leading-tight mt-0.5">
              {section.subtitle}
            </p>
          </div>
        </div>
        {/* Badge plan */}
        {isFree && (
          <Badge
            variant="outline"
            className="gap-1 text-[10px] px-2 py-0.5 border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0"
          >
            <Crown className="h-2.5 w-2.5" />
            Premium
          </Badge>
        )}
      </div>

      {/* Lista de items */}
      <div className="px-4 pb-1 space-y-2">
        {/* Items visibles (reales, siempre se leen) */}
        {visibleItems.map((item, i) => (
          <div key={i} className="flex items-start gap-2.5 py-1">
            <CircleDot className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${iconColor}`} />
            <p className="text-sm text-foreground leading-relaxed">
              {item.text}
            </p>
          </div>
        ))}

        {/* Items difuminados (solo plan free) */}
        {isFree &&
          hiddenItems.map((item, i) => (
            <div
              key={`blur-${i}`}
              className="flex items-start gap-2.5 py-1 blur-[4px] opacity-40 select-none pointer-events-none"
              aria-hidden="true"
            >
              <CircleDot className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
      </div>

      {/* Footer CTA — solo en plan free cuando hay items ocultos */}
      {isFree && hasHidden && (
        <div className="mx-4 mb-4 mt-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span>
              +{hiddenItems.length} punto{hiddenItems.length > 1 ? "s" : ""}{" "}
              oculto{hiddenItems.length > 1 ? "s" : ""}
            </span>
          </div>
          <Button
            asChild
            size="sm"
            className="h-7 text-[11px] px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 
            text-white border-0 shadow-sm shrink-0"
          >
            <a href="/dashboard/subscription">
              <Crown className="h-2.5 w-2.5 mr-1" />
              Ver todo
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}

/****************************************************************************************************************************/
export function AnalysisDetailDialog({
  analysisId,
  open,
  onOpenChange,
}: AnalysisDetailDialogProps) {
  // Estados
  const [data, setData] = useState<AnalysisDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { plan } = usePlan();
  const isFree = plan === "free";

  /****************************************************************************************************************************/
  // Hooks
  const apiFetch = useApiFetch();

  // AbortController para cancelar petición si el usuario cierra el dialog — evita memory leaks y race conditions en el estado de React.
  useEffect(() => {
    if (!open || !analysisId) return;

    const controller = new AbortController();

    setData(null);
    setLoading(true);
    setError(null);

    getAnalysis(apiFetch, analysisId)
      .then((res) => {
        if (!controller.signal.aborted) {
          setData(res.data);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.error("Error fetching analysis:", err);
          setError(err.message || "Error al cargar el análisis");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [open, analysisId, apiFetch]);

  /****************************************************************************************************************************/
  const alertBadge = data ? getAlertBadge(data.overview.alert_level) : null;
  const AlertIcon = alertBadge?.icon;

  const handleDownload = () => {
    if (!data) return;
    downloadAnalysisAsPDF(data);
  };

  // Detectamos si hay secciones detalladas para el análisis actual
  const hasSections =
    data?.analysis_sections && data.analysis_sections.length > 0;

  /****************************************************************************************************************************/
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[88vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-primary/5 to-secondary/5">
          <DialogDescription className="sr-only">
            Detalles y resultados del análisis de sangre seleccionado.
          </DialogDescription>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">
                Detalle del análisis
              </DialogTitle>
              {data && (
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(data.date).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
            {alertBadge && AlertIcon && (
              <Badge
                variant="outline"
                className={`${alertBadge.className} gap-1.5 px-3 py-1`}
              >
                <AlertIcon className="h-3.5 w-3.5" />
                {alertBadge.label}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(88vh-120px)]">
          <div className="px-6 py-5 space-y-6">
            {/* Loading skeleton */}
            {loading && (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 text-destructive">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Contenido del análisis */}
            {data && !loading && (
              <>
                {/* Resumen ejecutivo */}
                <div className="rounded-xl border bg-card p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    Resumen general
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {data.overview.summary}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">
                      Estado:
                    </span>
                    <span className="text-xs font-medium">
                      {data.overview.general_state}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Parámetros */}
                {data.parameters && Object.keys(data.parameters).length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Activity className="h-4 w-4 text-primary" />
                      Parámetros analizados
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(data.parameters).map(([name, param]) => (
                        <div
                          key={name}
                          className="rounded-lg border bg-card/50 p-3 space-y-1 hover:bg-card transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium truncate max-w-[60%]">
                              {name}
                            </span>
                            <span
                              className={`text-xs font-semibold ${getParamStatusColor(param.status)}`}
                            >
                              {getParamStatusLabel(param.status)}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold">
                              {param.value !== null ? param.value : "—"}
                            </span>
                            {param.unit && (
                              <span className="text-xs text-muted-foreground">
                                {param.unit}
                              </span>
                            )}
                          </div>
                          {param.reference_range && (
                            <p className="text-[11px] text-muted-foreground">
                              Ref: {param.reference_range[0]} —{" "}
                              {param.reference_range[1]} {param.unit}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Secciones de análisis detallado */}
                {hasSections && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      {/* Título del bloque */}
                      <div className="text-center space-y-1">
                        <h3 className="text-base font-bold">
                          Análisis Detallado
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Interpretación impulsada por IA de tus resultados
                        </p>
                        {/* Banner upgrade para plan free */}
                        {isFree && (
                          <div
                            className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 
                          text-xs text-amber-600 dark:text-amber-400"
                          >
                            <Crown className="h-3 w-3" />
                            <span>
                              Actualiza a Premium para ver el análisis completo
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Cards de secciones */}
                      <div className="space-y-3">
                        {data.analysis_sections!.map((section, i) => (
                          <SectionCard
                            key={i}
                            section={section}
                            isFree={isFree}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Interpretación (texto plano — solo visible si no hay secciones) */}
                {!hasSections && data.analysis && data.analysis.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <FileText className="h-4 w-4 text-primary" />
                        Interpretación
                      </div>
                      <ul className="space-y-2">
                        {data.analysis.map((item, i) => (
                          <li
                            key={i}
                            className="text-sm text-muted-foreground leading-relaxed pl-4 border-l-2 border-primary/30"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {/* Recomendaciones (solo si no hay secciones — fallback legacy) */}
                {!hasSections &&
                  data.recommendations &&
                  data.recommendations.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-3 relative">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <Compass className="h-4 w-4 text-yellow-500" />
                          Recomendaciones
                        </div>

                        {isFree ? (
                          <div className="relative rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 text-center overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
                            <Crown className="w-8 h-8 text-amber-500 mx-auto mb-3 opacity-80" />
                            <h4 className="font-bold text-amber-600 dark:text-amber-500 mb-1">
                              Recomendaciones Avanzadas
                            </h4>
                            <p className="text-sm text-muted-foreground mb-4">
                              Sube a Premium para obtener un plan de acción
                              personalizado.
                            </p>
                            <Button
                              asChild
                              size="sm"
                              className="bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-md shadow-amber-500/20 rounded-lg"
                            >
                              <a href="/dashboard/subscription">Mejorar Plan</a>
                            </Button>
                          </div>
                        ) : (
                          <ul className="space-y-2">
                            {data.recommendations.map((rec, i) => (
                              <li
                                key={i}
                                className="text-sm text-muted-foreground leading-relaxed pl-4 border-l-2 border-yellow-500/30"
                              >
                                {rec}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </>
                  )}

                {/* Botón de descarga */}
                <div className="pt-2">
                  <Button
                    onClick={handleDownload}
                    className="w-full gradient-bg"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar informe
                  </Button>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

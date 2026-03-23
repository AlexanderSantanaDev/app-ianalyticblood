"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import { getAnalysis } from "@/lib/api/analysis";
import { useApiFetch } from "@/lib/api/client";
import type { AnalysisDoc } from "@/lib/api/types";
import { downloadAnalysisAsHTML } from "@/lib/api/download-analysis";
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
  /****************************************************************************************************************************/
  // Hooks
  // Hook para fetch de API
  const apiFetch = useApiFetch();
  // Hook para cargar el análisis
  useEffect(() => {
    if (!open || !analysisId) return;
    setLoading(true);
    setError(null);
    getAnalysis(apiFetch, analysisId)
      .then((res) => {
        // La API devuelve ApiSuccess<AnalysisDoc>, extraemos .data
        setData(res.data);
      })
      .catch((err) => {
        console.error("Error fetching analysis:", err);
        setError(err.message || "Error al cargar el análisis");
      })
      .finally(() => setLoading(false));
  }, [open, analysisId]);
  /****************************************************************************************************************************/
  // Badge de alerta
  const alertBadge = data ? getAlertBadge(data.overview.alert_level) : null;
  // Icono de alerta
  const AlertIcon = alertBadge?.icon;
  /****************************************************************************************************************************/
  // Métodos
  /** Handler para descargar análisis como HTML/PDF. */
  const handleDownload = () => {
    if (!data) return;
    downloadAnalysisAsHTML(data);
  };
  /****************************************************************************************************************************/
  // JSX
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0 overflow-hidden">
        {/* Header. */}
        <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">Detalle del análisis</DialogTitle>
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
              <Badge variant="outline" className={`${alertBadge.className} gap-1.5 px-3 py-1`}>
                <AlertIcon className="h-3.5 w-3.5" />
                {alertBadge.label}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-120px)]">
          <div className="px-6 py-5 space-y-6">
            {/* Loading skeleton */}
            {loading && (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 text-destructive">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Contenido del análisis. */}
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
                    <span className="text-xs text-muted-foreground">Estado:</span>
                    <span className="text-xs font-medium">{data.overview.general_state}</span>
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
                            <span className="text-xs font-medium truncate max-w-[60%]">{name}</span>
                            <span
                              className={`text-xs font-semibold ${getParamStatusColor(
                                param.status,
                              )}`}
                            >
                              {getParamStatusLabel(param.status)}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold">
                              {param.value !== null ? param.value : "—"}
                            </span>
                            {param.unit && (
                              <span className="text-xs text-muted-foreground">{param.unit}</span>
                            )}
                          </div>
                          {param.reference_range && (
                            <p className="text-[11px] text-muted-foreground">
                              Ref: {param.reference_range[0]} — {param.reference_range[1]}{" "}
                              {param.unit}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Análisis/Interpretación */}
                {data.analysis && data.analysis.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <TrendingUp className="h-4 w-4 text-primary" />
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
                )}

                {/* Recomendaciones */}
                {data.recommendations && data.recommendations.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        Recomendaciones
                      </div>
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
                    </div>
                  </>
                )}

                {/* Botón de descarga dentro del dialog */}
                <div className="pt-2">
                  <Button onClick={handleDownload} className="w-full gradient-bg">
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

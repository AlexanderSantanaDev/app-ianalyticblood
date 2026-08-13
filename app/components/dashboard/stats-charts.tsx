"use client";

import { useMemo } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Activity, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import type { AnalysisDoc } from "@/lib/api/types";
/****************************************************************************************************************************/
/** Tipado de props del dialog. */
interface StatsChartsProps {
  analyses: AnalysisDoc[];
}

/** Helper para generar IDs de gradiente SVG válidos. */
function toGradientId(name: string): string {
  return `grad-${name
    .normalize("NFD") // descompone acentos: é → e + ́
    .replace(/[\u0300-\u036f]/g, "") // elimina los diacríticos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // sustituye espacios y símbolos por "-"
    .replace(/^-+|-+$/g, "")}`; // limpia guiones iniciales/finales
}
/****************************************************************************************************************************/
/****************************************************************************************************************************/
/** Componente de gráficos de estadísticas y tendencias */
export default function StatsCharts({ analyses }: StatsChartsProps) {
  // Procesamiento de datos para los gráficos
  const chartData = useMemo(() => {
    if (!analyses.length) return [];

    // Ordenar por fecha ascendente para la línea de tiempo
    const sorted = [...analyses].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // Obtener todos los parámetros únicos
    const allParamNames = new Set<string>();
    sorted.forEach((ana) => {
      Object.keys(ana.parameters).forEach((name) => allParamNames.add(name));
    });

    /** Mapear tendencias por parámetro. */
    const trends = Array.from(allParamNames).map((paramName) => {
      const dataPoints = sorted
        .filter((ana) => ana.parameters[paramName])
        .map((ana) => ({
          date: new Date(ana.date).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
          }),
          fullDate: new Date(ana.date).toLocaleDateString("es-ES"),
          value: ana.parameters[paramName].value,
          unit: ana.parameters[paramName].unit || "",
          status: ana.parameters[paramName].status,
          refMin: ana.parameters[paramName].reference_range?.[0] || null,
          refMax: ana.parameters[paramName].reference_range?.[1] || null,
        }));

      const lastPoint = dataPoints[dataPoints.length - 1];
      const prevPoint =
        dataPoints.length > 1 ? dataPoints[dataPoints.length - 2] : null;

      // Calcular cambio
      let changeType: "up" | "down" | "stable" = "stable";
      if (prevPoint && lastPoint.value !== null && prevPoint.value !== null) {
        if (lastPoint.value > prevPoint.value) changeType = "up";
        else if (lastPoint.value < prevPoint.value) changeType = "down";
      }

      return {
        name: paramName,
        data: dataPoints,
        lastValue: lastPoint.value,
        unit: lastPoint.unit,
        status: lastPoint.status,
        changeType,
        refMin: lastPoint.refMin,
        refMax: lastPoint.refMax,
      };
    });

    // Solo mostrar parámetros que tengan valores numéricos y al menos 1 punto
    return trends.filter((t) => t.lastValue !== null);
  }, [analyses]);

  if (!analyses.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
        <Activity className="h-12 w-12 mb-4 text-muted-foreground" />
        <h3 className="text-xl font-medium">No hay datos suficientes</h3>
        <p className="text-sm">
          Sube tu primer análisis para empezar a ver tendencias.
        </p>
      </div>
    );
  }

  // Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-md border border-border p-3 rounded-xl shadow-2xl">
          <p className="text-xs font-bold text-muted-foreground mb-1">
            {data.fullDate}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black gradient-text">
              {payload[0].value}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              {data.unit}
            </span>
          </div>
          {data.refMin !== null && (
            <p className="text-[10px] mt-1 text-muted-foreground italic">
              Ref: {data.refMin} - {data.refMax}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Grid de tendencias por biomarcador. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartData.map((trend) => (
          <Card
            key={trend.name}
            className="overflow-hidden border-border/50 hover:border-primary/30 
          transition-all duration-300"
          >
            <CardHeader className="pb-2 space-y-0">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    {trend.name}
                    {trend.status !== "normal" && (
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Evolución en el tiempo
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-2xl font-black">
                      {trend.lastValue}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {trend.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-end mt-1">
                    {trend.changeType === "up" ? (
                      <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
                    ) : trend.changeType === "down" ? (
                      <TrendingDown className="h-3 w-3 text-blue-500 mr-1" />
                    ) : (
                      <Minus className="h-3 w-3 text-muted-foreground mr-1" />
                    )}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        trend.status === "normal"
                          ? "text-green-500"
                          : "text-orange-500"
                      }`}
                    >
                      {trend.status}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 px-2">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend.data}>
                    <defs>
                      <linearGradient
                        id={toGradientId(trend.name)}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8b5cf6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="currentColor"
                      strokeOpacity={0.1}
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      dy={10}
                    />
                    <YAxis hide domain={["auto", "auto"]} />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{
                        stroke: "#8b5cf6",
                        strokeWidth: 1,
                        strokeDasharray: "4 4",
                      }}
                    />

                    {/* Líneas de referencia para rango normal */}
                    {trend.refMin !== null && (
                      <ReferenceLine
                        y={trend.refMin}
                        stroke="#22c55e"
                        strokeDasharray="3 3"
                        opacity={0.5}
                      />
                    )}
                    {trend.refMax !== null && (
                      <ReferenceLine
                        y={trend.refMax}
                        stroke="#ef4444"
                        strokeDasharray="3 3"
                        opacity={0.5}
                      />
                    )}

                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill={`url(#${toGradientId(trend.name)})`}
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Nota informativa */}
      <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl flex gap-3 items-start">
        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-primary">
            Interpretación de Tendencias
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Los gráficos muestran la evolución de tus biomarcadores basándose en
            los análisis cargados. Las líneas punteadas indican los límites de
            referencia estándar. Recuerda que estas tendencias son orientativas
            y deben ser validadas por un especialista.
          </p>
        </div>
      </div>
    </div>
  );
}

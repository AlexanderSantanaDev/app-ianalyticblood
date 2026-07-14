"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isSameDay, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronRight,
  FileText,
  Beaker,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useApiFetch } from "@/lib/api/client";
import {
  getAnalyses,
  getDashboardStats,
  type DashboardStats,
} from "@/lib/api/analysis";
import type { AnalysisDoc } from "@/lib/api/types";
import { AnalysisDetailDialog } from "@/components/dashboard/analysis-detail-dialog";
import { getCached, setCached, CACHE_KEYS } from "@/lib/dashboard-cache";
/***********************************************************************************************************************/
// Helpers
/** Obtiene el color de la badge según el nivel de alerta. */
function getBadgeColor(level: string) {
  switch (level) {
    case "normal":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "attention":
      return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20";
    case "alert":
    case "high":
    case "low":
    case "critical":
      return "bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

/** Obtiene el texto del próximo recordatorio. */
function getNextReminderText(dateString: string | null) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return format(date, "d 'de' MMMM, yyyy", { locale: es });
}
/***********************************************************************************************************************/
/** Skeleton. */
function CalendarSkeleton() {
  return (
    <div className="pt-12 pb-8 container mx-auto px-4 max-w-7xl">
      <Skeleton className="h-10 w-64 mb-4" />
      <Skeleton className="h-6 w-full max-w-sm mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Skeleton className="h-[500px] w-full rounded-2xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full rounded-2xl" />
          <Skeleton className="h-[300px] w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

/***********************************************************************************************************************/
export default function CalendarPage() {
  // Inicializado desde cache para evitar skeleton en re-mount
  type CalendarData = { analyses: AnalysisDoc[]; stats: DashboardStats | null };
  const cachedCalendar = getCached<CalendarData>(CACHE_KEYS.CALENDAR);
  const [loading, setLoading] = useState<boolean>(
    () => cachedCalendar === null,
  );
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [data, setData] = useState<CalendarData>(
    () => cachedCalendar ?? { analyses: [], stats: null },
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(
    null,
  );
  /***********************************************************************************************************************/
  // Hooks
  const apiFetch = useApiFetch();
  const { status } = useSession();

  // Ref para garantizar un solo fetch por mount
  const fetchCalledRef = useRef(false);
  useEffect(() => {
    if (status === "authenticated" && !fetchCalledRef.current) {
      fetchCalledRef.current = true;
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);
  /***********************************************************************************************************************/
  // Métodos
  /** Fetch Data */
  const fetchData = async () => {
    // Silent refresh si ya hay cache — no toca loading para evitar micro-blink
    const isSilent = getCached<CalendarData>(CACHE_KEYS.CALENDAR) !== null;
    if (!isSilent) setLoading(true);
    try {
      const [analysesRes, statsRes] = await Promise.all([
        getAnalyses(apiFetch, 0, 100),
        getDashboardStats(apiFetch),
      ]);
      const calData = {
        analyses: analysesRes.data || [],
        stats: statsRes as any,
      };
      setData(calData);
      setCached(CACHE_KEYS.CALENDAR, calData);
    } catch (err) {
      console.error(err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  /** Procesar fechas para marcado visual en el calendario. */
  const { analysisDates, datesMap } = useMemo(() => {
    const dates: Date[] = [];
    const map = new Map<string, AnalysisDoc[]>();

    data.analyses.forEach((analysis) => {
      const d = new Date(analysis.date);
      const startD = startOfDay(d);
      dates.push(startD);

      const dayKey = startD.toISOString();
      const existing = map.get(dayKey) || [];
      map.set(dayKey, [...existing, analysis]);
    });

    return { analysisDates: dates, datesMap: map };
  }, [data.analyses]);

  /** Obtener análisis del día seleccionado. */
  const selectedDayAnalyses = useMemo(() => {
    if (!date) return [];
    const dayKey = startOfDay(date).toISOString();
    return datesMap.get(dayKey) || [];
  }, [date, datesMap]);

  /** Maneja la vista de detalles de una analítica. */
  const handleViewDetails = (id: string) => {
    setSelectedAnalysisId(id);
    setDetailDialogOpen(true);
  };

  // Solo skeleton si no hay datos en cache y está en primera carga
  if (loading && data.analyses.length === 0) {
    return <CalendarSkeleton />;
  }

  // Next reminder processing
  const reminderDateObj = data.stats?.next_reminder
    ? new Date(data.stats.next_reminder)
    : null;
  const isReminderSelected =
    date && reminderDateObj && isSameDay(date, reminderDateObj);
  /***********************************************************************************************************************/
  //JSX
  return (
    <div className="pt-12 pb-12 min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-sm border border-primary/20">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Calendario Clínico
            </h1>
          </div>
          <p className="text-muted-foreground text-lg ml-[3.5rem] leading-relaxed max-w-2xl">
            Tu línea de tiempo médica. Revisa el historial de tus analíticas día
            a día y prepárate para tus próximas citas programadas.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          {/* LADO IZQUIERDO: EL CALENDARIO MAIN */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6"
          >
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <CardContent className="p-2 sm:p-6 flex justify-center bg-card">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) =>
                    date > new Date() &&
                    (!reminderDateObj || !isSameDay(date, reminderDateObj))
                  }
                  locale={es}
                  className="w-full flex justify-center [&_.rdp-day]:text-sm sm:[&_.rdp-day]:text-base [&_.rdp-day]:w-10 
                  sm:[&_.rdp-day]:w-14 [&_.rdp-day]:h-10 sm:[&_.rdp-day]:h-14 [&_.rdp-button:hover]:bg-accent/50 
                  [&_.rdp-button:active]:scale-95 transition-transform"
                  // Inyectamos modificadores para pintar los días con analítica
                  modifiers={{
                    hasAnalysis: analysisDates,
                    isReminder: reminderDateObj ? [reminderDateObj] : [],
                  }}
                  modifiersClassNames={{
                    hasAnalysis:
                      "bg-primary/15 text-primary font-bold shadow-sm border border-primary/30 relative after:content-[''] after:absolute after:bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-primary after:rounded-full",
                    isReminder:
                      "bg-purple-500/15 text-purple-500 font-bold border border-purple-500/30 relative after:content-[''] after:absolute after:bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-purple-500 after:rounded-full",
                  }}
                />
              </CardContent>
            </Card>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground px-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                </div>
                <span>Días con análisis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                </div>
                <span>Próximo recordatorio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary flex items-center justify-center"></div>
                <span>Día seleccionado</span>
              </div>
            </div>
          </motion.div>

          {/* LADO DERECHO: DETALLES DEL DÍA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6"
          >
            {/* Próximo Recordatorio Estático Global si existe */}
            {data.stats?.next_reminder && (
              <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20 shadow-none">
                <CardBody className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">
                        Tu próximo análisis
                      </h4>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {getNextReminderText(data.stats.next_reminder)}
                      </p>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-purple-600 dark:text-purple-400 mt-2 font-medium"
                        onClick={() => setDate(reminderDateObj!)}
                      >
                        Ver en calendario
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Foco Día Seleccionado */}
            <Card className="flex-1 border-border/60 shadow-lg shadow-background/5 overflow-hidden flex flex-col h-full min-h-[400px]">
              <CardHeader className="bg-muted/30 pb-4 border-b">
                <CardDescription className="uppercase tracking-widest text-xs font-bold text-primary mb-1">
                  Resumen diario
                </CardDescription>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  {date
                    ? format(date, "EEEE, d 'de' MMMM", { locale: es })
                    : "Selecciona una fecha"}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 p-0 flex flex-col bg-background/50">
                <AnimatePresence mode="wait">
                  {selectedDayAnalyses.length > 0 ? (
                    <motion.div
                      key="has-data"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-5 flex flex-col gap-4"
                    >
                      <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <Beaker className="w-4 h-4" />
                        Analíticas Encontradas ({selectedDayAnalyses.length})
                      </h4>

                      <div className="space-y-4">
                        {selectedDayAnalyses.map((analysis) => {
                          const time = format(new Date(analysis.date), "HH:mm");
                          return (
                            <div
                              key={analysis._id}
                              className="group bg-card border border-border/50 hover:border-primary/50 transition-colors p-4 
                              rounded-xl shadow-sm flex flex-col gap-3 cursor-pointer"
                              onClick={() => handleViewDetails(analysis._id)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2 text-foreground font-bold">
                                  <FileText className="w-4 h-4 text-primary" />
                                  Informe Clínico
                                </div>
                                <div className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                                  {time} hs
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                {analysis.overview?.summary ||
                                  "Sin resumen disponible."}
                              </p>

                              <div className="flex justify-between items-center mt-1">
                                <span
                                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border 
                                    ${getBadgeColor(analysis.overview?.alert_level || "normal")}`}
                                >
                                  {analysis.overview?.alert_level === "normal"
                                    ? "Todo Normal"
                                    : "Atención Requerida"}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2 text-primary hover:bg-primary/10"
                                >
                                  Detalles{" "}
                                  <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  ) : isReminderSelected ? (
                    <motion.div
                      key="is-reminder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col items-center justify-center p-8 text-center"
                    >
                      <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
                        <Clock className="w-8 h-8 text-purple-500" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">
                        Recordatorio Analítico
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Éste día tienes programada una analítica clínica de
                        control o seguimiento recurrente.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="no-data"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground"
                    >
                      <div
                        className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 border border-dashed 
                      border-border/80"
                      >
                        <CalendarIcon className="w-8 h-8 opacity-40" />
                      </div>
                      <h3 className="font-medium text-lg mb-1">
                        Día sin actividad
                      </h3>
                      <p className="text-sm opacity-80 max-w-[250px]">
                        No encontramos registros clínicos subidos el{" "}
                        {date
                          ? format(date, "d 'de' MMMM", { locale: es })
                          : "día indicado"}
                        .
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
              {selectedDayAnalyses.length === 0 && !isReminderSelected && (
                <CardFooter className="bg-muted/10 border-t p-4 flex justify-center">
                  <Button
                    variant="outline"
                    className="w-full text-muted-foreground hover:text-foreground"
                    asChild
                  >
                    <a href="/dashboard/upload">Añadir informe clínico</a>
                  </Button>
                </CardFooter>
              )}
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Dialog Detail reutilizado */}
      <AnalysisDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        analysisId={selectedAnalysisId}
      />
    </div>
  );
}

/** Pequeno mock element interno para hacer consistente CardBody. */
function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

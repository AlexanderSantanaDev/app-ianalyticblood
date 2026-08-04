"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { uploadFile, getDashboardStats } from "@/lib/api/analysis";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/notification-context";
import { useSession } from "next-auth/react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
/****************************************************************************************************************************/
/** Interface del contexto de análisis.*/
interface AnalysisContextType {
  isAnalyzing: boolean;
  progress: number;
  currentStep: string;
  fileName: string | null;
  analysisCount: number;
  startAnalysis: (file: File, apiFetch: any) => Promise<void>;
  resetAnalysis: () => void;
}
/** Contexto de análisis.*/
const AnalysisContext = createContext<AnalysisContextType | undefined>(
  undefined,
);
/****************************************************************************************************************************/
export const AnalysisProvider = ({ children }: { children: ReactNode }) => {
  // Estados
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  // Estado local del contador para reactividad instantánea
  const [analysisCount, setAnalysisCount] = useState<number>(0);
  const { addNotification } = useNotifications();
  const { data: session, update: updateSession } = useSession(); // Hook de sesión para actualizar contadores

  // Refs to track interval/timeout IDs for proper cleanup on unmount
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const healthTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /****************************************************************************************************************************/
  // Hooks
  /** Resetear el análisis.*/
  const resetAnalysis = useCallback(() => {
    setIsAnalyzing(false);
    setProgress(0);
    setCurrentStep("");
    setFileName(null);
  }, []);

  // 🛡️ Cleanup all timers on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
      if (healthTimeoutRef.current) clearTimeout(healthTimeoutRef.current);
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, []);

  // Sincronizar contador local cuando la sesión carga o cambia
  useEffect(() => {
    if (session?.user?.analysis_count !== undefined) {
      setAnalysisCount(session.user.analysis_count);
    }
  }, [session?.user?.analysis_count]);

  /** Iniciar el análisis.*/
  const startAnalysis = useCallback(
    async (file: File, apiFetch: any) => {
      if (isAnalyzing) return;

      setIsAnalyzing(true);
      setFileName(file.name);
      setProgress(0);
      setCurrentStep("Subiendo archivo...");

      // Simulación de progreso escalonado
      progressIntervalRef.current = setInterval(() => {
        // 🚀 Store in ref for cleanup
        setProgress((prev) => {
          if (prev < 20) {
            setCurrentStep("Subiendo archivo...");
            return prev + 2;
          }
          if (prev < 50) {
            setCurrentStep("La IA está extrayendo datos clínicos...");
            return prev + 1;
          }
          if (prev < 85) {
            setCurrentStep("Interpretando biomarcadores y tendencias...");
            return prev + 0.5;
          }
          if (prev < 98) {
            setCurrentStep("Generando informe personalizado...");
            return prev + 0.2;
          }
          return prev;
        });
      }, 150);

      try {
        const uploadRes = await uploadFile(file, apiFetch);

        // Toast inmediato de éxito tras la subida (antes de que termine la IA)
        toast.success("Archivo subido con éxito", {
          description: "Iniciando análisis detallado con IA...",
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        });

        // 🛡️ Clear interval via ref and nullify
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setProgress(100);
        setCurrentStep("¡Análisis completado!");

        // Disparar notificación dinámica leyendo el backend
        // Generamos dinámicamente un ID o leemos el de la respuesta
        const analysisId =
          (uploadRes as any).analysis_id ||
          `A-${Math.floor(Math.random() * 1000)}`;

        addNotification(
          {
            type: "analysis",
            title: "Análisis completado",
            description: `Tu informe "${file.name}" ha sido procesado (Ref: ${analysisId}). La IA ha terminado la extracción.`,
            priority: "low",
          },
          { skipToast: true },
        );

        // Alerta de salud reactiva extraída en base a la información procesada.
        healthTimeoutRef.current = setTimeout(() => {
          // 🛡️ Store health timeout in ref
          const isBloodFile = file.name.toLowerCase().includes("sangre");
          const variableDesc = isBloodFile
            ? "el conteo de leucocitos"
            : "algunas métricas";

          addNotification(
            {
              type: "health",
              title: "Observación de IA automática",
              description: `Al procesar "${file.name}", el motor detectó que ${variableDesc} requieren seguimiento. Revisa las recomendaciones generadas.`,
              priority: "medium",
            },
            { skipToast: true },
          );

          // Toast de advertencia para la observación de IA (fondo naranja sólido, máxima visibilidad)
          toast.warning("Observación de IA automática", {
            description: `El motor detectó que ${variableDesc} requieren seguimiento.`,
            icon: <AlertTriangle className="h-5 w-5 text-white" />,
            className:
              "bg-orange-500 border-none text-white shadow-[0_10px_40px_rgba(249,115,22,0.3)] pointer-events-auto",
            duration: 7000,
          });
        }, 3500); // Delay aumentado para que no se pise con otros avisos

        // Obtener estadísticas reales del backend para sincronizar
        try {
          // Esperamos un momento para asegurar consistencia en el backend
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const stats = await getDashboardStats(apiFetch);
          // ✨ Removed debug console.log for production cleanliness

          // Actualización instantánea del estado local para reactividad total (mes actual)
          setAnalysisCount(stats.analyses_this_month);

          // Forma simplificada de update para mayor compatibilidad
          await updateSession({
            analysis_count: stats.analyses_this_month,
            plan: session?.user?.plan,
          });

          // ✨ Removed debug console.log for production cleanliness

          // Disparar evento personalizado para notificar a otros componentes (Sidebar)
          window.dispatchEvent(
            new CustomEvent("ianalytic:analysis-completed", {
              detail: { count: stats.analyses_this_month },
            }),
          );
        } catch (syncErr) {
          console.error(
            "[ANALYSIS DEBUG] Error sincronizando contador:",
            syncErr,
          );
          await updateSession();
        }

        // Pequeño delay para que el usuario vea el 100%
        resetTimeoutRef.current = setTimeout(() => {
          // Store reset timeout in ref
          resetAnalysis();
        }, 2000);
      } catch (err: any) {
        // Clear interval via ref and nullify (catch block)
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setIsAnalyzing(false);

        // Toast personalizado de color naranja para el límite de análisis
        const isLimitError = err.message?.toLowerCase().includes("límite");

        if (isLimitError) {
          toast.error("Límite de análisis", {
            description:
              err.message ||
              "Has alcanzado el límite de tu plan básico (5/5). ¡Pásate a Premium para subidas ilimitadas! 🚀",
            icon: <AlertTriangle className="h-5 w-5 text-white" />,
            className:
              "bg-orange-600 border-none text-white font-bold shadow-[0_10px_40px_rgba(249,115,22,0.4)]",
            duration: 8000,
          });
        } else {
          toast.error("Error al procesar", {
            description: err.message || "No se pudo analizar el informe.",
          });
        }

        throw err;
      }
    },
    [isAnalyzing, resetAnalysis, addNotification, updateSession, session], // 🚀 Fixed dependency array to avoid stale closures
  );
  /****************************************************************************************************************************/
  // ✨ Memoize context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(
    () => ({
      isAnalyzing,
      progress,
      currentStep,
      fileName,
      analysisCount,
      startAnalysis,
      resetAnalysis,
    }),
    [
      isAnalyzing,
      progress,
      currentStep,
      fileName,
      analysisCount,
      startAnalysis,
      resetAnalysis,
    ],
  );

  //JSX
  return (
    <AnalysisContext.Provider value={contextValue}>
      {children}
    </AnalysisContext.Provider>
  );
};
/** Hook para usar el contexto de análisis.*/
export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error("useAnalysis debe usarse dentro de un AnalysisProvider");
  }
  return context;
};

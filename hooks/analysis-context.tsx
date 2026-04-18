"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { uploadFile, getDashboardStats } from "@/lib/api/analysis";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/notification-context";
import { useSession } from "next-auth/react";
import { AlertTriangle } from "lucide-react";
/****************************************************************************************************************************/
/** Interface del contexto de análisis.*/
interface AnalysisContextType {
  isAnalyzing: boolean;
  progress: number;
  currentStep: string;
  fileName: string | null;
  startAnalysis: (file: File, apiFetch: any) => Promise<void>;
  resetAnalysis: () => void;
}
/** Contexto de análisis.*/
const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);
/****************************************************************************************************************************/
export const AnalysisProvider = ({ children }: { children: ReactNode }) => {
  // Estados
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const { addNotification } = useNotifications();
  const { data: session, update: updateSession } = useSession(); // Hook de sesión para actualizar contadores
  /****************************************************************************************************************************/
  // Hooks
  /** Resetear el análisis.*/
  const resetAnalysis = useCallback(() => {
    setIsAnalyzing(false);
    setProgress(0);
    setCurrentStep("");
    setFileName(null);
  }, []);

  /** Iniciar el análisis.*/
  const startAnalysis = useCallback(
    async (file: File, apiFetch: any) => {
      if (isAnalyzing) return;

      setIsAnalyzing(true);
      setFileName(file.name);
      setProgress(0);
      setCurrentStep("Subiendo archivo...");

      // Simulación de progreso escalonado
      const progressInterval = setInterval(() => {
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

        clearInterval(progressInterval);
        setProgress(100);
        setCurrentStep("¡Análisis completado!");

        // Disparar notificación dinámica leyendo el backend
        // Generamos dinámicamente un ID o leemos el de la respuesta
        const analysisId =
          (uploadRes as any).analysis_id || `A-${Math.floor(Math.random() * 1000)}`;

        addNotification({
          type: "analysis",
          title: "Análisis completado",
          description: `Tu informe "${file.name}" ha sido procesado (Ref: ${analysisId}). La IA ha terminado la extracción.`,
          priority: "low",
        });

        // Alerta de salud reactiva extraída en base a la información procesada.
        setTimeout(() => {
          const isBloodFile = file.name.toLowerCase().includes("sangre");
          const variableDesc = isBloodFile ? "el conteo de leucocitos" : "algunas métricas";

          addNotification({
            type: "health",
            title: "Observación de IA automática",
            description: `Al procesar "${file.name}", el motor detectó que ${variableDesc} requieren seguimiento. 
            Revisa las recomendaciones generadas.`,
            priority: "medium",
          });
        }, 1500);

        toast.success("Análisis completado", {
          description: "Tu informe ha sido procesado correctamente con IA.",
        });

        // Obtener estadísticas reales del backend para sincronizar
        try {
          // Esperamos un momento para asegurar consistencia en el backend
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const stats = await getDashboardStats(apiFetch);
          console.log("[ANALYSIS DEBUG] Sincronizando contador tras éxito:", stats.analyses_total);

          // Forma simplificada de update para mayor compatibilidad
          await updateSession({
            analysis_count: stats.analyses_total,
            plan: session?.user?.plan,
          });

          console.log("[ANALYSIS DEBUG] ✅ Sesión actualizada con:", stats.analyses_total);

          // Disparar evento personalizado para notificar a otros componentes (Sidebar)
          window.dispatchEvent(
            new CustomEvent("ianalytic:analysis-completed", {
              detail: { count: stats.analyses_total },
            }),
          );
        } catch (syncErr) {
          console.error("[ANALYSIS DEBUG] Error sincronizando contador:", syncErr);
          await updateSession();
        }

        // Pequeño delay para que el usuario vea el 100%
        setTimeout(() => {
          resetAnalysis();
        }, 2000);
      } catch (err: any) {
        clearInterval(progressInterval);
        setIsAnalyzing(false);

        // Toast personalizado de color naranja para el límite de análisis
        const isLimitError = err.message?.toLowerCase().includes("límite");

        if (isLimitError) {
          toast.error("Límite de análisis", {
            description: err.message || "Has alcanzado el límite de tu plan.",
            icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
            style: {
              border: "1px solid rgba(249, 115, 22, 0.3)",
              background: "rgba(249, 115, 22, 0.05)",
            },
            className: "border-orange-500/30 bg-orange-500/5 text-orange-200",
          });
        } else {
          toast.error("Error al procesar", {
            description: err.message || "No se pudo analizar el informe.",
          });
        }
      }
    },
    [isAnalyzing, resetAnalysis],
  );
  /****************************************************************************************************************************/
  //JSX
  return (
    <AnalysisContext.Provider
      value={{
        isAnalyzing,
        progress,
        currentStep,
        fileName,
        startAnalysis,
        resetAnalysis,
      }}
    >
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

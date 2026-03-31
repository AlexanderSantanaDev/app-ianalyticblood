"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { uploadFile } from "@/lib/api/analysis";
import { toast } from "sonner";
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
        await uploadFile(file, apiFetch);

        clearInterval(progressInterval);
        setProgress(100);
        setCurrentStep("¡Análisis completado!");

        toast.success("Análisis completado", {
          description: "Tu informe ha sido procesado correctamente con IA.",
        });

        // Pequeño delay para que el usuario vea el 100%
        setTimeout(() => {
          resetAnalysis();
        }, 2000);
      } catch (err: any) {
        clearInterval(progressInterval);
        setIsAnalyzing(false);
        toast.error("Error al procesar", {
          description: err.message || "No se pudo analizar el informe.",
        });
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

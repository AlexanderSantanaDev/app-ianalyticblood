"use client";

import { useAnalysis } from "@/hooks/analysis-context";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Beaker } from "lucide-react";
import { Progress } from "@/components/ui/progress";
/****************************************************************************************************************************/
export default function GlobalAnalysisIndicator() {
  // Contexto
  const { isAnalyzing, progress, currentStep } = useAnalysis();
  /****************************************************************************************************************************/
  //JSX
  return (
    <AnimatePresence>
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="mr-2 md:mr-4 flex items-center gap-3 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/20 backdrop-blur-md 
          shadow-lg shadow-primary/5 group transition-all hover:bg-primary/10"
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/20 blur-md rounded-full animate-pulse" />
            <div className="relative w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Beaker size={14} className="text-primary animate-bounce shadow-glow" />
            </div>
          </div>

          <div className="hidden sm:flex flex-col min-w-[120px]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">
                Procesando IA
              </span>
              <span className="text-[10px] font-bold text-primary/80">{Math.round(progress)}%</span>
            </div>
            <Progress
              value={progress}
              className="h-1 text-primary shadow-[0_0_8px_rgba(var(--primary),0.3)] bg-primary/10"
            />
          </div>

          <div className="flex sm:hidden flex-col items-center">
            <span className="text-[10px] font-bold text-primary">{Math.round(progress)}%</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

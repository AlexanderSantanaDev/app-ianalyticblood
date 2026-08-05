"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Joyride,
  STATUS,
  Step,
  TooltipRenderProps,
  EventData,
} from "react-joyride";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { motion } from "framer-motion";
/****************************************************************************************************************************/
interface TourGuideProps {
  steps: Step[];
  pageId: string;
}
/** Tooltip personalizado para el tour. */
const Tooltip = ({
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  tooltipProps,
  isLastStep,
  size,
}: TooltipRenderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-card/95 backdrop-blur-md border border-primary/30 rounded-2xl shadow-[0_0_40px_-10px_rgba(var(--primary),0.2)] 
      w-[320px] max-w-[90vw] overflow-hidden z-[9999]"
      {...tooltipProps}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {step.title}
          </h3>
          <button
            {...skipProps}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
            title="Finalizar tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="text-sm text-muted-foreground leading-relaxed mb-6">
          {step.content}
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
            {index + 1} / {size}
          </div>
          <div className="flex gap-2">
            {index > 0 && (
              <Button
                {...backProps}
                variant="outline"
                size="sm"
                className="h-8 border-border/50 text-xs gap-1"
              >
                <ChevronLeft className="w-3 h-3" />
                Atrás
              </Button>
            )}
            <Button
              {...primaryProps}
              size="sm"
              className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1"
            >
              {isLastStep ? (
                <>
                  Finalizar <Check className="w-3 h-3" />
                </>
              ) : (
                <>
                  Siguiente <ChevronRight className="w-3 h-3" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      <div className="h-1 w-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${((index + 1) / size) * 100}%` }}
        />
      </div>
    </motion.div>
  );
};

/** Componente principal del tour guide. */
export function TourGuide({ steps, pageId }: TourGuideProps) {
  const [run, setRun] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Hook para montar el componente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Hook para iniciar el tour
  useEffect(() => {
    if (!isMounted) return;

    // Verificar si el tour ya fue completado
    const tourKey = `ianalytic_tour_${pageId}`;
    const isCompleted = localStorage.getItem(tourKey);
    let timer: NodeJS.Timeout;

    // Un pequeño retraso para asegurar que el DOM esté listo
    if (!isCompleted) {
      timer = setTimeout(() => {
        setRun(true);
      }, 400); // Reducido a 400ms para que sea casi inmediato pero seguro
    }

    // Escuchar un evento custom para poder reiniciar el tour desde el Navbar o Sidebar
    const handleStartTour = () => {
      setRun(true);
    };

    window.addEventListener(`start_tour_${pageId}`, handleStartTour);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener(`start_tour_${pageId}`, handleStartTour);
    };
  }, [pageId, isMounted]);

  /** Callback que se ejecuta al finalizar el tour */
  const handleJoyrideCallback = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem(`ianalytic_tour_${pageId}`, "true");
    }
  };

  if (!isMounted) return null;

  /****************************************************************************************************************************/
  // Render
  return (
    <Joyride
      steps={steps.map((step) => ({ ...step, skipBeacon: true }))}
      run={run}
      continuous
      scrollToFirstStep
      onEvent={handleJoyrideCallback}
      tooltipComponent={Tooltip}
      styles={{
        overlay: {
          zIndex: 30,
        },
        tooltipContainer: {
          zIndex: 10000,
        },
      }}
    />
  );
}

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

/** Tipo estricto para los planes soportados. */
export type PlanType = "free" | "premium" | "enterprise";

interface PlanContextValue {
  plan: PlanType;
  setPlan: (plan: PlanType) => void;
}

const PlanContext = createContext<PlanContextValue | undefined>(undefined);
/***********************************************************************************************************************/
/** Provider del plan. */
export function PlanProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  // Inicializamos con lo que tengamos en sesión. Se puede sobreescribir con setPlan().
  const [plan, setPlanState] = useState<PlanType>("free");

  // Sincronizar con la sesión cuando cargue o cambie (p.ej. tras updateSession())
  useEffect(() => {
    if (status === "authenticated" && session?.user?.plan) {
      const sessionPlan = session.user.plan as PlanType;
      setPlanState(sessionPlan);
    }
  }, [session?.user?.plan, status]);

  /** Pueden llamar páginas como subscription para actualizar globalmente. */
  const setPlan = (newPlan: PlanType) => {
    setPlanState(newPlan);
  };

  return (
    <PlanContext.Provider value={{ plan, setPlan }}>
      {children}
    </PlanContext.Provider>
  );
}

/***********************************************************************************************************************/
/** Hook de consumo del plan global */
export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) {
    throw new Error("usePlan debe usarse dentro de <PlanProvider>");
  }
  return ctx;
}

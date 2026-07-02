"use client";

import { createContext, useContext, useState, useMemo, ReactNode } from "react";
/****************************************************************************************************************************/
interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Memoizar el valor del contexto para evitar re-renders innecesarios en todos los consumers
  const contextValue = useMemo(
    () => ({ isLoading, setIsLoading }),
    [isLoading],
  );
  /****************************************************************************************************************************/
  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
};

/** Hook para usar el contexto de carga.  */
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

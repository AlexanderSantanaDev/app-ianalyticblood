"use client";

import { useApiFetch } from "./client";
/***********************************************************************************************************************/
export function useSubscriptionApi() {
  // Hooks
  const apiFetch = useApiFetch();
  /***********************************************************************************************************************/
  // Métodos
  /** Inicia el flujo de Stripe Checkout */
  const createCheckoutSession = async (plan: string) => {
    return await apiFetch<{ url: string }>(
      `/subscription/create-checkout?plan=${plan}`,
      {
        method: "POST",
      },
    );
  };

  /** Inicia el flujo del Portal del Cliente de Stripe */
  const createCustomerPortal = async () => {
    return await apiFetch<{ url: string }>("/subscription/customer-portal", {
      method: "POST",
    });
  };

  /** Sincroniza el estado de la suscripción con Stripe */
  const syncSubscription = async () => {
    // Ahora el backend devuelve { status, plan? } para detectar degradación
    return await apiFetch<{ status: string; plan?: string }>(
      "/subscription/sync",
      {
        method: "GET",
      },
    );
  };

  /***********************************************************************************************************************/
  return {
    createCheckoutSession,
    createCustomerPortal,
    syncSubscription,
  };
}

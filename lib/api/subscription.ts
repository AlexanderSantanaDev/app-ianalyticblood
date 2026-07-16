"use client";

import { useApiFetch } from "./client";

/***********************************************************************************************************************/
/** Tipos de respuesta para las operaciones de suscripción. */
export type CancelSubscriptionResponse = {
  status: string;
  message: string;
  cancel_at_period_end: boolean;
  current_period_end?: number | null;
};

export type ReactivateSubscriptionResponse = {
  status: string;
  message: string;
  cancel_at_period_end: boolean;
};

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
    // El backend devuelve { status, plan? } para detectar degradación
    return await apiFetch<{ status: string; plan?: string }>(
      "/subscription/sync",
      {
        method: "GET",
      },
    );
  };

  /** Cancela la suscripción al final del periodo (no de inmediato). */
  const cancelSubscription = async (): Promise<CancelSubscriptionResponse> => {
    return await apiFetch<CancelSubscriptionResponse>("/subscription/cancel", {
      method: "POST",
    });
  };

  /** Reactiva una suscripción con cancelación pendiente. */
  const reactivateSubscription =
    async (): Promise<ReactivateSubscriptionResponse> => {
      return await apiFetch<ReactivateSubscriptionResponse>(
        "/subscription/reactivate",
        {
          method: "POST",
        },
      );
    };

  /***********************************************************************************************************************/
  return {
    createCheckoutSession,
    createCustomerPortal,
    syncSubscription,
    cancelSubscription, // ✨ Nuevo
    reactivateSubscription, // ✨ Nuevo
  };
}

"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

import { motion } from "framer-motion";
import {
  CreditCard,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Building2,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  AlertCircle,
  Crown,
} from "lucide-react";
import { useUserApi } from "@/lib/api/user";
import { useSubscriptionApi } from "@/lib/api/subscription";
import { User as UserType } from "@/lib/api/types";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/***********************************************************************************************************************/
/** Componente de Contenido de Suscripción (Separado para poder usar Suspense) */
function SubscriptionContent() {
  // Estados
  const { data: session, status: authStatus, update: updateSession } = useSession();
  const { getMe } = useUserApi();
  const { createCheckoutSession, createCustomerPortal, syncSubscription } = useSubscriptionApi();
  const [profile, setProfile] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const searchParams = useSearchParams();
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  /***********************************************************************************************************************/
  // Métodos
  /** Función maestra de sincronización con motor de reintentos inteligente */
  const performSync = async (isManual = false) => {
    if (isSyncing || authStatus !== "authenticated") return; // No sincronizar si no hay sesión lista
    setIsSyncing(true);

    //  Motor de reintentos más potente (Stripe)
    const MAX_RETRIES = isManual ? 1 : 5;
    let currentRetry = 0;

    const promise = new Promise(async (resolve, reject) => {
      const attemptSync = async () => {
        try {
          // Si es automático, esperamos un poco más para que los webhooks terminen de dispararse
          if (currentRetry === 0 && !isManual) {
            await new Promise((r) => setTimeout(r, 1500));
          }

          console.log(`🛰️ Intento de sincronización ${currentRetry + 1}/${MAX_RETRIES}...`);
          const data = await syncSubscription();
          console.log("✅ Respuesta del backend:", data);

          if (data.status === "success") {
            // ¡Éxito total! Activamos visuales y forzamos recarga
            setShowSuccess(true);

            // Obtenemos el perfil fresco del backend para sincronizar datos reales
            const freshProfile = await getMe();
            setProfile(freshProfile);

            // Forzamos la actualización atómica del JWT de NextAuth
            // Pasamos el plan en múltiples niveles para asegurar que el callback jwt lo capture
            await updateSession({
              ...session,
              plan: freshProfile.plan,
              user: {
                ...session?.user,
                plan: freshProfile.plan,
              },
            });

            console.log("💎 Sesión actualizada a:", freshProfile.plan);

            // Delay controlado para que la rotación de cookies de NextAuth termine
            setTimeout(() => {
              window.location.href = "/dashboard/subscription";
            }, 2500);

            resolve(data);
            return true;
          } else if (data.status === "no_change" && currentRetry < MAX_RETRIES - 1) {
            currentRetry++;
            console.log("⏳ No detectado aún. Reintentando en 3s...");
            await new Promise((r) => setTimeout(r, 3000));
            return await attemptSync();
          } else {
            if (isManual || currentRetry >= MAX_RETRIES - 1) {
              reject(
                new Error("No se detectó el pago en Stripe aún. Prueba de nuevo en unos segundos."),
              );
            } else {
              resolve(data);
            }
            return false;
          }
        } catch (err: any) {
          console.error("❌ Error en sincronización:", err);
          reject(err);
          return false;
        }
      };

      await attemptSync();
    });

    toast.promise(promise, {
      loading: isManual ? "Sincronizando pago..." : "Verificando tu membresía Premium...",
      success: "¡Membresía Premium activada! Refrescando... 💎",
      error: (err) => `Sincronización: ${err.message || "Inténtalo de nuevo"}`,
    });

    try {
      await promise;
    } catch (e) {
      // Manejado por toast
    } finally {
      setIsSyncing(false);
    }
  };

  /***********************************************************************************************************************/
  // Sincronización automática al volver de Stripe
  useEffect(() => {
    const success = searchParams.get("success");
    // Solo disparamos si la sesión está cargada y validada
    if (success === "true" && authStatus === "authenticated" && !isSyncing && !showSuccess) {
      performSync(false);
      // Limpiamos la URL para evitar re-fuegos al recargar manualmente
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams, authStatus]);

  // Hooks para cargar datos iniciales
  const fetchProfile = async () => {
    if (authStatus !== "authenticated") return;
    try {
      const data = await getMe();
      setProfile(data);
    } catch (error) {
      console.error("Error al cargar suscripción:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [authStatus]); // Recargar si la sesión cambia

  if (isLoading || authStatus === "loading") {
    return <SubscriptionSkeleton />;
  }

  const currentPlan = profile?.plan || "free";
  const usageLimit = currentPlan === "free" ? 5 : Infinity;
  // Usar campo analysis_count ahora que está tipado en User
  const currentUsage = profile?.analysis_count ?? 0;
  const progressValue = usageLimit === Infinity ? 100 : (currentUsage / usageLimit) * 100;

  /***********************************************************************************************************************/
  // Métodos de Pago
  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    setShowUpgradeDialog(true);
  };

  /** Confirmar upgrade */
  const confirmUpgrade = async () => {
    if (!selectedPlan) return;
    setIsUpgrading(true);
    try {
      const res = await createCheckoutSession(selectedPlan);
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (error) {
      toast.error("Hubo un problema al conectar con la pasarela de pagos.");
    } finally {
      setIsUpgrading(false);
    }
  };

  /** Gestionar suscripción */
  const handleManageSubscription = async () => {
    try {
      toast.loading("Accediendo al portal de pagos...", { duration: 1500 });
      const res = await createCustomerPortal();
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (error) {
      toast.error("No se pudo acceder al portal de facturación.");
    }
  };

  /***********************************************************************************************************************/
  //JSX
  return (
    <div className="pt-8 pb-12 min-h-[calc(100dvh-4rem)] relative">
      {/* Overlay de éxito durante la sincronización final */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-xl flex flex-col items-center justify-center 
          p-6 text-center"
        >
          <motion.div
            initial={{ scale: 0.5, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6 border-2 border-primary/50 
            shadow-[0_0_40px_rgba(var(--primary-rgb),0.3)]"
          >
            <Crown className="w-12 h-12 text-primary fill-primary animate-pulse" />
          </motion.div>
          <h2 className="text-4xl font-black gradient-text mb-4 uppercase tracking-tighter">
            ¡Bienvenido a Premium!
          </h2>
          <p className="text-muted-foreground text-lg max-w-md">
            Tu cuenta ha sido elevada al siguiente nivel. Estamos preparando tu nuevo panel de
            control...
          </p>
          <div className="mt-8 flex items-center gap-2 text-primary font-bold animate-pulse">
            <Sparkles className="w-5 h-5" />
            <span>Sincronizando privilegios...</span>
          </div>
        </motion.div>
      )}

      <div className="container mx-auto px-4 max-w-6xl w-full">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-sm border border-primary/20">
              <CreditCard className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Mi Suscripción</h1>
          </div>
          <p className="text-muted-foreground text-lg ml-[3.5rem] max-w-2xl">
            Gestiona tus planes, límites de análisis y facturación desde un solo lugar.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel Plan Actual (Izquierda) */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card
                className="border-primary/20 bg-gradient-to-br from-card to-primary/5 shadow-xl relative overflow-hidden 
              group"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Sparkles className="w-32 h-32 text-primary" />
                </div>
                <CardHeader className="pb-2">
                  <Badge
                    variant="outline"
                    className="w-fit mb-2 bg-primary/10 text-primary border-primary/20 uppercase tracking-widest text-[10px]"
                  >
                    Plan Activo
                  </Badge>
                  <CardTitle className="text-3xl font-black gradient-text uppercase">
                    {currentPlan === "free" ? "Básico" : currentPlan}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4" />
                    Renovación el 24 de Abril, 2026
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                  {/* Banner de ayuda si el usuario cree que pagó pero sigue en Básico */}
                  {currentPlan === "free" && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-2">
                      <p className="text-[10px] text-amber-600 font-medium mb-2 leading-tight">
                        ¿Has pagado pero sigues viendo el plan Básico?
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-8 text-[10px] border-amber-500/30 text-amber-700 hover:bg-amber-500/10"
                        onClick={() => performSync(true)}
                        disabled={isSyncing}
                      >
                        {isSyncing ? "Sincronizando..." : "Sincronizar Pago Manualmente"}
                      </Button>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm items-end">
                      <span className="font-medium text-foreground">Uso de análisis</span>
                      <span className="text-muted-foreground">
                        <span className="font-bold text-foreground">{currentUsage}</span>
                        {usageLimit === Infinity ? " / ∞" : ` / ${usageLimit}`}
                      </span>
                    </div>
                    <Progress value={progressValue} className="h-2.5 bg-muted">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${progressValue}%` }}
                      />
                    </Progress>
                    <p className="text-[11px] text-muted-foreground text-center">
                      Tu límite se reiniciará el próximo periodo de facturación.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 pt-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground w-full">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    Pagos seguros gestionados por Stripe
                  </div>
                  {currentPlan !== "free" && (
                    <Button
                      variant="outline"
                      className="w-full text-xs hover:bg-primary/10"
                      onClick={handleManageSubscription}
                    >
                      Gestionar Facturación
                      <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                  )}
                  {currentPlan === "free" && (
                    <Button
                      variant="ghost"
                      className="w-full text-xs hover:bg-primary/10"
                      onClick={() =>
                        (document.getElementById("plan-selection") as HTMLElement).scrollIntoView({
                          behavior: "smooth",
                        })
                      }
                    >
                      Ver beneficios de otros planes
                      <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>

            {/* Quick Status / Ads */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm flex items-start gap-4"
            >
              <div className="p-3 bg-secondary/20 rounded-xl text-secondary">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm mb-1">Ahorra con el plan anual</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Cambia a facturación anual y obtén un 20% de descuento inmediato en todos los
                  planes Premium.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Selector de Planes (Derecha) */}
          <div className="lg:col-span-2 space-y-8" id="plan-selection">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
              <div>
                <h2 className="text-2xl font-bold mb-2">Potencia tu salud</h2>
                <p className="text-muted-foreground text-sm">
                  Desbloquea el análisis de IA avanzado y el historial ilimitado.
                </p>
              </div>

              {/* Toggle Billing Period con Tabs */}
              <Tabs
                value={billingPeriod}
                onValueChange={(val) => setBillingPeriod(val as "monthly" | "yearly")}
                className="w-fit"
              >
                <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1">
                  <TabsTrigger value="monthly" className="text-xs rounded-md">
                    Mensual
                  </TabsTrigger>
                  <TabsTrigger
                    value="yearly"
                    className="text-xs rounded-md flex items-center gap-1.5"
                  >
                    Anual
                    <Badge className="bg-primary/20 text-primary border-none text-[8px] h-4 px-1">
                      -20%
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </motion.div>

            {/* Plan Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Premium Plan Card */}
              <motion.div
                whileHover={{ y: -5 }}
                className={`relative p-6 rounded-3xl border-2 transition-all ${
                  currentPlan === "premium"
                    ? "border-primary bg-primary/5 shadow-xl shadow-primary/10"
                    : "border-border/60 bg-card hover:border-primary/40 shadow-sm"
                }`}
              >
                {currentPlan === "premium" && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white py-1 px-4 rounded-full 
                  text-[10px] font-black uppercase tracking-widest shadow-lg"
                  >
                    Tu plan actual
                  </div>
                )}
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black">
                      {billingPeriod === "monthly" ? "€9.99" : "€7.99"}
                    </span>
                    <span className="text-muted-foreground text-xs block">/ mes + IVA</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Premium Individual</h3>
                <p className="text-xs text-muted-foreground mb-6 h-8 leading-tight">
                  Para quienes se toman en serio su bienestar con análisis ilimitados y detallados.
                </p>

                <ul className="space-y-3 mb-8">
                  {[
                    "Análisis ilimitados",
                    "Interpretación avanzada de IA",
                    "Historial completo de salud",
                    "Recomendaciones nutricionales",
                    "Soporte prioritario 24/7",
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-xs text-foreground/80">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full rounded-2xl h-12 transition-all font-bold ${
                    currentPlan === "premium"
                      ? "bg-muted text-muted-foreground"
                      : "gradient-bg hover:opacity-90 shadow-md shadow-primary/20"
                  }`}
                  disabled={currentPlan === "premium" || isUpgrading}
                  onClick={() => handleUpgrade("premium")}
                >
                  {currentPlan === "premium" ? "Plan Actual" : "Mejorar a Premium"}
                </Button>
              </motion.div>

              {/* Enterprise / Clínicas Plan Card */}
              <motion.div
                whileHover={{ y: -5 }}
                className="p-6 rounded-3xl border border-border/60 border-dashed bg-card hover:border-secondary/40 
                shadow-sm transition-all"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black">Personalizado</span>
                    <span className="text-muted-foreground text-xs block">Clínicas y Lab</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Plan Enterprise</h3>
                <p className="text-xs text-muted-foreground mb-6 h-8 leading-tight">
                  Integración vía API para laboratorios y panel multi-paciente.
                </p>

                <ul className="space-y-3 mb-8">
                  {[
                    "Panel para 50+ usuarios",
                    "Acceso a la API REST",
                    "Personalización de informes",
                    "Exportación masiva de datos",
                    "Account Manager dedicado",
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-xs text-foreground/80">
                      <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <Button
                  variant="outline"
                  className="w-full rounded-2xl h-12 border-secondary/50 text-secondary hover:bg-secondary/10 font-bold"
                  onClick={() => handleUpgrade("enterprise")}
                  disabled={currentPlan === "enterprise"}
                >
                  Contactar Ventas
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Confirmation Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-[440px] rounded-3xl overflow-hidden border-none shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-card -z-10" />
          <DialogHeader className="pt-4">
            <div
              className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 
            border border-primary/20"
            >
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center">
              Confirmar suscripción {selectedPlan?.toUpperCase()}
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground pt-1">
              Estás a punto de desbloquear todo el potencial de tu salud con IAnalytic Blood.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 px-4 space-y-4">
            <div className="bg-muted/40 p-4 rounded-2xl border border-border/50">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Plan seleccionado</span>
                <span className="font-bold uppercase tracking-wider">{selectedPlan}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground"> Ciclo de facturación</span>
                <span className="font-bold">
                  {billingPeriod === "monthly" ? "Mensual" : "Anual"}
                </span>
              </div>
              <div className="border-t border-border/50 my-2 pt-2 flex justify-between items-center">
                <span className="font-bold">Total a pagar ahora</span>
                <span className="text-xl font-black text-primary">
                  {billingPeriod === "monthly" ? "€9.99" : "€95.90"}
                </span>
              </div>
            </div>
            <div
              className="flex items-center gap-3 py-2 px-3 bg-amber-500/5 text-amber-500 rounded-xl border 
            border-amber-500/10"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-[10px] leading-tight text-amber-600 font-medium">
                Al confirmar, serás redirigido a Stripe para completar el pago de forma segura.
              </p>
            </div>
          </div>

          <DialogFooter className="px-4 pb-6 flex !flex-col sm:!flex-row gap-3">
            <Button
              variant="ghost"
              className="flex-1 rounded-xl h-12"
              onClick={() => setShowUpgradeDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 gradient-bg rounded-xl h-12 shadow-md shadow-primary/20 font-bold"
              onClick={confirmUpgrade}
              disabled={isUpgrading}
            >
              {isUpgrading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Conectando...
                </div>
              ) : (
                "Ir a Pagar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Exportación Principal con Límite de Suspense (OBLIGATORIO EN NEXT.JS 15 PARA USE-SEARCH-PARAMS) */
export default function SubscriptionPage() {
  return (
    <Suspense fallback={<SubscriptionSkeleton />}>
      <SubscriptionContent />
    </Suspense>
  );
}

/***********************************************************************************************************************/
/** Skeleton de la página de suscripción. */
function SubscriptionSkeleton() {
  return (
    <div className="pt-8 pb-12 container mx-auto px-4 max-w-6xl w-full">
      <Skeleton className="h-10 w-64 mb-4" />
      <Skeleton className="h-6 w-full max-w-sm mb-12" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 border border-border/50 rounded-2xl p-6">
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-end">
            <Skeleton className="h-20 w-80" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[400px] w-full rounded-3xl" />
            <Skeleton className="h-[400px] w-full rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

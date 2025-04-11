"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface PricingCardProps {
  title: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant?: "default" | "outline";
  popular?: boolean;
  delay?: number;
}
// Componente de tarjeta de precio
const PricingCard = ({
  title,
  price,
  period,
  description,
  features,
  buttonText,
  buttonVariant = "default",
  popular = false,
  delay = 0,
}: PricingCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={`bg-card rounded-xl shadow-lg overflow-hidden border ${
        popular ? "border-primary" : "border-border"
      } h-full flex flex-col`}
    >
      {popular && (
        <div className="gradient-bg text-white text-center py-2 font-medium text-sm">
          Más popular
        </div>
      )}
      <div className="p-6 flex-grow">
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <div className="mb-4">
          <span className="text-4xl font-bold">{price}</span>
          {period && <span className="text-muted-foreground ml-2">{period}</span>}
        </div>
        <p className="text-muted-foreground mb-6">{description}</p>
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mr-3 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-6 pt-0">
        <Link href="/auth/register">
          <Button
            variant={buttonVariant}
            className={`w-full ${
              buttonVariant === "default" ? "gradient-bg hover:opacity-90 transition-opacity" : ""
            }`}
          >
            {buttonText}
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState("monthly");

  return (
    <div className="pt-32 pb-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Planes y <span className="gradient-text">precios</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Elige el plan que mejor se adapte a tus necesidades y comienza a entender tus análisis
            de sangre hoy mismo.
          </p>

          <div className="inline-flex items-center p-1 bg-muted rounded-lg">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === "monthly"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === "yearly"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Anual <span className="text-xs text-primary">-20%</span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <PricingCard
            title="Básico"
            price={billingPeriod === "monthly" ? "€0" : "€0"}
            period={billingPeriod === "monthly" ? "/mes" : "/año"}
            description="Perfecto para comenzar a entender tus análisis de sangre."
            features={[
              "5 análisis de PDF al mes",
              "Interpretación básica de resultados",
              "Visualización de datos estándar",
              "Acceso a la aplicación web",
              "Soporte por email",
            ]}
            buttonText="Comenzar gratis"
            buttonVariant="outline"
            delay={0.1}
          />

          <PricingCard
            title="Premium"
            price={billingPeriod === "monthly" ? "€9.99" : "€95.90"}
            period={billingPeriod === "monthly" ? "/mes" : "/año"}
            description="Para un seguimiento regular de tu salud con análisis detallados."
            features={[
              "Análisis ilimitados de PDF",
              "Interpretación avanzada de resultados",
              "Visualización de datos interactiva",
              "Seguimiento histórico de resultados",
              "Recomendaciones personalizadas",
              "Acceso a la aplicación móvil",
              "Soporte prioritario",
            ]}
            buttonText="Obtener Premium"
            popular={true}
            delay={0.2}
          />

          <PricingCard
            title="Empresas"
            price="Personalizado"
            description="Solución a medida para clínicas, laboratorios y profesionales de la salud."
            features={[
              "Análisis ilimitados de PDF",
              "API para integración con sistemas existentes",
              "Panel de administración para múltiples usuarios",
              "Personalización de informes",
              "Análisis estadísticos avanzados",
              "Soporte técnico dedicado",
              "Formación para el personal",
            ]}
            buttonText="Contactar ventas"
            buttonVariant="outline"
            delay={0.3}
          />
        </div>

        <div className="mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-card rounded-xl shadow-lg border border-border p-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-center">Preguntas frecuentes</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold mb-2">¿Cómo funciona el análisis de PDF?</h3>
                <p className="text-muted-foreground">
                  Nuestra tecnología de IA extrae automáticamente los datos de tu PDF de análisis de
                  sangre, los interpreta y te proporciona un informe detallado y fácil de entender.
                </p>
              </div>

              <div>
                <h3 className="font-bold mb-2">¿Es segura mi información médica?</h3>
                <p className="text-muted-foreground">
                  Absolutamente. Utilizamos encriptación de nivel bancario y cumplimos con todas las
                  normativas de protección de datos. Tu información nunca se comparte con terceros.
                </p>
              </div>

              <div>
                <h3 className="font-bold mb-2">
                  ¿Puedo cancelar mi suscripción en cualquier momento?
                </h3>
                <p className="text-muted-foreground">
                  Sí, puedes cancelar tu suscripción en cualquier momento desde tu perfil. No hay
                  compromisos a largo plazo ni penalizaciones por cancelación.
                </p>
              </div>

              <div>
                <h3 className="font-bold mb-2">¿Qué tipos de análisis de sangre puedo subir?</h3>
                <p className="text-muted-foreground">
                  Nuestro sistema es compatible con la mayoría de los formatos de análisis de sangre
                  estándar. Si tienes algún problema con un formato específico, nuestro equipo de
                  soporte estará encantado de ayudarte.
                </p>
              </div>

              <div>
                <h3 className="font-bold mb-2">¿Cómo puedo contactar con el soporte?</h3>
                <p className="text-muted-foreground">
                  Puedes contactar con nuestro equipo de soporte a través del chat en la aplicación
                  o enviando un email a soporte@analiticbold.com.
                </p>
              </div>

              <div>
                <h3 className="font-bold mb-2">
                  ¿Ofrecen descuentos para estudiantes o profesionales médicos?
                </h3>
                <p className="text-muted-foreground">
                  Sí, ofrecemos descuentos especiales para estudiantes, profesionales médicos y
                  organizaciones sin ánimo de lucro. Contacta con nuestro equipo de ventas para más
                  información.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { BookOpen, ShieldCheck, Microscope, FileText, Zap, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
/***********************************************************************************************************************/
/** Datos de las categorías de ayuda con iconos y descripciones. */
const CATEGORIES = [
  {
    title: "Primeros Pasos",
    description: "Aprende cómo subir tu primer informe y navegar por el panel.",
    icon: BookOpen,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Interpretación de Datos",
    description: "Guía sobre qué significan los biomarcadores y los insights de IA.",
    icon: Microscope,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    title: "Seguridad y Privacidad",
    description: "Cómo protegemos tus datos médicos y la gestión de tu cuenta.",
    icon: ShieldCheck,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    title: "Formatos Soportados",
    description: "Información sobre archivos PDF e imágenes aceptadas.",
    icon: FileText,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    title: "Planes y Suscripciones",
    description: "Gestión de pagos, upgrades y límites de análisis.",
    icon: Zap,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    title: "Soporte Técnico",
    description: "¿Problemas con la app? Contacta con nuestro equipo.",
    icon: HelpCircle,
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

/** Animaciones para el componente HelpCategories. */
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/** Animaciones para el componente HelpCategories. */
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

/** Componente modular para las categorías del centro de ayuda. */
export default function HelpCategories() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {CATEGORIES.map((category, index) => (
        <motion.div key={index} variants={item}>
          <Card
            className="h-full border-border/40 bg-card/40 backdrop-blur-sm hover:bg-card/60 hover:border-primary/30 
          transition-all duration-300 cursor-pointer group"
          >
            <CardContent className="p-6">
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110",
                  category.bg,
                )}
              >
                <category.icon className={cn("h-6 w-6", category.color)} />
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                {category.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {category.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

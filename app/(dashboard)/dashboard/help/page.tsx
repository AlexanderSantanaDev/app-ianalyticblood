"use client";

import { motion } from "framer-motion";
import { Search, Mail, MessageCircle, Phone, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import HelpCategories from "@/components/dashboard/help-categories";
import HelpFAQ from "@/components/dashboard/help-faq";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useChat } from "@/hooks/use-chat";
/***********************************************************************************************************************/
export default function HelpPage() {
  const { setIsOpen } = useChat();

  return (
    <div className="flex-1 space-y-12 p-8 pt-6 max-w-7xl mx-auto min-h-[100dvh]">
      {/* Hero Section con buscador integrado */}
      <section className="relative overflow-hidden rounded-3xl bg-neutral-900/40 border border-border/40 p-8 md:p-12">
        {/* Fondo decorativo con gradiente */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-extrabold tracking-tight"
          >
            ¿En qué podemos <span className="gradient-text">ayudarte</span>?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed"
          >
            Busca en nuestra base de conocimientos o explora las categorías para resolver tus dudas
            rápidamente.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-xl mx-auto"
          >
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 transition-colors 
            group-focus-within:text-primary"
            />
            <Input
              placeholder="¿Cómo interpretar los resultados...?"
              className="w-full h-14 pl-12 pr-4 rounded-2xl bg-background/50 border-border/60 focus:border-primary/50 
              focus:ring-primary/20 backdrop-blur-xl text-md transition-all shadow-xl"
            />
          </motion.div>
        </div>
      </section>

      {/* Categorías modulares */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Explorar por categorías</h2>
        </div>
        <HelpCategories />
      </section>

      {/* Tarjeta destacada - Asistente IA especializado */}
      <section>
        <Card className="relative overflow-hidden border-primary/20 bg-primary/5 backdrop-blur-sm group">
          <div className="absolute top-0 right-0 p-4">
            <ArrowUpRight
              className="h-5 w-5 text-primary/40 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 
            transition-all"
            />
          </div>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl">Pregunta a nuestra IA</CardTitle>
            </div>
            <CardDescription className="max-w-md">
              Nuestra IA no solo analiza informes, también puede ayudarte a entender cómo funciona
              iAnalytic Blood. Prueba a consultarle cualquier duda técnica.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="rounded-xl px-6 font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] 
            transition-transform"
            >
              Hablar con asistente
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Preguntas Frecuentes con acordeones */}
      <section className="bg-neutral-900/20 rounded-3xl border border-border/40 py-4">
        <HelpFAQ />
      </section>

      {/* Sección de contacto directo premium */}
      <section className="text-center space-y-8 py-10">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">¿Aún necesitas ayuda?</h2>
          <p className="text-muted-foreground">
            Estamos aquí para apoyarte en cada paso de tu salud.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Button
            variant="outline"
            className="h-14 px-8 rounded-2xl gap-3 border-border/60 hover:bg-muted/50 hover:border-primary/30 group"
          >
            <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold text-sm">Enviar Email</span>
          </Button>

          <Button
            variant="outline"
            className="h-14 px-8 rounded-2xl gap-3 border-border/60 hover:bg-muted/50 hover:border-primary/30 group"
          >
            <div className="p-1.5 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
              <MessageCircle className="h-4 w-4 text-green-500" />
            </div>
            <span className="font-semibold text-sm">WhatsApp Soporte</span>
          </Button>

          <Button
            variant="outline"
            className="h-14 px-8 rounded-2xl gap-3 border-border/60 hover:bg-muted/50 hover:border-primary/30 group"
          >
            <div className="p-1.5 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
              <Phone className="h-4 w-4 text-blue-500" />
            </div>
            <span className="font-semibold text-sm">Llamada</span>
          </Button>
        </div>
      </section>
    </div>
  );
}

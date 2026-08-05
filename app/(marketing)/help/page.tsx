"use client";

import {
  LifeBuoy,
  FileText,
  UploadCloud,
  ShieldAlert,
  Mail,
  MessageSquare,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
/****************************************************************************************************************************/
export default function HelpPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute top-20 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none opacity-50" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
              <LifeBuoy className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Centro de Ayuda
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Encuentra respuestas rápidas a tus preguntas o contacta con
              nuestro equipo de soporte para recibir asistencia personalizada.
            </p>
          </div>

          {/* Quick Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div
              className="p-6 bg-card border border-border/50 rounded-[2rem] shadow-lg shadow-black/5 flex flex-col items-center text-center 
            hover:border-primary/50 transition-colors"
            >
              <UploadCloud className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bold mb-2">Subida de Informes</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Aprende a subir tus PDFs o imágenes correctamente.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-auto rounded-xl"
              >
                Ver guía
              </Button>
            </div>
            <div
              className="p-6 bg-card border border-border/50 rounded-[2rem] shadow-lg shadow-black/5 flex flex-col items-center text-center 
            hover:border-primary/50 transition-colors"
            >
              <FileText className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bold mb-2">Entender Resultados</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Cómo interpretar los biomarcadores extraídos por la IA.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-auto rounded-xl"
              >
                Ver guía
              </Button>
            </div>
            <div
              className="p-6 bg-card border border-border/50 rounded-[2rem] shadow-lg shadow-black/5 flex flex-col items-center text-center 
            hover:border-primary/50 transition-colors"
            >
              <ShieldAlert className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bold mb-2">Privacidad y Seguridad</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Cómo protegemos tus datos médicos en todo momento.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-auto rounded-xl"
                onClick={() => (window.location.href = "/privacy")}
              >
                Ver política
              </Button>
            </div>
          </div>

          {/* FAQs Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">
              Preguntas Frecuentes (FAQ)
            </h2>
            <div className="bg-card border border-border/50 rounded-[2.5rem] p-6 md:p-10 shadow-xl shadow-black/5">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem
                  value="item-1"
                  className="border-b border-border/50"
                >
                  <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors">
                    ¿Qué formatos de archivo puedo subir?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Aceptamos documentos en formato PDF y los principales
                    formatos de imagen (JPG, PNG). Asegúrate de que el texto sea
                    legible para que nuestra IA pueda extraer los biomarcadores
                    correctamente.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="item-2"
                  className="border-b border-border/50"
                >
                  <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors">
                    ¿Cuánto tarda en analizarse un informe?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    El proceso suele tardar entre 10 y 30 segundos, dependiendo
                    de la cantidad de páginas y la complejidad del informe.
                    Durante este tiempo, la IA extrae, clasifica y analiza cada
                    métrica clínica.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="item-3"
                  className="border-b border-border/50"
                >
                  <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors">
                    ¿Es seguro subir mis análisis de sangre?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Completamente. Utilizamos cifrado de extremo a extremo y
                    protocolos de seguridad robustos. Tus datos nunca se venden
                    ni se utilizan para entrenar modelos públicos. Puedes borrar
                    tu historial en cualquier momento.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="item-4"
                  className="border-b border-border/50"
                >
                  <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors">
                    ¿El análisis por IA sustituye a mi médico?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    <strong>No.</strong> IAnalytic Blood es una herramienta
                    tecnológica de apoyo diseñada para ayudarte a entender tus
                    analíticas, pero en ningún caso sustituye el criterio,
                    diagnóstico o tratamiento de un médico cualificado.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5" className="border-none">
                  <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors">
                    ¿Cómo puedo eliminar mi cuenta y mis datos?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Puedes solicitar la eliminación total de tus datos desde la
                    sección "Perfil" de tu panel de control, o escribiéndonos
                    directamente a privacy@ianalyticblood.com.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-[2.5rem] p-8 md:p-12 text-center">
            <MessageSquare className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">¿Aún necesitas ayuda?</h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Nuestro equipo de soporte está disponible de lunes a viernes para
              resolver cualquier duda técnica o relacionada con tu suscripción.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="rounded-xl shadow-lg shadow-primary/20 gap-2"
              >
                <Mail className="w-4 h-4" />
                Contactar Soporte
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

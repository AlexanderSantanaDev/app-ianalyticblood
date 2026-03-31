"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
/***********************************************************************************************************************/
/** Preguntas frecuentes con respuestas claras e informativas. */
const FAQ_ITEMS = [
  {
    question: "¿Qué tipos de informes de sangre puedo subir?",
    answer:
      "Aceptamos la mayoría de los formatos de informes estándar en PDF, JPG y PNG. La IA está entrenada para reconocer parámetros comunes como hemograma, perfil lipídico, glucosa, y marcadores hepáticos/renales.",
  },
  {
    question: "¿Es precisa la interpretación de la IA?",
    answer:
      "Nuestra IA utiliza modelos clínicos avanzados para extraer datos con alta precisión. Sin embargo, los resultados son informativos y no sustituyen el diagnóstico de un médico profesional.",
  },
  {
    question: "¿Mis datos están seguros?",
    answer:
      "Absolutamente. Utilizamos cifrado de grado bancario para proteger tus archivos e información personal. Todos los datos están anonimizados y cumplen con las normativas locales de protección de datos médicos.",
  },
  {
    question: "¿Cuánto tiempo tarda el análisis?",
    answer:
      "El proceso suele tardar entre 30 y 60 segundos, dependiendo de la extensión del informe. Verás una barra de progreso en tiempo real mientras la IA procesa la información.",
  },
  {
    question: "¿Qué significan los colores en mis resultados?",
    answer:
      "Usamos una escala visual intuitiva: Verde (Dentro del rango óptimo), Amarillo (Valores límite que requieren atención) y Rojo (Valores fuera de rango que deben consultarse con un médico).",
  },
  {
    question: "¿Puedo usar la aplicación desde mi móvil?",
    answer:
      "Sí, iAnalytic Blood está optimizada para dispositivos móviles. Puedes tomar una foto de tu informe directamente con la cámara de tu móvil y subirla al instante.",
  },
];

/** Componente modular para las FAQ del centro de ayuda. */
export default function HelpFAQ() {
  return (
    <div className="w-full max-w-3xl mx-auto py-10 px-4">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold mb-4 tracking-tight">Preguntas Frecuentes</h2>
        <p className="text-muted-foreground">
          Encuentra respuestas rápidas a las dudas más comunes sobre la plataforma.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {FAQ_ITEMS.map((item, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="border border-border/40 bg-card/20 rounded-xl px-4 transition-all duration-200 hover:bg-card/40"
          >
            <AccordionTrigger className="text-sm font-medium hover:no-underline py-4">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed pt-2 pb-4">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

import { Metadata } from "next";
import PreviewUpload from "@/components/marketing/preview-upload";
/****************************************************************************************************************************/
export const metadata: Metadata = {
  title: "Prueba Gratuita | IAnalyticBlood",
  description:
    "Prueba nuestro análisis de sangre con inteligencia artificial gratis.",
};

export default function PreviewPage() {
  return (
    <div className="min-h-[80dvh] pt-24 pb-12 flex flex-col items-center justify-center relative">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent -z-10" />

      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Prueba nuestro
            <span className="gradient-text"> Análisis con IA</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Sube un informe de sangre para ver cómo funciona nuestra tecnología.
            Es rápido, seguro y 100% confidencial.
          </p>
        </div>

        <PreviewUpload />
      </div>
    </div>
  );
}

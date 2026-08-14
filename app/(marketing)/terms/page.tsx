import { Metadata } from "next";
import { Scale, AlertTriangle, ShieldCheck } from "lucide-react";
/****************************************************************************************************************************/
export const metadata: Metadata = {
  title: "Términos y Condiciones | IAnalyticBlood",
  description:
    "Términos de servicio y condiciones de uso de la plataforma IAnalyticBlood.",
};
/****************************************************************************************************************************/
export default function TermsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute top-20 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none opacity-50" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
              <Scale className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Términos y Condiciones
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Reglas claras para un servicio seguro. Por favor, lee
              detenidamente nuestras condiciones de uso antes de utilizar
              IAnalytic Blood.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Última actualización:{" "}
              {new Date().toLocaleDateString("es-ES", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Advertencia Médica (Muy importante en health-tech) */}
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 mb-8 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-destructive mb-1">
                Aviso Médico Importante
              </h3>
              <p className="text-sm text-destructive/90 leading-relaxed">
                IAnalytic Blood es una herramienta tecnológica de análisis
                asistido por Inteligencia Artificial y no constituye, bajo
                ninguna circunstancia, un diagnóstico médico, consejo clínico o
                tratamiento. Los resultados generados deben ser siempre
                revisados e interpretados por un profesional de la salud
                cualificado.
              </p>
            </div>
          </div>

          {/* Content */}
          <div
            className="bg-card border border-border/50 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-black/5 max-w-none
            [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-foreground [&>h2]:mt-12 [&>h2]:mb-6 [&>h2]:flex [&>h2]:items-center [&>h2]:gap-3
            [&>p]:text-muted-foreground [&>p]:leading-relaxed [&>p]:mb-6 [&>p]:text-[1.05rem]
            [&>ul]:list-none [&>ul]:space-y-4 [&>ul]:mb-8 [&>ul]:mt-2
            [&>ul>li]:relative [&>ul>li]:pl-7 [&>ul>li]:text-muted-foreground [&>ul>li]:leading-relaxed
            [&>ul>li::before]:content-[''] [&>ul>li::before]:absolute [&>ul>li::before]:left-0 [&>ul>li::before]:top-[0.6rem] [&>ul>li::before]:w-2 
            [&>ul>li::before]:h-2 [&>ul>li::before]:bg-primary [&>ul>li::before]:rounded-full [&>ul>li::before]:shadow-[0_0_8px_rgba(var(--primary),0.5)]
            [&>ul>li>strong]:text-foreground [&>ul>li>strong]:font-semibold
            [&>p>strong]:text-foreground [&>p>strong]:font-semibold
          "
          >
            <h2>1. Aceptación de los Términos</h2>
            <p>
              Al acceder y utilizar <strong>IAnalytic Blood</strong>, aceptas
              estar legalmente vinculado por estos Términos y Condiciones, así
              como por nuestra Política de Privacidad. Si no estás de acuerdo
              con alguno de estos términos, no debes utilizar nuestra
              plataforma.
            </p>

            <h2>2. Descripción del Servicio</h2>
            <p>
              IAnalytic Blood es una plataforma SaaS (Software as a Service) que
              permite a los usuarios subir imágenes o documentos PDF de informes
              de análisis de sangre. Mediante el uso de Inteligencia Artificial,
              el sistema extrae, clasifica y presenta visualmente los
              biomarcadores detectados en dichos informes.
            </p>

            <h2>3. Limitación de Responsabilidad</h2>
            <p>
              Dada la naturaleza del servicio y las limitaciones actuales de la
              Inteligencia Artificial:
            </p>
            <ul>
              <li>
                No garantizamos una precisión del 100% en la extracción o
                interpretación de los datos de los informes médicos.
              </li>
              <li>
                El usuario asume toda la responsabilidad por las decisiones
                tomadas basándose en la información proporcionada por la
                plataforma.
              </li>
              <li>
                IAnalytic Blood no se hace responsable de errores tipográficos
                en el informe original, fallos en la interpretación de la IA, o
                daños directos o indirectos derivados del uso de la información.
              </li>
            </ul>

            <h2>4. Obligaciones del Usuario</h2>
            <p>Al utilizar IAnalytic Blood, te comprometes a:</p>
            <ul>
              <li>
                Proporcionar información verdadera y precisa al registrarte.
              </li>
              <li>
                Subir únicamente informes de sangre que te pertenezcan o sobre
                los cuales tengas autorización legal y explícita para procesar.
              </li>
              <li>
                Mantener la confidencialidad de tus credenciales de acceso.
              </li>
              <li>
                No utilizar la plataforma para fines ilícitos, ingeniería
                inversa, o intentar vulnerar nuestros sistemas de seguridad.
              </li>
            </ul>

            <h2>5. Propiedad Intelectual</h2>
            <p>
              Todo el contenido, diseño, código fuente, algoritmos, logotipos y
              marcas de IAnalytic Blood son propiedad exclusiva de la empresa u
              ostentan las licencias correspondientes. El uso de la plataforma
              no te otorga ningún derecho de propiedad sobre la misma. Se
              prohíbe la reproducción o distribución no autorizada.
            </p>

            <h2>6. Suscripciones y Pagos (Si aplica)</h2>
            <p>
              Algunas funciones avanzadas pueden requerir una suscripción de
              pago. Los precios, ciclos de facturación y políticas de reembolso
              se especificarán claramente en el momento de la compra. IAnalytic
              Blood se reserva el derecho de modificar las tarifas con previo
              aviso a los usuarios activos.
            </p>

            <h2>7. Modificaciones del Servicio</h2>
            <p>
              Nos reservamos el derecho de modificar, suspender o discontinuar
              el servicio (o cualquier parte del mismo) en cualquier momento,
              con o sin previo aviso. También podemos actualizar estos términos;
              el uso continuado de la plataforma tras los cambios constituye tu
              aceptación de los mismos.
            </p>

            <h2>8. Ley Aplicable y Jurisdicción</h2>
            <p>
              Estos Términos y Condiciones se regirán e interpretarán de acuerdo
              con las leyes vigentes del país de residencia legal de la empresa
              matriz de IAnalytic Blood, y cualquier disputa se someterá a la
              jurisdicción exclusiva de sus tribunales.
            </p>

            <div className="mt-12 p-6 bg-muted rounded-2xl flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">
                Protegido y auditado legalmente
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

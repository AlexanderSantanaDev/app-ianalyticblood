import { Metadata } from "next";
import { Shield, Lock, FileText, CheckCircle2 } from "lucide-react";
/****************************************************************************************************************************/
export const metadata: Metadata = {
  title: "Política de Privacidad | IAnalyticBlood",
  description:
    "Conoce cómo protegemos y gestionamos tus datos médicos y personales.",
};
/****************************************************************************************************************************/
export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute top-20 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none opacity-50" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Política de Privacidad
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tu salud es confidencial. Nuestra prioridad es mantenerla así.
              Descubre cómo protegemos tus datos de salud analizados mediante
              Inteligencia Artificial.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Última actualización:{" "}
              {new Date().toLocaleDateString("es-ES", {
                month: "long",
                year: "numeric",
              })}
            </p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 not-prose">
              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                <Lock className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-semibold mb-2">
                  Cifrado de Extremo a Extremo
                </h3>
                <p className="text-sm text-muted-foreground">
                  Tus informes médicos se procesan de forma segura y cifrada en
                  tránsito y en reposo.
                </p>
              </div>
              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                <FileText className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Sin Venta de Datos</h3>
                <p className="text-sm text-muted-foreground">
                  Nunca compartiremos, venderemos ni comercializaremos tu
                  información de salud con terceros.
                </p>
              </div>
              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                <CheckCircle2 className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Transparencia Total</h3>
                <p className="text-sm text-muted-foreground">
                  Control absoluto sobre tus datos. Puedes descargar o eliminar
                  tu historial en cualquier momento.
                </p>
              </div>
            </div>

            <h2>1. Introducción</h2>
            <p>
              En <strong>IAnalytic Blood</strong> ("nosotros", "nuestro", "la
              plataforma"), nos tomamos muy en serio la privacidad y seguridad
              de tus datos, especialmente dado que tratamos información
              relacionada con la salud. Esta Política de Privacidad describe
              cómo recopilamos, utilizamos, protegemos y gestionamos tu
              información cuando utilizas nuestra aplicación y servicios.
            </p>

            <h2>2. Información que Recopilamos</h2>
            <p>
              Para ofrecerte nuestro servicio de análisis inteligente,
              recopilamos los siguientes tipos de información:
            </p>
            <ul>
              <li>
                <strong>Datos de la Cuenta:</strong> Nombre, dirección de correo
                electrónico, y credenciales de autenticación cuando te
                registras.
              </li>
              <li>
                <strong>Datos Médicos y de Salud:</strong> Los archivos (PDF o
                imágenes) de análisis de sangre que decides subir
                voluntariamente a la plataforma para su análisis. Esto incluye
                los biomarcadores extraídos por nuestro sistema de Inteligencia
                Artificial.
              </li>
              <li>
                <strong>Datos de Uso Técnico:</strong> Información sobre cómo
                interactúas con la plataforma (dirección IP, tipo de navegador,
                páginas visitadas) recopilada de forma anónima para fines de
                seguridad y mejora del rendimiento.
              </li>
            </ul>

            <h2>3. Cómo Utilizamos tu Información</h2>
            <p>
              Tus datos se utilizan exclusivamente para los siguientes
              propósitos:
            </p>
            <ul>
              <li>
                <strong>Prestar el Servicio:</strong> Extraer, analizar y
                presentar de forma estructurada los resultados de tus análisis
                de sangre usando algoritmos de IA en nuestro backend protegido.
              </li>
              <li>
                <strong>Mejora del Servicio:</strong> Optimizar la precisión de
                nuestros modelos clínicos de extracción de datos, manteniendo
                siempre el anonimato de la fuente.
              </li>
              <li>
                <strong>Seguridad:</strong> Detectar y prevenir actividades
                fraudulentas o accesos no autorizados.
              </li>
            </ul>

            <h2>
              4. Procesamiento mediante Inteligencia Artificial (DeepSeek)
            </h2>
            <p>
              IAnalytic Blood utiliza tecnología avanzada de Inteligencia
              Artificial para el análisis de los informes. Queremos ser
              transparentes en cómo interactúa esta tecnología con tus datos:
            </p>
            <ul>
              <li>
                Los textos y métricas extraídos de tus archivos son enviados a
                nuestros modelos de IA de forma temporal y estrictamente con el
                propósito de generar el informe estructurado.
              </li>
              <li>
                No utilizamos tus datos personales identificables (nombre, DNI)
                en los prompts enviados a los modelos de lenguaje. Nuestro
                sistema pre-procesa el documento para extraer solo las métricas
                clínicas relevantes antes del análisis profundo.
              </li>
              <li>
                Tus informes de sangre no se utilizan para entrenar modelos
                fundacionales públicos de terceros.
              </li>
            </ul>

            <h2>5. Retención y Almacenamiento de Datos</h2>
            <p>
              Mantenemos tu información personal y el historial de análisis
              únicamente mientras tu cuenta esté activa. Los archivos originales
              subidos (PDFs/Imágenes) son procesados y su almacenamiento se rige
              por estrictas normas de seguridad. Todo el almacenamiento se
              realiza en infraestructuras con certificaciones de alta seguridad.
            </p>

            <h2>6. Tus Derechos (RGPD / Normativas de Privacidad)</h2>
            <p>Tienes el control total sobre tus datos. Tienes derecho a:</p>
            <ul>
              <li>
                <strong>Acceder:</strong> Solicitar una copia de todos los datos
                que tenemos sobre ti.
              </li>
              <li>
                <strong>Rectificar:</strong> Corregir información inexacta en tu
                perfil.
              </li>
              <li>
                <strong>Derecho al Olvido:</strong> Eliminar permanentemente tu
                cuenta y todo el historial médico asociado en cualquier momento
                desde los ajustes de la plataforma.
              </li>
              <li>
                <strong>Exportar:</strong> Descargar tus análisis en formatos
                estructurados.
              </li>
            </ul>

            <h2>7. Contacto para Privacidad</h2>
            <p>
              Si tienes alguna pregunta sobre esta Política de Privacidad o
              sobre cómo manejamos tu información, por favor contacta a nuestro
              Oficial de Protección de Datos en:
              <br />
              <br />
              <strong>Email:</strong> privacy@ianalyticblood.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

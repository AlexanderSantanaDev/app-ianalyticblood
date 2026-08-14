import { Metadata } from "next";
import { Cookie, Info, Settings, ShieldAlert } from "lucide-react";
/****************************************************************************************************************************/
export const metadata: Metadata = {
  title: "Política de Cookies | IAnalyticBlood",
  description: "Información sobre el uso de cookies en nuestra plataforma.",
};
/****************************************************************************************************************************/
export default function CookiesPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute top-20 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none opacity-50" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
              <Cookie className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Política de Cookies
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transparencia sobre cómo utilizamos tecnologías de rastreo para
              mejorar tu experiencia manteniendo tu privacidad a salvo.
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 not-prose">
              <div className="p-6 bg-secondary/10 rounded-2xl border border-secondary/20">
                <ShieldAlert className="w-6 h-6 text-secondary mb-3" />
                <h3 className="font-semibold mb-2">Cookies Esenciales</h3>
                <p className="text-sm text-muted-foreground">
                  Utilizamos cookies de NextAuth para mantener tu sesión segura.
                  No se pueden desactivar.
                </p>
              </div>
              <div className="p-6 bg-secondary/10 rounded-2xl border border-secondary/20">
                <Settings className="w-6 h-6 text-secondary mb-3" />
                <h3 className="font-semibold mb-2">Control en tus manos</h3>
                <p className="text-sm text-muted-foreground">
                  Puedes gestionar o rechazar cookies de terceros desde los
                  ajustes de tu navegador en cualquier momento.
                </p>
              </div>
            </div>

            <h2>1. ¿Qué son las Cookies?</h2>
            <p>
              Las cookies son pequeños archivos de texto que se almacenan en tu
              dispositivo (ordenador, tablet, móvil) cuando visitas una página
              web. Sirven para recordar tus preferencias, mantener tu sesión
              abierta de forma segura y recopilar información estadística sobre
              cómo se utiliza el sitio para poder mejorarlo.
            </p>

            <h2>2. ¿Qué tipos de Cookies utilizamos en IAnalytic Blood?</h2>

            <h3>2.1 Cookies Estrictamente Necesarias (Esenciales)</h3>
            <p>
              Estas cookies son indispensables para que la plataforma funcione.
              No pueden desactivarse en nuestros sistemas sin que el servicio
              deje de funcionar correctamente.
            </p>
            <ul>
              <li>
                <strong>next-auth.session-token:</strong> Gestiona tu inicio de
                sesión y asegura que solo tú puedas ver tus informes médicos.
              </li>
              <li>
                <strong>next-auth.csrf-token:</strong> Te protege contra ataques
                de falsificación de peticiones en sitios cruzados (Seguridad).
              </li>
              <li>
                <strong>Preferencias UI:</strong> Para recordar si has aceptado
                este aviso o si prefieres el modo oscuro/claro (next-themes).
              </li>
            </ul>

            <h3>2.2 Cookies Analíticas y de Rendimiento</h3>
            <p>
              Nos permiten medir y mejorar el rendimiento de nuestro sitio. Toda
              la información que recogen es agregada y, por lo tanto, anónima.
              Nos ayudan a saber qué páginas son las más o menos visitadas
              (p.ej., si muchos usuarios abandonan el proceso de subida de PDF,
              nos ayuda a detectar un fallo de diseño).
            </p>

            <h3>2.3 Cookies de Terceros</h3>
            <p>
              Dado que usamos tecnologías de terceros para ofrecer un servicio
              estable, algunos servicios externos pueden depositar sus propias
              cookies. Al no ser una plataforma publicitaria,{" "}
              <strong>NO</strong> utilizamos cookies para enviarte anuncios
              segmentados ni vendemos tu historial de navegación.
            </p>

            <h2>3. ¿Cómo gestionar o eliminar las cookies?</h2>
            <p>
              Puedes permitir, bloquear o eliminar las cookies instaladas en tu
              equipo mediante la configuración de las opciones de tu navegador
              de Internet. Ten en cuenta que si bloqueas las cookies
              estrictamente necesarias, la aplicación (incluyendo el acceso al
              panel y análisis) no funcionará correctamente.
            </p>

            <ul>
              <li>
                <strong>Google Chrome:</strong> Ajustes &gt; Privacidad y
                seguridad &gt; Cookies y otros datos de sitios.
              </li>
              <li>
                <strong>Safari:</strong> Preferencias &gt; Privacidad &gt;
                Bloquear todas las cookies.
              </li>
              <li>
                <strong>Firefox:</strong> Opciones &gt; Privacidad &amp;
                Seguridad &gt; Cookies y datos del sitio.
              </li>
            </ul>

            <h2>4. Modificaciones en la Política de Cookies</h2>
            <p>
              Es posible que actualicemos la Política de Cookies de nuestro
              Sitio Web. Por ello, te recomendamos revisar esta política cada
              vez que accedas con el objetivo de estar adecuadamente informado
              sobre cómo y para qué usamos las cookies.
            </p>

            <div className="mt-12 p-6 bg-muted/50 rounded-2xl flex items-center gap-4">
              <Info className="w-6 h-6 text-muted-foreground shrink-0" />
              <p className="text-sm text-muted-foreground m-0">
                Para cualquier consulta respecto al uso de cookies en nuestra
                plataforma, puedes escribirnos a{" "}
                <strong>privacy@ianalyticblood.com</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

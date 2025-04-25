import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Brain, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimateOnScroll } from "@/components/marketing/animated-sections";
import { TeamMemberCard } from "@/components/marketing/team-member-card";
import { TechnologyCard } from "@/components/marketing/technology-card";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Sobre nosotros | IAnalyticBlood",
  description: "Conoce nuestra misión, el equipo y la tecnología que impulsa IAnalyticBlood.",
};

export default function AboutPage() {
  const team = [
    { name: "Ana Martínez", role: "CEO & Fundadora", img: "/placeholder.svg" },
    { name: "Carlos Rodríguez", role: "CTO & Dev", img: "/placeholder.svg" },
    { name: "Elena Gómez", role: "Científica de datos", img: "/placeholder.svg" },
    { name: "Javier López", role: "Asesor médico", img: "/placeholder.svg" },
  ];

  const tech = [
    {
      icon: "brain",
      title: "Inteligencia Artificial",
      desc: "Algoritmos avanzados de machine learning y procesamiento de lenguaje natural para interpretar los análisis médicos con precisión.",
    },
    {
      icon: "code",
      title: "Desarrollo Web Moderno",
      desc: "Utilizamos React y Next.js para crear una interfaz de usuario rápida, responsiva y accesible desde cualquier dispositivo.",
    },
    {
      icon: "flask",
      title: "Backend en Python",
      desc: "Nuestro backend está desarrollado en Python, utilizando frameworks como Django y Flask para garantizar un rendimiento óptimo.",
    },
    {
      icon: "file",
      title: "Procesado de PDF",
      desc: "Tecnología especializada para extraer datos de documentos PDF con precisión, independientemente del formato o la estructura.",
    },
    {
      icon: "database",
      title: "Base de datos segura",
      desc: "Almacenamiento seguro y encriptado de datos médicos, cumpliendo con los más altos estándares de seguridad y privacidad.",
    },
    {
      icon: "chart",
      title: "Visualización",
      desc: "Herramientas avanzadas de visualización para presentar los resultados de forma clara, comprensible y visualmente atractiva.",
    },
  ] as const satisfies ReadonlyArray<{
    icon: keyof typeof import("@/components/marketing/technology-card").iconMap;
    title: string;
    desc: string;
  }>;

  return (
    <div className="pt-32 pb-20">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <AnimateOnScroll
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Sobre <span className="gradient-text">Nosotros</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Conoce más sobre IAnalyticBlood, nuestra misión y el equipo detrás de esta innovadora
            plataforma.
          </p>
        </AnimateOnScroll>

        {/* Nuestra Misión */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimateOnScroll>
              <div>
                <h2 className="text-3xl font-bold mb-6">Nuestra Misión</h2>
                <p className="text-lg text-muted-foreground mb-4">
                  En IAnalyticBlood, nuestra misión es democratizar el acceso a la información
                  médica, permitiendo a las personas entender sus análisis de sangre de manera
                  sencilla y accesible.
                </p>
                <p className="text-lg text-muted-foreground mb-4">
                  Creemos que cada persona tiene derecho a comprender su salud sin necesidad de ser
                  un experto médico. Por eso, hemos desarrollado una plataforma que utiliza
                  inteligencia artificial avanzada para interpretar análisis de sangre y presentar
                  los resultados de forma clara y comprensible.
                </p>
                <p className="text-lg text-muted-foreground">
                  Nuestro objetivo es empoderar a las personas para que tomen decisiones informadas
                  sobre su salud, facilitando la detección temprana de problemas y promoviendo un
                  estilo de vida saludable.
                </p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={0.2}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl -z-10"></div>
                <div className="bg-card rounded-3xl shadow-xl overflow-hidden border border-border p-6">
                  <div className="aspect-video relative">
                    <Image
                      src="/placeholder.svg?height=400&width=600"
                      alt="Nuestra misión"
                      fill
                      className="object-cover rounded-xl"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* Nuestro Equipo */}
        <section className="mb-20">
          <AnimateOnScroll>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold mb-4">Nuestro Equipo</h2>
              <p className="text-lg text-muted-foreground">
                Somos un equipo multidisciplinario de profesionales apasionados por la tecnología y
                la salud.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((m, i) => (
              <TeamMemberCard key={m.name} {...m} delay={0.1 * (i + 1)} />
            ))}
          </div>
        </section>

        {/* Nuestra Historia */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimateOnScroll delay={0.2}>
              <div className="relative order-2 lg:order-1">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl -z-10"></div>
                <div className="bg-card rounded-3xl shadow-xl overflow-hidden border border-border p-6">
                  <div className="aspect-video relative">
                    <Image
                      src="/placeholder.svg?height=400&width=600"
                      alt="Nuestra historia"
                      fill
                      className="object-cover rounded-xl"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </div>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll className="order-1 lg:order-2">
              <div>
                <h2 className="text-3xl font-bold mb-6">Nuestra Historia</h2>
                <p className="text-lg text-muted-foreground mb-4">
                  IAnalyticBlood nació en 2023 como respuesta a una necesidad personal de nuestra
                  fundadora, Ana Martínez, quien tras recibir unos análisis de sangre complejos, se
                  dio cuenta de lo difícil que era para una persona sin formación médica entender
                  los resultados.
                </p>
                <p className="text-lg text-muted-foreground mb-4">
                  Junto con Carlos Rodríguez, desarrollador con experiencia en inteligencia
                  artificial, comenzaron a trabajar en un prototipo que pudiera "traducir" los
                  análisis médicos a un lenguaje comprensible para todos.
                </p>
                <p className="text-lg text-muted-foreground">
                  Tras meses de desarrollo y pruebas, y con la incorporación de Elena Gómez y el Dr.
                  Javier López al equipo, IAnalyticBlood se lanzó oficialmente, con la misión de
                  hacer la información médica accesible para todos.
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* Nuestras Tecnologías */}
        <section className="mb-20">
          <AnimateOnScroll>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold mb-4">Nuestras Tecnologías</h2>
              <p className="text-lg text-muted-foreground">
                Utilizamos tecnologías de vanguardia para ofrecer la mejor experiencia posible.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tech.map((t, i) => (
              <TechnologyCard key={t.title} {...t} delay={0.1 * (i + 1)} />
            ))}
          </div>
        </section>

        {/* Valores */}
        <section className="mb-20">
          <AnimateOnScroll>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold mb-4">Nuestros Valores</h2>
              <p className="text-lg text-muted-foreground">
                Los principios que guían nuestro trabajo y nuestra relación con los usuarios.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimateOnScroll delay={0.1}>
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="rounded-full w-12 h-12 flex items-center justify-center gradient-bg mb-4">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Accesibilidad</h3>
                  <p className="text-muted-foreground">
                    Creemos que la información médica debe ser accesible para todos,
                    independientemente de su formación o conocimientos previos. Nos esforzamos por
                    presentar la información de manera clara y comprensible.
                  </p>
                </CardContent>
              </Card>
            </AnimateOnScroll>

            <AnimateOnScroll delay={0.2}>
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="rounded-full w-12 h-12 flex items-center justify-center gradient-bg mb-4">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Privacidad y Seguridad</h3>
                  <p className="text-muted-foreground">
                    La privacidad y seguridad de los datos de nuestros usuarios es nuestra máxima
                    prioridad. Utilizamos las tecnologías más avanzadas para garantizar que la
                    información médica esté siempre protegida.
                  </p>
                </CardContent>
              </Card>
            </AnimateOnScroll>

            <AnimateOnScroll delay={0.3}>
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="rounded-full w-12 h-12 flex items-center justify-center gradient-bg mb-4">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Innovación</h3>
                  <p className="text-muted-foreground">
                    Estamos constantemente investigando y desarrollando nuevas tecnologías para
                    mejorar nuestros servicios. La innovación está en el corazón de todo lo que
                    hacemos.
                  </p>
                </CardContent>
              </Card>
            </AnimateOnScroll>

            <AnimateOnScroll delay={0.4}>
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="rounded-full w-12 h-12 flex items-center justify-center gradient-bg mb-4">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Empatía</h3>
                  <p className="text-muted-foreground">
                    Entendemos que la salud es un tema sensible y personal. Nos acercamos a cada
                    usuario con empatía y respeto, ofreciendo un servicio humano y cercano.
                  </p>
                </CardContent>
              </Card>
            </AnimateOnScroll>
          </div>
        </section>

        {/* CTA */}
        <section>
          <AnimateOnScroll>
            <div className="bg-card rounded-3xl shadow-xl overflow-hidden border border-border relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 -z-10"></div>
              <div className="p-8 md:p-12 text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">
                  ¿Listo para entender tus <span className="gradient-text">análisis de sangre</span>
                  ?
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Únete a IAnalyticBlood hoy y comienza a tomar el control de tu salud.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/auth/register">
                    <Button size="lg" className="gradient-bg hover:opacity-90 transition-opacity">
                      Comenzar ahora
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button size="lg" variant="outline">
                      Contactar con nosotros
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </section>
      </div>
    </div>
  );
}

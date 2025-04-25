"use client";

import { useEffect, useRef, ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Brain,
  LineChart,
  Shield,
  Clock,
  CheckCircle,
  Upload,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { motion, useInView, useAnimation } from "framer-motion";

type AnimateOnScrollProps = {
  children: ReactNode;
  delay?: number;
};

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
};

type ProcessStepProps = {
  number: string;
  title: string;
  description: string;
  delay?: number;
};

type TestimonialProps = {
  quote: string;
  author: string;
  role: string;
  delay?: number;
};

// Componente de animación para elementos que aparecen al hacer scroll
const AnimateOnScroll = ({ children, delay = 0 }: AnimateOnScrollProps) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay } },
      }}
    >
      {children}
    </motion.div>
  );
};

// Componente de tarjeta de característica
const FeatureCard = ({ icon, title, description, delay = 0 }: FeatureCardProps) => {
  return (
    <AnimateOnScroll delay={delay}>
      <div className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
        <div className="rounded-full w-12 h-12 flex items-center justify-center gradient-bg mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </AnimateOnScroll>
  );
};

// Componente de paso del proceso
const ProcessStep = ({ number, title, description, delay = 0 }: ProcessStepProps) => {
  return (
    <AnimateOnScroll delay={delay}>
      <div className="flex items-start space-x-4">
        <div className="rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center gradient-bg text-white font-bold">
          {number}
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </AnimateOnScroll>
  );
};

// Componente de testimonio
const Testimonial = ({ quote, author, role, delay = 0 }: TestimonialProps) => {
  return (
    <AnimateOnScroll delay={delay}>
      <div className="bg-card rounded-xl p-6 shadow-lg h-full">
        <p className="italic mb-4 text-muted-foreground">"{quote}"</p>
        <div>
          <p className="font-bold">{author}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>
    </AnimateOnScroll>
  );
};

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent -z-10"></div>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Comprende tus <span className="gradient-text">análisis de sangre</span> con
                inteligencia artificial
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Sube tu PDF o imagen de análisis de sangre y obtén un estudio detallado,
                personalizado y fácil de entender en segundos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register">
                  <Button size="lg" className="gradient-bg hover:opacity-90 transition-opacity">
                    Comenzar ahora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline">
                    Conocer más
                    <ChevronRight className="ml-1 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative mx-auto max-w-md">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl -z-10"></div>
                <div className="bg-card rounded-3xl shadow-2xl overflow-hidden border border-border">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-lg">Análisis de Sangre</h3>
                      <span className="text-sm text-muted-foreground">Hace 2 minutos</span>
                    </div>
                    <div className="space-y-4">
                      <div className="h-8 bg-muted rounded-md w-3/4 animate-pulse"></div>
                      <div className="h-8 bg-muted rounded-md w-1/2 animate-pulse"></div>
                      <div className="h-8 bg-muted rounded-md w-5/6 animate-pulse"></div>
                      <div className="h-8 bg-muted rounded-md w-2/3 animate-pulse"></div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">Resultado:</div>
                        <div className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs font-medium">
                          Normal
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 animate-float">
                <div className="bg-card rounded-2xl shadow-xl p-4 border border-border">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full w-8 h-8 flex items-center justify-center bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100">
                      <CheckCircle size={16} />
                    </div>
                    <div className="text-sm font-medium">Análisis completado</div>
                  </div>
                </div>
              </div>

              <div
                className="absolute -top-6 -left-6 animate-float"
                style={{ animationDelay: "1s" }}
              >
                <div className="bg-card rounded-2xl shadow-xl p-4 border border-border">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full w-8 h-8 flex items-center justify-center bg-primary/20 text-primary">
                      <Brain size={16} />
                    </div>
                    <div className="text-sm font-medium">IA procesando</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <AnimateOnScroll>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Características <span className="gradient-text">principales</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Descubre cómo IAnalyticBlood transforma la manera en que entiendes tus análisis de
                sangre.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FileText className="h-6 w-6 text-white" />}
              title="Análisis de PDF o imágen"
              description="Sube tu PDF (o imagen) de análisis de sangre y nuestra IA extraerá automáticamente todos los datos relevantes."
              delay={0.1}
            />
            <FeatureCard
              icon={<Brain className="h-6 w-6 text-white" />}
              title="IA Avanzada"
              description="Utilizamos algoritmos de inteligencia artificial de última generación para interpretar tus resultados con precisión."
              delay={0.2}
            />
            <FeatureCard
              icon={<LineChart className="h-6 w-6 text-white" />}
              title="Visualización de Datos"
              description="Gráficos interactivos que te ayudan a entender tus resultados y su evolución a lo largo del tiempo."
              delay={0.3}
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6 text-white" />}
              title="Privacidad Garantizada"
              description="Tu información médica está segura con nosotros. Utilizamos encriptación de nivel bancario."
              delay={0.4}
            />
            <FeatureCard
              icon={<Clock className="h-6 w-6 text-white" />}
              title="Resultados Instantáneos"
              description="Obtén un análisis detallado en segundos, sin esperas ni complicaciones."
              delay={0.5}
            />
            <FeatureCard
              icon={<CheckCircle className="h-6 w-6 text-white" />}
              title="Precisión Médica"
              description="Nuestro sistema ha sido entrenado con millones de análisis y validado por profesionales médicos."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <AnimateOnScroll>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                ¿Cómo <span className="gradient-text">funciona</span>?
              </h2>
              <p className="text-xl text-muted-foreground">
                Un proceso simple y eficiente para obtener resultados precisos.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-12">
              <ProcessStep
                number="1"
                title="Sube tu PDF o imagen"
                description="Simplemente arrastra y suelta tu archivo PDF de análisis de sangre en nuestra plataforma."
                delay={0.1}
              />

              <ProcessStep
                number="2"
                title="Procesamiento con IA"
                description="Nuestra inteligencia artificial analiza el documento, extrae los datos y los compara con valores de referencia."
                delay={0.2}
              />
              <ProcessStep
                number="3"
                title="Resultados Detallados"
                description="Recibe un informe completo con explicaciones claras y recomendaciones personalizadas."
                delay={0.3}
              />
              <ProcessStep
                number="4"
                title="Seguimiento Continuo"
                description="Guarda tus resultados y realiza un seguimiento de tu evolución a lo largo del tiempo."
                delay={0.4}
              />
            </div>

            <AnimateOnScroll delay={0.5}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl -z-10"></div>
                <div className="bg-card rounded-3xl shadow-xl overflow-hidden border border-border p-6">
                  <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted rounded-xl">
                    <div className="text-center">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="font-medium">Arrastra tu PDF o imagen aquí</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        o haz clic para seleccionar
                      </p>
                      <Button className="mt-4">Seleccionar archivo</Button>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded-md w-full"></div>
                      <div className="h-4 bg-muted rounded-md w-3/4"></div>
                      <div className="h-4 bg-muted rounded-md w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <AnimateOnScroll>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Lo que dicen nuestros <span className="gradient-text">usuarios</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Miles de personas ya confían en IAnalyticBlood para entender sus análisis de sangre.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Testimonial
              quote="IAnalyticBlood me ha ayudado a entender mis análisis de sangre de una manera que nunca antes había experimentado. Las explicaciones son claras y las recomendaciones muy útiles."
              author="María González"
              role="Usuaria desde 2023"
              delay={0.1}
            />
            <Testimonial
              quote="Como médico, recomiendo IAnalyticBlood a mis pacientes. Les ayuda a comprender mejor sus resultados y a tomar un papel más activo en su salud."
              author="Dr. Javier Martínez"
              role="Médico de Familia"
              delay={0.2}
            />
            <Testimonial
              quote="La precisión y rapidez con la que IAnalyticBlood analiza mis resultados es impresionante. Ya no tengo que esperar días para entender qué significan mis análisis."
              author="Carlos Rodríguez"
              role="Usuario Premium"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <AnimateOnScroll>
            <div className="bg-card rounded-3xl shadow-xl overflow-hidden border border-border relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 -z-10"></div>
              <div className="p-8 md:p-12 text-center max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Comienza a entender tus análisis <span className="gradient-text">hoy mismo</span>
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Únete a miles de personas que ya han transformado la manera en que entienden su
                  salud.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/auth/register">
                    <Button size="lg" className="gradient-bg hover:opacity-90 transition-opacity">
                      Registrarse gratis
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button size="lg" variant="outline">
                      Ver planes
                      <ChevronRight className="ml-1 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}

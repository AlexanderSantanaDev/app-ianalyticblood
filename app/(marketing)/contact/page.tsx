"use client";

import { ChangeEvent, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Card, CardContent } from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { useToast } from "hooks/use-toast";

/* 1. Tipado del estado */
interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, subject: value }));
  };

  const handleSubmit = async (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulación de envío de formulario
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: "Mensaje enviado",
      description: "Hemos recibido tu mensaje. Te responderemos lo antes posible.",
    });

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
    setIsSubmitting(false);
  };

  return (
    <div className="pt-32 pb-20">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Contacta con <span className="gradient-text">Nosotros</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            ¿Tienes alguna pregunta o comentario? Estamos aquí para ayudarte. Ponte en contacto con
            nuestro equipo.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Formulario de contacto */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-border shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">Envíanos un mensaje</h2>
                <form onSubmit={() => handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Tu nombre"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="tu@ejemplo.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Asunto</Label>
                    <Select value={formData.subject} onValueChange={handleSelectChange} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un asunto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Consulta general</SelectItem>
                        <SelectItem value="support">Soporte técnico</SelectItem>
                        <SelectItem value="billing">Facturación</SelectItem>
                        <SelectItem value="partnership">Colaboraciones</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Escribe tu mensaje aquí..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full gradient-bg hover:opacity-90 transition-opacity"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Enviando..." : "Enviar mensaje"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Información de contacto */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">Información de contacto</h2>
                <p className="text-muted-foreground mb-8">
                  Puedes contactarnos a través del formulario o utilizando cualquiera de los
                  siguientes métodos:
                </p>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="rounded-full w-10 h-10 flex items-center justify-center gradient-bg flex-shrink-0">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Correo electrónico</h3>
                      <p className="text-muted-foreground">info@analiticbold.com</p>
                      <p className="text-muted-foreground">soporte@analiticbold.com</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="rounded-full w-10 h-10 flex items-center justify-center gradient-bg flex-shrink-0">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Teléfono</h3>
                      <p className="text-muted-foreground">+34 912 345 678</p>
                      <p className="text-muted-foreground">Lunes a viernes, 9:00 - 18:00</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="rounded-full w-10 h-10 flex items-center justify-center gradient-bg flex-shrink-0">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Dirección</h3>
                      <p className="text-muted-foreground">Calle Innovación, 123</p>
                      <p className="text-muted-foreground">28001 Madrid, España</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-xl mb-4">Síguenos en redes sociales</h3>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="rounded-full w-12 h-12 flex items-center justify-center bg-card border border-border hover:border-primary transition-colors"
                  >
                    <Facebook className="h-5 w-5" />
                    <span className="sr-only">Facebook</span>
                  </a>
                  <a
                    href="#"
                    className="rounded-full w-12 h-12 flex items-center justify-center bg-card border border-border hover:border-primary transition-colors"
                  >
                    <Twitter className="h-5 w-5" />
                    <span className="sr-only">Twitter</span>
                  </a>
                  <a
                    href="#"
                    className="rounded-full w-12 h-12 flex items-center justify-center bg-card border border-border hover:border-primary transition-colors"
                  >
                    <Instagram className="h-5 w-5" />
                    <span className="sr-only">Instagram</span>
                  </a>
                  <a
                    href="#"
                    className="rounded-full w-12 h-12 flex items-center justify-center bg-card border border-border hover:border-primary transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                    <span className="sr-only">LinkedIn</span>
                  </a>
                </div>
              </div>

              <Card className="border-border shadow-xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-video relative">
                    {/* Aquí iría un mapa, pero usamos un placeholder */}
                    <div className="absolute inset-0 bg-muted flex items-center justify-center">
                      <p className="text-muted-foreground">Mapa de ubicación</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Preguntas frecuentes</h2>
            <p className="text-lg text-muted-foreground">
              Aquí encontrarás respuestas a las preguntas más comunes sobre nuestro servicio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-border">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">
                  ¿Cuánto tiempo tarda el análisis de un PDF?
                </h3>
                <p className="text-muted-foreground">
                  El análisis de un PDF suele tardar entre 30 segundos y 1 minuto, dependiendo de la
                  complejidad del documento y el tamaño del archivo.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">
                  ¿Cómo puedo contactar con el soporte técnico?
                </h3>
                <p className="text-muted-foreground">
                  Puedes contactar con nuestro equipo de soporte técnico a través del formulario de
                  contacto, enviando un email a soporte@analiticbold.com o llamando al +34 912 345
                  678 en horario de oficina.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">¿Mis datos médicos están seguros?</h3>
                <p className="text-muted-foreground">
                  Absolutamente. Utilizamos encriptación de nivel bancario y cumplimos con todas las
                  normativas de protección de datos. Tu información nunca se comparte con terceros
                  sin tu consentimiento explícito.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">
                  ¿Puedo cancelar mi suscripción en cualquier momento?
                </h3>
                <p className="text-muted-foreground">
                  Sí, puedes cancelar tu suscripción en cualquier momento desde tu perfil de
                  usuario. No hay compromisos a largo plazo ni penalizaciones por cancelación.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import { useToast } from "hooks/use-toast";
/***********************************************************************************************************************/
export default function ForgotPasswordPage() {
  // Estados para manejar la carga y si se ha enviado el correo
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { toast } = useToast();
  /***********************************************************************************************************************/
  // Métodos
  /** Maneja el envío del formulario. */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulación de llamada a API para enviar correo
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSubmitted(true);
      toast({
        title: "Correo enviado",
        description: "Revisa tu bandeja de entrada para continuar.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Hubo un problema al intentar enviar el correo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /***********************************************************************************************************************/
  // JSX
  return (
    <div className="pt-32 pb-20 min-h-[100dvh] flex items-center justify-center">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto"
        >
          <Card className="border-border shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">
                Recuperar contraseña
              </CardTitle>
              <CardDescription>
                {isSubmitted
                  ? "Hemos enviado un enlace de recuperación a tu correo."
                  : "Ingresa tu correo electrónico y te enviaremos las instrucciones."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@ejemplo.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full gradient-bg hover:opacity-90 transition-opacity"
                    disabled={isSubmitting || !email}
                  >
                    {isSubmitting
                      ? "Enviando..."
                      : "Enviar enlace de recuperación"}
                  </Button>
                </form>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4 py-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    Si existe una cuenta asociada a{" "}
                    <strong className="text-foreground">{email}</strong>,
                    recibirás un correo electrónico con un enlace para
                    restablecer tu contraseña en breve.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio de sesión
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

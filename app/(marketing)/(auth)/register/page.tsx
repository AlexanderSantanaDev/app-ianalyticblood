"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/page-loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Check, X } from "lucide-react";
import { register } from "lib/api/auth";
import { useToast } from "hooks/use-toast";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { z } from "zod";
/***********************************************************************************************************************/
// Esquema de validación para registro (coincide con el backend)
const registerSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "Nombre demasiado largo"),
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio")
    .email("Formato de correo inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número")
    .max(128, "Contraseña demasiado larga"),
});

/***********************************************************************************************************************/
export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  // Nuevo estado para controlar visibilidad del campo de confirmación
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Nuevo estado para la confirmación de contraseña
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevenir doble submit

  // Validadores dinámicos para feedback visual
  const isLengthValid = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid =
    password.length > 0 &&
    isLengthValid &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber;
  const isConfirmValid =
    confirmPassword.length > 0 && password === confirmPassword;
  /***********************************************************************************************************************/
  // Hooks
  const router = useRouter();
  const { toast } = useToast();
  const { status } = useSession(); // --> Obtenemos el estado de la sesión con useSession

  /** Método para registrar usuario */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validación Zod en cliente ANTES de llamar al backend
    const validation = registerSchema.safeParse({ name, email, password });
    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message;
      toast({
        title: "Error en los datos",
        description: firstError,
        variant: "destructive",
      });
      return;
    }

    // Validación visual de que coinciden
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      });
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Se envían los datos validados por Zod
      await register({
        name: validation.data.name,
        email: validation.data.email,
        password: validation.data.password,
        terms_accepted: acceptTerms,
        terms_version: "1.0",
      });
      toast({
        title: "Cuenta creada ✔️",
        description: "Inicia sesión para continuar",
      });

      // Dejamos un margen de tiempo para que el usuario lea el toast antes de redirigir
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch {
      // Error genérico (no mostrar err.message directo)
      toast({
        title: "Error de registro",
        description:
          "No se pudo crear la cuenta. Verifica que el correo no esté en uso.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Método para iniciar sesion con google */
  const handleGoogleSignup = async () => {
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  // Loader
  if (status === "loading") {
    return <PageLoader />;
  }
  /***********************************************************************************************************************/
  // Render
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
                Crear una cuenta
              </CardTitle>
              <CardDescription>
                Ingresa tus datos para registrarte en IAnalyticBlood
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Tu nombre"
                      className="pl-10"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>
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
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors ${
                        password.length > 0
                          ? isPasswordValid
                            ? "text-green-500"
                            : "text-red-500"
                          : "text-muted-foreground"
                      }`}
                    />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      // Feedback visual en el input (bordes verdes o rojos dinámicos)
                      className={`pl-10 transition-colors ${
                        password.length > 0
                          ? isPasswordValid
                            ? "border-green-500 focus-visible:ring-green-500/50"
                            : "border-red-500 focus-visible:ring-red-500/50"
                          : ""
                      }`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                    {/* El icono del ojo solo se muestra cuando hay texto escrito */}
                    {password.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                  {/* Lista de validación dinámica */}
                  {password.length > 0 && (
                    <div className="space-y-1 mt-2 p-3 bg-muted/50 rounded-lg border border-border/50">
                      <p className="text-xs font-medium text-foreground mb-2">
                        Requisitos de contraseña:
                      </p>
                      <ul className="text-xs space-y-1">
                        <li
                          className={`flex items-center gap-1.5 transition-colors ${
                            isLengthValid ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {isLengthValid ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          Mínimo 8 caracteres
                        </li>
                        <li
                          className={`flex items-center gap-1.5 transition-colors ${
                            hasUpperCase ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {hasUpperCase ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          Al menos una mayúscula
                        </li>
                        <li
                          className={`flex items-center gap-1.5 transition-colors ${
                            hasLowerCase ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {hasLowerCase ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          Al menos una minúscula
                        </li>
                        <li
                          className={`flex items-center gap-1.5 transition-colors ${
                            hasNumber ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {hasNumber ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          Al menos un número
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Nuevo bloque para confirmar la contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                  <div className="relative">
                    <Lock
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors ${
                        confirmPassword.length > 0
                          ? isConfirmValid
                            ? "text-green-500"
                            : "text-red-500"
                          : "text-muted-foreground"
                      }`}
                    />
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      // Feedback visual en confirmación
                      className={`pl-10 transition-colors ${
                        confirmPassword.length > 0
                          ? isConfirmValid
                            ? "border-green-500 focus-visible:ring-green-500/50"
                            : "border-red-500 focus-visible:ring-red-500/50"
                          : ""
                      }`}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                    {/* El icono del ojo solo se muestra cuando hay texto escrito */}
                    {confirmPassword.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                  {/* Mensaje visual de error si las contraseñas no coinciden */}
                  {confirmPassword.length > 0 &&
                    password !== confirmPassword && (
                      <p className="text-xs text-red-500 mt-1 font-medium">
                        Las contraseñas no coinciden.
                      </p>
                    )}
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) =>
                      setAcceptTerms(checked === true)
                    }
                    className="mt-1"
                  />
                  <Label htmlFor="terms" className="text-sm">
                    Acepto los{" "}
                    <Link
                      href="/terms"
                      className="text-primary hover:underline"
                    >
                      Términos de Servicio
                    </Link>{" "}
                    y la{" "}
                    <Link
                      href="/privacy"
                      className="text-primary hover:underline"
                    >
                      Política de Privacidad
                    </Link>
                  </Label>
                </div>
                <Button
                  type="submit"
                  className="w-full gradient-bg hover:opacity-90 transition-opacity"
                  // Deshabilitar el botón si la seguridad no se cumple
                  disabled={
                    !acceptTerms ||
                    isSubmitting ||
                    !isPasswordValid ||
                    !isConfirmValid
                  }
                >
                  {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    O regístrate con
                  </span>
                </div>
              </div>

              <div className="w-full">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignup}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Inicia sesión
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

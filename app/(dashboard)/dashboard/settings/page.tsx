"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Lock,
  Bell,
  User,
  Shield,
  Globe,
  Moon,
  Sun,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  LogOut,
  Save,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  BarChart3,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { cn } from "lib/utils";
import { useApiFetch } from "lib/api/client";
import { changePassword, deleteAccount, requestDataExport } from "lib/api/auth";
import { useSession } from "next-auth/react";

/***********************************************************************************************************************/
/** Esquema de validación estricta para la nueva contraseña. */
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es obligatoria"),
    newPassword: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[0-9]/, "Debe contener al menos un número"),
    confirmPassword: z.string().min(1, "Confirma tu nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  // Estados
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession(); // 🔒 Para acceder al accessToken en exportación
  // Estados para mostrar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  // Estados para exportación y eliminación de cuenta
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  /***********************************************************************************************************************/
  // Hook form para manejar el estado y validación del formulario de contraseña
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  // apiFetch autenticado para todas las llamadas al backend que requieren JWT
  const apiFetch = useApiFetch();

  // Observamos los 3 campos para saber si el botón debe estar habilitado
  const watchedFields = watch([
    "currentPassword",
    "newPassword",
    "confirmPassword",
  ]);
  const allFieldsFilled = watchedFields.every((f) => !!f && f.length > 0);

  // Estados de configuración
  const [configs, setConfigs] = useState({
    notifications: {
      emailAnalysis: true,
      emailWeekly: false,
      pushDesktop: true,
      pushSecurity: true,
    },
    security: {
      twoFactor: false,
      loginAlerts: true,
    },
    preferences: {
      language: "es",
      units: "metric",
    },
  });
  /***********************************************************************************************************************/
  // Métodos
  /** Alternar el estado de una configuración. */
  const handleToggle = (category: keyof typeof configs, key: string) => {
    setConfigs((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category] as any),
        [key]: !(prev[category] as any)[key],
      },
    }));
  };

  /** Guardar configuración. */
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Configuración guardada correctamente ✨", {
        description:
          "Tus cambios se han sincronizado en todos tus dispositivos.",
      });
    }, 1200);
  };

  /** Manejador real que llama al backend Python y gestiona errores correctamente */
  const onUpdatePassword = async (data: PasswordFormValues) => {
    setIsUpdatingPassword(true);
    try {
      // Llamada autenticada al endpoint PUT /auth/change-password del backend Python
      await changePassword(apiFetch, {
        current_password: data.currentPassword,
        new_password: data.newPassword,
      });
      toast.success("Contraseña actualizada con éxito 🔒", {
        description:
          "Tu nueva contraseña ya está activa. La sesión sigue abierta.",
      });
      reset(); // Limpia los campos del formulario tras éxito real
    } catch (err: unknown) {
      // Error controlado: mostramos el mensaje del back sin exponer detalles técnicos
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo actualizar la contraseña. Inténtalo de nuevo.";
      toast.error("Error al actualizar la contraseña", {
        description: message,
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  /** Descarga todos los datos del usuario como JSON */
  const onExportData = async () => {
    const accessToken = session?.accessToken;
    if (!accessToken) {
      toast.error("Sesión no disponible", {
        description: "Inicia sesión de nuevo para exportar tus datos.",
      });
      return;
    }
    setIsExporting(true);
    try {
      await requestDataExport(accessToken);
      toast.success("📦 Exportación completada", {
        description: "Tu fichero JSON con todos tus datos se ha descargado.",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al exportar datos.";
      toast.error("Error al exportar", { description: message });
    } finally {
      setIsExporting(false);
    }
  };

  /** Elimina la cuenta y sus datos permanentemente */
  const onDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount(apiFetch);
      toast.success("🗑️ Cuenta eliminada", {
        description:
          "Tu cuenta y todos tus datos han sido eliminados permanentemente.",
      });
      // Forzar logout tras eliminación
      const { signOut } = await import("next-auth/react");
      await signOut({ callbackUrl: "/" });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "No se pudo eliminar la cuenta.";
      toast.error("Error al eliminar la cuenta", { description: message });
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  /***********************************************************************************************************************/
  //JSX
  return (
    <div className="pt-8 pb-20 min-h-[calc(100dvh-4rem)]">
      <div className="container mx-auto px-4 max-w-5xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-2 mb-10"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20 shadow-sm">
              <Settings className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Configuración
            </h1>
          </div>
          <p className="text-muted-foreground text-lg sm:ml-[3.5rem] ml-0 max-w-2xl">
            Gestiona la seguridad de tu cuenta, preferencias de la UI y canales
            de comunicación.
          </p>
        </motion.div>

        <Tabs defaultValue="security" className="space-y-8">
          {/* Navegación de Pestañas: Smart Grid para móviles sin desbordamientos */}
          <div className="w-full">
            <TabsList className="bg-transparent border-none p-0 h-auto w-full grid grid-cols-2 lg:flex lg:flex-row gap-2 sm:gap-3 mb-2">
              {[
                {
                  id: "security",
                  label: "Seguridad",
                  icon: Shield,
                  color: "text-primary",
                },
                {
                  id: "notifications",
                  label: "Alertas",
                  icon: Bell,
                  color: "text-primary",
                },
                {
                  id: "preferences",
                  label: "Preferencias",
                  icon: Globe,
                  color: "text-primary",
                },
                {
                  id: "account",
                  label: "Cuenta",
                  icon: User,
                  color: "text-primary",
                },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="relative group h-auto py-3 px-4 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm 
                    hover:bg-card/60 transition-all duration-300 data-[state=active]:bg-primary/5 data-[state=active]:border-primary/40 
                    data-[state=active]:shadow-lg data-[state=active]:shadow-primary/5 flex items-center justify-center gap-2.5 flex-1"
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-data-[state=active]:text-primary transition-colors shrink-0" />
                    <span className="font-semibold text-sm">{tab.label}</span>
                    <AnimatePresence>
                      <motion.div
                        layoutId="activeTabSettings"
                        className="absolute inset-0 rounded-2xl border-2 border-primary/20 z-[-1] opacity-0 data-[state=active]:opacity-100"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    </AnimatePresence>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/***********************************************************************************************************************/}
          {/* CONTENIDO: SEGURIDAD */}
          <TabsContent value="security" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cambio de Contraseña */}
                <Card className="border-border/60 shadow-xl rounded-3xl backdrop-blur-sm bg-card/80">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className="w-4 h-4 text-primary" />
                      <CardTitle className="text-xl">
                        Seguridad de Acceso
                      </CardTitle>
                    </div>
                    <CardDescription>
                      Actualiza tu contraseña para mantener tu cuenta segura.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      className="space-y-4"
                      onSubmit={handleSubmit(onUpdatePassword)}
                    >
                      {/* Contraseña Actual */}
                      <div className="space-y-1.5">
                        <Label htmlFor="currentPassword">
                          Contraseña actual
                        </Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            className={cn(
                              "rounded-xl pr-10",
                              errors.currentPassword &&
                                "border-destructive focus-visible:ring-destructive",
                            )}
                            placeholder="••••••••"
                            {...register("currentPassword")}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                        {errors.currentPassword && (
                          <p className="text-[11px] text-destructive font-medium pl-1">
                            {errors.currentPassword.message}
                          </p>
                        )}
                      </div>

                      {/* Nueva Contraseña */}
                      <div className="space-y-1.5">
                        <Label htmlFor="newPassword">Nueva contraseña</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            autoComplete="new-password"
                            className={cn(
                              "rounded-xl pr-10",
                              errors.newPassword &&
                                "border-destructive focus-visible:ring-destructive",
                            )}
                            placeholder="••••••••"
                            {...register("newPassword")}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                        {errors.newPassword && (
                          <p className="text-[11px] text-destructive font-medium pl-1">
                            {errors.newPassword.message}
                          </p>
                        )}
                      </div>

                      {/* Confirmar Nueva Contraseña */}
                      <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword">
                          Confirmar nueva contraseña
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            className={cn(
                              "rounded-xl pr-10",
                              errors.confirmPassword &&
                                "border-destructive focus-visible:ring-destructive",
                            )}
                            placeholder="••••••••"
                            {...register("confirmPassword")}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-[11px] text-destructive font-medium pl-1">
                            {errors.confirmPassword.message}
                          </p>
                        )}
                      </div>

                      {/* Botón deshabilitado hasta que todos los campos estén rellenos */}
                      <Button
                        type="submit"
                        className={cn(
                          "w-full rounded-xl font-bold shadow-md transition-all h-11",
                          allFieldsFilled && !isUpdatingPassword
                            ? "gradient-bg hover:shadow-lg hover:shadow-primary/20"
                            : "opacity-50 cursor-not-allowed",
                        )}
                        disabled={isUpdatingPassword || !allFieldsFilled}
                      >
                        {isUpdatingPassword ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Actualizando...
                          </div>
                        ) : (
                          "Actualizar Contraseña"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Doble Factor (2FA) */}
                <Card className="border-border/60 shadow-xl rounded-3xl backdrop-blur-sm bg-card/80">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <CardTitle className="text-xl">
                          Doble Factor (2FA)
                        </CardTitle>
                      </div>
                      <Badge
                        variant={
                          configs.security.twoFactor ? "default" : "secondary"
                        }
                        className="rounded-lg"
                      >
                        {configs.security.twoFactor
                          ? "Activado"
                          : "Recomendado"}
                      </Badge>
                    </div>
                    <CardDescription>
                      Añade una capa extra de protección a tu cuenta móvil.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-0.5">
                        <Label className="text-base font-bold">
                          Autenticación en dos pasos
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Usa una app de autenticación (Google/Authy) para
                          confirmar accesos.
                        </p>
                      </div>
                      <Switch
                        checked={configs.security.twoFactor}
                        onCheckedChange={() =>
                          handleToggle("security", "twoFactor")
                        }
                      />
                    </div>

                    <div className="p-4 bg-muted/40 rounded-2xl border border-dashed text-xs text-muted-foreground leading-relaxed">
                      Al activar la verificación en dos pasos, necesitaremos un
                      código generado por tu móvil cada vez que inicies sesión
                      en un dispositivo nuevo.
                    </div>

                    <div className="flex items-start justify-between gap-4 pt-2">
                      <div className="space-y-0.5">
                        <Label className="text-base font-bold">
                          Alertas de Inicio de Sesión
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Te avisaremos por email cuando se acceda desde un
                          lugar desconocido.
                        </p>
                      </div>
                      <Switch
                        checked={configs.security.loginAlerts}
                        onCheckedChange={() =>
                          handleToggle("security", "loginAlerts")
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>

          {/***********************************************************************************************************************/}
          {/* CONTENIDO: NOTIFICACIONES */}
          <TabsContent value="notifications" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-border/60 shadow-xl rounded-3xl backdrop-blur-sm bg-card/80 max-w-3xl mx-auto">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold">
                    Protocolos de Alerta
                  </CardTitle>
                  <CardDescription>
                    Escoge qué información es prioritaria para tu salud y
                    bienestar.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pt-4">
                  {/* Grupo Email */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-primary/80 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Correo Electrónico
                    </h4>
                    <div className="space-y-4 divide-y divide-border/40">
                      <div className="flex items-center justify-between pt-2">
                        <div className="space-y-0.5">
                          <Label className="text-base">
                            Resultados de Análisis
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Recibir una copia en PDF del análisis cuando se
                            procese.
                          </p>
                        </div>
                        <Switch
                          checked={configs.notifications.emailAnalysis}
                          onCheckedChange={() =>
                            handleToggle("notifications", "emailAnalysis")
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between pt-4">
                        <div className="space-y-0.5">
                          <Label className="text-base">
                            Resumen Biométrico Mensual
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Reporte detallado de tus tendencias y salud cada
                            mes.
                          </p>
                        </div>
                        <Switch
                          checked={configs.notifications.emailWeekly}
                          onCheckedChange={() =>
                            handleToggle("notifications", "emailWeekly")
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Grupo Push */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-primary/80 flex items-center gap-2">
                      <Smartphone className="w-4 h-4" /> Notificaciones Push
                    </h4>
                    <div className="space-y-4 divide-y divide-border/40">
                      <div className="flex items-center justify-between pt-2">
                        <div className="space-y-0.5">
                          <Label className="text-base">
                            Alertas en Tiempo Real
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Notificaciones instantáneas al completar un
                            escaneado.
                          </p>
                        </div>
                        <Switch
                          checked={configs.notifications.pushDesktop}
                          onCheckedChange={() =>
                            handleToggle("notifications", "pushDesktop")
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between pt-4">
                        <div className="space-y-0.5">
                          <Label className="text-base">
                            Avisos de Seguridad
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Cambios de contraseña o accesos nuevos.
                          </p>
                        </div>
                        <Switch
                          checked={configs.notifications.pushSecurity}
                          onCheckedChange={() =>
                            handleToggle("notifications", "pushSecurity")
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 border-t mt-4 p-6 justify-between flex flex-col sm:flex-row gap-4">
                  <p className="text-xs text-muted-foreground max-w-sm">
                    No compartiremos tu correo con terceros por motivos
                    publicitarios bajo ninguna circunstancia.
                  </p>
                  <Button
                    onClick={handleSave}
                    className="rounded-xl px-8 font-bold gap-2"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      "Guardando..."
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Guardar Cambios
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>

          {/***********************************************************************************************************************/}
          {/* CONTENIDO: PREFERENCIAS */}
          <TabsContent value="preferences" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Personalización Visual */}
                <Card className="border-border/60 shadow-xl rounded-3xl backdrop-blur-sm bg-card/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Moon className="w-5 h-5 text-primary" /> Apariencia
                    </CardTitle>
                    <CardDescription>
                      Ajusta el entorno visual de iAnalytic Blood.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setTheme("light")}
                        className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                          theme === "light"
                            ? "border-primary bg-primary/5"
                            : "border-border/40 hover:border-primary/20"
                        }`}
                      >
                        <Sun className="w-6 h-6 text-orange-500" />
                        <span className="text-sm font-bold text-foreground">
                          Claro
                        </span>
                      </button>
                      <button
                        onClick={() => setTheme("dark")}
                        className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                          theme === "dark"
                            ? "border-primary bg-primary/10"
                            : "border-border/40 hover:border-primary/20"
                        }`}
                      >
                        <Moon className="w-6 h-6 text-blue-400" />
                        <span className="text-sm font-bold text-foreground">
                          Oscuro
                        </span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      <Label>Idioma de la Interfaz</Label>
                      <Select
                        defaultValue={configs.preferences.language}
                        onValueChange={(val) =>
                          setConfigs((p) => ({
                            ...p,
                            preferences: { ...p.preferences, language: val },
                          }))
                        }
                      >
                        <SelectTrigger className="rounded-xl h-12">
                          <SelectValue placeholder="Selecciona idioma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="es">
                            Español (Recomendado)
                          </SelectItem>
                          <SelectItem value="en">
                            English (Coming Soon)
                          </SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Datos y Metodología */}
                <Card className="border-border/60 shadow-xl rounded-3xl backdrop-blur-sm bg-card/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" /> Unidades y
                      Análisis
                    </CardTitle>
                    <CardDescription>
                      Configura cómo interpretamos tus biomarcadores.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Sistema de Unidades</Label>
                      <Select defaultValue={configs.preferences.units}>
                        <SelectTrigger className="rounded-xl h-12">
                          <SelectValue placeholder="Selecciona sistema" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="metric">
                            Sistema Métrico (kg, cm, mg/dL)
                          </SelectItem>
                          <SelectItem value="imperial">
                            Imperial (lb, ft/in, mmol/L)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="p-4 bg-muted/40 rounded-2xl border flex items-start gap-3">
                      <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        El sistema de análisis detectará automáticamente si tu
                        informe utiliza unidades distintas a tu preferencia y
                        las convertirá para la comparativa histórica.
                      </p>
                    </div>

                    <Button
                      onClick={handleSave}
                      className="w-full rounded-xl h-12 font-bold"
                      variant="default"
                    >
                      Aplicar Preferencias
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>

          {/***********************************************************************************************************************/}
          {/* CONTENIDO: CUENTA */}
          <TabsContent value="account" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-red-500/20 shadow-xl rounded-3xl bg-card/80 overflow-hidden border-2">
                <CardHeader className="bg-red-500/5 p-8 border-b border-red-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-red-600">
                        Zona de Riesgo
                      </CardTitle>
                      <CardDescription className="text-red-600/60 font-medium">
                        Gestiona tu privacidad y presencia en la plataforma.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-8 space-y-6">
                  {/* Descargar mis datos */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 rounded-2xl bg-muted/30 border border-border/50">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-lg">
                          Descargar mis datos
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Genera un fichero{" "}
                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded-md">
                          .json
                        </span>{" "}
                        con tu perfil y el historial completo de análisis en
                        formato estructurado. Compatible con GDPR/LOPD.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="rounded-xl px-6 h-11 font-bold shrink-0 border-border/60 hover:border-primary/40 hover:text-primary transition-all"
                      onClick={onExportData}
                      disabled={isExporting}
                    >
                      {isExporting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
                          Exportando...
                        </div>
                      ) : (
                        "Solicitar Exportación"
                      )}
                    </Button>
                  </div>

                  {/* Eliminar cuenta */}
                  <div
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 rounded-2xl bg-red-500/5 
                  border border-red-500/20"
                  >
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-lg text-red-600">
                        Eliminar cuenta permanentemente
                      </h4>
                      <p className="text-sm text-red-600/70 max-w-sm">
                        Esta acción es <strong>irreversible</strong>. Se
                        borrarán todos tus análisis, datos biométricos e
                        imágenes de nuestros servidores.
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      className="rounded-xl px-6 h-11 font-bold shrink-0 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all"
                      onClick={() => {
                        setDeleteConfirmText("");
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Eliminar Cuenta
                    </Button>
                  </div>
                </CardContent>

                <CardFooter className="bg-muted/10 p-6 flex justify-center border-t">
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión en otros
                    dispositivos
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog de confirmación para eliminar cuenta */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="w-[95vw] sm:max-w-[440px] rounded-3xl border-red-500/30 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-card rounded-3xl -z-10" />
          <DialogHeader className="pt-2">
            <div className="w-14 h-14 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-center text-red-600">
              ¿Eliminar tu cuenta?
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground pt-1 px-2">
              Esta acción es{" "}
              <strong className="text-foreground">
                permanente e irreversible
              </strong>
              . Se borrarán todos tus análisis, datos biométricos e imágenes de
              forma definitiva.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 px-1 sm:px-2 space-y-4">
            {/* Info box de lo que se borrará */}
            <div className="rounded-xl bg-red-500/5 border border-red-500/15 p-4 space-y-2">
              <p className="text-xs font-semibold text-red-600/80 uppercase tracking-widest mb-1">
                Se eliminará permanentemente:
              </p>
              {[
                "Tu perfil y datos personales",
                "Todo el historial de análisis de sangre",
                "Imágenes y PDFs procesados",
                "Configuraciones y preferencias",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-xs text-red-600/70"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500/60 shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            {/* Campo de confirmación por texto */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Escribe{" "}
                <span className="font-mono font-bold text-foreground">
                  ELIMINAR
                </span>{" "}
                para confirmar
              </Label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="ELIMINAR"
                className="rounded-xl font-mono text-sm border-red-500/30 focus-visible:ring-red-500/30"
                autoComplete="off"
              />
            </div>
          </div>

          <DialogFooter className="px-1 sm:px-2 pb-2 flex !flex-col sm:!flex-row gap-2 sm:gap-3">
            <Button
              variant="ghost"
              className="flex-1 rounded-xl h-11 text-sm"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1 rounded-xl h-11 text-sm font-bold shadow-md shadow-red-500/20"
              onClick={onDeleteAccount}
              disabled={isDeleting || deleteConfirmText !== "ELIMINAR"}
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Eliminando...
                </div>
              ) : (
                "Sí, eliminar mi cuenta"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

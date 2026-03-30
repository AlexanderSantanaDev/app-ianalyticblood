"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  User,
  HeartPulse,
  Lock,
  Camera,
  Mail,
  Smartphone,
  ShieldCheck,
  Activity,
  Droplet,
  Save,
  LogOut,
  AlertCircle,
  Info,
} from "lucide-react";
import { useEffect } from "react";
import { useUserApi } from "@/lib/api/user";
import { User as UserType } from "@/lib/api/types";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
/***********************************************************************************************************************/
/** Esquemas de validación. */
const accountSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  lastName: z.string().optional(),
  email: z.string().email("Debe ser un correo válido."),
  phone: z.string().optional(),
});
/** Tipos de datos para los formularios. */
type AccountFormValues = z.infer<typeof accountSchema>;

/** Esquemas de validación. */
const healthSchema = z.object({
  bloodType: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  allergies: z.string().optional(),
  conditions: z.string().optional(),
});

/** Tipos de datos para los formularios. */
type HealthFormValues = z.infer<typeof healthSchema>;

/** Esquemas de validación. */
const securitySchema = z
  .object({
    currentPassword: z.string().min(6, "Debe tener al menos 6 caracteres."),
    newPassword: z.string().min(6, "Debe tener al menos 6 caracteres."),
    confirmPassword: z.string().min(6, "Debe tener al menos 6 caracteres."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

/** Tipos de datos para los formularios. */
type SecurityFormValues = z.infer<typeof securitySchema>;

/** Tipos de datos para los formularios. */
type TabValue = "account" | "health" | "security";

/***********************************************************************************************************************/
export default function ProfilePage() {
  // Restaurada la sesión y useUserApi para integración real
  const { data: session, status } = useSession();
  const { getMe } = useUserApi();
  const [profile, setProfile] = useState<UserType | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>("account");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMe();
        setProfile(data);
      } catch (error) {
        console.error("Error al cargar perfil:", error);
        toast.error("No se pudo cargar la información del perfil.");
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  // Skeleton de carga
  if (status === "loading" || isLoadingProfile) {
    return <ProfileSkeleton />;
  }

  // Datos del usuario (Priorizar los de la API sobre los de la sesión)
  const userName = profile?.name || session?.user?.name || "Usuario";
  const userLastName = profile?.lastName || "";
  const userEmail = profile?.email || session?.user?.email || "correo@ejemplo.com";

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Tabs
  const tabs = [
    { id: "account", label: "Cuenta General", icon: User },
    { id: "health", label: "Datos Clínicos", icon: HeartPulse },
    { id: "security", label: "Seguridad", icon: Lock },
  ];
  /***********************************************************************************************************************/
  //JSX
  return (
    <div className="pt-12 pb-12 min-h-[calc(100vh-4rem)]">
      <div className="container mx-auto px-4 max-w-6xl w-full">
        {/* Header Premium */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-sm border border-primary/20">
              <User className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Tu Perfil</h1>
          </div>
          <p className="text-muted-foreground text-lg ml-[3.5rem] leading-relaxed max-w-2xl">
            Gestiona tu información personal, historial médico base y las preferencias de seguridad
            de tu cuenta.
          </p>
        </motion.div>

        {/* Layout Principal: Side Menu + Contenido */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Navegación Lateral */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-4 lg:col-span-3 flex flex-col gap-2"
          >
            {/* Banner Pequeño de Usuario */}
            <div className="bg-card border border-border/50 rounded-2xl p-5 flex items-center gap-4 mb-4 shadow-sm">
              <Avatar className="w-12 h-12 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-foreground truncate">{userName}</span>
                <span className="text-xs text-muted-foreground truncate">{userEmail}</span>
              </div>
            </div>

            {/* Menú Vertical */}
            <div className="flex flex-col gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabValue)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 px-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </motion.div>

          {/* Área de Contenido Dinámico */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-8 lg:col-span-9"
          >
            <AnimatePresence mode="wait">
              {activeTab === "account" && (
                <AccountTab
                  key="account"
                  user={profile!}
                  onUpdate={(newProfile) => setProfile(newProfile)}
                  initials={initials}
                />
              )}
              {activeTab === "health" && (
                <HealthTab
                  key="health"
                  user={profile!}
                  onUpdate={(newProfile) => setProfile(newProfile)}
                />
              )}
              {activeTab === "security" && <SecurityTab key="security" />}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/***********************************************************************************************************************/
/** Tab: Cuenta General. */
function AccountTab({
  user,
  onUpdate,
  initials,
}: {
  user: UserType;
  onUpdate: (u: UserType) => void;
  initials: string;
}) {
  // Restaurado isSubmitting
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateMe } = useUserApi();

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: user.name,
      lastName: user.lastName || "",
      email: user.email,
      phone: user.phone || "",
    },
  });

  /***********************************************************************************************************************/
  //Métodos
  /** Método que se ejecuta al enviar el formulario. */
  const onSubmit = async (data: AccountFormValues) => {
    setIsSubmitting(true);
    try {
      await updateMe(data);
      onUpdate({ ...user, ...data });
      toast.success("Perfil actualizado con éxito", {
        description: "Tus datos personales han sido guardados en el servidor.",
      });
    } catch (error) {
      toast.error("Error al actualizar el perfil.");
    } finally {
      setIsSubmitting(false);
    }
  };
  /***********************************************************************************************************************/
  //JSX
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-border/60 shadow-lg shadow-background/5 overflow-hidden">
        <CardHeader className="bg-muted/30 border-b pb-6">
          <CardTitle className="text-xl">Información General</CardTitle>
          <CardDescription>
            Actualiza tu foto y los detalles de contacto de tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {/* FOTO DE PERFIL */}
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 p-4 rounded-2xl border border-dashed border-border/80 bg-muted/20">
            <Avatar className="w-20 h-20 ring-4 ring-background shadow-xl">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2 text-center sm:text-left">
              <h4 className="font-semibold text-foreground">Foto de perfil</h4>
              <p className="text-xs text-muted-foreground mr-4 max-w-[250px]">
                Sube una imagen para reconocerte fácilmente en los informes generados. (Max 2MB)
              </p>
              <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
                <Button variant="secondary" size="sm" className="h-8">
                  <Camera className="w-3.5 h-3.5 mr-2" />
                  Subir nueva
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-destructive hover:bg-destructive/10"
                >
                  Quitar
                </Button>
              </div>
            </div>
          </div>

          {/* FORMULARIO */}
          <form id="account-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="name" {...form.register("name")} className="pl-10" />
                </div>
                {form.formState.errors.name && (
                  <p className="text-xs text-red-500 mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Apellidos</Label>
                <Input id="lastName" {...form.register("lastName")} placeholder="Tus apellidos" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" {...form.register("email")} className="pl-10" />
                </div>
                {form.formState.errors.email && (
                  <p className="text-xs text-red-500 mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono (Opcional)</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    {...form.register("phone")}
                    placeholder="+34 600 000 000"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t py-4 px-6 flex justify-end">
          <Button
            type="submit"
            form="account-form"
            disabled={isSubmitting || !form.formState.isDirty}
            className="min-w-[120px] gradient-bg border-none shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              "Guardando..."
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Guardar Cambios
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

/***********************************************************************************************************************/
/** Tab: Salud / Medical. */
function HealthTab({ user, onUpdate }: { user: UserType; onUpdate: (u: UserType) => void }) {
  // Estados
  const [isSubmitting, setIsSubmitting] = useState(false);
  /***********************************************************************************************************************/
  // useUserApi
  const { updateMe } = useUserApi();

  const form = useForm<HealthFormValues>({
    resolver: zodResolver(healthSchema),
    defaultValues: {
      bloodType: user.medical_data?.bloodType || "",
      height: user.medical_data?.height || "",
      weight: user.medical_data?.weight || "",
      allergies: user.medical_data?.allergies || "",
      conditions: user.medical_data?.conditions || "",
    },
  });

  /***********************************************************************************************************************/
  //Métodos
  /** Método que se ejecuta al enviar el formulario. */
  const onSubmit = async (data: HealthFormValues) => {
    setIsSubmitting(true);
    try {
      // Llamada real al back enviando medical_data
      await updateMe({ medical_data: data });
      onUpdate({ ...user, medical_data: data });
      toast.success("Expediente base actualizado", {
        description: "Esta información ayudará a la IA a personalizar tus lecturas.",
      });
    } catch (error) {
      toast.error("Error al guardar los datos médicos.");
    } finally {
      setIsSubmitting(false);
    }
  };
  /***********************************************************************************************************************/
  //JSX
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-border/60 shadow-lg shadow-background/5 overflow-hidden">
        <CardHeader className="bg-muted/30 border-b pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Datos Médicos Base</CardTitle>
              <CardDescription>
                Para mejorar la precisión interpretativa de tus analíticas.
              </CardDescription>
            </div>
            <div className="hidden sm:flex p-2 bg-red-400/10 text-red-500 rounded-full">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 bg-primary/10 border border-primary/20 text-primary p-3 rounded-lg flex items-start gap-3 text-sm">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <p>
              Tus datos clínicos están encriptados y se utilizan única y exclusivamente como
              contexto adicional para el motor de IA de DeepSeek durante el resumen.
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form id="health-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="bloodType">Grupo Sanguíneo</Label>
                <div className="relative">
                  <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500/70 z-10" />
                  <Select
                    value={form.watch("bloodType")}
                    onValueChange={(val) => form.setValue("bloodType", val, { shouldDirty: true })}
                  >
                    <SelectTrigger className="pl-10 bg-background">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Estatura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="Ej: 175"
                  {...form.register("height")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="Ej: 70"
                  {...form.register("weight")}
                />
              </div>

              <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                <Label htmlFor="allergies">Alergias Conocidas</Label>
                <Input
                  id="allergies"
                  placeholder="Polen, Penicilina... (Separado por comas)"
                  {...form.register("allergies")}
                />
              </div>

              <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                <Label htmlFor="conditions">Condiciones Preexistentes</Label>
                <Input
                  id="conditions"
                  placeholder="Hipotiroidismo, Diabetes Tipo 2..."
                  {...form.register("conditions")}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t py-4 px-6 flex justify-end">
          <Button
            type="submit"
            form="health-form"
            disabled={isSubmitting || !form.formState.isDirty}
            className="min-w-[120px] bg-red-500 hover:bg-red-600 text-white border-none shadow-md shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              "Guardando..."
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Guardar Informe
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

/***********************************************************************************************************************/
/** Tab: Seguridad. */
function SecurityTab() {
  // Estados
  const [isSubmitting, setIsSubmitting] = useState(false);
  /***********************************************************************************************************************/
  // Hooks
  const form = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  /***********************************************************************************************************************/
  //Métodos
  /** Método que se ejecuta al enviar el formulario. */
  const onSubmit = async (data: SecurityFormValues) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    form.reset();
    toast.success("Contraseña actualizada", {
      description: "Por seguridad hemos cerrado tus sesiones en otros dispositivos.",
    });
    setIsSubmitting(false);
  };
  /***********************************************************************************************************************/
  //JSX
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-border/60 shadow-lg shadow-background/5 overflow-hidden">
        <CardHeader className="bg-muted/30 border-b pb-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <CardTitle className="text-xl">Seguridad de la Cuenta</CardTitle>
          </div>
          <CardDescription>
            Actualiza tu contraseña periódicamente para mantener tu cuenta segura.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form
            id="security-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 max-w-md"
          >
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Contraseña Actual</Label>
              <Input id="currentPassword" type="password" {...form.register("currentPassword")} />
              {form.formState.errors.currentPassword && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            <hr className="border-border/50" />

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <Input id="newPassword" type="password" {...form.register("newPassword")} />
              {form.formState.errors.newPassword && (
                <p className="text-xs text-red-500">{form.formState.errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
              <Input id="confirmPassword" type="password" {...form.register("confirmPassword")} />
              {form.formState.errors.confirmPassword && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="pt-2">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer">
                <AlertCircle className="w-3.5 h-3.5" />
                ¿Olvidaste tu contraseña actual? Recuperar.
              </p>
            </div>
          </form>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t py-4 px-6 flex justify-end">
          <Button
            type="submit"
            form="security-form"
            disabled={isSubmitting || !form.formState.isDirty}
            className="min-w-[120px] disabled:opacity-50"
          >
            {isSubmitting ? "Autenticando..." : "Actualizar Contraseña"}
          </Button>
        </CardFooter>
      </Card>

      {/* 2FA Upsell Visual (solo diseño) */}
      <div
        className="mt-6 border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl p-6 flex flex-col 
      m:flex-row items-center justify-between gap-4"
      >
        <div>
          <h4 className="font-bold text-foreground mb-1">Doble Factor de Autenticación (2FA)</h4>
          <p className="text-sm text-muted-foreground max-w-xl">
            Protege tu información clínica con un nivel extra de seguridad sincronizando la App de
            Autenticación de Google o Microsoft.
          </p>
        </div>
        <Button
          variant="outline"
          className="shrink-0 border-primary text-primary hover:bg-primary/10"
        >
          Activar 2FA
        </Button>
      </div>
    </motion.div>
  );
}

/***********************************************************************************************************************/
/** Skeleton General. */
function ProfileSkeleton() {
  return (
    <div className="pt-12 pb-8 container mx-auto px-4 max-w-6xl">
      <Skeleton className="h-10 w-64 mb-4" />
      <Skeleton className="h-6 w-96 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-4 lg:col-span-3 space-y-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div className="md:col-span-8 lg:col-span-9">
          <Skeleton className="h-[500px] w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

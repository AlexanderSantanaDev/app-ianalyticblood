"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  ShieldCheck,
  Database,
  Sparkles,
  CheckCircle2,
  Lock,
  AlertTriangle,
  AlertCircle,
  Activity,
  FileText,
  Heart,
  Microscope,
  Compass,
  CircleDot,
  Crown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { useEffect } from "react";
/****************************************************************************************************************************/
// Copiamos la función de compresión del FileUpload original para evitar OOM
const MAX_IMAGE_PX = 1600;
const JPEG_QUALITY = 0.85;
/****************************************************************************************************************************/
async function compressImageIfNeeded(file: File): Promise<File> {
  // Si no es una imagen, devolvemos el archivo original
  if (!file.type.startsWith("image/")) return file;

  // Si es una imagen, la comprimimos
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const { width, height } = img;
      const longest = Math.max(width, height);
      if (longest <= MAX_IMAGE_PX) {
        resolve(file);
        return;
      }
      const scale = MAX_IMAGE_PX / longest;
      const newW = Math.round(width * scale);
      const newH = Math.round(height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = newW;
      canvas.height = newH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, newW, newH);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressed = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, ".jpg"),
            { type: "image/jpeg", lastModified: Date.now() },
          );
          resolve(compressed);
        },
        "image/jpeg",
        JPEG_QUALITY,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };
    img.src = objectUrl;
  });
}
/****************************************************************************************************************************/
export default function PreviewUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [hasUsedPreview, setHasUsedPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_FILE_SIZE = 20 * 1024 * 1024;

  // Bloqueo global de clic derecho e inspección a nivel de documento
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
    };

    // Bloqueamos menú contextual y selección de texto en todo el DOM
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("selectstart", handleSelectStart);

    // También deshabilitamos atajos de teclado típicos de DevTools
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey &&
          e.shiftKey &&
          (e.key === "I" || e.key === "C" || e.key === "J")) ||
        (e.metaKey &&
          e.altKey &&
          (e.key === "i" || e.key === "c" || e.key === "j")) ||
        e.key === "F12"
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  /****************************************************************************************************************************/
  // Métodos
  /** Simula el progreso de carga. */
  const simulateProgress = () => {
    setProgress(10);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 5;
      });
    }, 800);
    return interval;
  };

  /** Procesa el archivo y muestra los resultados. */
  const processFile = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Archivo demasiado grande", { description: "Máximo 20MB." });
      return;
    }

    setIsAnalyzing(true);
    const progressInterval = simulateProgress();

    try {
      const fileToUpload = await compressImageIfNeeded(file);
      const formData = new FormData();
      formData.append("file", fileToUpload);

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const response = await fetch(`${API_URL}/upload/preview`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setHasUsedPreview(true);
          throw new Error(data.detail || "Prueba gratuita agotada.");
        }
        throw new Error(data.detail || "Error al procesar el archivo.");
      }

      setProgress(100);
      setResult(data.analysis);
      setHasUsedPreview(true);
      toast.success("Análisis de prueba completado con éxito");
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => setIsAnalyzing(false), 500);
    }
  };

  /** Maneja el evento de arrastrar y soltar archivos. */
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (hasUsedPreview || isAnalyzing) return;
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    [hasUsedPreview, isAnalyzing],
  );

  /** Maneja el evento de cambio de archivos. */
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      const { files } = e.target;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    [],
  );
  /****************************************************************************************************************************/
  // Si el backend devuelve score 0 (o no lo devuelve), calculamos uno basado en los parámetros
  // para que la interfaz nunca se quede rota (Score = (óptimos*100 + atención*50) / total)
  const optimalCount = result?.counts?.optimal || 0;
  const attentionCount = result?.counts?.attention || 0;
  const criticalCount = result?.counts?.critical || 0;
  const totalCount = optimalCount + attentionCount + criticalCount;

  const calculatedScore =
    totalCount > 0
      ? Math.round(
          (optimalCount * 100 + attentionCount * 50 + criticalCount * 0) /
            totalCount,
        )
      : 0;

  const displayScore = result?.score || calculatedScore;
  /****************************************************************************************************************************/
  // Render
  return (
    <div
      className={`relative w-full mx-auto transition-all duration-700 select-none ${result ? "max-w-5xl" : "max-w-md"}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl -z-10 pointer-events-none" />

      <div className="bg-card rounded-3xl shadow-2xl overflow-hidden border border-border  p-[6px] sm:p-6 md:p-8 relative">
        {/* Overlay de carga */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-md z-50 p-6 rounded-3xl"
            >
              <div className="flex flex-col gap-6 items-center text-center w-full max-w-sm">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full group-hover:bg-primary/30 transition-all duration-500" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="relative w-20 h-20 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                      {progress < 40 ? (
                        <Database
                          className="text-primary animate-pulse"
                          size={20}
                        />
                      ) : progress < 80 ? (
                        <Sparkles
                          className="text-primary animate-pulse"
                          size={20}
                        />
                      ) : (
                        <CheckCircle2 className="text-primary" size={20} />
                      )}
                    </div>
                  </motion.div>
                </div>
                <div className="w-full space-y-4">
                  <h4 className="text-foreground font-bold text-lg tracking-tight">
                    Analizando (Prueba Gratuita)...
                  </h4>
                  <Progress value={progress} className="h-2 bg-primary/10" />
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Lock size={12} /> Tus datos están seguros y se borrarán al
                    instante.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vista de Resultados vs Vista de Subida */}
        {!result ? (
          <>
            <div
              className={`flex flex-col items-center justify-center min-h-[250px] border-2 border-dashed rounded-xl transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-primary/50 hover:bg-muted/30"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <div className="text-center p-6 w-full">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-medium text-lg">
                  {hasUsedPreview
                    ? "Prueba gratuita agotada"
                    : "Arrastra tu informe aquí"}
                </p>
                <p className="text-sm text-muted-foreground mt-1 mb-6">
                  {hasUsedPreview
                    ? "Regístrate para seguir analizando."
                    : "Límite: 1 análisis gratuito. PDF o Imagen."}
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                  disabled={hasUsedPreview || isAnalyzing}
                />

                {hasUsedPreview ? (
                  <Link href="/register" className="w-full">
                    <Button className="w-full gradient-bg">
                      Registrarse Gratis
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="gradient-bg w-full"
                  >
                    Seleccionar archivo
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/50">
              <ShieldCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>
                Privacidad 100% garantizada. Archivos destruidos tras análisis.
              </span>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            <div className="bg-muted/20 border border-border rounded-2xl p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-4 flex flex-col items-center justify-center py-2">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg
                      viewBox="0 0 160 160"
                      className="absolute inset-0 w-full h-full -rotate-90 overflow-visible"
                      aria-hidden="true"
                    >
                      {/* Pista de fondo */}
                      <circle
                        cx="80"
                        cy="80"
                        r="68"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-muted"
                      />
                      {/* Arco de progreso */}
                      <circle
                        cx="80"
                        cy="80"
                        r="68"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray={`${2 * Math.PI * 68}`}
                        strokeDashoffset={
                          2 * Math.PI * 68 -
                          (2 * Math.PI * 68 * displayScore) / 100
                        }
                        className="text-primary transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                      />
                    </svg>
                    {/* Contenido centrado */}
                    <div className="relative z-10 text-center">
                      <span className="text-5xl font-black gradient-text">
                        {displayScore}
                      </span>
                      <p className="text-xs font-medium text-muted-foreground mt-1">
                        Puntuación
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tarjetas de Conteo */}
                <div className="md:col-span-8 grid grid-cols-2 gap-4">
                  <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2
                        className="text-green-600 dark:text-green-400"
                        size={20}
                      />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {result.counts?.optimal || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Óptimos
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle
                        className="text-amber-600 dark:text-amber-400"
                        size={20}
                      />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {result.counts?.attention || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Atención
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm col-span-2 sm:col-span-1">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                      <AlertCircle
                        className="text-red-600 dark:text-red-400"
                        size={20}
                      />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {result.counts?.critical || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Críticos
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm col-span-2 sm:col-span-1">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Activity className="text-primary" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {(result.counts?.optimal || 0) +
                          (result.counts?.attention || 0) +
                          (result.counts?.critical || 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Analizados
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="mt-6 flex items-center justify-center gap-2 text-[8px]
              bg-muted/50 py-2 px-4 rounded-full border border-border
              max-w-full mx-auto text-center"
              >
                <Lock
                  size={14}
                  className="text-muted-foreground flex-shrink-0"
                />
                <span className="text-muted-foreground font-medium">
                  Los resultados que definieron tu puntuación se explican abajo
                </span>
              </div>
            </div>

            {/* 📑 SECCIONES DE ANÁLISIS PROFUNDO */}
            {result.analysis_sections &&
              result.analysis_sections.length > 0 && (
                <div className="space-y-6 pt-6">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold">Análisis Detallado</h3>
                    <p className="text-muted-foreground mt-1">
                      Interpretación impulsada por IA de sus resultados
                    </p>
                  </div>

                  <div className="space-y-6">
                    {result.analysis_sections.map(
                      (section: any, idx: number) => {
                        // Helper para el icono
                        const renderIcon = (name: string) => {
                          switch (name) {
                            case "Activity":
                              return (
                                <Activity
                                  className="text-primary bg-primary/10 p-2 rounded-xl"
                                  size={40}
                                />
                              );
                            case "FileText":
                              return (
                                <FileText
                                  className="text-blue-500 bg-blue-500/10 p-2 rounded-xl"
                                  size={40}
                                />
                              );
                            case "Heart":
                              return (
                                <Heart
                                  className="text-rose-500 bg-rose-500/10 p-2 rounded-xl"
                                  size={40}
                                />
                              );
                            case "Microscope":
                              return (
                                <Microscope
                                  className="text-purple-500 bg-purple-500/10 p-2 rounded-xl"
                                  size={40}
                                />
                              );
                            case "AlertTriangle":
                              return (
                                <AlertTriangle
                                  className="text-amber-500 bg-amber-500/10 p-2 rounded-xl"
                                  size={40}
                                />
                              );
                            case "Compass":
                              return (
                                <Compass
                                  className="text-teal-500 bg-teal-500/10 p-2 rounded-xl"
                                  size={40}
                                />
                              );
                            default:
                              return (
                                <Sparkles
                                  className="text-primary bg-primary/10 p-2 rounded-xl"
                                  size={40}
                                />
                              );
                          }
                        };

                        return (
                          <div
                            key={idx}
                            className="bg-card border border-border shadow-md rounded-3xl overflow-hidden relative"
                          >
                            {/* Cabecera de la Tarjeta */}
                            <div className="p-6 md:p-8 flex items-start justify-between border-b border-border/50 bg-muted/20">
                              <div className="flex gap-4 items-center">
                                {renderIcon(section.icon)}
                                <div>
                                  <h4 className="font-bold text-xl">
                                    {section.title}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {section.subtitle}
                                  </p>
                                </div>
                              </div>
                              <div
                                className="flex-shrink-0 inline-flex items-center gap-1 whitespace-nowrap
                              bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400
                              text-xs font-bold px-3 py-1 rounded-full shadow-sm"
                              >
                                <Crown size={12} className="flex-shrink-0" />
                                Premium
                              </div>
                            </div>

                            {/* Contenido (Viñetas Mixtas) */}
                            <div className="p-6 md:p-8 space-y-5">
                              {section.items &&
                                section.items.map((item: any, i: number) => (
                                  <div
                                    key={i}
                                    className={`flex gap-3 items-start transition-all duration-300 ${
                                      !item.is_real
                                        ? "blur-[4px] select-none pointer-events-none opacity-50"
                                        : ""
                                    }`}
                                  >
                                    <CircleDot
                                      className="text-primary mt-1 flex-shrink-0"
                                      size={16}
                                      strokeWidth={3}
                                    />
                                    <p className="text-foreground leading-relaxed">
                                      {item.text}
                                    </p>
                                  </div>
                                ))}
                            </div>

                            {/* Footer / CTA de Desbloqueo */}
                            <div className="px-6 md:px-8 py-4 bg-muted/30 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                <Lock size={14} /> +{section.hidden_count || 3}{" "}
                                puntos ocultos
                              </div>
                              <Link
                                href="/register"
                                className="w-full md:w-auto"
                              >
                                <Button className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl shadow-sm">
                                  <Lock size={16} className="mr-2" />
                                  Ver {section.title.split(" ")[0]} Completo
                                </Button>
                              </Link>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              )}

            {/* Parámetros de Análisis de Sangre */}
            <div className="space-y-6 pt-10">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold">
                  Parámetros de Análisis de Sangre
                </h3>
                <p className="text-muted-foreground mt-1">
                  Valores biomarcadores extraídos de su informe
                </p>
              </div>

              <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(result.parameters || {}).map(
                    ([key, data]: any) => {
                      const isReal = data.is_real;
                      const min = data.reference_range?.[0] || 0;
                      const max = data.reference_range?.[1] || 100;
                      const val = data.value || 0;

                      let percent = 50;
                      if (max > min) {
                        percent = ((val - min) / (max - min)) * 100;
                        if (percent < 0) percent = 5;
                        if (percent > 100) percent = 95;
                      }

                      return (
                        <div
                          key={key}
                          className={`p-6 border rounded-2xl flex flex-col justify-between transition-all duration-300 h-full ${
                            isReal
                              ? "bg-card border-border shadow-md"
                              : "bg-card/40 border-border/50 blur-[5px] select-none pointer-events-none opacity-60"
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="font-bold text-lg">{key}</h4>
                              <div
                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  data.status === "muy_alto"
                                    ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                                    : data.status === "alto" ||
                                        data.status === "bajo"
                                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                                      : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                                }`}
                              >
                                {data.status === "muy_alto"
                                  ? "Crítico"
                                  : data.status === "alto"
                                    ? "Alto"
                                    : data.status === "bajo"
                                      ? "Bajo"
                                      : "Normal"}
                              </div>
                            </div>

                            <div className="flex items-baseline gap-1 mb-6">
                              <span className="text-4xl font-black">
                                {data.value}
                              </span>
                              <span className="text-sm font-medium text-muted-foreground">
                                {data.unit}
                              </span>
                            </div>

                            <div className="space-y-2 mb-6">
                              <div className="relative h-2 w-full rounded-full overflow-hidden flex">
                                <div className="h-full bg-red-400/80 w-1/4" />
                                <div className="h-full bg-green-400/80 w-2/4" />
                                <div className="h-full bg-red-400/80 w-1/4" />
                                <div
                                  className="absolute top-0 bottom-0 w-1 bg-foreground rounded-full transform -translate-x-1/2 z-10"
                                  style={{ left: `${percent}%` }}
                                />
                              </div>
                              <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5">
                                <div className="w-3 h-1.5 bg-muted rounded-sm" />{" "}
                                Rango de Referencia: {min} - {max} {data.unit}
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground leading-relaxed mt-4 border-t border-border/50 pt-4">
                            {data.description}
                          </p>
                        </div>
                      );
                    },
                  )}
                </div>

                <div
                  className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background via-background/90 to-transparent flex flex-col 
                items-center justify-end pb-4 z-10"
                >
                  <div
                    className="bg-card/90 backdrop-blur-md border border-primary/20 shadow-2xl rounded-3xl p-6 flex flex-col items-center 
                  max-w-sm w-full mx-auto transform translate-y-4"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                      <Lock className="text-primary" size={24} />
                    </div>
                    <p className="text-base font-bold text-center mb-1">
                      +{result.total_parameters_hidden || 15} parámetros ocultos
                    </p>
                    <p className="text-sm text-muted-foreground text-center mb-5">
                      Algunos de tus valores requieren una revisión más
                      detallada.
                    </p>
                    <Link href="/register" className="w-full">
                      <Button className="w-full gradient-bg shadow-md rounded-xl h-11 font-semibold">
                        Ver informe completo
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

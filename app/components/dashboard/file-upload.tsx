"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FileUploadProps } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useApiFetch } from "@/lib/api/client";
import { useAnalysis } from "@/hooks/analysis-context";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ShieldCheck, Database, Sparkles, CheckCircle2 } from "lucide-react";
/****************************************************************************************************************************/
export const FileUpload = ({ onUpload }: FileUploadProps) => {
  // Estados
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const apiFetch = useApiFetch();
  const { startAnalysis, isAnalyzing, progress, currentStep } = useAnalysis();
  // Referencia al input de archivo para evitar document.getElementById
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Límite de 20MB para archivos subidos
  const MAX_FILE_SIZE = 20 * 1024 * 1024;

  // Cleanup de previewUrl al desmontar para evitar memory leaks
  useEffect(() => {
    return () => {
      setPreviewUrl(null);
    };
  }, []);
  /****************************************************************************************************************************/
  // Métodos
  /** Maneja el cambio de archivo */
  // Envolver handleChange en useCallback para memoización
  const handleChange = useCallback((f: File) => {
    // Validación de tamaño máximo de archivo (20MB)
    if (f.size > MAX_FILE_SIZE) {
      toast.error("Archivo demasiado grande", {
        description: `El archivo pesa ${(f.size / 1024 / 1024).toFixed(1)}MB. El máximo permitido es 20MB.`,
      });
      return;
    }
    setFile(f);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(f);
    }
  }, []);

  /** Maneja el procesamiento del archivo */
  // Envolver handleProcess en useCallback para memoización
  const handleProcess = useCallback(async () => {
    if (!file) return;
    try {
      await startAnalysis(file, apiFetch);
      onUpload(file);
    } catch (err: any) {
      // El error ya se maneja en el context, pero podemos limpiar estado local aquí si hace falta
    } finally {
      setFile(null);
      setPreviewUrl(null);
    }
  }, [file, startAnalysis, apiFetch, onUpload]);

  /** Maneja el arrastre del archivo */
  // Envolver handleDragOver en useCallback para memoización
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  /** Maneja la salida del arrastre del archivo */
  // Envolver handleDragLeave en useCallback para memoización
  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  /** Maneja la caída del archivo */
  // Envolver handleDrop en useCallback para memoización
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const droppedFile = files[0];
        const isPdf = droppedFile.type === "application/pdf";
        const isImage = droppedFile.type.startsWith("image/");
        if (isPdf || isImage) {
          handleChange(droppedFile);
        } else {
          console.warn(
            "Formato de archivo no válido. Sube un PDF o una imagen.",
          );
        }
      }
    },
    [handleChange],
  );

  /** Maneja el cambio de archivo */
  // Envolver handleFileChange en useCallback para memoización
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      const { files } = e.target;
      if (files && files.length > 0) {
        const selectedFile = files[0];
        const isPdf = selectedFile.type === "application/pdf";
        const isImage = selectedFile.type.startsWith("image/");
        if (isPdf || isImage) {
          handleChange(selectedFile);
        } else {
          console.warn(
            "Formato de archivo no válido. Sube un PDF o una imagen.",
          );
        }
      }
    },
    [handleChange],
  );
  /****************************************************************************************************************************/
  //JSX
  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
        isDragging ? "border-primary bg-primary/5" : "border-border"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Loader overlay más con BARRA DE PROGRESO */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-xl rounded-xl z-50 p-6"
          >
            <div className="flex flex-col gap-8 items-center text-center w-full max-w-md">
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full group-hover:bg-primary/30 transition-all duration-500" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="relative w-24 h-24 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    {progress < 30 ? (
                      <Database
                        className="text-primary animate-pulse"
                        size={28}
                      />
                    ) : progress < 70 ? (
                      <Sparkles
                        className="text-primary animate-pulse"
                        size={28}
                      />
                    ) : progress < 95 ? (
                      <ShieldCheck
                        className="text-primary animate-pulse"
                        size={28}
                      />
                    ) : (
                      <CheckCircle2 className="text-primary" size={28} />
                    )}
                  </div>
                </motion.div>
              </div>

              <div className="w-full space-y-4">
                <div className="space-y-1">
                  <motion.h4
                    key={currentStep}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-foreground font-bold text-lg tracking-tight"
                  >
                    {currentStep}
                  </motion.h4>
                  <p className="text-muted-foreground text-sm font-medium">
                    {Math.round(progress)}% completado
                  </p>
                </div>

                <div className="relative pt-2">
                  <Progress
                    value={progress}
                    className="h-2 bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.2)]"
                  />
                  {/* Destello sutil que sigue al progreso */}
                  <motion.div
                    className="absolute top-2 left-0 h-2 bg-white/40 blur-sm rounded-full pointer-events-none"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2">
                  {[20, 50, 85, 100].map((step, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-500 ${progress >= step ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" : "bg-muted"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mx-auto w-16 h-16 mb-4 text-muted-foreground">
        <Upload className="w-full h-full" />
      </div>
      <h3 className="text-lg font-medium mb-2">
        {file ? file.name : "Arrastra y suelta tu PDF o imagen aquí"}
      </h3>
      <p className="text-muted-foreground mb-4">
        {file
          ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
          : "o haz clic para seleccionar un archivo"}
      </p>
      {/* Usar ref en lugar de id para acceso directo al input */}
      <input
        ref={fileInputRef}
        type="file"
        id="file-upload"
        className="hidden"
        accept=".pdf,image/*"
        onChange={handleFileChange}
      />
      <label htmlFor="file-upload">
        <Button
          variant={file ? "outline" : "default"}
          onClick={(e) => {
            e.preventDefault();
            // Usar fileInputRef en lugar de document.getElementById
            fileInputRef.current?.click();
          }}
          className={file ? "" : "gradient-bg"}
          disabled={isAnalyzing}
        >
          {file ? "Cambiar archivo" : "Seleccionar archivo"}
        </Button>
      </label>
      {previewUrl && (
        <div className="mt-4">
          <img
            src={previewUrl}
            alt="Vista previa"
            className="w-32 h-32 object-cover rounded-lg mx-auto"
          />
        </div>
      )}
      {file && (
        <Button
          className="ml-2 gradient-bg"
          onClick={handleProcess}
          disabled={isAnalyzing}
        >
          Procesar archivo
        </Button>
      )}
    </div>
  );
};

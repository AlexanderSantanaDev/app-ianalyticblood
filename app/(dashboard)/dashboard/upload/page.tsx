"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { FileUpload } from "@/components/dashboard/file-upload";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
/***********************************************************************************************************************/
export default function UploadPage() {
  const router = useRouter();
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  /** Maneja el proceso post-subida */
  const handleUploadComplete = (file: File) => {
    setUploadedFile(file);
    setUploadSuccess(true);
  };

  /** Redirige al historial para ver el resultado */
  const goToHistory = () => {
    router.push("/dashboard/history");
  };

  /** Resetea el estado para subir otro archivo */
  const resetUpload = () => {
    setUploadSuccess(false);
    setUploadedFile(null);
  };
  /***********************************************************************************************************************/
  //JSX
  return (
    <div className="pt-12 pb-6 min-h-[calc(100dvh-4rem)] flex flex-col">
      <div className="container mx-auto px-4 max-w-4xl flex-grow flex flex-col justify-center">
        {/* Header de la página */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
            <FlaskConical className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 gradient-text">
            Sube tu análisis de sangre
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Extraemos de forma inteligente tus biomarcadores empleando IA clínica para ofrecerte
            métricas claras y comprensibles sobre tu estado de salud.
          </p>
        </motion.div>

        {/* Contenedor animado (Upload o Success) */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {!uploadSuccess ? (
              <motion.div
                key="upload-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="border-border/50 shadow-xl shadow-primary/5 bg-background/50 backdrop-blur-sm overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 via-secondary/40 to-primary/40"></div>
                  <CardHeader className="text-center pb-2 pt-8">
                    <CardTitle className="text-2xl">Archivo de resultados</CardTitle>
                    <CardDescription className="text-base mt-2">
                      Formatos soportados: PDF, JPG, PNG (máx. 10MB)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 md:p-10">
                    <div className="max-w-2xl mx-auto">
                      <FileUpload onUpload={handleUploadComplete} />
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/30 border-t p-6 flex justify-center text-sm text-muted-foreground text-center">
                    Tus datos médicos se procesan de forma segura y nunca se comparten con terceros
                    sin tu consentimiento.
                  </CardFooter>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="upload-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                <Card className="border-green-500/20 shadow-xl shadow-green-500/10 bg-green-500/5 overflow-hidden text-center py-12">
                  <CardContent className="flex flex-col items-center justify-center space-y-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="w-20 h-20 bg-green-500/20 text-green-600 rounded-full flex items-center justify-center mb-2"
                    >
                      <CheckCircle2 className="w-10 h-10" />
                    </motion.div>

                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-foreground">
                        ¡Análisis procesado con éxito!
                      </h2>
                      <p className="text-muted-foreground text-lg">
                        El archivo{" "}
                        <span className="font-semibold text-foreground">{uploadedFile?.name}</span>{" "}
                        centralizado en tu historial.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-6 w-full max-w-sm mx-auto">
                      <Button
                        onClick={goToHistory}
                        className="w-full flex-1 gradient-bg text-white h-12 text-base shadow-lg shadow-primary/25"
                      >
                        Ver resultados <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={resetUpload}
                        className="w-full sm:w-auto h-12 hover:bg-background"
                      >
                        Subir otro
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

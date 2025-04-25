"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart,
  Calendar,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";

interface FileUploadProps {
  // onUpload recibe un File, o null, o lo que prefieras.
  // Cambia a (file: File | null) => void si quieres contemplar archivos nulos
  onUpload: (file: File) => void;
}

interface Analysis {
  id: number;
  title: string;
  date: string;
  // Si sabes que `status` solo puede ser "normal", "warning" o "alert",
  // usa un tipo literal:
  status: "normal" | "warning" | "alert";
  statusText: string;
  description: string;
}

// Luego las props para el componente:
interface RecentAnalysisProps {
  analysis: Analysis;
}

// Componente para subir archivos
const FileUpload = ({ onUpload }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const droppedFile = files[0];

      // Permitir PDF o cualquier imagen
      const isPdf = droppedFile.type === "application/pdf";
      const isImage = droppedFile.type.startsWith("image/");

      if (isPdf || isImage) {
        setFile(droppedFile);
        onUpload(droppedFile);
      } else {
        // Aquí podrías mostrar algún mensaje de error
        // toast.error("Formato de archivo no válido. Sube un PDF o una imagen.");
        console.warn("Formato de archivo no válido. Sube un PDF o una imagen.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      const selectedFile = files[0];

      const isPdf = selectedFile.type === "application/pdf";
      const isImage = selectedFile.type.startsWith("image/");

      if (isPdf || isImage) {
        setFile(selectedFile);
        onUpload(selectedFile);
      } else {
        console.warn("Formato de archivo no válido. Sube un PDF o una imagen.");
      }
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
        isDragging ? "border-primary bg-primary/5" : "border-border"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
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

      {/* Ahora aceptamos PDF e imágenes */}
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept=".pdf,image/*"
        onChange={handleFileChange}
      />

      <label htmlFor="file-upload">
        <Button variant={file ? "outline" : "default"} className={file ? "" : "gradient-bg"}>
          {file ? "Cambiar archivo" : "Seleccionar archivo"}
        </Button>
      </label>

      {file && (
        <Button className="ml-2 gradient-bg" onClick={() => console.log("Procesando archivo...")}>
          Procesar archivo
        </Button>
      )}
    </div>
  );
};

// Componente de análisis reciente
const RecentAnalysis = ({ analysis }: RecentAnalysisProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{analysis.title}</CardTitle>
            <CardDescription>{analysis.date}</CardDescription>
          </div>
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              analysis.status === "normal"
                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100"
                : analysis.status === "warning"
                ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100"
                : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100"
            }`}
          >
            {analysis.statusText}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-4">{analysis.description}</div>
        <div className="flex justify-between">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Ver detalles
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Descargar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("upload");

  const recentAnalyses: Analysis[] = [
    {
      id: 1,
      title: "Análisis de sangre completo",
      date: "10 de abril, 2025",
      status: "normal", // <<-- Se asocia al literal 'normal'
      statusText: "Normal",
      description:
        "Todos los valores están dentro de los rangos normales. No se requiere acción adicional.",
    },
    {
      id: 2,
      title: "Perfil lipídico",
      date: "28 de marzo, 2025",
      status: "warning", // <<-- Se asocia al literal 'warning'
      statusText: "Atención",
      description: "Niveles de colesterol ligeramente elevados. Se recomienda revisión de dieta.",
    },
    {
      id: 3,
      title: "Hemograma",
      date: "15 de febrero, 2025",
      status: "alert", // <<-- Se asocia al literal 'alert'
      statusText: "Alerta",
      description: "Niveles de hierro bajos. Se recomienda consultar con un especialista.",
    },
  ];

  const handleFileUpload = (file: File) => {
    console.log("Archivo subido:", file);
    // Aquí iría la lógica para procesar el archivo
  };

  return (
    // <div className="pt-32 pb-20">
    //   <div className="container mx-auto px-4">
    //     <motion.div
    //       initial={{ opacity: 0, y: 20 }}
    //       animate={{ opacity: 1, y: 0 }}
    //       transition={{ duration: 0.6 }}
    //     >
    //       <h1 className="text-3xl font-bold mb-2">Bienvenido, Usuario</h1>
    //       <p className="text-muted-foreground mb-8">
    //         Gestiona tus análisis de sangre y obtén información valiosa sobre tu salud.
    //       </p>

    //       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    //         <Card>
    //           <CardHeader className="pb-2">
    //             <CardTitle className="text-lg">Análisis realizados</CardTitle>
    //           </CardHeader>
    //           <CardContent>
    //             <div className="flex items-center">
    //               <div className="text-4xl font-bold mr-4">12</div>
    //               <div className="text-sm text-muted-foreground">
    //                 <div className="flex items-center text-green-600">
    //                   <span className="mr-1">+2</span>
    //                   <span>este mes</span>
    //                 </div>
    //               </div>
    //             </div>
    //           </CardContent>
    //         </Card>

    //         <Card>
    //           <CardHeader className="pb-2">
    //             <CardTitle className="text-lg">Estado general</CardTitle>
    //           </CardHeader>
    //           <CardContent>
    //             <div className="flex items-center">
    //               <div className="rounded-full w-10 h-10 flex items-center justify-center bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 mr-4">
    //                 <CheckCircle className="h-6 w-6" />
    //               </div>
    //               <div>
    //                 <div className="font-medium">Saludable</div>
    //                 <div className="text-sm text-muted-foreground">
    //                   Basado en tus últimos análisis
    //                 </div>
    //               </div>
    //             </div>
    //           </CardContent>
    //         </Card>

    //         <Card>
    //           <CardHeader className="pb-2">
    //             <CardTitle className="text-lg">Próximo recordatorio</CardTitle>
    //           </CardHeader>
    //           <CardContent>
    //             <div className="flex items-center">
    //               <div className="rounded-full w-10 h-10 flex items-center justify-center bg-primary/20 text-primary mr-4">
    //                 <Calendar className="h-6 w-6" />
    //               </div>
    //               <div>
    //                 <div className="font-medium">15 de mayo, 2025</div>
    //                 <div className="text-sm text-muted-foreground">
    //                   Análisis de sangre trimestral
    //                 </div>
    //               </div>
    //             </div>
    //           </CardContent>
    //         </Card>
    //       </div>

    //       <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
    //         <TabsList className="grid grid-cols-3 mb-8">
    //           <TabsTrigger value="upload">Subir análisis</TabsTrigger>
    //           <TabsTrigger value="history">Historial</TabsTrigger>
    //           <TabsTrigger value="insights">Estadísticas</TabsTrigger>
    //         </TabsList>

    //         <TabsContent value="upload" className="space-y-8">
    //           <Card>
    //             <CardHeader>
    //               <CardTitle>Subir nuevo análisis</CardTitle>
    //               <CardDescription>
    //                 Sube tu PDF de análisis de sangre para obtener un estudio detallado.
    //               </CardDescription>
    //             </CardHeader>
    //             <CardContent>
    //               <FileUpload onUpload={handleFileUpload} />
    //             </CardContent>
    //           </Card>

    //           <div>
    //             <h3 className="text-xl font-bold mb-4">Análisis recientes</h3>
    //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    //               {recentAnalyses.map((analysis) => (
    //                 <RecentAnalysis key={analysis.id} analysis={analysis} />
    //               ))}
    //             </div>
    //           </div>
    //         </TabsContent>

    //         <TabsContent value="history">
    //           <Card>
    //             <CardHeader>
    //               <CardTitle>Historial de análisis</CardTitle>
    //               <CardDescription>
    //                 Visualiza todos tus análisis anteriores y su evolución.
    //               </CardDescription>
    //             </CardHeader>
    //             <CardContent>
    //               <div className="space-y-6">
    //                 {[...recentAnalyses, ...recentAnalyses].map((analysis, index) => (
    //                   <div
    //                     key={`${analysis.id}-${index}`}
    //                     className="flex items-start border-b border-border pb-4 last:border-0 last:pb-0"
    //                   >
    //                     <div
    //                       className={`rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center mr-4 ${
    //                         analysis.status === "normal"
    //                           ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100"
    //                           : analysis.status === "warning"
    //                           ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100"
    //                           : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100"
    //                       }`}
    //                     >
    //                       {analysis.status === "normal" ? (
    //                         <CheckCircle className="h-5 w-5" />
    //                       ) : analysis.status === "warning" ? (
    //                         <Clock className="h-5 w-5" />
    //                       ) : (
    //                         <AlertCircle className="h-5 w-5" />
    //                       )}
    //                     </div>
    //                     <div className="flex-grow">
    //                       <div className="flex justify-between items-start">
    //                         <div>
    //                           <h4 className="font-medium">{analysis.title}</h4>
    //                           <p className="text-sm text-muted-foreground">{analysis.date}</p>
    //                         </div>
    //                         <div className="flex space-x-2">
    //                           <Button variant="outline" size="sm">
    //                             <FileText className="h-4 w-4 mr-2" />
    //                             Ver
    //                           </Button>
    //                           <Button variant="outline" size="sm">
    //                             <Download className="h-4 w-4 mr-2" />
    //                             PDF
    //                           </Button>
    //                         </div>
    //                       </div>
    //                       <p className="text-sm mt-2">{analysis.description}</p>
    //                     </div>
    //                   </div>
    //                 ))}
    //               </div>
    //             </CardContent>
    //           </Card>
    //         </TabsContent>

    //         <TabsContent value="insights">
    //           <Card>
    //             <CardHeader>
    //               <CardTitle>Estadísticas y tendencias</CardTitle>
    //               <CardDescription>
    //                 Visualiza la evolución de tus valores a lo largo del tiempo.
    //               </CardDescription>
    //             </CardHeader>
    //             <CardContent>
    //               <div className="space-y-8">
    //                 <div>
    //                   <h4 className="font-medium mb-4">Niveles de colesterol</h4>
    //                   <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
    //                     <div className="text-center">
    //                       <BarChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
    //                       <p className="text-muted-foreground">Gráfico de tendencias</p>
    //                     </div>
    //                   </div>
    //                 </div>

    //                 <div>
    //                   <h4 className="font-medium mb-4">Niveles de glucosa</h4>
    //                   <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
    //                     <div className="text-center">
    //                       <BarChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
    //                       <p className="text-muted-foreground">Gráfico de tendencias</p>
    //                     </div>
    //                   </div>
    //                 </div>
    //               </div>
    //             </CardContent>
    //           </Card>
    //         </TabsContent>
    //       </Tabs>
    //     </motion.div>
    //   </div>
    // </div>
    <div className="pt-12 pb-2">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold mb-2">Bienvenido, Usuario</h1>
          <p className="text-muted-foreground mb-8">
            Gestiona tus análisis de sangre y obtén información valiosa sobre tu salud.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Análisis realizados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-4xl font-bold mr-4">12</div>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center text-green-600">
                      <span className="mr-1">+2</span>
                      <span>este mes</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Estado general</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="rounded-full w-10 h-10 flex items-center justify-center bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 mr-4">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-medium">Saludable</div>
                    <div className="text-sm text-muted-foreground">
                      Basado en tus últimos análisis
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Próximo recordatorio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="rounded-full w-10 h-10 flex items-center justify-center bg-primary/20 text-primary mr-4">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-medium">15 de mayo, 2025</div>
                    <div className="text-sm text-muted-foreground">
                      Análisis de sangre trimestral
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="upload">Subir análisis</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
              <TabsTrigger value="insights">Estadísticas</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Subir nuevo análisis</CardTitle>
                  <CardDescription>
                    Sube tu PDF de análisis de sangre para obtener un estudio detallado.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload onUpload={handleFileUpload} />
                </CardContent>
              </Card>

              <div>
                <h3 className="text-xl font-bold mb-4">Análisis recientes</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {recentAnalyses.map((analysis) => (
                    <RecentAnalysis key={analysis.id} analysis={analysis} />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de análisis</CardTitle>
                  <CardDescription>
                    Visualiza todos tus análisis anteriores y su evolución.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[...recentAnalyses, ...recentAnalyses].map((analysis, index) => (
                      <div
                        key={`${analysis.id}-${index}`}
                        className="flex items-start border-b border-border pb-4 last:border-0 last:pb-0"
                      >
                        <div
                          className={`rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center mr-4 ${
                            analysis.status === "normal"
                              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100"
                              : analysis.status === "warning"
                              ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100"
                              : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100"
                          }`}
                        >
                          {analysis.status === "normal" ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : analysis.status === "warning" ? (
                            <Clock className="h-5 w-5" />
                          ) : (
                            <AlertCircle className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{analysis.title}</h4>
                              <p className="text-sm text-muted-foreground">{analysis.date}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-2" />
                                Ver
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                PDF
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm mt-2">{analysis.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights">
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas y tendencias</CardTitle>
                  <CardDescription>
                    Visualiza la evolución de tus valores a lo largo del tiempo.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div>
                      <h4 className="font-medium mb-4">Niveles de colesterol</h4>
                      <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <BarChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">Gráfico de tendencias</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-4">Niveles de glucosa</h4>
                      <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <BarChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">Gráfico de tendencias</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

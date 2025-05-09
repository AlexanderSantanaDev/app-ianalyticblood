"use client";

import { useEffect, useMemo, useState } from "react";
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
  Inbox,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  DashboardStats,
  getAnalysesSummary,
  getDashboardStats,
  uploadFile,
} from "@/lib/api/analysis";

import { useApiFetch } from "@/lib/api/client";
import { useSession } from "next-auth/react";
import { Analysis, AnalysisSummary } from "@/types/dashboard";
import { FileUpload } from "@/components/dashboard/file-upload";
/***********************************************************************************************************************/

interface RecentProps {
  analysis: AnalysisSummary;
}

/***********************************************************************************************************************/
export default function DashboardPage() {
  const recentAnalyses: Analysis[] = [
    {
      id: 1,
      title: "Análisis de sangre completo",
      date: "10 de abril, 2025",
      status: "normal",
      statusText: "Normal",
      description: "Todos los valores están dentro de los rangos normales.",
    },
    {
      id: 2,
      title: "Perfil lipídico",
      date: "28 de marzo, 2025",
      status: "warning",
      statusText: "Atención",
      description: "Niveles de colesterol ligeramente elevados.",
    },
    {
      id: 3,
      title: "Hemograma",
      date: "15 de febrero, 2025",
      status: "alert",
      statusText: "Alerta",
      description: "Niveles de hierro bajos.",
    },
  ];
  /***********************************************************************************************************************/
  // Estaods
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<AnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upload" | "history" | "insights">("upload");
  /***********************************************************************************************************************/
  // Hooks
  const apiFetch = useApiFetch();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  /***********************************************************************************************************************/
  // Métodos
  function RecentCard({ analysis }: RecentProps) {
    const badge =
      analysis.alert_level === "normal"
        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100"
        : analysis.alert_level === "attention"
        ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100"
        : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100";

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">
                Análisis {new Date(analysis.date).toLocaleDateString("es-ES")}
              </CardTitle>
              <CardDescription>{analysis.summary}</CardDescription>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${badge}`}>
              {analysis.alert_level === "normal"
                ? "Normal"
                : analysis.alert_level === "attention"
                ? "Atención"
                : "Alerta"}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Ver detalles
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Descargar
          </Button>
        </CardContent>
      </Card>
    );
  }

  function EmptyPlaceholder() {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg">
        <Inbox className="w-10 h-10 mb-4 text-muted-foreground" />
        <p className="font-medium">Todavía no hay análisis recientes</p>
        <p className="text-muted-foreground text-sm mt-2">
          Cuando subas tu primer archivo, aparecerá aquí.
        </p>
      </div>
    );
  }

  const fetchData = async () => {
    if (status !== "authenticated") return;
    setLoading(true);
    try {
      const [statsRes, recentRes] = await Promise.all([
        getDashboardStats(apiFetch),
        getAnalysesSummary(apiFetch, 0, 3),
      ]);
      setStats(statsRes);
      setRecent(recentRes);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generalStateBadge = useMemo(() => {
    if (!stats) return null;
    const st = stats.general_state.toLowerCase();
    if (st.includes("saludable") || st === "—")
      return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100";
    if (st.includes("riesgo"))
      return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100";
    return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100";
  }, [stats]);

  if (status === "loading" || loading) {
    return (
      <div className="p-10">
        <p>Cargando datos del dashboard… 🩸</p>
      </div>
    );
  }

  const handleFileUpload = (file: File) => {
    console.log("Archivo subido:", file);
    fetchData();
  };

  /***********************************************************************************************************************/
  //JSX
  return (
    <div className="pt-12 pb-2">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold mb-2">Bienvenido, Usuario</h1>
          <p className="text-muted-foreground mb-8">
            {stats?.analyses_total
              ? "Gestiona tus análisis de sangre y obtén información valiosa sobre tu salud."
              : "Aún no has subido ningún análisis. ¡Empieza cargando tu primer PDF o imagen! 🚀"}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Análisis realizados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-4xl font-bold mr-4">{stats?.analyses_total ?? 0}</div>
                  <div className="text-sm text-muted-foreground">
                    {stats?.analyses_this_month ? (
                      <div className="flex items-center text-green-600">
                        <span className="mr-1">+{stats.analyses_this_month}</span>
                        <span>este mes</span>
                      </div>
                    ) : (
                      <span>—</span>
                    )}
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
                  <div
                    className={`rounded-full w-10 h-10 flex items-center justify-center mr-4 ${generalStateBadge}`}
                  >
                    {stats?.general_state && stats.general_state !== "—" ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <Inbox className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">
                      {stats?.general_state && stats.general_state !== "—"
                        ? stats.general_state
                        : "Sin datos"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stats?.general_state && stats.general_state !== "—"
                        ? "Basado en tus últimos análisis"
                        : "Sube tu primer informe"}
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
                    <div className="font-medium">
                      {stats?.next_reminder
                        ? new Date(stats.next_reminder).toLocaleDateString("es-ES")
                        : "—"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stats?.next_reminder
                        ? "Analítica programada"
                        : "Se mostrará tras tu primer análisis"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-8">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="upload">Subir análisis</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
              <TabsTrigger value="insights">Estadísticas</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Subir nuevo análisis</CardTitle>
                  <CardDescription>PDF o imagen - extracción automática con IA 🧠</CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload onUpload={handleFileUpload} />
                </CardContent>
              </Card>

              <div>
                <h3 className="text-xl font-bold mb-4">Análisis recientes</h3>
                {recent.length ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {recent.map((a) => (
                      <RecentCard key={a.id} analysis={a} />
                    ))}
                  </div>
                ) : (
                  <EmptyPlaceholder />
                )}
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

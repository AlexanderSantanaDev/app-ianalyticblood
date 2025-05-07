import { get, post } from "./client";
import type { AnalysisDoc, ApiSuccess } from "./types";


export interface DashboardStats {
  analyses_total: number;
  analyses_this_month: number;
  general_state: string;          // "—" cuando aún no hay datos
  next_reminder: string | null;   // ISO 8601 ó null
}

export interface AnalysisSummary {
  id: string;
  date: string;          // ISO 8601
  summary: string;
  alert_level: "normal" | "attention" | "alert";
}

/************************************************************************************************************/
/** Subir imagen/PDF  */
export async function uploadFile(file: File) {
  const form = new FormData();
  form.append("file", file);
  return post<{ status: "success"; analysis_id: string }>("/upload", form, true);
}

/** Listar análisis  */
export async function getAnalyses() {
  return get<ApiSuccess<AnalysisDoc[]>>("/analysis");
}

/** Listar análisis por id  */
export async function getAnalysis(id: string) {
  return get<ApiSuccess<AnalysisDoc>>(`/analysis/${id}`);
}

/** KPI del header (⇠ /dashboard) */
export async function getDashboardStats() {
  return get<DashboardStats>("/dashboard");
}

/** Últimos análisis resumidos (⇠ /analysis/summary) */
export async function getAnalysesSummary(skip = 0, limit = 10) {
  return get<AnalysisSummary[]>(`/analysis/summary?skip=${skip}&limit=${limit}`);
}
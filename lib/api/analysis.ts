// lib/api/analysis.ts
import type { AnalysisDoc, ApiSuccess } from "./types";

export interface DashboardStats {
  analyses_total: number;
  analyses_this_month: number;
  general_state: string;
  next_reminder: string | null;
}

export interface AnalysisSummary {
  id: string;
  date: string;
  summary: string;
  alert_level: "normal" | "attention" | "alert";
}

/** Subir imagen/PDF */
export async function uploadFile(
  file: File,
  apiFetch: <T>(path: string, options?: RequestInit) => Promise<T>
) {
  const form = new FormData();
  form.append("file", file);
  return apiFetch<{ status: "success"; analysis_id: string }>("/upload", {
    method: "POST",
    body: form,
  });
}

/** Listar análisis */
export async function getAnalyses(
  apiFetch: <T>(path: string, options?: RequestInit) => Promise<T>,
  skip = 0,
  limit = 10
) {
  return apiFetch<ApiSuccess<AnalysisDoc[]>>(`/analysis?skip=${skip}&limit=${limit}`);
}

/** Listar análisis por id */
export async function getAnalysis(
  apiFetch: <T>(path: string, options?: RequestInit) => Promise<T>,
  id: string
) {
  return apiFetch<ApiSuccess<AnalysisDoc>>(`/analysis/${id}`);
}

/** KPI del header */
export async function getDashboardStats(
  apiFetch: <T>(path: string, options?: RequestInit) => Promise<T>
) {
  return apiFetch<DashboardStats>("/dashboard");
}

/** Últimos análisis resumidos */
export async function getAnalysesSummary(
  apiFetch: <T>(path: string, options?: RequestInit) => Promise<T>,
  skip = 0,
  limit = 10
) {
  return apiFetch<AnalysisSummary[]>(`/analysis/summary?skip=${skip}&limit=${limit}`);
}
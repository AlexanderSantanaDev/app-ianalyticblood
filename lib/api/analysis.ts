import { get, post } from "./client";
import type { AnalysisDoc, ApiSuccess } from "./types";

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
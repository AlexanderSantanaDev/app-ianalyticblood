export interface ApiSuccess<T> {
  status: "success";
  data: T;
}

export interface RegisterBody {
  email: string;
  name: string;
  password: string;
  terms_accepted: boolean;
  terms_version?: string; // opcional (por defecto "1.0")
}

export interface LoginResponse {
  status: "success";
  access_token: string;
  refresh_token?: string;
  token_type: "bearer";
}

export interface MedicalData {
  bloodType?: string;
  height?: string;
  weight?: string;
  allergies?: string;
  conditions?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  lastName?: string;
  phone?: string;
  medical_data?: MedicalData;
  terms_accepted: boolean;
  terms_accepted_at?: string;
  plan?: "free" | "premium" | "enterprise";
  subscription_status?: "active" | "inactive" | "pending" | "canceled";
  cancel_at_period_end?: boolean;
  current_period_end?: number;
  analysis_count?: number;
}

export interface Overview {
  alert_level: "normal" | "attention" | "alert";
  general_state: string;
  summary: string;
}

export interface Parameter {
  value: number | null;
  unit: string | null;
  status: "normal" | "bajo" | "alto" | "muy_alto" | null;
  reference_range: [number, number] | null;
}

// Tipado para las viñetas de cada sección de análisis detallado.
// is_real=true → visible (dato real del informe).
// is_real=false → difuminado (incentivo para subir de plan).
export interface AnalysisSectionItem {
  text: string;
  is_real: boolean;
}

// Tipado para cada sección del análisis detallado (Seguimiento, Conclusión, etc.)
export interface AnalysisSection {
  title: string;
  subtitle: string;
  icon: string;
  items: AnalysisSectionItem[];
  hidden_count: number;
}

export interface AnalysisDoc {
  _id: string;
  user_id: string;
  file_type: string;
  overview: Overview;
  parameters: Record<string, Parameter>;
  analysis: string[];
  recommendations: string[];
  analysis_sections?: AnalysisSection[];
  date: string;
}

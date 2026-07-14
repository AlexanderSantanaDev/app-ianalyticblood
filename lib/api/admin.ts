// Tipos de respuesta del backend de admin
export type UserPlan = "free" | "premium" | "enterprise";
export type UserRole = "user" | "admin";
export type UserStatus = "active" | "inactive" | "suspended";

/** Perfil de usuario tal como lo devuelve el endpoint de admin */
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  plan: UserPlan;
  role: UserRole;
  status: UserStatus;
  analysis_count: number;
  created_at: string;
  last_login?: string;
  provider: "credentials" | "google";
  subscription_status?: "active" | "inactive" | "pending" | "canceled";
}

/** Métricas globales de la plataforma */
export interface AdminMetrics {
  total_users: number;
  active_users_today: number;
  active_users_week: number;
  total_analyses: number;
  analyses_today: number;
  analyses_week: number;
  revenue_month: number; // en € / USD (lo define el backend)
  users_by_plan: {
    free: number;
    premium: number;
    enterprise: number;
  };
  users_by_provider: {
    credentials: number;
    google: number;
  };
  top_users: Array<{
    id: string;
    name: string;
    email: string;
    analysis_count: number;
  }>;
  analyses_per_day: Array<{
    date: string; // "YYYY-MM-DD"
    count: number;
  }>;
  new_users_per_day: Array<{
    date: string;
    count: number;
  }>;
}

/** Respuesta paginada de usuarios */
export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  page_size: number;
}

/** Estado del servidor / sistema */
export interface SystemHealth {
  status: "healthy" | "degraded" | "down";
  api_latency_ms: number;
  db_connected: boolean;
  ai_service_available: boolean;
  uptime_seconds: number;
}

// Funciones de fetch — se invocan desde server components o client components según el contexto, siempre con el token del admin

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

/** Fetch autenticado para rutas admin — token obligatorio */
async function adminFetch<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...((options.headers as Record<string, string>) || {}),
    },
    cache: "no-store",
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error("FORBIDDEN");
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Error del servidor");
  }
  return data as T;
}

/** Obtiene las métricas globales del panel de admin */
export async function getAdminMetrics(token: string): Promise<AdminMetrics> {
  return adminFetch<AdminMetrics>("/admin/metrics", token);
}

/** Obtiene la lista paginada de usuarios */
export async function getAdminUsers(
  token: string,
  page = 1,
  pageSize = 20,
  search = "",
): Promise<AdminUsersResponse> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    ...(search ? { search } : {}),
  });
  return adminFetch<AdminUsersResponse>(`/admin/users?${params}`, token);
}

/** Obtiene el estado de salud del sistema */
export async function getSystemHealth(token: string): Promise<SystemHealth> {
  return adminFetch<SystemHealth>("/admin/health", token);
}

/** Cambia el plan de un usuario */
export async function updateUserPlan(
  token: string,
  userId: string,
  plan: UserPlan,
): Promise<{ success: boolean }> {
  return adminFetch<{ success: boolean }>(
    `/admin/users/${userId}/plan`,
    token,
    {
      method: "PATCH",
      body: JSON.stringify({ plan }),
    },
  );
}

/** Cambia el estado de un usuario (activo / suspendido) */
export async function updateUserStatus(
  token: string,
  userId: string,
  status: UserStatus,
): Promise<{ success: boolean }> {
  return adminFetch<{ success: boolean }>(
    `/admin/users/${userId}/status`,
    token,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
}

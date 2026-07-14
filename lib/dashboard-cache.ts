/**
 * ✨ Cache a nivel de módulo para datos del dashboard.
 *
 * Por qué aquí y no en useState/useRef:
 * - PageTransition usa key={pathname} → AnimatePresence desmonta/remonta cada página en cada navegación.
 * - useState y useRef se reinician en cada mount → siempre loading=true → skeleton siempre aparece.
 * - Las variables a nivel de módulo (fuera de React) persisten en memoria durante la sesión del navegador.
 * - Al remontar, el useState se inicializa con el valor del cache → loading=false → sin skeleton.
 *
 * TTL de 5 minutos por entrada para evitar datos obsoletos.
 */

// ✨ TTL en ms: 5 minutos
const CACHE_TTL_MS = 5 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// ✨ Store global de módulo — persiste entre mounts de React en la misma sesión del navegador
const store = new Map<string, CacheEntry<unknown>>();

/**
 * Obtiene un valor del cache si existe y no ha expirado.
 * Devuelve null si no existe o si el TTL expiró.
 */
export function getCached<T>(key: string): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

/**
 * Guarda un valor en el cache con timestamp actual.
 */
export function setCached<T>(key: string, data: T): void {
  store.set(key, { data, timestamp: Date.now() });
}

/**
 * Invalida una entrada del cache manualmente (por ejemplo, tras subir un nuevo análisis).
 */
export function invalidateCache(key: string): void {
  store.delete(key);
}

/**
 * Invalida todas las entradas del cache que coincidan con un prefijo.
 * Útil para invalidar todas las páginas tras un logout o cambio de usuario.
 */
export function invalidateCacheByPrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}

// ✨ Claves de cache estandarizadas para cada sección del dashboard
export const CACHE_KEYS = {
  DASHBOARD: "dashboard:main",
  HISTORY: "dashboard:history",
  STATS: "dashboard:stats",
  CALENDAR: "dashboard:calendar",
  PROFILE: "dashboard:profile",
} as const;

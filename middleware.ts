import { withSecurityHeaders } from "./security-headers";
import { NextFetchEvent, NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Rutas que requieren autenticación (JWT check) — solo ejecutar getToken cuando sea necesario
const PROTECTED_PREFIXES = ["/dashboard"];
const AUTH_PAGES = ["/login", "/register"];

// Rate limiting simple por IP para rutas de API del frontend
// Almacén en memoria — funciona por instancia de servidor
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 100; // máx 100 requests/minuto por IP

/** Limpieza periódica del mapa para evitar memory leak. */
function cleanupRateLimitMap() {
  const now = Date.now();
  for (const [key, value] of rateLimitMap) {
    if (now > value.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}

// Limpiar cada 5 minutos
let lastCleanup = Date.now();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  // Limpiar periódicamente
  if (now - lastCleanup > 300_000) {
    cleanupRateLimitMap();
    lastCleanup = now;
  }

  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return false; // Bloqueado
  }
  return true;
}

export async function middleware(req: NextRequest, ev: NextFetchEvent) {
  /* ① Añadimos siempre las cabeceras seguras */
  const res = (await withSecurityHeaders(req, ev)) as NextResponse;
  const { pathname } = req.nextUrl;

  // Rate limiting en rutas de API del frontend
  if (pathname.startsWith("/api/")) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return new NextResponse(
        JSON.stringify({ detail: "Demasiadas peticiones. Espera un momento." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
            ...Object.fromEntries(res.headers),
          },
        },
      );
    }
  }

  // Solo decodificar JWT en rutas que lo necesitan (protegidas o auth pages)
  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (!needsAuth && !isAuthPage) {
    return res; // Rutas públicas → sin JWT check → menor latencia
  }

  const token = await getToken({ req });

  /* ② Protegemos las rutas privadas */
  if (needsAuth && !token) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login, { headers: res.headers });
  }

  // Redirigir usuarios autenticados desde /login y /register al /dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url), {
      headers: res.headers,
    });
  }

  return res; // ← pasa al route handler
}

/* Ejecuta el middleware en toda la app
   (si solo quieres algunas carpetas, ajusta aquí) */
export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"],
};

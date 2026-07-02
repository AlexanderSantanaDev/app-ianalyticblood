import { withSecurityHeaders } from "./security-headers";
import { NextFetchEvent, NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Rutas que requieren autenticación (JWT check) — solo ejecutar getToken cuando sea necesario
const PROTECTED_PREFIXES = ["/dashboard"];
const AUTH_PAGES = ["/login", "/register"];

export async function middleware(req: NextRequest, ev: NextFetchEvent) {
  /* ① Añadimos siempre las cabeceras seguras */
  const res = (await withSecurityHeaders(req, ev)) as NextResponse;
  const { pathname } = req.nextUrl;

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
  matcher: ["/((?!api|_next|static|favicon.ico).*)"],
};

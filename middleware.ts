import { withSecurityHeaders } from "./security-headers";
import { NextFetchEvent, NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest, ev: NextFetchEvent) {
  /* ① Añadimos siempre las cabeceras seguras */
  const res = (await withSecurityHeaders(req, ev)) as NextResponse;
  const token = await getToken({ req });

  /* ② Protegemos las rutas privadas */
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    //const token = await getToken({ req });
    if (!token) {
      const login = new URL("/login", req.url);
      login.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(login, { headers: res.headers });
    }
  }

  // Redirigir usuarios autenticados desde /login y /register al /dashboard
  if (token && (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.url), { headers: res.headers });
  }

  return res; // ← pasa al route handler
}

/* Ejecuta el middleware en toda la app
   (si solo quieres algunas carpetas, ajusta aquí) */
export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico).*)"],
};
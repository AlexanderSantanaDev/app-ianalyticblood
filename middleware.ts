import { withSecurityHeaders } from "./security-headers";
import { NextFetchEvent, NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest, ev: NextFetchEvent) {
  /* ① Añadimos siempre las cabeceras seguras */
  const res = (await withSecurityHeaders(req, ev)) as NextResponse;

  /* ② Protegemos las rutas privadas */
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    const secret = process.env.NEXTAUTH_SECRET!;
    const token = await getToken({ req });
    console.log("Token en middleware es:", token);
    if (!token) {
      const login = new URL("/login", req.url);
      login.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(login, { headers: res.headers });
    }
  }

  return res; // ← pasa al route handler
}

/* Ejecuta el middleware en toda la app
   (si solo quieres algunas carpetas, ajusta aquí) */
export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico).*)"],
};
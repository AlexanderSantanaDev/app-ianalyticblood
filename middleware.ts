
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const protectedPath = req.nextUrl.pathname.startsWith("/dashboard");
    if (!protectedPath) return NextResponse.next();

    /* Usa SIEMPRE la misma clave que pasaste a NextAuth ---------------------- */
    const secret = process.env.NEXTAUTH_SECRET;      // ✅
    const token = await getToken({ req, secret });  // ⬅️  ahora no es undefined

    if (!token) {
        const login = new URL("/login", req.url);
        login.searchParams.set("callbackUrl", req.nextUrl.pathname);
        return NextResponse.redirect(login);
    }
    return NextResponse.next();
}

/* Limita el middleware solo a lo privado */
export const config = { matcher: ["/dashboard/:path*"] };

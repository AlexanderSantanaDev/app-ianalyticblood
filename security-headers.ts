import type { NextFetchEvent, NextMiddleware, NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────
//  Cabeceras “baseline” que hoy aconseja OWASP / Mozilla
// ─────────────────────────────────────────────────────────────
const securityHeaders: Record<string, string> = {
  // Previene click-jacking
  "X-Frame-Options": "DENY",

  // Previene XXS reflexivo - viejo pero siguen pidiéndolo algunos scanners
  "X-XSS-Protection": "1; mode=block",

  // Oculta versión del servidor
  "X-Powered-By": "Next.js", // (“Express” típico)

  // CORS pre-flight más seguro (solo ejemplos, tu API ya tiene CORS propio)
  "Access-Control-Allow-Origin":
    process.env.NODE_ENV === "production"
      ? "https://app-ianalyticblood.vercel.app"
      : "http://localhost:3000",

  // Evita que el navegador infera MIME
  "X-Content-Type-Options": "nosniff",

  // HTTPS obligatorio + HSTS 6 meses + preload
  "Strict-Transport-Security": "max-age=15552000; includeSubDomains; preload",

  // DNS prefetch 👇🏼  (opcional)
  "X-DNS-Prefetch-Control": "on",
};

const isProd = process.env.NODE_ENV === "production";
const apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL!).origin;

//  ───────────── CSP:  ajustar fuentes ─────────────
/* const csp = `// añadir mas adelante para segirdad
  default-src 'self';
  frame-ancestors 'none';
  img-src 'self' https: data:;
  script-src 'self' ${isProd ? "" : "'unsafe-inline' 'unsafe-eval'"} 'wasm-unsafe-eval' 'inline-speculation-rules';
  style-src 'self' 'unsafe-inline';
  connect-src 'self' https://api.deepseek.com ${process.env.NEXT_PUBLIC_API_URL};
`.replace(/\s{2,}/g, " ").trim(); */
const csp = `
  default-src 'self';
  frame-ancestors 'none';
  img-src 'self' https: data:;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' 'inline-speculation-rules';
  style-src 'self' 'unsafe-inline';
  connect-src 'self' https://api-ianalyticblood.onrender.com ${apiOrigin} ${!isProd ? "ws://localhost:* ws://127.0.0.1:*" : ""};
`
  .replace(/\s{2,}/g, " ")
  .trim();

export const withSecurityHeaders: NextMiddleware = (
  req: NextRequest,
  _ev?: NextFetchEvent,
) => {
  const res = NextResponse.next();

  // 1) Cabeceras fijas
  Object.entries(securityHeaders).forEach(([k, v]) => res.headers.set(k, v));

  // 2) CSP
  res.headers.set("Content-Security-Policy", csp);

  return res;
};

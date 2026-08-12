import type { NextFetchEvent, NextMiddleware, NextRequest } from "next/server";
import { NextResponse } from "next/server";

//  Cabeceras "baseline" que hoy aconseja OWASP / Mozilla
const securityHeaders: Record<string, string> = {
  // Previene click-jacking
  "X-Frame-Options": "DENY",

  // Previene XSS reflexivo
  "X-XSS-Protection": "1; mode=block",

  // CORS pre-flight
  "Access-Control-Allow-Origin":
    process.env.NODE_ENV === "production"
      ? "https://app-ianalyticblood.vercel.app"
      : "http://localhost:3000",

  // Evita que el navegador infiera MIME — previene MIME sniffing attacks
  "X-Content-Type-Options": "nosniff",

  // HTTPS obligatorio + HSTS 1 año + includeSubDomains + preload
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",

  // Controla qué información se envía en el header Referer
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Permissions-Policy ampliada — bloquea APIs del navegador innecesarias
  "Permissions-Policy":
    "camera=(), geolocation=(), microphone=(), payment=(), usb=(), bluetooth=(), display-capture=(), magnetometer=(), gyroscope=(), accelerometer=()",

  // DNS prefetch (opcional)
  "X-DNS-Prefetch-Control": "on",

  // Relajar COOP para permitir el popup de Google OAuth
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
  // Se eliminan COEP y CORP porque bloquean recursos de terceros (ej. avatares de Google)
};

const isProd = process.env.NODE_ENV === "production";
const apiOrigin = process.env.NEXT_PUBLIC_API_URL
  ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
  : "http://localhost:8000";

// blob: añadido a img-src para permitir previsualización local de archivos.
const csp = `
  default-src 'self';
  frame-ancestors 'none';
  form-action 'self';
  base-uri 'self';
  object-src 'none';
  img-src 'self' https: data: blob:;
  script-src 'self' ${isProd ? "'unsafe-inline' 'wasm-unsafe-eval' 'inline-speculation-rules'" : "'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' 'inline-speculation-rules'"};
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api-ianalyticblood.onrender.com ${apiOrigin} ${!isProd ? "ws://localhost:* ws://127.0.0.1:*" : ""};
  worker-src 'self' blob:;
  manifest-src 'self';
  media-src 'self';
  frame-src 'none';
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

  // Eliminar X-Powered-By para no revelar el framework
  res.headers.delete("X-Powered-By");

  // 2) CSP
  res.headers.set("Content-Security-Policy", csp);

  return res;
};

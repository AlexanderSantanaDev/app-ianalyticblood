/** @type {import('next').NextConfig} */
const nextConfig = {
  //  Habilitado ESLint durante el build para detectar errores antes de producción
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Habilitado TypeScript checks durante el build — los errores de tipos ya no pasan a producción
  typescript: {
    ignoreBuildErrors: false,
  },
  // Habilitada optimización de imágenes de Next.js (WebP/AVIF, lazy loading, srcset)
  images: {
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Habilitadas optimizaciones de build en paralelo
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  // Cabeceras de seguridad ampliadas
  headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), geolocation=(), microphone=(), payment=(), usb=(), bluetooth=(), display-capture=(), magnetometer=(), gyroscope=(), accelerometer=()",
          },
        ],
      },
      {
        // Prevenir que los bots indexen las rutas de API
        source: "/api/(.*)",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
  transpilePackages: ["lucide-react"],
};

export default nextConfig;

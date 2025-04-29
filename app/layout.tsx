import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "IAnalyticBlood - Análisis de Sangre con IA",
  description:
    "Obtén un estudio automatizado de tus análisis de sangre mediante inteligencia artificial",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          {/* <main className="min-h-screen">{children}</main> */}
        </Providers>
      </body>
    </html>
  );
}

import type React from "react";
import { Inter } from "next/font/google";
import "../globals.css";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import NavigationLoader from "../components/dashboard/navigation-loader";
/***********************************************************************************************************************/
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "IAnalyticBlood - Análisis de Sangre con IA",
  description:
    "Obtén un estudio automatizado de tus análisis de sangre mediante inteligencia artificial",
  icons: {
    icon: "/favicon.ico",
  },
};
/***********************************************************************************************************************/
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavigationLoader />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

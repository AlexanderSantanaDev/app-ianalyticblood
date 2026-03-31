"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";
import { Menu, X } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Tag,
  Info,
  Mail,
  LogIn,
  UserPlus,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";
/***********************************************************************************************************************/
export default function Navbar() {
  // Estados
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useMobile();
  const { data: session, status } = useSession();
  /***********************************************************************************************************************/
  // Hooks
  // Detecta el scroll para cambiar el estilo del navbar.
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Bloqueo de scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (isMenuOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen, isMobile]);
  /***********************************************************************************************************************/
  //Métodos
  /** Alterna el estado del menú móvil. */
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  /***********************************************************************************************************************/
  //JSX
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-background/60 backdrop-blur-xl border-b border-white/5 shadow-[0_2px_20px_-10px_rgba(0,0,0,0.3)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/logo-ianalytic-blood.png"
            alt="AnalyticBlood Logo"
            width={150}
            height={40}
            draggable="false"
            className="w-40"
            priority
          />
        </Link>

        {isMobile ? (
          <>
            <button
              onClick={toggleMenu}
              className="relative z-[60] p-2 text-foreground/80 hover:text-primary transition-colors"
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>

            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, x: "100%" }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed inset-0 z-50 bg-background/95 backdrop-blur-3xl flex flex-col pt-24 px-6 pb-12 h-[100dvh]"
                >
                  {/* Gradiente de fondo sutil para el menú */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 -z-10 pointer-events-none" />

                  <nav className="flex flex-col space-y-2 flex-1">
                    {[
                      { href: "/", label: "Inicio", icon: Home },
                      { href: "/pricing", label: "Precios", icon: Tag },
                      { href: "/about", label: "Nosotros", icon: Info },
                      { href: "/contact", label: "Contacto", icon: Mail },
                    ].map((link, idx) => (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + idx * 0.1 }}
                      >
                        <Link
                          href={link.href}
                          onClick={toggleMenu}
                          className="flex items-center justify-between py-4 border-b border-white/5 group"
                        >
                          <div className="flex items-center space-x-4">
                            <div
                              className="p-2.5 rounded-xl bg-white/5 border border-white/5 group-hover:bg-primary/10 
                            group-hover:border-primary/20 transition-all duration-300"
                            >
                              <link.icon
                                size={20}
                                className="text-foreground/60 group-hover:text-primary transition-colors"
                              />
                            </div>
                            <span className="text-xl font-medium tracking-tight group-hover:text-primary transition-colors">
                              {link.label}
                            </span>
                          </div>
                          <ChevronRight
                            size={18}
                            className="text-foreground/20 group-hover:text-primary/50 transition-all transform group-hover:translate-x-1"
                          />
                        </Link>
                      </motion.div>
                    ))}
                  </nav>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-4 pt-12"
                  >
                    {status === "authenticated" ? (
                      <Link href="/dashboard" onClick={toggleMenu}>
                        <Button
                          className="w-full h-14 rounded-2xl text-lg font-semibold gradient-bg flex items-center justify-center 
                        gap-2 shadow-xl shadow-primary/20"
                        >
                          <LayoutDashboard size={20} />
                          Acceder al Dashboard
                        </Button>
                      </Link>
                    ) : (
                      <>
                        <Link href="/login" onClick={toggleMenu} className="block">
                          <Button
                            variant="outline"
                            className="w-full h-14 rounded-2xl text-lg font-medium border-white/10 hover:bg-white/5 flex items-center 
                            justify-center gap-2"
                          >
                            <LogIn size={20} />
                            Iniciar Sesión
                          </Button>
                        </Link>
                        <Link href="/register" onClick={toggleMenu} className="block">
                          <Button
                            className="w-full h-14 rounded-2xl text-lg font-semibold gradient-bg flex items-center justify-center 
                          gap-2 shadow-xl shadow-primary/20"
                          >
                            <UserPlus size={20} />
                            Registrarse Gratis
                          </Button>
                        </Link>
                      </>
                    )}

                    {/* Pie de menú móvil */}
                    <div className="pt-8 text-center">
                      <p className="text-sm text-foreground/40 font-medium">
                        iAnalytic Blood © 2026
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-foreground hover:text-primary transition-colors">
                Inicio
              </Link>
              <Link
                href="/pricing"
                className="text-foreground hover:text-primary transition-colors"
              >
                Precios
              </Link>
              <Link href="/about" className="text-foreground hover:text-primary transition-colors">
                Nosotros
              </Link>
              <Link
                href="/contact"
                className="text-foreground hover:text-primary transition-colors"
              >
                Contacto
              </Link>
            </nav>

            <div className="hidden md:flex items-center space-x-5">
              {status === "authenticated" ? (
                <>
                  <Link href="/dashboard">
                    <Button
                      variant="outline"
                      className="rounded-xl border-white/10 hover:bg-white/5 transition-all"
                    >
                      Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="hover:bg-white/5 transition-colors">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      className="gradient-bg hover:opacity-90 shadow-lg shadow-primary/20 rounded-xl transition-all 
                    hover:scale-105 active:scale-95"
                    >
                      Registrarse
                    </Button>
                  </Link>
                </>
              )}
              <div className="pl-2 border-l border-white/10">
                <ModeToggle />
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

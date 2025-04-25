"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";
import { Menu, X } from "lucide-react";
import { useMobile } from "hooks/use-mobile";
import Image from "next/image";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useMobile();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/80 backdrop-blur-md shadow-md" : "bg-transparent"
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
              className="p-2 text-foreground"
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {isMenuOpen && (
              <div className="fixed inset-0 top-16 bg-background z-40 p-4">
                <nav className="flex flex-col space-y-4 text-lg">
                  <Link
                    href="/"
                    onClick={toggleMenu}
                    className="py-2 hover:text-primary transition-colors"
                  >
                    Inicio
                  </Link>
                  <Link
                    href="/pricing"
                    onClick={toggleMenu}
                    className="py-2 hover:text-primary transition-colors"
                  >
                    Precios
                  </Link>
                  <Link
                    href="/about"
                    onClick={toggleMenu}
                    className="py-2 hover:text-primary transition-colors"
                  >
                    Nosotros
                  </Link>
                  <Link
                    href="/contact"
                    onClick={toggleMenu}
                    className="py-2 hover:text-primary transition-colors"
                  >
                    Contacto
                  </Link>
                  <div className="pt-4 flex flex-col space-y-2">
                    <Link href="/login" onClick={toggleMenu}>
                      <Button variant="outline" className="w-full">
                        Iniciar Sesión
                      </Button>
                    </Link>
                    <Link href="/register" onClick={toggleMenu}>
                      <Button className="w-full">Registrarse</Button>
                    </Link>
                  </div>
                </nav>
              </div>
            )}
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

            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline">Iniciar Sesión</Button>
              </Link>
              <Link href="/register">
                <Button>Registrarse</Button>
              </Link>
              <ModeToggle />
            </div>
          </>
        )}
      </div>
    </header>
  );
}

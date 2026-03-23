import Link from "next/link";

/** Footer del dashboard. */
export default function DashboardFooter() {
  return (
    <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          {/* Copyright con branding */}
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="gradient-text font-semibold">IAnalyticBlood</span>. Todos los derechos
            reservados.
          </p>

          {/* Links útiles del footer */}
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Términos
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacidad
            </Link>
            <Link href="/dashboard/help" className="hover:text-foreground transition-colors">
              Ayuda
            </Link>
            {/* Versión de la app */}
            <span className="text-muted-foreground/50">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

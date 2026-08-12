"use client";

import { useEffect } from "react";
/****************************************************************************************************************************/
interface BrowserGuardOptions {
  enabled?: boolean;
}
/****************************************************************************************************************************/
/** Hook de seguridad de navegador que bloquea:
   - Click derecho (contextmenu) en toda la página.
   - Atajos de teclado para abrir DevTools 
*/
export function useBrowserGuard({ enabled = true }: BrowserGuardOptions = {}) {
  useEffect(() => {
    // No activar en entorno de desarrollo local para no bloquear al dev team
    if (!enabled) return;

    /** Bloqueo de click derecho en toda la página. */
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    /** Bloqueo de atajos de teclado para DevTools e inspección de fuente */
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const ctrl = e.ctrlKey;
      const cmd = e.metaKey; // Cmd en macOS
      const shift = e.shiftKey;
      const alt = e.altKey;
      const key = e.key;

      // F12 → abre DevTools en todos los navegadores
      if (key === "F12") {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+I / Cmd+Opt+I → Elements panel
      if ((ctrl && shift && key === "I") || (cmd && alt && key === "i")) {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+J / Cmd+Opt+J → Console panel
      if ((ctrl && shift && key === "J") || (cmd && alt && key === "j")) {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+C / Cmd+Opt+C → Inspector picker
      if ((ctrl && shift && key === "C") || (cmd && alt && key === "c")) {
        e.preventDefault();
        return false;
      }

      // Ctrl+U / Cmd+U → Ver fuente de la página
      if ((ctrl && key === "u") || (cmd && key === "u")) {
        e.preventDefault();
        return false;
      }

      // Ctrl+S / Cmd+S → Guardar página (también expone el HTML)
      if ((ctrl && key === "s") || (cmd && key === "s")) {
        e.preventDefault();
        return false;
      }

      // Ctrl+P / Cmd+P → Imprimir (permite ver el HTML completo)
      if ((ctrl && key === "p") || (cmd && key === "p")) {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+K → Consola en Firefox
      if (ctrl && shift && key === "K") {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+E → Network panel en Firefox
      if (ctrl && shift && key === "E") {
        e.preventDefault();
        return false;
      }
    };

    /** Bloqueo de selección de texto en las zonas protegidas (refuerzo visual) */
    const handleSelectStart = (e: Event) => {
      // Solo bloqueamos si el target tiene la clase de elemento difuminado
      const target = e.target as HTMLElement;
      if (target?.closest?.("[data-protected]")) {
        e.preventDefault();
        return false;
      }
    };

    /** Registrar listeners en capture phase para interceptar antes que cualquier handler de React */
    document.addEventListener("contextmenu", handleContextMenu, {
      capture: true,
    });
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    document.addEventListener("selectstart", handleSelectStart, {
      capture: true,
    });

    return () => {
      // Cleanup al desmontar para evitar memory leaks y doble registro
      document.removeEventListener("contextmenu", handleContextMenu, {
        capture: true,
      });
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
      document.removeEventListener("selectstart", handleSelectStart, {
        capture: true,
      });
    };
  }, [enabled]);
}

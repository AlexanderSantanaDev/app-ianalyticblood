import { Step } from "react-joyride";

export const dashboardSteps: Step[] = [
  {
    target: "#tour-sidebar",
    title: "Menú Principal",
    content: "Navega rápidamente por tu panel, historial, estadísticas y configuración desde aquí.",
    placement: "right",
  },
  {
    target: "#tour-stats-overview",
    title: "Métricas Rápidas",
    content: "Revisa un resumen global de tu salud basado en los últimos análisis clínicos subidos.",
    placement: "bottom",
  },
  {
    target: "#tour-upload-box",
    title: "Subir Análisis",
    content: "Arrastra y suelta tu informe (PDF o Imagen). Nuestra IA médica extraerá y procesará todos los biomarcadores al instante.",
    placement: "bottom",
  },
  {
    target: "#tour-recent-analysis",
    title: "Últimos Informes",
    content: "Accede directamente a los resultados detallados de tus análisis más recientes.",
    placement: "top",
  }
];

export const historySteps: Step[] = [
  {
    target: "#tour-history-controls",
    title: "Búsqueda y Filtros",
    content: "Encuentra rápidamente cualquier análisis usando palabras clave o filtrando por rango de fechas.",
    placement: "bottom",
  },
  {
    target: "#tour-history-table",
    title: "Historial Clínico",
    content: "Aquí se listan todos tus análisis. Observa su estado, fecha y accede al informe detallado con un clic.",
    placement: "top",
  }
];

export const subscriptionSteps: Step[] = [
  {
    target: "#tour-subscription-plan",
    title: "Plan Actual",
    content: "Consulta los detalles de tu membresía actual y los análisis que has consumido este mes.",
    placement: "bottom",
  },
  {
    target: "#plan-selection",
    title: "Beneficios Premium",
    content: "Descubre las funcionalidades avanzadas para monitorear tu salud de forma profesional.",
    placement: "top",
  }
];

export const adminSteps: Step[] = [
  {
    target: "#tour-admin-tabs",
    title: "Navegación Admin",
    content: "Alterna entre el resumen global, la gestión detallada de usuarios y las métricas avanzadas.",
    placement: "bottom",
  },
  {
    target: "#tour-admin-stats",
    title: "Métricas del Sistema",
    content: "Observa en tiempo real el estado de la plataforma, los usuarios totales y los análisis realizados.",
    placement: "bottom",
  },
];

export const statsSteps: Step[] = [
  {
    target: "#tour-stats-header",
    title: "Estadísticas Globales",
    content: "Aquí obtendrás una panorámica avanzada de tu salud basada en todos tus análisis clínicos.",
    placement: "bottom",
  },
  {
    target: "#tour-stats-cards",
    title: "Indicadores Clave",
    content: "Revisa rápidamente tu score de salud y la tendencia de tus biomarcadores más críticos.",
    placement: "bottom",
  },
  {
    target: "#tour-stats-charts",
    title: "Gráficas Evolutivas",
    content: "Observa la evolución detallada de cada parámetro médico a lo largo del tiempo.",
    placement: "top",
  }
];

export const calendarSteps: Step[] = [
  {
    target: "#tour-calendar-main",
    title: "Calendario Clínico",
    content: "Visualiza rápidamente los días en los que te has realizado análisis y próximos recordatorios.",
    placement: "right",
  },
  {
    target: "#tour-calendar-details",
    title: "Detalles del Día",
    content: "Selecciona una fecha en el calendario para ver un resumen ejecutivo de ese día específico.",
    placement: "left",
  }
];

export const profileSteps: Step[] = [
  {
    target: "#tour-profile-menu",
    title: "Navegación del Perfil",
    content: "Navega entre tu configuración general de cuenta y tus datos clínicos base.",
    placement: "right",
  },
  {
    target: "#tour-profile-content",
    title: "Edición de Datos",
    content: "Actualiza tu información personal y métricas base para afinar el análisis de la IA.",
    placement: "left",
  }
];

export const notificationsSteps: Step[] = [
  {
    target: "#tour-notifications-header",
    title: "Centro de Alertas",
    content: "Mantente al día con notificaciones importantes sobre tus análisis y la seguridad de tu cuenta.",
    placement: "bottom",
  },
  {
    target: "#tour-notifications-tabs",
    title: "Filtros Rápidos",
    content: "Filtra tus notificaciones por alertas médicas, recordatorios, o avisos de seguridad del sistema.",
    placement: "bottom",
  }
];

export const settingsSteps: Step[] = [
  {
    target: "#tour-settings-header",
    title: "Configuración Avanzada",
    content: "Ajusta la seguridad de tu cuenta, preferencias de la UI y canales de comunicación.",
    placement: "bottom",
  },
  {
    target: "#tour-settings-tabs",
    title: "Opciones de Sistema",
    content: "Navega entre las diferentes configuraciones del sistema, desde autenticación en 2 pasos hasta modos de apariencia.",
    placement: "bottom",
  }
];

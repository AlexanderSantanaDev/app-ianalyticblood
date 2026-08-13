import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/****************************************************************************************************************************/
/** Une clases de Tailwind de forma segura */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatea una fecha a estilo "hace cuánto tiempo" */
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Ahora mismo";
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400)
    return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
  if (diffInSeconds < 172800) return "Ayer";
  return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
}

/** Helper para parsear fechas UTC del backend Python correctamente. */
export function parseUTCDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  // Si ya tiene sufijo Z o tiene offset +/-HH:MM, no tocamos nada
  const hasTimezone = /Z$|[+-]\d{2}:\d{2}$/.test(dateStr.trim());
  return hasTimezone ? new Date(dateStr) : new Date(dateStr + "Z");
}

/****************************************************************************************************************************/
/** Diccionario de descripciones médicas. */
export function getParameterDescription(paramName: string): string | null {
  const normalized = paramName.toLowerCase().trim();

  if (normalized.includes("got") || normalized.includes("ast"))
    return "Enzima presente principalmente en el corazón y el hígado. Sus niveles altos en sangre pueden indicar daño hepático o muscular.";
  if (normalized.includes("gpt") || normalized.includes("alt"))
    return "Enzima presente mayoritariamente en el hígado. Es un marcador muy sensible para detectar daño o inflamación celular hepática.";
  if (normalized.includes("glucosa"))
    return "Principal fuente de energía de las células. Sus niveles reflejan el metabolismo de los azúcares y el riesgo de diabetes o resistencia a la insulina.";
  if (normalized.includes("creatinina"))
    return "Producto de desecho muscular filtrado por los riñones. Es un indicador clave para evaluar el funcionamiento y la salud renal.";
  if (normalized.includes("hdl"))
    return "Conocido como el colesterol 'bueno'. Ayuda a eliminar el exceso de lípidos de la sangre y protege el sistema cardiovascular.";
  if (normalized.includes("ldl"))
    return "Conocido como el colesterol 'malo'. Su exceso puede acumularse en las arterias y aumentar el riesgo de enfermedades cardíacas.";
  if (normalized.includes("colesterol"))
    return "Lípido esencial para las células y hormonas. Un desequilibrio global aumenta el riesgo de problemas cardiovasculares.";
  if (
    normalized.includes("triglicérido") ||
    normalized.includes("triglicerido")
  )
    return "Tipo principal de grasa en la sangre. Niveles elevados suelen estar asociados a dietas ricas en azúcares, grasas y riesgo metabólico.";
  if (normalized.includes("proteína") || normalized.includes("proteina"))
    return "Mide la cantidad total de proteínas en la sangre, fundamentalmente albúmina y globulinas. Refleja el estado nutricional y hepático.";
  if (
    normalized.includes("hematie") ||
    normalized.includes("glóbulos rojos") ||
    normalized.includes("globulos rojos") ||
    normalized.includes("hematíe")
  )
    return "También llamados glóbulos rojos. Se encargan de transportar oxígeno vital desde los pulmones al resto de los tejidos del cuerpo.";
  if (normalized.includes("hemoglobina"))
    return "Proteína rica en hierro presente en los glóbulos rojos. Fundamental para el transporte de oxígeno; su déficit sostenido indica anemia.";
  if (
    normalized.includes("leucocito") ||
    normalized.includes("glóbulos blancos") ||
    normalized.includes("globulos blancos")
  )
    return "Glóbulos blancos, parte clave del sistema inmunológico. Ayudan a combatir activamente infecciones y protegen contra patógenos.";
  if (normalized.includes("plaqueta"))
    return "Células responsables de la coagulación de la sangre. Son fundamentales para evitar sangrados excesivos y reparar vasos sanguíneos.";
  if (
    normalized.includes("hierro") ||
    normalized.includes("ferritina") ||
    normalized.includes("transferrina")
  )
    return "Mineral indispensable para formar hemoglobina. Su equilibrio es vital para evitar la fatiga por anemia o la acumulación tóxica en los órganos.";
  if (normalized.includes("ácido úrico") || normalized.includes("acido urico"))
    return "Producto de la degradación de las purinas. Su acumulación excesiva puede formar cristales y causar dolor articular (gota) o cálculos renales.";
  if (normalized.includes("urea"))
    return "Producto de desecho de la degradación de las proteínas. Su medición continua ayuda a determinar el buen funcionamiento de filtrado de los riñones.";
  if (normalized.includes("bilirrubina"))
    return "Pigmento biliar producto de la descomposición de los glóbulos rojos. Su elevación indica problemas hepáticos o de evacuación de las vías biliares.";
  if (normalized.includes("tsh") || normalized.includes("tiroide"))
    return "Hormona estimulante de la tiroides. Regula el metabolismo general del cuerpo al controlar directamente el funcionamiento de la glándula tiroidea.";
  if (normalized.includes("vitamina d"))
    return "Hormona esencial para la absorción de calcio y la salud ósea. También juega un papel crítico y regulador en el sistema inmunológico.";
  if (normalized.includes("vitamina b12") || normalized.includes("b12"))
    return "Nutriente fundamental para la formación de glóbulos rojos sanos, el metabolismo celular y la función del sistema nervioso central.";
  if (normalized.includes("sodio"))
    return "Electrolito clave para mantener el equilibrio de líquidos corporales, la función nerviosa y la correcta contracción muscular.";
  if (normalized.includes("potasio"))
    return "Mineral esencial para mantener el ritmo cardíaco normal, la función muscular y el equilibrio de líquidos dentro de las células.";

  return null;
}

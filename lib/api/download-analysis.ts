import type { AnalysisDoc } from "./types";
/***********************************************************************************************************************/
/** Genera HTML limpio del análisis para descarga/impresión. */
function generateAnalysisHTML(data: AnalysisDoc): string {
  // Fecha del análisis
  const date = new Date(data.date).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  // Etiqueta del nivel de alerta
  const statusLabel =
    data.overview.alert_level === "normal"
      ? "Normal"
      : data.overview.alert_level === "attention"
        ? "Atención"
        : "Alerta";
  // Color del badge según el nivel de alerta
  const statusColor =
    data.overview.alert_level === "normal"
      ? "#22c55e"
      : data.overview.alert_level === "attention"
        ? "#eab308"
        : "#ef4444";
  // Genera el HTML de los parámetros
  const paramsHTML = Object.entries(data.parameters)
    .map(
      ([name, param]) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${name}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${param.value !== null ? param.value : "—"} ${param.unit || ""}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: ${
          param.status === "normal"
            ? "#22c55e"
            : param.status === "bajo"
              ? "#eab308"
              : param.status === "alto"
                ? "#f97316"
                : param.status === "muy_alto"
                  ? "#ef4444"
                  : "#6b7280"
        }; font-weight: 600;">${
          param.status === "normal"
            ? "Normal"
            : param.status === "bajo"
              ? "Bajo"
              : param.status === "alto"
                ? "Alto"
                : param.status === "muy_alto"
                  ? "Muy alto"
                  : "—"
        }</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 13px;">${
          param.reference_range
            ? `${param.reference_range[0]} — ${param.reference_range[1]} ${param.unit || ""}`
            : "—"
        }</td>
      </tr>
    `,
    )
    .join("");

  const analysisHTML = data.analysis
    .map(
      (item) =>
        `<li style="margin-bottom: 8px; padding-left: 12px; border-left: 3px solid #7c3aed; color: #374151; 
      line-height: 1.6;">${item}</li>`,
    )
    .join("");

  const recsHTML = data.recommendations
    .map(
      (rec) =>
        `<li style="margin-bottom: 8px; padding-left: 12px; border-left: 3px solid #eab308; color: #374151; 
      line-height: 1.6;">${rec}</li>`,
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Informe de Análisis - IAnalyticBlood</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; 
    color: #1f2937; background: #fff; }
    .header { text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #7c3aed; }
    .header h1 { font-size: 24px; color: #7c3aed; margin: 0 0 4px; }
    .header p { color: #6b7280; margin: 4px 0; font-size: 14px; }
    .section { margin-bottom: 28px; }
    .section-title { font-size: 16px; font-weight: 700; color: #1f2937; margin-bottom: 12px; display: flex; align-items: center;
     gap: 8px; }
    .summary-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
    .summary-box p { margin: 4px 0; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    thead th { padding: 10px 12px; background: #7c3aed; color: #fff; text-align: left; font-weight: 600; }
    thead th:not(:first-child) { text-align: center; }
    ul { list-style: none; padding: 0; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; 
    font-size: 12px; }
    .print-btn { display: block; margin: 0 auto 32px; background: #7c3aed; color: #fff; border: none; padding: 10px 24px; 
    border-radius: 8px; font-size: 14px; cursor: pointer; }
    .print-btn:hover { background: #6d28d9; }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>

  <div class="header">
    <h1>🩸 IAnalyticBlood</h1>
    <p>Informe de análisis de sangre</p>
    <p><strong>Fecha:</strong> ${date} &nbsp; | &nbsp; <strong>Estado:</strong> <span style="color: ${statusColor}; 
    font-weight: 700;">${statusLabel}</span></p>
  </div>

  <div class="section">
    <div class="section-title">📋 Resumen general</div>
    <div class="summary-box">
      <p>${data.overview.summary}</p>
      <p style="color: #6b7280; font-size: 13px; margin-top: 8px;">Estado general: 
      <strong>${data.overview.general_state}</strong></p>
    </div>
  </div>

  ${
    Object.keys(data.parameters).length > 0
      ? `
  <div class="section">
    <div class="section-title">📊 Parámetros analizados</div>
    <table>
      <thead>
        <tr>
          <th>Parámetro</th>
          <th>Valor</th>
          <th>Estado</th>
          <th>Referencia</th>
        </tr>
      </thead>
      <tbody>${paramsHTML}</tbody>
    </table>
  </div>
  `
      : ""
  }

  ${
    data.analysis.length > 0
      ? `
  <div class="section">
    <div class="section-title">🔬 Interpretación</div>
    <ul>${analysisHTML}</ul>
  </div>
  `
      : ""
  }

  ${
    data.recommendations.length > 0
      ? `
  <div class="section">
    <div class="section-title">💡 Recomendaciones</div>
    <ul>${recsHTML}</ul>
  </div>
  `
      : ""
  }

  <div class="footer">
    <p>Informe generado por IAnalyticBlood — Análisis de sangre asistido por inteligencia artificial</p>
    <p>Este informe tiene carácter informativo. Consulte siempre con un profesional médico.</p>
  </div>
</body>
</html>`;
}

/** Descarga el análisis como HTML (se puede imprimir como PDF desde el navegador). */
export function downloadAnalysisAsHTML(data: AnalysisDoc) {
  const html = generateAnalysisHTML(data);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `analisis-${new Date(data.date)
    .toLocaleDateString("es-ES")
    .replace(/\//g, "-")}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Abre el informe en nueva pestaña para impresión directa. */
export function printAnalysis(data: AnalysisDoc) {
  const html = generateAnalysisHTML(data);
  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  }
}

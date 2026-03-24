import type { AnalysisDoc } from "./types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
/***********************************************************************************************************************/
/** Genera el HTML para el PDF/Impresión */
function getTemplateHTML(data: AnalysisDoc): string {
  const date = new Date(data.date).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const statusLabel =
    data.overview.alert_level === "normal"
      ? "Normal"
      : data.overview.alert_level === "attention"
        ? "Atención"
        : "Alerta";

  const statusColor =
    data.overview.alert_level === "normal"
      ? "#22c55e"
      : data.overview.alert_level === "attention"
        ? "#eab308"
        : "#ef4444";

  const paramsHTML = Object.entries(data.parameters)
    .map(
      ([name, param]) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #f3f4f6; font-weight: 500; font-size: 13px;">${name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f3f4f6; text-align: center; font-size: 13px;">
          ${param.value !== null ? param.value : "—"} ${param.unit || ""}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #f3f4f6; text-align: center; color: ${
          param.status === "normal"
            ? "#16a34a"
            : param.status === "bajo"
              ? "#ca8a04"
              : param.status === "alto"
                ? "#ea580c"
                : param.status === "muy_alto"
                  ? "#dc2626"
                  : "#6b7280"
        }; font-weight: 600; font-size: 13px;">
          ${
            param.status === "normal"
              ? "Normal"
              : param.status === "bajo"
                ? "Bajo"
                : param.status === "alto"
                  ? "Alto"
                  : param.status === "muy_alto"
                    ? "Muy alto"
                    : "—"
          }
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #f3f4f6; text-align: center; color: #9ca3af; font-size: 11px;">
          ${
            param.reference_range
              ? `${param.reference_range[0]} — ${param.reference_range[1]} ${param.unit || ""}`
              : "—"
          }
        </td>
      </tr>
    `,
    )
    .join("");

  const analysisHTML = data.analysis
    .map(
      (item) => `
      <li style="margin-bottom: 10px; padding-left: 15px; border-left: 3px solid #8b5cf6; color: #4b5563; font-size: 13px; line-height: 1.6;">
        ${item}
      </li>`,
    )
    .join("");

  const recsHTML = data.recommendations
    .map(
      (rec) => `
      <li style="margin-bottom: 10px; padding-left: 15px; border-left: 3px solid #f59e0b; color: #4b5563; font-size: 13px; 
      line-height: 1.6;">
        ${rec}
      </li>`,
    )
    .join("");

  return `
    <div id="pdf-content" style="width: 794px; padding: 60px; background: white; color: #111827; font-family: 'Inter', sans-serif;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; 
      padding-bottom: 20px; border-bottom: 2px solid #8b5cf6;">
        <div>
          <h1 style="margin: 0; font-size: 28px; color: #8b5cf6; font-weight: 800; letter-spacing: -0.025em;">IAnalyticBlood</h1>
          <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px; font-weight: 500;">Informe Inteligente de Salud</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em;">
          Fecha de Análisis
          </p>
          <p style="margin: 2px 0 0; font-size: 14px; font-weight: 600; color: #374151;">${date}</p>
        </div>
      </div>

      <div style="margin-bottom: 35px; padding: 20px; background: #f9fafb; border-radius: 12px; border: 1px solid #f3f4f6;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h2 style="margin: 0; font-size: 16px; font-weight: 700; color: #111827;">Resumen Ejecutivo</h2>
          <span style="background: ${statusColor}15; color: ${statusColor}; padding: 4px 10px; border-radius: 99px; 
          font-size: 11px; font-weight: 700; text-transform: uppercase;">
            Estado: ${statusLabel}
          </span>
        </div>
        <p style="margin: 0; font-size: 13.5px; line-height: 1.6; color: #4b5563;">${data.overview.summary}</p>
        <p style="margin: 12px 0 0; font-size: 12px; color: #6b7280;">
          Estado general: <strong style="color: #374151;">${data.overview.general_state}</strong>
        </p>
      </div>

      <div style="margin-bottom: 35px;">
        <h3 style="margin: 0 0 15px; font-size: 15px; font-weight: 700; color: #111827; display: flex; align-items: center; 
        gap: 8px;">
          <span style="color: #8b5cf6;">📊</span> Parámetros Analizados
        </h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #f3f4f6; border-radius: 8px; overflow: hidden;">
          <thead style="background: #f9fafb;">
            <tr>
              <th style="padding: 12px; text-align: left; font-size: 11px; font-weight: 600; color: #6b7280; 
              text-transform: uppercase;">Parámetro</th>
              <th style="padding: 12px; text-align: center; font-size: 11px; font-weight: 600; color: #6b7280; 
              text-transform: uppercase;">Valor</th>
              <th style="padding: 12px; text-align: center; font-size: 11px; font-weight: 600; color: #6b7280; 
              text-transform: uppercase;">Estado</th>
              <th style="padding: 12px; text-align: center; font-size: 11px; font-weight: 600; color: #6b7280; 
              text-transform: uppercase;">Rango Ref.</th>
            </tr>
          </thead>
          <tbody>${paramsHTML}</tbody>
        </table>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
        <div>
          <h3 style="margin: 0 0 15px; font-size: 15px; font-weight: 700; color: #111827;">
            <span style="color: #8b5cf6;">🔬</span> Interpretación
          </h3>
          <ul style="margin: 0; padding: 0; list-style: none;">${analysisHTML}</ul>
        </div>
        <div>
          <h3 style="margin: 0 0 15px; font-size: 15px; font-weight: 700; color: #111827;">
            <span style="color: #f59e0b;">💡</span> Recomendaciones
          </h3>
          <ul style="margin: 0; padding: 0; list-style: none;">${recsHTML}</ul>
        </div>
      </div>

      <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #f3f4f6; text-align: center; color: #9ca3af;
       font-size: 11px;">
        <p style="margin: 0;">Este informe ha sido generado automáticamente por iAnalyticBlood mediante IA.</p>
        <p style="margin: 4px 0 0;">Consulte siempre con un profesional médico calificado para la interpretación definitiva.</p>
        <p style="margin: 15px 0 0; color: #374151; font-weight: 600;">v1.0.0 — ianalyticblood.com</p>
      </div>
    </div>
  `;
}

/** Descarga el análisis como PDF real */
export async function downloadAnalysisAsPDF(data: AnalysisDoc) {
  //  Generación de PDF real usando jspdf + html2canvas
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.innerHTML = getTemplateHTML(data);
  document.body.appendChild(container);

  try {
    const content = container.querySelector("#pdf-content") as HTMLElement;
    if (!content) return;

    // Escala 2 para mejor resolución de texto
    const canvas = await html2canvas(content, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width / 2, canvas.height / 2],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
    // Nombre de archivo más limpio
    pdf.save(`Analisis_Blood_${data.date.split("T")[0]}.pdf`);
  } catch (err) {
    console.error("Error generating PDF:", err);
    throw err;
  } finally {
    document.body.removeChild(container);
  }
}

/** Imprime el informe (usando el mismo diseño) */
export function printAnalysis(data: AnalysisDoc) {
  // Reutilización del mismo template premium para imprimir
  const html = getTemplateHTML(data);
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`
    <html>
      <head>
        <title>Imprimir Análisis - IAnalyticBlood</title>
        <style>
          body { margin: 0; padding: 0; background: #f3f4f6; display: flex; justify-content: center; }
          #pdf-content { width: 794px !important; margin: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); 
          border-radius: 8px; }
          @media print {
            body { background: white; }
            #pdf-content { margin: 0; box-shadow: none; width: 100% !important; }
            .no-print { display: none; }
          }
        </style>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      </head>
      <body>
        ${html}
        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
            }, 500);
          };
        </script>
      </body>
    </html>
  `);
  win.document.close();
}

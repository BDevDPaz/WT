import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { getDB } from '../database/db';
import { getTexts } from '../utils/i18n';

export const generateWeeklyReport = async () => {
  try {
    const db = getDB();

    // 1. OBTENER DATOS DE LA BD
    // Traemos TODAS las sesiones, incluso las borradas, para mostrarlas en rojo (Transparencia)
    const sessions = await db.getAllAsync("SELECT * FROM work_sessions ORDER BY start_time ASC");
    const settings = await db.getFirstAsync("SELECT * FROM settings WHERE id = 1");
    const auditLogs = await db.getAllAsync("SELECT * FROM audit_logs ORDER BY timestamp ASC");

    if (!sessions || sessions.length === 0) {
      // Alerta simple si no hay datos (usando idioma por defecto si falla la carga)
      alert("No records found to generate report.");
      return;
    }

    // 2. CONFIGURACIÓN DE IDIOMA Y MONEDA
    const lang = settings?.language || 'es';
    const t = getTexts(lang); // Cargar diccionario
    const hourlyRate = settings?.hourly_rate || 0;

    // --- VARIABLES ACUMULADORAS ---
    let totalRegularHours = 0;
    let totalOvertimeHours = 0;
    let rowsHTML = '';
    let logsHTML = '';

    // 3. PROCESAR FILAS (La Lógica del Semáforo)
    sessions.forEach(session => {
      const start = new Date(session.start_time);
      // Si no ha cerrado sesión, usamos la hora actual para el cálculo preliminar
      const end = session.end_time ? new Date(session.end_time) : new Date();

      // A. Calcular Duración Bruta
      let durationMs = end - start;
      let durationHours = durationMs / (1000 * 60 * 60);

      // B. Aplicar Descuento de Almuerzo
      if (session.lunch_taken === 1) {
        durationHours = durationHours - 1.0; // Restar 1 hora exacta
      }
      
      // Protección contra negativos
      if (durationHours < 0) durationHours = 0;

      // C. Determinar Estado y Color (Anti-Fraude)
      let rowColor = '#D1E7DD'; // Verde (Default - Íntegro)
      let statusText = t.status_ok;
      let isDeleted = (session.status === 'deleted');
      let isEdited = session.is_manual_edit === 1;

      if (isDeleted) {
        rowColor = '#F8D7DA'; // ROJO (Eliminado)
        statusText = t.status_del;
        durationHours = 0; // Registros borrados valen $0
      } else if (isEdited) {
        rowColor = '#FFF3CD'; // AMARILLO (Manipulado)
        statusText = t.status_edit;
      }

      // Indicador visual de Almuerzo "🍔"
      if (!isDeleted && session.lunch_taken === 1) {
        statusText += t.status_lunch; 
      }

      // D. Cálculo de Overtime (Regla: > 8 horas diarias)
      let regular = 0;
      let overtime = 0;

      if (!isDeleted) {
        if (durationHours > 8) {
          regular = 8;
          overtime = durationHours - 8;
        } else {
          regular = durationHours;
        }
        totalRegularHours += regular;
        totalOvertimeHours += overtime;
      }

      // E. Formatear Horas para la Tabla
      const timeIn = start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      const timeOut = isDeleted ? '--:--' : end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

      // F. Construir Fila HTML
      rowsHTML += `
        <tr style="background-color: ${rowColor}; color: ${isDeleted ? '#721c24' : '#000'}">
          <td>${start.toLocaleDateString()}</td>
          <td>${session.address}</td>
          <td>${timeIn}</td>
          <td>${timeOut}</td>
          <td>${regular.toFixed(2)}h</td>
          <td>${overtime.toFixed(2)}h</td>
          <td style="font-weight: bold; font-size: 11px;">${statusText}</td>
        </tr>
      `;
    });

    // 4. PROCESAR LOGS DE AUDITORÍA
    if (auditLogs && auditLogs.length > 0) {
      auditLogs.forEach(log => {
        const date = new Date(log.timestamp).toLocaleString();
        let actionColor = 'orange';
        let actionText = log.action_type;

        // Traducir acciones
        if (log.action_type === 'ELIMINADO') {
            actionColor = 'red';
            actionText = t.audit_deleted;
        } else if (log.action_type === 'MODIFICADO') {
            actionText = t.audit_modified;
        } else if (log.action_type === 'ALMUERZO') {
            actionColor = 'green';
            actionText = t.audit_lunch;
        }

        logsHTML += `
          <div class="log-item">
            <span class="log-date">[${date}]</span>
            <span style="color: ${actionColor}; font-weight: bold;"> ${actionText}:</span>
            <span> ${log.details}</span>
          </div>
        `;
      });
    } else {
      logsHTML = `<p style="color: #999; font-style: italic;">${t.audit_empty}</p>`;
    }

    // 5. CÁLCULO FINANCIERO FINAL
    const regularPay = totalRegularHours * hourlyRate;
    const overtimePay = totalOvertimeHours * (hourlyRate * 1.5);
    const totalPay = regularPay + overtimePay;

    // 6. PLANTILLA HTML (CSS INLINE PARA PDF)
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Helvetica, sans-serif; padding: 30px; color: #333; }
            h1 { text-align: center; color: #2c3e50; margin-bottom: 5px; }
            .subtitle { text-align: center; color: #7f8c8d; font-size: 14px; margin-bottom: 30px; }
            
            .info-box { margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: #f9f9f9; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #999; padding: 8px; text-align: left; font-size: 11px; }
            th { background-color: #2c3e50; color: white; text-transform: uppercase; }
            
            .totals-box { margin-top: 20px; text-align: right; }
            .pay-line { font-size: 20px; font-weight: bold; color: #27ae60; margin-top: 10px; border-top: 2px solid #ddd; padding-top: 10px; display: inline-block;}
            
            .audit-section { margin-top: 40px; border-top: 2px dashed #ccc; padding-top: 20px; }
            .audit-title { font-size: 14px; font-weight: bold; color: #c0392b; margin-bottom: 10px; text-transform: uppercase; }
            .log-item { font-size: 10px; border-bottom: 1px solid #eee; padding: 5px 0; }
            .log-date { color: #666; font-family: monospace; }
          </style>
        </head>
        <body>
          <h1>${t.pdf_title}</h1>
          <div class="subtitle">${t.pdf_subtitle}</div>

          <div class="info-box">
            <div class="info-row">
              <span><strong>${t.pdf_employee}</strong> ${settings?.employee_name || '---'}</span>
              <span><strong>${t.pdf_date}</strong> ${new Date().toLocaleDateString()}</span>
            </div>
            <div class="info-row">
              <span><strong>${t.pdf_company}</strong> ${settings?.employer_name || '---'}</span>
              <span><strong>${t.pdf_rate}</strong> $${hourlyRate.toFixed(2)}/hr</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>${t.col_date}</th>
                <th>${t.col_loc}</th>
                <th>${t.col_in}</th>
                <th>${t.col_out}</th>
                <th>${t.col_reg}</th>
                <th>${t.col_ot}</th>
                <th>${t.col_status}</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>

          <div class="totals-box">
            <p>${t.pdf_total_reg} <strong>${totalRegularHours.toFixed(2)} h</strong></p>
            <p>${t.pdf_total_ot} <strong>${totalOvertimeHours.toFixed(2)} h</strong></p>
            <div class="pay-line">${t.pdf_pay_total} $${totalPay.toFixed(2)}</div>
          </div>

          <div class="audit-section">
            <div class="audit-title">${t.audit_title}</div>
            <p style="font-size: 10px; color: #666; margin-bottom: 10px;">${t.audit_intro}</p>
            ${logsHTML}
          </div>
        </body>
      </html>
    `;

    // 7. GENERAR Y COMPARTIR
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    await Sharing.shareAsync(uri, { UTMIType: '.pdf', mimeType: 'application/pdf' });

  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Error PDF Generation");
  }
};

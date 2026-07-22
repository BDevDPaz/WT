import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as MailComposer from 'expo-mail-composer';
import { getDB, getSettings } from '../database/db';
import { WorkSession, AuditLog } from '../types';
import { translations } from '../utils/i18n';

// ---------------------------------------------------------
// 📧 Enviar Reporte por Email
// ---------------------------------------------------------
export const sendReportByEmail = async (pdfUri: string, settings: any) => {
  const isAvailable = await MailComposer.isAvailableAsync();
  if (!isAvailable) {
    alert("No tienes una app de correo configurada");
    return;
  }

  // Protección de datos para el email
  const employeeName = settings?.employee_name || 'Employee';
  const employerEmail = settings?.company_email || ''; // Usamos company_email de tus tipos

  await MailComposer.composeAsync({
    recipients: [employerEmail],
    subject: `Reporte de Trabajo - ${employeeName} - ${new Date().toLocaleDateString()}`,
    body: `Hola,\n\nAdjunto envío mi reporte semanal de horas generado desde LEDTracker.\n\nSaludos.`,
    attachments: [pdfUri],
  });
};

// ---------------------------------------------------------
// 📄 Generación de Reporte Semanal en PDF
// ---------------------------------------------------------
export const generateWeeklyReport = async (
  shouldShare = true,
  customRange?: { start: number; end: number }
): Promise<string | null> => {
  try {
    const db = getDB();
    const settings = await getSettings();
    
    // Si no hay settings, no podemos calcular nada, pero evitamos el crash
    if (!settings) {
      console.warn("⚠️ No se encontraron settings para generar el reporte.");
      return null;
    }

    const lang = settings.language || 'es';
    const t = translations[lang];
    const multiplier = settings.overtime_multiplier || 1.5;
    const rate = settings.hourly_rate || 0;
    const employerName = settings.employer_name || "LEON'S ELECTRICAL DESIGN";
    const employeeName = settings.employee_name || "Employee";

    let startTs = customRange
      ? customRange.start
      : new Date(new Date().setDate(new Date().getDate() - 7)).setHours(0, 0, 0, 0);
    let endTs = customRange ? customRange.end : Date.now();

    const sessions = await db.getAllAsync<WorkSession>(
      `SELECT * FROM work_sessions
       WHERE start_time >= ?
       AND (end_time <= ? OR end_time IS NULL)
       AND status != 'deleted'
       ORDER BY start_time ASC`,
      [startTs, endTs]
    );

    let sessionsHtml = '';
    let totalWeeklyReg = 0;
    let totalWeeklyOT = 0;

    for (const s of sessions) {
      const start = new Date(s.start_time);
      const end = s.end_time ? new Date(s.end_time) : new Date();
      let ms = end.getTime() - start.getTime();

      // Cálculo de Almuerzo
      let lunchInfo = '';
      if (s.lunch_start && s.lunch_end) {
        ms -= (s.lunch_end - s.lunch_start);
        lunchInfo = `<span class="badge-lunch">Lunch: ${Math.round((s.lunch_end - s.lunch_start) / 60000)}m</span>`;
      } else if (s.lunch_taken) {
        ms -= 3600000;
        lunchInfo = `<span class="badge-lunch">Lunch: 60m</span>`;
      }

      const hours = Math.max(0, ms / (1000 * 60 * 60));
      let reg = hours > 8 ? 8 : hours;
      let ot = hours > 8 ? hours - 8 : 0;
      totalWeeklyReg += reg;
      totalWeeklyOT += ot;

      const logs = await db.getAllAsync<AuditLog>(
        "SELECT * FROM audit_logs WHERE session_id = ? ORDER BY timestamp ASC",
        [s.id]
      );

      let auditHtml = logs
        .map(
          l => `
        <div class="audit-item">
          <b>${new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</b>:
          [${l.action_type || 'GPS'}] ${l.details}
        </div>
      `
        )
        .join('');

      sessionsHtml += `
        <div class="session-card">
          <div class="session-header">
            <span class="date">${start.toLocaleDateString()}</span>
            <span class="total-day">${hours.toFixed(2)} hrs</span>
          </div>
          <p><b>Location:</b> ${s.status === 'travel' ? '🚗 En Tránsito' : s.address}</p>
          <div class="time-grid">
            <div><b>IN:</b> ${start.toLocaleTimeString()}</div>
            <div><b>OUT:</b> ${s.end_time ? end.toLocaleTimeString() : 'Active'}</div>
          </div>
          ${lunchInfo}
          ${s.manual_note ? `<div class="note"><b>Note:</b> ${s.manual_note}</div>` : ''}
          ${auditHtml ? `<div class="audit-section"><b>Audit Logs:</b>${auditHtml}</div>` : ''}
        </div>
      `;
    }

    if (totalWeeklyReg > 40) {
      totalWeeklyOT += totalWeeklyReg - 40;
      totalWeeklyReg = 40;
    }
    const totalPay = (totalWeeklyReg * rate) + (totalWeeklyOT * rate * multiplier);

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Helvetica; padding: 30px; color: #333; }
            .header { border-bottom: 3px solid #D4AF37; padding-bottom: 20px; margin-bottom: 30px; }
            .employer { font-size: 24px; font-weight: bold; text-transform: uppercase; }
            .summary-card { background: #f8f8f8; padding: 20px; border-radius: 15px; border:1px solid #ddd; display:flex; justify-content:space-between; margin-bottom:30px; }
            .session-card { border:1px solid #eee; padding:20px; border-radius:15px; margin-bottom:20px; page-break-inside:avoid; }
            .session-header { display:flex; justify-content:space-between; font-size:18px; font-weight:bold; border-bottom:1px solid #eee; padding-bottom:10px; margin-bottom:10px; }
            .time-grid { display:flex; gap:30px; margin:10px 0; font-family:monospace; }
            .total-day { color:#D4AF37; }
            .badge-lunch { background:#eee; padding:3px 8px; border-radius:5px; font-size:11px; font-weight:bold; }
            .audit-section { margin-top:15px; background:#fff5f5; padding:10px; border-radius:8px; font-size:11px; }
            .audit-item { margin-bottom:4px; border-bottom:1px solid #ffebee; }
            .grand-total { font-size:22px; color:#2E7D32; font-weight:bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="employer">${employerName}</div>
            <div>Employee: <b>${employeeName}</b></div>
            <div style="font-size:12px; color:#666;">
              Range: ${new Date(startTs).toLocaleDateString()} - ${new Date(endTs).toLocaleDateString()}
            </div>
          </div>
          <div class="summary-card">
            <div><small>REGULAR HRS</small><br/><b>${totalWeeklyReg.toFixed(2)}</b></div>
            <div><small>OVERTIME</small><br/><b>${totalWeeklyOT.toFixed(2)}</b></div>
            <div class="grand-total"><small>EST. PAY</small><br/>$${totalPay.toFixed(2)}</div>
          </div>
          ${sessionsHtml}
          <div style="text-align:center; font-size:10px; color:#aaa; margin-top:40px;">
            Generated by LEDTracker Pro Edition. GPS Verified.
          </div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });

    // ✅ CORRECCIÓN SEGURA: Usamos employeeName ya validado para evitar el error 'replace' of null
    const safeName = employeeName.replace(/\s/g, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `${safeName}_Report_${dateStr}.pdf`;

    const newPath = `${FileSystem.cacheDirectory}${fileName}`;
    await FileSystem.moveAsync({ from: uri, to: newPath });

    if (shouldShare) {
      await Sharing.shareAsync(newPath, { UTI: '.pdf', mimeType: 'application/pdf' });
    }

    return newPath;
  } catch (error) {
    console.error("❌ Report Error:", error);
    return null;
  }
};

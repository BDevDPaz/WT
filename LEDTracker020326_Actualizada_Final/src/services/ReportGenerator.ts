import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';
import { getDB, getSettings, getAllAsync } from '../database/db';
import { WorkSession, AppSettings, AuditLog } from '../types';
import { calculateSessionDuration, calculatePay } from '../utils/payrollUtils';
import { translations } from '../utils/i18n';

// Helper para fechas y monedas
const formatDate = (timestamp: number, lang: 'es' | 'en') => {
  return new Date(timestamp).toLocaleDateString(lang === 'es' ? 'es-US' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const formatCurrency = (amount: number) => {
  return `$${amount.toFixed(2)}`;
};

/**
 * Genera el reporte semanal en PDF con integridad financiera histórica.
 */
export const generateWeeklyReport = async (shouldShare: boolean = true, customRange?: { start: number, end: number }, language: 'es' | 'en' = 'es'): Promise<string | null> => {
  try {
    const db = getDB();
    const settings = await getSettings();
    const t = translations[language]; 
    
    if (!settings) {
      console.error("No settings found");
      return null;
    }

    // 1. Determinar Rango de Fechas
    let startTs: number, endTs: number;
    let rangeTitle = "";

    if (customRange) {
      startTs = customRange.start;
      endTs = customRange.end;
      rangeTitle = `${formatDate(startTs, language)} - ${formatDate(endTs, language)}`;
    } else {
      const now = new Date();
      const day = now.getDay(); 
      const diff = now.getDate() - day; 
      const start = new Date(now);
      start.setDate(diff);
      start.setHours(0,0,0,0);
      
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23,59,59,999);
      
      startTs = start.getTime();
      endTs = end.getTime();
      rangeTitle = language === 'es' ? "Semana Actual" : "Current Week";
    }

    // 2. FILTRAR SESIONES (Excluir 'deleted')
    const sessions = await getAllAsync<WorkSession>(
      `SELECT * FROM work_sessions 
       WHERE start_time >= ? AND start_time <= ? 
       AND status != 'deleted'
       ORDER BY start_time ASC`,
      [startTs, endTs]
    );

    // 3. LOGS VINCULADOS
    const sessionIds = sessions.map(s => s.id).join(',');
    
    let logsQuery = `SELECT * FROM audit_logs WHERE (timestamp >= ? AND timestamp <= ? AND session_id = 0)`;
    if (sessionIds.length > 0) {
        logsQuery += ` OR session_id IN (${sessionIds})`;
    }
    logsQuery += ` ORDER BY timestamp DESC`;

    const logs = await getAllAsync<AuditLog>(logsQuery, [startTs, endTs]);

    // 4. Cálculos Financieros (USANDO CACHÉ HISTÓRICO)
    let totalHours = 0;
    let totalEarnings = 0;

    const rows = sessions.map(session => {
      const startTime = session.actual_start_time || session.start_time;
      const endTime = session.end_time || Date.now();
      
      const durationMs = calculateSessionDuration(
        startTime, 
        endTime, 
        session.lunch_taken, 
        session.lunch_start, 
        session.lunch_end
      );

      const hours = durationMs / (1000 * 60 * 60);
      
      // ✅ LÓGICA DE PRECIO HISTÓRICO
      // Si la sesión tiene un precio guardado (cached_hourly_rate), usamos ese.
      // Si no (es 0 o null), usamos el precio global actual como respaldo.
      const rateToUse = (session.cached_hourly_rate && session.cached_hourly_rate > 0) 
                        ? session.cached_hourly_rate 
                        : settings.hourly_rate;

      const { totalPay } = calculatePay(
          hours, 
          rateToUse, 
          settings.overtime_multiplier
      );
      
      totalHours += hours;
      totalEarnings += totalPay;

      // Detectar si se usó precio histórico diferente al actual (para marcarlo en el reporte)
      const isHistoricalRate = (rateToUse !== settings.hourly_rate);

      return {
        date: formatDate(startTime, language),
        client: session.client_name || (language === 'es' ? 'General' : 'General'),
        address: session.address,
        notes: session.manual_note || '',
        start: formatTime(startTime),
        end: session.end_time ? formatTime(session.end_time) : (language === 'es' ? 'En curso' : 'Ongoing'),
        lunch: session.lunch_taken ? (language === 'es' ? 'Sí' : 'Yes') : 'No',
        total: hours.toFixed(2),
        pay: formatCurrency(totalPay),
        status: session.status,
        isGeofence: session.actual_start_time ? true : false,
        isManual: session.is_manual_edit === 1,
        rateUsed: rateToUse // Guardamos para mostrar si es relevante
      };
    });

    // 5. Construcción del HTML
    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #D4AF37; padding-bottom: 15px; }
            .title { font-size: 26px; font-weight: 800; color: #000; letter-spacing: 2px; text-transform: uppercase; }
            .subtitle { font-size: 11px; color: #D4AF37; text-transform: uppercase; margin-top: 5px; letter-spacing: 1px; }
            
            .info-grid { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f8f8f8; padding: 15px; border-radius: 8px; }
            .info-col { width: 48%; }
            .info-label { font-size: 9px; color: #999; text-transform: uppercase; font-weight: bold; margin-bottom: 2px; }
            .info-value { font-size: 13px; color: #000; font-weight: 600; margin-bottom: 10px; }

            .stats-box { display: flex; justify-content: space-between; margin-bottom: 30px; border: 1px solid #eee; border-radius: 8px; overflow: hidden; }
            .stat-item { flex: 1; text-align: center; padding: 15px; border-right: 1px solid #eee; }
            .stat-item:last-child { border-right: none; background: #fffcf2; }
            .stat-num { font-size: 22px; font-weight: bold; color: #000; }
            .stat-desc { font-size: 9px; color: #666; text-transform: uppercase; margin-top: 5px; }

            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 11px; }
            th { text-align: left; border-bottom: 2px solid #000; padding: 10px; text-transform: uppercase; font-size: 9px; color: #666; }
            td { border-bottom: 1px solid #eee; padding: 12px 10px; vertical-align: top; }
            .row-active { background-color: #fff8e1; }
            
            .client-badge { background: #000; color: #fff; padding: 3px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; text-transform: uppercase; display: inline-block; margin-bottom: 4px; }
            .notes { font-style: italic; color: #666; font-size: 10px; display: block; margin-top: 4px; }
            .geo-badge { color: #2ecc71; font-size: 9px; font-weight: bold; display: block; margin-top: 2px; }
            .manual-badge { color: #e67e22; font-size: 9px; font-weight: bold; display: block; margin-top: 2px; }
            .lunch-badge { color: #e67e22; font-size: 9px; }
            .rate-info { font-size: 8px; color: #999; display: block; margin-top: 2px; }

            .audit-section { margin-top: 20px; border-top: 3px solid #eee; padding-top: 20px; page-break-inside: avoid; }
            .audit-title { font-size: 12px; font-weight: bold; color: #000; text-transform: uppercase; margin-bottom: 15px; }
            .log-item { font-size: 9px; color: #555; margin-bottom: 6px; border-left: 2px solid #ddd; padding-left: 10px; }
            .log-alert { border-left-color: #D4AF37; color: #000; background: #fffcf0; padding: 5px 10px; }
            .log-system { border-left-color: #000; color: #000; background: #f0f0f0; padding: 5px 10px; }
            
            .footer { margin-top: 50px; text-align: center; font-size: 9px; color: #aaa; border-top: 1px solid #eee; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">LED TRACKER</div>
            <div class="subtitle">${t.report_subtitle || "REPORTE OFICIAL"}</div>
          </div>

          <div class="info-grid">
            <div class="info-col">
              <div class="info-label">${t.label_name || "EMPLEADO"}</div>
              <div class="info-value">${settings.employee_name || '---'}</div>
              <div class="info-label">ID</div>
              <div class="info-value">EMP-#${settings.id.toString().padStart(4, '0')}</div>
            </div>
            <div class="info-col" style="text-align: right;">
              <div class="info-label">${t.label_company_name || "EMPRESA"}</div>
              <div class="info-value">${settings.employer_name || '---'}</div>
              <div class="info-label">${t.col_date || "RANGO"}</div>
              <div class="info-value">${rangeTitle}</div>
            </div>
          </div>

          <div class="stats-box">
            <div class="stat-item">
              <div class="stat-num">${totalHours.toFixed(2)}</div>
              <div class="stat-desc">${t.stats_hours || "HORAS TOTALES"}</div>
            </div>
            <div class="stat-item">
              <div class="stat-num" style="color: #D4AF37;">${formatCurrency(totalEarnings)}</div>
              <div class="stat-desc">${t.stats_earnings || "PAGO ESTIMADO"}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th width="15%">${t.col_date || "FECHA"}</th>
                <th width="40%">${language === 'es' ? 'ACTIVIDAD / CLIENTE' : 'ACTIVITY / CLIENT'}</th>
                <th width="25%">${language === 'es' ? 'HORARIO' : 'SCHEDULE'}</th>
                <th width="10%">HRS</th>
                <th width="10%">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map(row => `
                <tr class="${row.status === 'active' ? 'row-active' : ''}">
                  <td>
                    <strong>${row.date}</strong>
                    ${row.lunch === 'Sí' || row.lunch === 'Yes' ? '<br><span class="lunch-badge">Lunch</span>' : ''}
                  </td>
                  <td>
                    ${row.client !== 'General' ? `<span class="client-badge">${row.client}</span><br>` : ''}
                    ${row.address}
                    ${row.notes ? `<span class="notes">"${row.notes}"</span>` : ''}
                  </td>
                  <td>
                    ${row.start} - ${row.end}
                    ${row.isGeofence ? '<span class="geo-badge">✓ GPS</span>' : ''}
                    ${row.isManual ? '<span class="manual-badge">✎ Edit</span>' : ''}
                  </td>
                  <td><strong>${row.total}</strong></td>
                  <td>
                    ${row.pay}
                    <span class="rate-info">Rate: $${row.rateUsed}/h</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="audit-section">
            <div class="audit-title">${t.pdf_audit_title || "BITÁCORA DE EVENTOS"}</div>
            ${logs.length === 0 ? '<div style="font-size:10px; color:#999;">---</div>' : 
              logs.map(log => {
                const isSystem = log.action_type.includes('ADMIN');
                const isAlert = log.action_type.includes('AUTO') || log.action_type.includes('EXIT') || log.action_type.includes('MANUAL_EDIT');
                const cssClass = isSystem ? 'log-system' : (isAlert ? 'log-alert' : 'log-item');
                return `
                <div class="${cssClass}">
                  <strong>${formatTime(log.timestamp)}</strong> — <span style="font-weight:bold">[${log.action_type}]</span> ${log.details}
                </div>
              `}).join('')
            }
          </div>

          <div class="footer">
            Generado con / Generated by LED Tracker App.<br>
            ${new Date().toISOString()}
          </div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html, base64: false });

    if (shouldShare) {
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    }

    return uri;

  } catch (error) {
    console.error("Error generating report:", error);
    return null;
  }
};

export const sendReportByEmail = async (pdfUri: string, settings: AppSettings, language: 'es' | 'en' = 'es') => {
  const isAvailable = await MailComposer.isAvailableAsync();
  const subject = language === 'es' ? `Nómina Semanal - ${settings.employee_name}` : `Weekly Payroll - ${settings.employee_name}`;
  const body = language === 'es' ? "Adjunto reporte semanal." : "Weekly report attached.";

  if (isAvailable) {
    await MailComposer.composeAsync({
      recipients: [settings.company_email],
      subject: subject,
      body: body,
      attachments: [pdfUri]
    });
  } else {
    await Sharing.shareAsync(pdfUri);
  }
};

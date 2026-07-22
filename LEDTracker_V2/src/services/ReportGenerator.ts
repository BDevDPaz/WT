// src/services/ReportGenerator.ts
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { getDB, getSettings } from '../database/db';
import { WorkSession, AuditLog } from '../types';
import { translations } from '../utils/i18n';

export const generateWeeklyReport = async (shouldShare = true): Promise<string | null> => {
  try {
    const db = getDB();
    const settings = await getSettings();
    if (!settings) return null;

    const t = translations[settings.language];
    
    // Rango: Últimos 7 días o Semana actual (Simplificado para consistencia)
    const now = new Date();
    const past = new Date();
    past.setDate(now.getDate() - 7);
    
    const sessions = await db.getAllAsync<WorkSession>(
      `SELECT * FROM work_sessions 
       WHERE start_time >= ? ORDER BY start_time ASC`,
      [past.getTime()]
    );

    if (sessions.length === 0 && !shouldShare) return null; // Si es automático y está vacío, ignorar

    let rows = '';
    let totalReg = 0;
    
    sessions.forEach(s => {
      const start = new Date(s.start_time);
      const end = s.end_time ? new Date(s.end_time) : new Date();
      let ms = end.getTime() - start.getTime();
      if (s.lunch_taken) ms -= 3600000;
      ms = Math.max(0, ms);
      
      const hours = ms / (1000 * 60 * 60);
      totalReg += hours;

      rows += `
        <tr>
          <td>${start.toLocaleDateString()}</td>
          <td>${s.address}</td>
          <td>${start.toLocaleTimeString()}</td>
          <td>${s.end_time ? end.toLocaleTimeString() : 'Active'}</td>
          <td>${hours.toFixed(2)}</td>
        </tr>
      `;
    });

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Helvetica, sans-serif; padding: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { margin-top: 20px; font-size: 18px; font-weight: bold; text-align: right; }
          </style>
        </head>
        <body>
          <h1>${settings.employer_name}</h1>
          <h3>${t.pdf_employee}: ${settings.employee_name}</h3>
          <p>Email: ${settings.company_email}</p>
          
          <table>
            <tr>
              <th>${t.col_date}</th>
              <th>${t.col_loc}</th>
              <th>${t.col_in}</th>
              <th>${t.col_out}</th>
              <th>Hrs</th>
            </tr>
            ${rows}
          </table>
          
          <div class="total">Total: ${totalReg.toFixed(2)} hrs</div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    
    if (shouldShare) {
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    }
    
    return uri;

  } catch (error) {
    console.error("Report Gen Error:", error);
    return null;
  }
};

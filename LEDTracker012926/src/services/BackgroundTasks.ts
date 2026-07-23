import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDB, initDatabase, insertAuditLog, updateSessionEndTime } from '../database/db';
import { WorkSession } from '../types';
import { generateWeeklyReport } from './ReportGenerator';
import { LocationService } from './LocationManager';
import { STORAGE_KEYS } from '../constants/storageKeys';

const TASK_NAME = 'APP_BACKGROUND_SERVICES';
const KEY_LAST_EXIT_AT = STORAGE_KEYS.LAST_GEOFENCE_EXIT_AT;
const REPORT_STORAGE_KEY = STORAGE_KEYS.LAST_REPORT_WEEK_ID;
const AUTO_CHECKOUT_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes

// Returns the ISO week ID string for the current date, e.g. "2026-W03".
// Used to avoid generating the same weekly report more than once per week.
const getWeekId = (): string => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  return `${d.getFullYear()}-W${weekNum}`;
};

// Auto-Checkout failsafe logic.
// Exported so it can also be called from _layout (foreground check on app open).
export const checkFailsafeLogic = async () => {
  try {
    let db = getDB();
    if (!db) { await initDatabase(); db = getDB(); }
    if (!db) return false;

    const lastExitStr = await AsyncStorage.getItem(KEY_LAST_EXIT_AT);
    if (!lastExitStr) return false;

    const lastExitAt = parseInt(lastExitStr, 10);
    const now = Date.now();

    // 5.1 Condition: time outside >= threshold
    const duration = now - lastExitAt;

    console.log(`⏱️ [Estado] Inactividad: ${(duration / 60000).toFixed(1)} min`);

    if (duration >= AUTO_CHECKOUT_THRESHOLD_MS) {
      // Only close sessions that are still genuinely active.
      const session = await db.getFirstAsync<WorkSession>(
        "SELECT * FROM work_sessions WHERE status = 'active' ORDER BY id DESC LIMIT 1"
      );

      if (session && session.id) {
        console.log(`⚠️ [Auto-Checkout] Umbral superado. Cerrando sesión...`);

        // 5.2 Action: close the session using the exit timestamp so the payroll
        // is not charged for the 15-minute grace period.
        await updateSessionEndTime(session.id, lastExitAt);
        // updateSessionEndTime already sets status = 'completed', but we force
        // an explicit update here for clarity and safety.
        await db.runAsync("UPDATE work_sessions SET status = 'completed' WHERE id = ?", [session.id]);

        await insertAuditLog(session.id, 'AUTO_CHECKOUT', 'Inactividad detectada (>15m).');

        // Resolve the timer.
        await AsyncStorage.removeItem(KEY_LAST_EXIT_AT);
        try { await LocationService.stopMonitoring(); } catch (e) {}

        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Jornada Finalizada 🏁',
            body: 'Se cerró tu sesión automáticamente por inactividad.',
            sound: true,
          },
          trigger: null,
        });
        return true;
      } else {
        // No active session — clear stale timer data.
        await AsyncStorage.removeItem(KEY_LAST_EXIT_AT);
      }
    }
    return false;
  } catch (e) {
    console.error('Error en checkFailsafeLogic:', e);
    return false;
  }
};

TaskManager.defineTask(TASK_NAME, async () => {
  console.log('🔄 [Background] Ejecutando verificación periódica...');

  // 1. Auto-Checkout failsafe
  const failsafeResult = await checkFailsafeLogic();

  // 2. Automatic weekly report generation
  let reportResult = false;
  try {
    const dateObj = new Date();
    const day = dateObj.getDay(); // 0 = Sunday, 1 = Monday …

    // Window: Sunday after 8 PM, all day Monday, all day Tuesday.
    const isReportWindow = (day === 0 && dateObj.getHours() >= 20) || day === 1 || day === 2;
    if (isReportWindow) {
      const currentWeekId = getWeekId();
      const lastReportedWeek = await AsyncStorage.getItem(REPORT_STORAGE_KEY);

      if (lastReportedWeek !== currentWeekId) {
        console.log('📄 [Background] Generando reporte semanal automático...');

        // false = generate silently without opening the share sheet.
        const pdfPath = await generateWeeklyReport(false);

        if (pdfPath) {
          await AsyncStorage.setItem(REPORT_STORAGE_KEY, currentWeekId);

          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Reporte Semanal Listo 📄',
              body: 'Tu reporte de nómina ha sido generado. Toca para ver.',
              data: { action: 'GENERATE_REPORT_PROMPT' },
              sound: true,
            },
            trigger: null,
          });
          reportResult = true;
        }
      }
    }
  } catch (e) {
    console.error('Error en reporte automático:', e);
  }

  return (failsafeResult || reportResult)
    ? BackgroundFetch.BackgroundFetchResult.NewData
    : BackgroundFetch.BackgroundFetchResult.NoData;
});

export const BackgroundTasks = {
  register: async () => {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(TASK_NAME, {
        minimumInterval: 15 * 60,
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log('✅ Tarea de fondo registrada');
    }
  },
  unregister: async () => {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(TASK_NAME);
      console.log('❌ Tarea de fondo desregistrada');
    }
  },
};

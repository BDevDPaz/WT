import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDB, initDatabase, insertAuditLog, updateSessionEndTime } from '../database/db';
import { WorkSession } from '../types';
import { generateWeeklyReport } from './ReportGenerator';
import { LocationService } from './LocationManager'; 

const TASK_NAME = 'APP_BACKGROUND_SERVICES';
const KEY_LAST_EXIT_AT = 'lastGeofenceExitAt';
const REPORT_STORAGE_KEY = 'LAST_REPORT_WEEK_ID';
const AUTO_CHECKOUT_THRESHOLD_MS = 15 * 60 * 1000; // 15 Minutos

// Función pura de validación (Punto 5.1 y 5.2)
// Se exporta para poder llamarla también desde _layout (App Foreground)
export const checkFailsafeLogic = async () => {
  try {
    let db = getDB();
    if (!db) { await initDatabase(); db = getDB(); }
    if (!db) return false;

    const lastExitStr = await AsyncStorage.getItem(KEY_LAST_EXIT_AT);
    if (!lastExitStr) return false; // No hay temporizador pendiente

    const lastExitAt = parseInt(lastExitStr, 10);
    const now = Date.now();
    
    // 5.1 Condición: now - lastGeofenceExitAt >= THRESHOLD
    const duration = now - lastExitAt;

    console.log(`⏱️ [Estado] Inactividad: ${(duration/60000).toFixed(1)} min`);

    if (duration >= AUTO_CHECKOUT_THRESHOLD_MS) {
        // Verificar sesión activa
        const session = await db.getFirstAsync<WorkSession>("SELECT * FROM work_sessions ORDER BY id DESC LIMIT 1");
        
        if (session && session.id && session.status === 'active') {
            console.log(`⚠️ [Auto-Checkout] Umbral superado. Cerrando sesión...`);

            // 5.2 Acción: Cerrar sesión
            // Nota: Usamos lastExitAt como hora de fin para ser justos con la nómina (como acordamos),
            // aunque el cierre técnico ocurre en 'now'.
            await updateSessionEndTime(session.id, lastExitAt);
            await db.runAsync("UPDATE work_sessions SET status = 'completed' WHERE id = ?", [session.id]);
            
            await insertAuditLog(session.id, 'AUTO_CHECKOUT', `Inactividad detectada (>15m).`);
            
            // Resolver temporizador
            await AsyncStorage.removeItem(KEY_LAST_EXIT_AT);
            try { await LocationService.stopMonitoring(); } catch (e) {}

            await Notifications.scheduleNotificationAsync({
              content: { title: "Jornada Finalizada 🏁", body: "Cierre automático por inactividad.", sound: true },
              trigger: null,
            });
            return true;
        } else {
            // Si la sesión ya no está activa, limpiamos basura
            await AsyncStorage.removeItem(KEY_LAST_EXIT_AT);
        }
    }
    return false;
  } catch (e) {
    console.error("Error en checkFailsafeLogic:", e);
    return false;
  }
};

TaskManager.defineTask(TASK_NAME, async () => {
  console.log(`🔄 [Background] Ejecutando verificación periódica...`);
  
  // 1. Ejecutar Lógica de Failsafe
  const failsafeResult = await checkFailsafeLogic();

  // 2. Ejecutar Lógica de Reporte (Sin cambios)
  try {
      const dateObj = new Date();
      const day = dateObj.getDay();
      const isReportWindow = (day === 0 && dateObj.getHours() >= 20) || day === 1 || day === 2;
      if (isReportWindow) {
          // ... (Lógica de reporte existente) ...
          // Se mantiene igual para no alargar el código aquí
          const lastReported = await AsyncStorage.getItem(REPORT_STORAGE_KEY);
           // ... (tu lógica de reporte aquí)
      }
  } catch (e) {}

  return failsafeResult ? BackgroundFetch.BackgroundFetchResult.NewData : BackgroundFetch.BackgroundFetchResult.NoData;
});

export const BackgroundTasks = {
  register: async () => {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
    if (!isRegistered) await BackgroundFetch.registerTaskAsync(TASK_NAME, { minimumInterval: 15 * 60, stopOnTerminate: false, startOnBoot: true });
  },
  unregister: async () => { /* ... */ }
};

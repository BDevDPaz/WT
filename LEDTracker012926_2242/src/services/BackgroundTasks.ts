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

// Función pura de validación (Auto-Checkout)
export const checkFailsafeLogic = async () => {
  try {
    let db = getDB();
    if (!db) { await initDatabase(); db = getDB(); }
    if (!db) return false;

    const lastExitStr = await AsyncStorage.getItem(KEY_LAST_EXIT_AT);
    if (!lastExitStr) return false; // No hay temporizador pendiente

    const lastExitAt = parseInt(lastExitStr, 10);
    const now = Date.now();
    
    // 5.1 Condición: Tiempo fuera > 15 min
    const duration = now - lastExitAt;

    console.log(`⏱️ [Estado] Inactividad: ${(duration/60000).toFixed(1)} min`);

    if (duration >= AUTO_CHECKOUT_THRESHOLD_MS) {
        // Verificar sesión activa
        const session = await db.getFirstAsync<WorkSession>("SELECT * FROM work_sessions ORDER BY id DESC LIMIT 1");
        
        if (session && session.id && session.status === 'active') {
            console.log(`⚠️ [Auto-Checkout] Umbral superado. Cerrando sesión...`);

            // 5.2 Acción: Cerrar sesión usando la hora de salida detectada
            await updateSessionEndTime(session.id, lastExitAt);
            await db.runAsync("UPDATE work_sessions SET status = 'completed' WHERE id = ?", [session.id]);
            
            await insertAuditLog(session.id, 'AUTO_CHECKOUT', `Inactividad detectada (>15m).`);
            
            // Limpieza
            await AsyncStorage.removeItem(KEY_LAST_EXIT_AT);
            try { await LocationService.stopMonitoring(); } catch (e) {}

            await Notifications.scheduleNotificationAsync({
              content: { 
                title: "Jornada Finalizada 🏁", 
                body: "Se cerró tu sesión automáticamente por inactividad.", 
                sound: true 
              },
              trigger: null,
            });
            return true;
        } else {
            // Limpiar si ya no hay sesión activa
            await AsyncStorage.removeItem(KEY_LAST_EXIT_AT);
        }
    }
    return false;
  } catch (e) {
    console.error("Error en checkFailsafeLogic:", e);
    return false;
  }
};

// Función auxiliar para obtener ID único de la semana (Año-Semana)
const getWeekId = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    return `${d.getFullYear()}-W${weekNum}`;
};

TaskManager.defineTask(TASK_NAME, async () => {
  console.log(`🔄 [Background] Ejecutando verificación periódica...`);
  
  // 1. Ejecutar Lógica de Failsafe (Auto-Cierre)
  const failsafeResult = await checkFailsafeLogic();

  // 2. Ejecutar Lógica de Reporte Automático
  let reportResult = false;
  try {
      const dateObj = new Date();
      const day = dateObj.getDay(); // 0 = Domingo, 1 = Lunes...
      
      // Ventana: Domingo después de las 8PM, Lunes o Martes (todo el día)
      const isReportWindow = (day === 0 && dateObj.getHours() >= 20) || day === 1 || day === 2;
      
      if (isReportWindow) {
          const currentWeekId = getWeekId();
          const lastReportedWeek = await AsyncStorage.getItem(REPORT_STORAGE_KEY);

          // Si no se ha reportado esta semana
          if (lastReportedWeek !== currentWeekId) {
             console.log("📄 [Background] Generando reporte semanal automático...");
             
             // false = No abrir share sheet, solo generar archivo
             const pdfPath = await generateWeeklyReport(false);
             
             if (pdfPath) {
                 await AsyncStorage.setItem(REPORT_STORAGE_KEY, currentWeekId);
                 
                 await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "Reporte Semanal Listo 📄",
                        body: "Tu reporte de nómina ha sido generado. Toca para ver.",
                        data: { action: 'GENERATE_REPORT_PROMPT' }, // Redirige a pantalla reporte
                        sound: true
                    },
                    trigger: null
                 });
                 reportResult = true;
             }
          }
      }
  } catch (e) {
      console.error("Error en reporte automático:", e);
  }

  // Si alguna de las dos tareas hizo algo, retornamos NewData
  return (failsafeResult || reportResult) 
    ? BackgroundFetch.BackgroundFetchResult.NewData 
    : BackgroundFetch.BackgroundFetchResult.NoData;
});

export const BackgroundTasks = {
  register: async () => {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
    if (!isRegistered) {
        // Intervalo de 15 minutos (mínimo permitido por iOS/Android)
        await BackgroundFetch.registerTaskAsync(TASK_NAME, { 
            minimumInterval: 15 * 60, 
            stopOnTerminate: false, 
            startOnBoot: true 
        });
    }
  },
  unregister: async () => {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
    if (isRegistered) await BackgroundFetch.unregisterTaskAsync(TASK_NAME);
  }
};

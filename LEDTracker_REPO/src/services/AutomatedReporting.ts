import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateWeeklyReport } from './ReportGenerator';

const TASK_NAME = 'WEEKLY_REPORT_CHECK';
const STORAGE_KEY = 'LAST_REPORT_WEEK_ID';

// ------------------------------------------------------------------
// 1. DEFINICIÓN DE LA TAREA (El Cerebro)
// ------------------------------------------------------------------
TaskManager.defineTask(TASK_NAME, async () => {
  try {
    console.log(`🔄 Ejecutando chequeo de fondo: ${TASK_NAME}`);
    
    const now = new Date();
    const day = now.getDay(); // 0 = Domingo, 1 = Lunes, 2 = Martes...

    // Lógica de Ventana: Solo chequeamos de Domingo (noche) a Martes
    const isWindow = (day === 0 && now.getHours() >= 20) || day === 1 || day === 2;
    
    if (!isWindow) {
      console.log("⏳ Fuera de ventana de reporte. Saltando.");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Calcular ID de la semana pasada (Lunes anterior)
    const lastWeekMonday = new Date(now);
    // Ajuste para obtener el lunes de la semana ANTERIOR
    // Si hoy es Lunes (1), restamos 7. Si es Martes (2), restamos 8.
    const diff = now.getDate() - 7 - (day === 0 ? 6 : day - 1);
    lastWeekMonday.setDate(diff);
    lastWeekMonday.setHours(0, 0, 0, 0);

    const currentWeekId = lastWeekMonday.toISOString().split('T')[0];
    const lastReported = await AsyncStorage.getItem(STORAGE_KEY);

    if (lastReported === currentWeekId) {
      console.log("✅ Reporte de esta semana ya generado.");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Calcular rangos exactos para el reporte
    const startTs = lastWeekMonday.getTime();
    const lastWeekSunday = new Date(startTs);
    lastWeekSunday.setDate(lastWeekSunday.getDate() + 6);
    lastWeekSunday.setHours(23, 59, 59, 999);
    const endTs = lastWeekSunday.getTime();

    console.log("📄 Generando reporte automático en segundo plano...");
    
    // false = No compartir inmediatamente, solo generar URI
    const pdfUri = await generateWeeklyReport(false, { start: startTs, end: endTs });

    if (pdfUri) {
      // Notificación Local
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "📄 Reporte Semanal Listo",
          body: "Tu reporte de nómina está listo. Toca para enviarlo.",
          data: { action: 'GENERATE_REPORT_PROMPT' }, // Acción que escucha nuestro Layout
          sound: true,
        },
        trigger: null, // Inmediato
      });

      // Guardamos marca para no repetir
      await AsyncStorage.setItem(STORAGE_KEY, currentWeekId);
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }

    return BackgroundFetch.BackgroundFetchResult.Failed;

  } catch (error) {
    console.error("❌ Error en tarea de fondo:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// ------------------------------------------------------------------
// 2. REGISTRO SEGURO (El Escudo contra Warnings)
// ------------------------------------------------------------------
export const AutomatedReporting = {
  /**
   * Registra la tarea de fondo de manera segura, verificando estado
   * para evitar el 'NullPointerException' en Android.
   */
  register: async () => {
    try {
      // A) Verificar status global del sistema
      const status = await BackgroundFetch.getStatusAsync();
      
      if (status === BackgroundFetch.BackgroundFetchStatus.Restricted || status === BackgroundFetch.BackgroundFetchStatus.Denied) {
        console.warn("⚠️ Background Fetch está restringido o denegado por el usuario.");
        return;
      }

      // B) Verificar si YA está registrada para no duplicar (Causa común de warnings)
      const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
      if (isRegistered) {
        console.log("ℹ️ Tarea de reporte ya estaba registrada.");
        return;
      }

      // C) Registrar
      await BackgroundFetch.registerTaskAsync(TASK_NAME, {
        minimumInterval: 60 * 15, // 15 minutos (mínimo permitido por iOS/Android)
        stopOnTerminate: false,   // Seguir corriendo si la app se cierra
        startOnBoot: true,        // Arrancar con el dispositivo (Android)
      });
      
      console.log("✅ Tarea de reporte automático registrada con éxito.");

    } catch (e) {
      // Capturamos el error silenciosamente para que no moleste en UI
      console.log("⚠️ No se pudo registrar Background Fetch (probablemente en Expo Go o Dev Client sin configurar):", e);
    }
  },

  /**
   * Desregistra la tarea (Útil para logout o limpieza)
   */
  unregister: async () => {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
      if (isRegistered) {
        await BackgroundFetch.unregisterTaskAsync(TASK_NAME);
        console.log("🗑️ Tarea de reporte desregistrada.");
      }
    } catch (e) {
      console.error("Error desregistrando tarea:", e);
    }
  }
};

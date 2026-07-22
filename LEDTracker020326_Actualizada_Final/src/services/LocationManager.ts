import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDB, insertAuditLog, initDatabase } from '../database/db';
import { WorkSession } from '../types';

const GEOFENCE_TASK = 'GEOFENCE_TRACKING_TASK';
const KEY_LAST_EXIT_AT = 'lastGeofenceExitAt';
const KEY_LAST_DECISION_AT = 'lastUserDecisionAt';

// --- TAREA EN SEGUNDO PLANO ---
TaskManager.defineTask(GEOFENCE_TASK, async ({ data, error }: any) => {
  if (error) {
    // Si hay error en la tarea, no intentamos nada más para evitar bucles
    console.error("[GEO] ❌ Error crítico en tarea:", error);
    return;
  }

  const { eventType } = data;

  // Inicializar DB si es necesario
  let db = getDB();
  if (!db) {
    try {
      await initDatabase();
      db = getDB();
    } catch (e) {
      console.error("[GEO] Fallo DB:", e);
      return;
    }
  }
  if (!db) return;

  try {
    const session = await db.getFirstAsync<WorkSession>("SELECT * FROM work_sessions ORDER BY id DESC LIMIT 1");
    if (!session) return;
    
    const now = Date.now();

    // 🟢 ENTRADA
    if (eventType === Location.GeofencingEventType.Enter) {
      console.log(`[GEO] 🟢 Entrada: ${new Date(now).toLocaleTimeString()}`);
      await AsyncStorage.removeItem(KEY_LAST_EXIT_AT);

      if (session.status === 'pending_arrival' || session.status === 'travel') {
        await db.runAsync("UPDATE work_sessions SET status = 'active', actual_start_time = ? WHERE id = ?", [now, session.id]);
        await insertAuditLog(session.id!, 'GEOFENCE_ENTRY', `Auto Check-in (GPS).`);
        await Notifications.scheduleNotificationAsync({
          content: { title: "📍 Llegaste al sitio", body: "Jornada iniciada.", sound: true },
          trigger: null,
        });
      }
    }
    // 🔴 SALIDA
    else if (eventType === Location.GeofencingEventType.Exit) {
      console.log(`[GEO] 🔴 Salida: ${new Date(now).toLocaleTimeString()}`);
      if (session.status === 'active') {
        const existingExit = await AsyncStorage.getItem(KEY_LAST_EXIT_AT);
        if (!existingExit) {
          await AsyncStorage.setItem(KEY_LAST_EXIT_AT, now.toString());
          await insertAuditLog(session.id!, 'GEOFENCE_EXIT', `Salida detectada.`);
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "⚠️ Saliste del área",
              body: "¿Terminaste tu jornada?",
              data: { action: 'CHECKOUT_DECISION' },
              sound: true,
              priority: Notifications.AndroidNotificationPriority.MAX,
              vibrate: [0, 500, 200, 500],
            },
            trigger: null,
          });
        }
      }
    }
  } catch (err) {
    console.error("[GEO] Error lógico:", err);
  }
});

// --- API DEL SERVICIO ---
export const LocationService = {
  requestPermissions: async () => {
    // 1. Pedir permiso Foreground
    const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
    if (fgStatus !== 'granted') {
      console.log("[GEO] Permiso Foreground denegado");
      return false;
    }

    // 2. Pedir permiso Background (CRÍTICO para Android 10+)
    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
    if (bgStatus !== 'granted') {
      console.log("[GEO] Permiso Background denegado (Requerido: 'Allow all the time')");
      return false;
    }
    return true;
  },

  startMonitoringArrival: async (lat: number, lng: number, radius: number = 200) => {
    try {
      // ✅ FIX: Limpiar tarea previa con seguridad
      const isRegistered = await TaskManager.isTaskRegisteredAsync(GEOFENCE_TASK);
      if (isRegistered) {
        console.log("[GEO] Deteniendo tarea previa...");
        await Location.stopGeofencingAsync(GEOFENCE_TASK);
        // Pequeña pausa para que Android limpie SharedPreferences
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      await AsyncStorage.removeItem(KEY_LAST_EXIT_AT);

      console.log(`[GEO] Iniciando monitorización en: ${lat}, ${lng}`);
      
      // ✅ FIX: Validar coordenadas antes de enviar
      if (!lat || !lng) throw new Error("Coordenadas inválidas");

      await Location.startGeofencingAsync(GEOFENCE_TASK, [{
        identifier: 'WORK_ZONE',
        latitude: lat,
        longitude: lng,
        radius: radius,
        notifyOnEnter: true,
        notifyOnExit: true,
      }]);
      
      return true;
    } catch (e) {
      console.error("[GEO] Error iniciando monitorización:", e);
      return false;
    }
  },

  stopMonitoring: async () => {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(GEOFENCE_TASK);
      if (isRegistered) {
        await Location.stopGeofencingAsync(GEOFENCE_TASK);
      }
      await AsyncStorage.removeItem(KEY_LAST_EXIT_AT);
    } catch (e) {
      console.error("[GEO] Error al detener:", e);
    }
  },

  resolveAbandonmentTimer: async () => {
    const now = Date.now();
    await AsyncStorage.setItem(KEY_LAST_DECISION_AT, now.toString());
    await AsyncStorage.removeItem(KEY_LAST_EXIT_AT);
  }
};

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDB, initDatabase, insertAuditLog } from '../database/db';
import { WorkSession } from '../types';
import { STORAGE_KEYS } from '../constants/storageKeys';

const GEOFENCE_TASK = 'GEOFENCE_TRACKING_TASK';

const KEY_LAST_EXIT_AT = STORAGE_KEYS.LAST_GEOFENCE_EXIT_AT;
const KEY_LAST_DECISION_AT = STORAGE_KEYS.LAST_USER_DECISION_AT;

TaskManager.defineTask(GEOFENCE_TASK, async ({ data, error }: any) => {
  if (error) {
    console.error('[GEO] Error crítico en tarea:', error);
    return;
  }

  const { eventType } = data;

  // Guard: initialise DB if the background task wakes up before the foreground app.
  let db = getDB();
  if (!db) {
    try {
      await initDatabase();
      db = getDB();
    } catch (e) {
      console.error('[GEO] Fallo al inicializar DB en background:', e);
      return;
    }
  }
  if (!db) return;

  try {
    const session = await db.getFirstAsync<WorkSession>(
      "SELECT * FROM work_sessions WHERE status IN ('pending_arrival', 'travel', 'active') ORDER BY id DESC LIMIT 1"
    );

    if (!session) return;
    const now = Date.now();

    // 🟦 2.2 ENTRADA (Check-in)
    if (eventType === Location.GeofencingEventType.Enter) {
      console.log(`[GEO] 🟢 Entrada detectada a las ${new Date(now).toLocaleTimeString()}`);
      
      // Limpiamos estado de salida previo (Ya estamos dentro)
      await AsyncStorage.removeItem(KEY_LAST_EXIT_AT);

      if (session.status === 'pending_arrival' || session.status === 'travel') {
        // Registrar sessionStartAt = now
        await db.runAsync("UPDATE work_sessions SET status = 'active', actual_start_time = ? WHERE id = ?", [now, session.id]);
        await insertAuditLog(session.id!, 'GEOFENCE_ENTRY', `Auto Check-in (GPS).`);
        
        await Notifications.scheduleNotificationAsync({
          content: { title: "📍 Llegaste al sitio", body: "Jornada iniciada automáticamente.", sound: true },
          trigger: null,
        });
      }
    } 
    
    // 🟥 3. SALIDA (Geofence Exit)
    else if (eventType === Location.GeofencingEventType.Exit) {
      console.log(`[GEO] 🔴 Salida detectada a las ${new Date(now).toLocaleTimeString()}`);

      if (session.status === 'active') {
        // Verificar si ya existe un timestamp de salida (para respetar la PRIMERA salida)
        const existingExit = await AsyncStorage.getItem(KEY_LAST_EXIT_AT);
        
        if (!existingExit) {
            // Registrar lastGeofenceExitAt = now
            await AsyncStorage.setItem(KEY_LAST_EXIT_AT, now.toString());
            console.log("⏱️ [Timer] Temporizador de abandono ACTIVADO.");

            await insertAuditLog(session.id!, 'GEOFENCE_EXIT', `Salida detectada. Temporizador activado.`);
            
            // Enviar notificación con acciones
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "⚠️ Saliste del área",
                body: "¿Terminaste tu jornada o vas a otro sitio?",
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
    console.error('[GEO] Error en lógica de geocerca:', err);
  }
});

export const LocationService = {
  requestPermissions: async () => {
    const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
    if (fgStatus !== 'granted') return false;
    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
    return bgStatus === 'granted';
  },

  startMonitoringArrival: async (lat: number, lng: number, radius: number = 200) => {
    try {
      if (!lat || !lng) throw new Error('Coordenadas inválidas para la geocerca');

      const isRegistered = await TaskManager.isTaskRegisteredAsync(GEOFENCE_TASK);
      if (isRegistered) {
        console.log('[GEO] Deteniendo tarea previa...');
        try { await Location.stopGeofencingAsync(GEOFENCE_TASK); } catch (e) {}
        // Allow Android time to clear the previous region from SharedPreferences.
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      await AsyncStorage.removeItem(KEY_LAST_EXIT_AT);
      
      await Location.startGeofencingAsync(GEOFENCE_TASK, [{
        identifier: 'WORK_ZONE', latitude: lat, longitude: lng, radius: radius,
        notifyOnEnter: true, notifyOnExit: true,
      }]);
      return true;
    } catch (e) { return false; }
  },

  stopMonitoring: async () => {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(GEOFENCE_TASK);
      if (isRegistered) await Location.stopGeofencingAsync(GEOFENCE_TASK);
      await AsyncStorage.removeItem(KEY_LAST_EXIT_AT);
    } catch (e) {
      console.error('[GEO] Error al detener monitorización:', e);
    }
  },

  // Helpers para la lógica de "Usuario Responde"
  resolveAbandonmentTimer: async () => {
    const now = Date.now();
    await AsyncStorage.setItem(KEY_LAST_DECISION_AT, now.toString());
    await AsyncStorage.removeItem(KEY_LAST_EXIT_AT);
  }
};

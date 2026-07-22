import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDB, insertAuditLog } from '../database/db';
import { WorkSession } from '../types';

const GEOFENCE_TASK = 'GEOFENCE_TRACKING_TASK';

// 🟦 VARIABLES DE ESTADO (Según lógica de tu amiga)
const KEY_LAST_EXIT_AT = 'lastGeofenceExitAt';
const KEY_LAST_DECISION_AT = 'lastUserDecisionAt';

TaskManager.defineTask(GEOFENCE_TASK, async ({ data, error }: any) => {
  if (error) return;

  const { eventType } = data;
  const db = getDB();

  try {
    const session = await db.getFirstAsync<WorkSession>(
      "SELECT * FROM work_sessions ORDER BY id DESC LIMIT 1"
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
    console.error("Error en geocerca:", err);
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
      const isRegistered = await TaskManager.isTaskRegisteredAsync(GEOFENCE_TASK);
      if (isRegistered) {
        try { await Location.stopGeofencingAsync(GEOFENCE_TASK); } catch (e) {}
      }
      await AsyncStorage.removeItem(KEY_LAST_EXIT_AT); // Reiniciar estado
      
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
      await AsyncStorage.removeItem(KEY_LAST_EXIT_AT); // 4.1 Resolver temporizador
    } catch (e) {}
  },

  // Helpers para la lógica de "Usuario Responde"
  resolveAbandonmentTimer: async () => {
    const now = Date.now();
    await AsyncStorage.setItem(KEY_LAST_DECISION_AT, now.toString());
    await AsyncStorage.removeItem(KEY_LAST_EXIT_AT);
  }
};

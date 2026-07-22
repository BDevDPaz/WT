import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { insertAuditLog, getDB, initDatabase, updateSessionEndTime } from '../database/db';

export default async function GeofenceEventTask(data: any) {
  try {
    const transition = data.transition;

    // Aseguramos la DB en headless
    let db = getDB();
    if (!db) {
      await initDatabase();
      db = getDB();
    }

    const session = await db.getFirstAsync(
      "SELECT * FROM work_sessions ORDER BY id DESC LIMIT 1"
    );

    if (!session) return;

    // ================
    // ENTRADA (1)
    // ================
    if (transition === 1) {
      console.log("📍 [Headless] Entrada al sitio detectada");

      if (session.status === 'pending_arrival' || session.status === 'travel') {
        const now = Date.now();

        await db.runAsync(
          "UPDATE work_sessions SET status = 'active', actual_start_time = ? WHERE id = ?",
          [now, session.id]
        );

        await insertAuditLog(session.id, 'GEOFENCE_ENTRY', "Check-in automático (Headless)");

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Llegaste al sitio",
            body: "Check-in automático realizado.",
            sound: true
          },
          trigger: null,
        });
      }
    }

    // ================
    // SALIDA (2)
    // ================
    if (transition === 2) {
      console.log("📍 [Headless] Salida detectada");

      if (session.status === 'active') {
        const now = Date.now();

        // Marcar timestamp para failsafe
        await AsyncStorage.setItem("LAST_GEOFENCE_EXIT_TIMESTAMP", now.toString());

        await insertAuditLog(session.id, 'GEOFENCE_EXIT', "Salida detectada (Headless)");

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Saliste del sitio",
            body: "¿Terminar jornada o ir a otro destino?",
            data: { action: "CHECKOUT_DECISION" },
            sound: true
          },
          trigger: null,
        });
      }
    }
  } catch (err) {
    console.log("❌ Error en HeadlessTask:", err);
  }
}

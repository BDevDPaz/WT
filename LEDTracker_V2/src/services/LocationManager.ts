// src/services/LocationManager.ts
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { getDB, updateSessionEndTime, getSettings } from '../database/db';
import { WorkSession } from '../types';
import { getDistanceFromLatLonInMeters } from '../utils/geoUtils';
import { translations } from '../utils/i18n';

const LOCATION_TRACKING_TASK_NAME = 'WORK_LOCATION_TRACKING_TASK';

// TAREA DE FONDO (Se ejecuta aunque la app esté cerrada)
TaskManager.defineTask(LOCATION_TRACKING_TASK_NAME, async ({ data, error }: any) => {
  if (error || !data) return;
  const { locations } = data;
  if (!locations || !locations.length) return;

  try {
    const db = getDB();
    const location = locations[0];
    
    // 1. Obtener sesión activa
    const session = await db.getFirstAsync<WorkSession>(
      "SELECT * FROM work_sessions WHERE status = 'active' ORDER BY id DESC LIMIT 1"
    );

    if (!session) {
      // Si no hay sesión, APAGAR GPS para ahorrar batería
      await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK_NAME);
      return;
    }

    // 2. Obtener tolerancia desde la Configuración (Admin)
    const settings = await getSettings();
    const tolerance = settings?.tolerance_radius || 50;

    // 3. Calcular distancia
    const dist = getDistanceFromLatLonInMeters(
      session.latitude, session.longitude,
      location.coords.latitude, location.coords.longitude
    );

    // 4. AUTO-CHECKOUT si sale del rango
    if (dist > tolerance) {
      console.log(`📍 Salida detectada: ${dist.toFixed(0)}m > ${tolerance}m`);
      
      await updateSessionEndTime(session.id!, Date.now());
      
      // Notificar al usuario
      const lang = settings?.language || 'es';
      const t = translations[lang];
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: t.header_title || 'WorkTracker',
          body: `${t.log_auto_exit || 'Auto-Checkout'}: ${dist.toFixed(0)}m`,
        },
        trigger: null,
      });

      // Detener tracking
      await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK_NAME);
    }
  } catch (err) {
    console.error("❌ Background Task Error:", err);
  }
});

export const LocationService = {
  requestPermissions: async () => {
    const fg = await Location.requestForegroundPermissionsAsync();
    if (fg.status !== 'granted') return false;
    
    const bg = await Location.requestBackgroundPermissionsAsync();
    return bg.status === 'granted';
  },

  startActiveTracking: async () => {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TRACKING_TASK_NAME);
    if (hasStarted) return;

    await Location.startLocationUpdatesAsync(LOCATION_TRACKING_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 20, // Revisar cada 20 metros
      deferredUpdatesInterval: 60000, // O cada 1 minuto (ahorro batería)
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: "WorkTracker Activo",
        notificationBody: "Monitoreando ubicación de trabajo..."
      }
    });
  },

  stopMonitoring: async () => {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TRACKING_TASK_NAME);
    if (hasStarted) {
      await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK_NAME);
    }
  }
};

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { getDB } from '../database/db';

const LOCATION_TASK_NAME = 'background-location-task';

// --- DEFINICIÓN DE LA TAREA EN SEGUNDO PLANO ---
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("Location Task Error:", error);
    return;
  }

  if (data) {
    const { locations } = data;
    const currentLocation = locations[0]; // La ubicación más reciente
    
    if (!currentLocation) return;

    try {
      const db = getDB();
      
      // 1. Buscar sesión ACTIVA
      const session = await db.getFirstAsync(
        "SELECT * FROM work_sessions WHERE status = 'active' ORDER BY id DESC LIMIT 1"
      );

      // Si no hay sesión activa, DETENER rastreo para ahorrar batería
      if (!session) {
        console.log("No active session. Stopping GPS.");
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        return;
      }

      // 2. Guardar Punto de Inicio (Si aún no tiene coordenadas)
      // Esto pasa cuando inicias el trabajo solo escribiendo la dirección.
      // El primer ping de GPS fija tu "Geofence Center".
      if (!session.latitude || !session.longitude) {
        await db.runAsync(
          "UPDATE work_sessions SET latitude = ?, longitude = ? WHERE id = ?",
          [currentLocation.coords.latitude, currentLocation.coords.longitude, session.id]
        );
        console.log("📍 Punto de inicio fijado GPS:", currentLocation.coords.latitude, currentLocation.coords.longitude);
        return;
      }

      // 3. CALCULAR DISTANCIA (Geofencing Logic)
      const distanceMeters = getDistanceFromLatLonInMeters(
        session.latitude,
        session.longitude,
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );

      console.log(`📡 Distancia del trabajo: ${distanceMeters.toFixed(0)} metros`);

      // 4. AUTO-STOP (> 3200 metros / 2 millas)
      const GEOFENCE_LIMIT = 3200; 

      if (distanceMeters > GEOFENCE_LIMIT) {
        console.log("🚗 Fuera de rango. Ejecutando Auto-Checkout...");
        
        const endTime = Date.now();
        
        // CERRAR SESIÓN EN DB
        await db.runAsync(
          "UPDATE work_sessions SET status = 'completed', end_time = ? WHERE id = ?",
          [endTime, session.id]
        );

        // NOTIFICAR AL USUARIO
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "WorkTracker: Auto-Checkout",
            body: "Te has alejado del sitio de trabajo. Sesión cerrada automáticamente.",
            sound: true
          },
          trigger: null,
        });

        // DETENER GPS
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }

    } catch (err) {
      console.error("Error en Background Task:", err);
    }
  }
});

// --- FUNCIONES PÚBLICAS ---

// Iniciar rastreo (Llamar al dar click en "Iniciar Jornada")
export const startLocationTracking = async () => {
  try {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      console.log("Permiso GPS Foreground denegado");
      return;
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      console.log("Permiso GPS Background denegado");
      return;
    }

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 60000, // Chequear cada 1 minuto
      distanceInterval: 100, // O cada 100 metros
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: "WorkTracker Activo",
        notificationBody: "Rastreando ubicación para Auto-Stop...",
      },
    });
    console.log("✅ Rastreo iniciado");

  } catch (e) {
    console.error("Error iniciando tracking:", e);
  }
};

// Detener rastreo manual (Llamar al dar click en "Marcar Salida")
export const stopLocationTracking = async () => {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log("🛑 Rastreo detenido manualmente");
    }
  } catch (e) {
    console.error("Error deteniendo tracking:", e);
  }
};

// --- HELPER MATEMÁTICO (Fórmula Haversine) ---
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Radio de la tierra en metros
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distancia en metros
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

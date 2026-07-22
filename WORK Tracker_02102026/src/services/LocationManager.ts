import { NativeModules } from 'react-native';

const { GeofencingModule } = NativeModules;

export const LocationManager = {
  startMonitoringArrival: async (lat: number, lng: number, radius: number = 200) => {
    try {
      GeofencingModule.startGeofence(lat, lng, radius);
      console.log("📡 Geofence nativa iniciada");
      return true;
    } catch (e) {
      console.log("❌ Error iniciando geocerca nativa:", e);
      return false;
    }
  },

  stopMonitoring: async () => {
    try {
      GeofencingModule.stopGeofence();
      console.log("🛑 Geofence nativa detenida");
    } catch (e) {
      console.log("❌ Error deteniendo geocerca:", e);
    }
  }
};
 

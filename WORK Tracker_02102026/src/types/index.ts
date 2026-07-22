export type RootTabParamList = {
  index: undefined;
  history: undefined;
  settings: undefined;
  report: undefined;
};

// Configuración de la App
export interface AppSettings {
  id: number;
  employee_name: string;
  employer_name: string;
  company_email: string;
  tolerance_radius: number;
  hourly_rate: number;
  language: Language;
  start_time: string;
  overtime_multiplier: number;
}

// Estados posibles de una sesión
export type SessionStatus =
  | 'pending_arrival'
  | 'active'
  | 'travel'
  | 'completed'
  | 'deleted';

// Estructura de una Sesión de Trabajo
export interface WorkSession {
  id?: number;
  start_time: number;         // Hora de configuración o inicio
  actual_start_time?: number; // Hora real de llegada (Check-in GPS)
  end_time?: number;
  status: SessionStatus;

  // Coordenadas
  latitude: number;
  longitude: number;

  // Datos de auditoría y geocerca
  target_latitude?: number;   // Destino del trabajo
  target_longitude?: number;
  setup_latitude?: number;    // Coordenada al registrar configuración
  setup_longitude?: number;

  address: string;
  client_name?: string;       // Nombre del Cliente

  location_confirmed: number;
  is_manual_edit: number;
  manual_note?: string;

  lunch_taken: number;
  lunch_start?: number;
  lunch_end?: number;

  date_string: string;
}

// Logs de Auditoría para el Reporte
export interface AuditLog {
  id?: number;
  session_id: number;
  action_type: string;
  details: string;
  timestamp: number;
}

// ======================================================
// 🚀 NUEVO: Tipo para eventos Headless JS de Geocercas
// ======================================================

// Según Google GeofencingClient:
// 1 = Geofence.GEOFENCE_TRANSITION_ENTER
// 2 = Geofence.GEOFENCE_TRANSITION_EXIT

export interface HeadlessTaskEvent {
  transition: 1 | 2;  // 1 = entrada, 2 = salida
}
 

 

✔️ ¿Qué logras con este agregado?

Este tipo te permite:

Tipar correctamente la entrada del Headless JS Task

Usarlo en tu archivo GeofenceEvent.ts

Integrarlo con tu DB y tu lógica de geocercas nativas

Tener validación estricta de TypeScript en tu lógica de auto check‑in/out

Ejemplo de uso en tu tarea:

 
import { HeadlessTaskEvent } from '../types';

export default async function GeofenceEventTask(data: HeadlessTaskEvent) {
  if (data.transition === 1) {
    // Entrada
  } else if (data.transition === 2) {
    // Salida
  }
}

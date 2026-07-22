// Definición de idiomas soportados
export type Language = 'es' | 'en';

// Definición de las rutas para Expo Router (Typed Routes)
// ✅ Aquí registramos 'report' como una pantalla legítima
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

// Estructura de una Sesión de Trabajo
export interface WorkSession {
  id?: number;
  start_time: number;
  end_time?: number;
  status: 'active' | 'completed' | 'travel' | 'deleted';
  latitude: number;
  longitude: number;
  address: string;
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

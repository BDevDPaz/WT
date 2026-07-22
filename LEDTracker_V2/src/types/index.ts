// src/types/index.ts

// Definimos los idiomas permitidos
export type Language = 'es' | 'en';

// Definimos la estructura exacta de tu Configuración (incluyendo Zona Admin)
export interface AppSettings {
  id: number;
  employee_name: string;
  employer_name: string; // Nombre Empresa
  company_email: string; // Email para reportes
  tolerance_radius: number; // Radio en metros
  hourly_rate: number;
  language: Language;
}

// Definimos la estructura de una Sesión de Trabajo
export interface WorkSession {
  id?: number; // Opcional porque al crearla nueva aún no tiene ID
  start_time: number; // Timestamp
  end_time?: number; // Opcional (aún no ha terminado)
  status: 'active' | 'completed' | 'deleted';
  latitude: number;
  longitude: number;
  address: string;
  location_confirmed: 0 | 1; // SQLite usa 0/1 para booleanos
  is_manual_edit: 0 | 1;
  manual_note?: string;
  lunch_taken: 0 | 1;
  date_string: string; // Para agrupar por días
}

// Definimos la estructura de los Logs de Auditoría
export interface AuditLog {
  id?: number;
  session_id: number;
  action_type: string; // 'AUTO_ENTRADA', 'MANUAL_EDIT', etc.
  details: string; // Clave de traducción
  timestamp: number;
}

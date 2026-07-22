export type HoyState = 'NO_INICIADA' | 'ESPERANDO' | 'TRASLADO' | 'ACTIVA' | 'SALIDA' | 'CERRADA';
export type IntegrityType = 'VALID' | 'MANUAL' | 'AUTO' | 'CONFLICT';
export type ExporterState = 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR';
export type SettingsAccessState = 'LOCKED' | 'UNLOCKED';

export interface Session {
  id: string;
  date: string;
  destination: string;
  start: string;
  end: string;
  totalHours: number;
  totalEarnings: number;
  integrityType: IntegrityType;
  notes?: string;
  overtime?: number;
  timeline?: Array<{ id: string; timestamp: string; description: string; status: 'done' | 'current' | 'pending' }>;
  snapshotRate?: number;
}

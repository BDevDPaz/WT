import { HoyState, IntegrityType, ExporterState } from './types';
import { PALETTE } from './theme/tokens';

export const HERO_STATE_UI: Record<HoyState, {
  pill: string;
  subtext: string;
  metric: string;
  primary: string;
  secondary?: string;
}> = {
  NO_INICIADA: { pill: 'No iniciada', subtext: 'Configura tu jornada', metric: '--:-- / $0', primary: 'Iniciar jornada' },
  ESPERANDO: { pill: 'Esperando llegada', subtext: 'Esperando detección', metric: '00:00 / $0', primary: 'Ver monitoreo', secondary: 'Cancelar jornada' },
  TRASLADO: { pill: 'En traslado', subtext: 'En camino al destino', metric: 'Timer en 00:00', primary: 'Ver estado', secondary: 'Ajustar destino' },
  ACTIVA: { pill: 'Jornada activa', subtext: 'Sesión en curso', metric: 'Timer vivo / Valor $', primary: 'Cerrar jornada', secondary: 'Agregar nota' },
  SALIDA: { pill: 'Salida detectada', subtext: 'Saliste del área', metric: 'Timer pausado', primary: 'Confirmar salida', secondary: 'Seguir trabajando' },
  CERRADA: { pill: 'Jornada cerrada', subtext: 'Jornada finalizada', metric: 'Valor final estático', primary: 'Revisar sesión', secondary: 'Ver historial' },
};

export const INTEGRITY_UI: Record<IntegrityType, { label: string; color: string }> = {
  VALID: { label: 'Validada', color: PALETTE.successGreen },
  MANUAL: { label: 'Ajuste manual', color: PALETTE.secondaryText },
  AUTO: { label: 'Auto cierre', color: PALETTE.slateBlue },
  CONFLICT: { label: 'Revisar', color: PALETTE.amberWarning },
};

export const EXPORT_STATE_LABEL: Record<ExporterState, string> = {
  IDLE: 'Generar reporte',
  LOADING: 'Generando reporte PDF...',
  SUCCESS: 'Generar reporte',
  ERROR: 'Generar reporte',
};

import { Session } from '../types';

export const sessions: Session[] = [
  { id: '1', date: 'May 21', destination: 'Cliente principal', start: '08:14', end: '16:48', totalHours: 8.6, totalEarnings: 194, integrityType: 'VALID', snapshotRate: 20 },
  { id: '2', date: 'May 22', destination: 'Sucursal norte', start: '08:02', end: '17:10', totalHours: 8.9, totalEarnings: 202, integrityType: 'MANUAL', snapshotRate: 20 },
  { id: '3', date: 'May 23', destination: 'Ruta logística', start: '07:58', end: '16:40', totalHours: 8.4, totalEarnings: 188, integrityType: 'AUTO', snapshotRate: 20 },
];

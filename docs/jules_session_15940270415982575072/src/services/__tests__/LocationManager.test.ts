import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { LocationService, GEOFENCE_TASK } from '../LocationManager';
import { log } from '../../utils/logger';

jest.mock('expo-location', () => ({
  GeofencingEventType: {
    Enter: 1,
    Exit: 2,
  },
  requestForegroundPermissionsAsync: jest.fn(),
  requestBackgroundPermissionsAsync: jest.fn(),
  getForegroundPermissionsAsync: jest.fn(),
  getBackgroundPermissionsAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
  startGeofencingAsync: jest.fn(),
  stopGeofencingAsync: jest.fn(),
}));

jest.mock('expo-task-manager', () => ({
  defineTask: jest.fn(),
  isTaskRegisteredAsync: jest.fn(),
}));

jest.mock('../../utils/logger', () => ({
  log: jest.fn(),
}));

jest.mock('../../database/db', () => ({
  getDB: jest.fn(() => ({
    getFirstAsync: jest.fn(),
  })),
}));

jest.mock('../../core/workTrackerEngine', () => ({
  workTrackerEngine: {
    dispatch: jest.fn(),
  },
}));

describe('LocationManager - LocationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requestPermissions debe retornar true si ambos son concedidos', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });

    const result = await LocationService.requestPermissions();
    expect(result).toBe(true);
  });

  it('requestPermissions debe retornar false si foreground es denegado', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

    const result = await LocationService.requestPermissions();
    expect(result).toBe(false);
    expect(log).toHaveBeenCalledWith('ROJO', 'PERMISOS', 'ERROR', expect.any(String));
  });

  it('startMonitoringArrival debe validar datos de entrada', async () => {
    const result = await LocationService.startMonitoringArrival(NaN, 0);
    expect(result).toBe(false);
    expect(log).toHaveBeenCalledWith('AMARILLO', 'UBICACION', 'WARN', expect.stringContaining('skipped'), expect.any(Object));
  });

  it('startMonitoringArrival debe fallar si los servicios de ubicación están desactivados', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.hasServicesEnabledAsync as jest.Mock).mockResolvedValue(false);

    const result = await LocationService.startMonitoringArrival(10, 20);
    expect(result).toBe(false);
    expect(log).toHaveBeenCalledWith('ROJO', 'UBICACION', 'ERROR', expect.stringContaining('unavailable'));
  });
});

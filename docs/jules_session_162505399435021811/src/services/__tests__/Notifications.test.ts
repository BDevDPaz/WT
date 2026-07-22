import * as Notifications from 'expo-notifications';
import { setupNotifications, scheduleDailyReminder, notifyImmediate, cancelNotifications } from '../Notifications';
import { log } from '../../utils/logger';

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  dismissAllNotificationsAsync: jest.fn(),
  AndroidImportance: { MAX: 4 },
  SchedulableTriggerInputTypes: { DAILY: 'daily' },
}));

jest.mock('../../utils/logger', () => ({
  log: jest.fn(),
}));

jest.mock('../../database/db', () => ({
  getSettings: jest.fn(),
}));

describe('Notifications Service - Hardened', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setupNotifications', () => {
    it('debe retornar true si el permiso ya está concedido', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      const result = await setupNotifications();
      expect(result).toBe(true);
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it('debe solicitar permisos si no están concedidos y retornar true si se conceden', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      const result = await setupNotifications();
      expect(result).toBe(true);
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('debe retornar false y loguear si los permisos son denegados', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
      const result = await setupNotifications();
      expect(result).toBe(false);
      expect(log).toHaveBeenCalledWith('AMARILLO', 'ADVERTENCIA', 'WARN', expect.stringContaining('denegado'));
    });
  });

  describe('scheduleDailyReminder', () => {
    it('no debe programar si no hay permisos', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
      await scheduleDailyReminder('08:00');
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('debe validar el payload (hora)', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      await scheduleDailyReminder('invalid-time');
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
      expect(log).toHaveBeenCalledWith(expect.any(String), expect.any(String), 'WARN', expect.stringContaining('Payload inválido'));
    });

    it('debe programar si todo es válido', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      await scheduleDailyReminder('09:00');
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(expect.objectContaining({
        content: expect.objectContaining({ title: expect.any(String) }),
        trigger: expect.objectContaining({ hour: 9, minute: 0 }),
      }));
    });
  });

  describe('notifyImmediate', () => {
    it('debe validar payload vacío', async () => {
      await notifyImmediate('', '');
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
      expect(log).toHaveBeenCalledWith(expect.any(String), expect.any(String), 'WARN', expect.stringContaining('payload inválido'));
    });

    it('no debe programar sin permisos', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
      await notifyImmediate('Test', 'Body');
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('debe deduplicar notificaciones idénticas (anti-spam)', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      await notifyImmediate('Spam', 'Check');
      await notifyImmediate('Spam', 'Check');
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
      expect(log).toHaveBeenCalledWith('BLANCO', 'SIN_CAMBIOS', 'DEBUG', expect.stringContaining('duplicada omitida'));
    });
  });

  describe('cancelNotifications', () => {
    it('debe llamar a las funciones de cancelación de expo', async () => {
      await cancelNotifications();
      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
      expect(Notifications.dismissAllNotificationsAsync).toHaveBeenCalled();
    });
  });
});

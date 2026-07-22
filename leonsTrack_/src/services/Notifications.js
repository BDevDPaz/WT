import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// 1. Configuración del Handler (ACTUALIZADO PARA SDK 53)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    // Antes: shouldShowAlert: true (Deprecado)
    // Ahora: Se divide en Banner y Lista
    shouldShowBanner: true, 
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 2. Setup Inicial
export const setupNotifications = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Permiso de notificaciones denegado.');
      return;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    console.log("✅ Sistema de Notificaciones Configurado");

  } catch (e) {
    console.error("Error setupNotifications:", e);
  }
};

// 3. Rutinas Diarias
export const scheduleDailyMorningCheck = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    // 6:00 AM
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "WorkTracker ☀️",
        body: "Time to set your location!",
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        vibrate: [0, 250, 250, 250],
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 6,
        minute: 0,
        channelId: 'default',
      },
    });

    // 12:00 PM
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Lunch Time? 🍔",
        body: "Tap to log your break.",
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        vibrate: [0, 250, 250, 250],
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 12,
        minute: 0,
        channelId: 'default',
      },
    });

    console.log("📅 Alarmas diarias (6am/12pm) programadas.");

  } catch (e) {
    console.error("Error scheduling notifications:", e);
  }
};

// 4. TEST CON DELAY
export const scheduleTestNotification = async (seconds = 5) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🔔 Test de Notificación",
        body: `¡Funciona! Esta alerta esperó ${seconds} segundos.`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        vibrate: [0, 250, 250, 250],
      },
      trigger: {
        seconds: seconds, 
        channelId: 'default',
      },
    });

    console.log(`✅ Test programado en ${seconds}s.`);
  } catch (e) {
    console.error("Error test notification:", e);
  }
};

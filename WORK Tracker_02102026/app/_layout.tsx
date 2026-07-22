import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

// Imports
import '../src/services/LocationManager'; 
import { BackgroundTasks } from '../src/services/BackgroundTasks'; 
import { LanguageProvider } from '../src/context/LanguageContext';
import { LuxuryUIProvider } from '../src/context/LuxuryUIContext';
import { initDatabase } from '../src/database/db';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await initDatabase(); 
        await BackgroundTasks.register(); 
        console.log("✅ Sistema Listo.");
      } catch (e) {
        console.warn("Error crítico inicializando:", e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  // ✅ CORRECCIÓN EN MANEJO DE NOTIFICACIONES
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data || {}; 
      console.log("🔔 Notificación tocada con data:", data);

      if (data.action === 'OPEN_DAILY_SETUP') {
        // Navegamos pasando el parámetro directamente
        router.push({
          pathname: '/(tabs)',
          params: { showSetup: 'true' }
        });
      } else if (data.action === 'GENERATE_REPORT_PROMPT') {
        router.push('/(tabs)/report');
      } else if (data.action === 'CHECKOUT_DECISION') {
        router.push({
          pathname: '/(tabs)',
          params: { showCheckoutPrompt: 'true' }
        });
      }
    });

    return () => subscription.remove();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) await SplashScreen.hideAsync();
  }, [appIsReady]);

  if (!appIsReady) return null;

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <LanguageProvider>
        <LuxuryUIProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
        </LuxuryUIProvider>
      </LanguageProvider>
    </View>
  );
}

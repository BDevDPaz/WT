import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

// Imports
import '../src/services/LocationManager'; 
// Importamos la función de chequeo manual
import { BackgroundTasks, checkFailsafeLogic } from '../src/services/BackgroundTasks'; 
import { LanguageProvider } from '../src/context/LanguageContext';
import { LuxuryUIProvider } from '../src/context/LuxuryUIContext';
import { initDatabase } from '../src/database/db';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }),
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        console.log("⏳ Iniciando Sistema...");
        await initDatabase(); 
        await BackgroundTasks.register(); 
        
        // 🛑 DOBLE VERIFICACIÓN (Foreground Check)
        // Si el background fetch falló o se retrasó, esto fuerza el cierre
        // apenas el usuario abre la app.
        console.log("🔍 Verificando estado de Failsafe al inicio...");
        await checkFailsafeLogic();
        
        console.log("✅ Sistema Listo.");
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // ... (Resto del código de notificaciones igual) ...
  useEffect(() => {
      const subscription = Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data || {};
        if (data.action === 'OPEN_DAILY_SETUP') {
            router.push('/(tabs)');
            setTimeout(() => router.setParams({ showSetup: 'true' }), 100);
        } else if (data.action === 'GENERATE_REPORT_PROMPT') {
            router.push('/(tabs)/report');
        } else if (data.action === 'CHECKOUT_DECISION') {
            router.push('/(tabs)');
            setTimeout(() => router.setParams({ showCheckoutPrompt: 'true' }), 100);
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

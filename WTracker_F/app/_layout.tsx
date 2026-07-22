import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Importaciones adaptadas a la nueva arquitectura
import { ThemeProvider } from '../src/context/ThemeContext';
import { ToastProvider } from '../src/context/ToastContext';
import { LoadingOverlay } from '../src/components/ui/LoadingOverlay';
import { PALETTE } from '../src/constants/theme'; // Se mantiene solo para el color inicial estático del SafeArea

export default function RootLayout() {
  const [isRehydrating, setIsRehydrating] = useState(true);

  useEffect(() => {
    const bootTimer = setTimeout(() => {
      setIsRehydrating(false);
    }, 2500);

    return () => clearTimeout(bootTimer);
  }, []);

  return (
    // SafeAreaProvider mantiene PALETTE.obsidian por ser el punto más alto antes de los Providers
    <SafeAreaProvider style={{ flex: 1, backgroundColor: PALETTE.obsidian }}>
      {/* Inyección del Contexto Global del Tema */}
      <ThemeProvider>
        {/* El ToastProvider ahora está envuelto por ThemeProvider y puede consumir colors */}
        <ToastProvider>
          <StatusBar style="light" translucent backgroundColor="transparent" />

          <Stack
            screenOptions={{
              headerShown: false,
              // El contentStyle inicial apunta al obsidian desde la constante estática
              // ya que las propiedades screenOptions de Root Stack no pueden usar hooks de forma directa aquí.
              contentStyle: { backgroundColor: PALETTE.obsidian },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            <Stack.Screen
              name="session/[id]"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
          </Stack>

          <LoadingOverlay
            visible={isRehydrating}
            message="Restaurando la sesión..."
            isReconnecting={false}
          />
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

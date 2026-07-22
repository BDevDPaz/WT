import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ 
        headerShown: false, // Ocultamos la barra de navegación por defecto
        contentStyle: { backgroundColor: '#000' } // Fondo negro global
      }}>
        <Stack.Screen name="index" />
      </Stack>
    </View>
  );
}

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLanguage } from '../context/LanguageContext';
import { GlassModalWrapper, LuxuryButton } from './LuxuryUI';
import { COLORS } from '../constants/theme';
import { getSettings } from '../database/db';
import { getDistanceFromLatLonInMeters } from '../utils/geoUtils';

interface Props { visible: boolean; onClose: () => void; onStart: (address: string) => void; }

export function DailySetupModal({ visible, onClose, onStart }: Props) {
  const { t } = useLanguage();
  const [address, setAddress] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleStart = async () => {
    if (address.trim().length === 0) return;
    
    setIsValidating(true);
    try {
      // 1. Obtener ajustes y ubicación actual
      const settings = await getSettings();
      const tolerance = settings?.tolerance_radius || 150;
      const userLoc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });

      // 2. Intentar geocodificar la dirección ingresada
      const geocoded = await Location.geocodeAsync(address);
      
      if (geocoded && geocoded.length > 0) {
        const target = geocoded[0];
        const dist = getDistanceFromLatLonInMeters(
          userLoc.coords.latitude, userLoc.coords.longitude,
          target.latitude, target.longitude
        );

        // 3. Validar distancia (Punto 3 de tu lista)
        if (dist > tolerance) {
          Alert.alert(
            "📍 " + (t.alert_exit_title || "Ubicación Lejana"),
            `Estás a ${Math.round(dist)}m de "${address}".\n\nEl límite permitido es de ${tolerance}m. ¿Deseas iniciar de todos modos?`,
            [
              { text: "Corregir", style: "cancel", onPress: () => setIsValidating(false) },
              { 
                text: "Sí, iniciar", 
                style: "destructive", 
                onPress: () => { onStart(address); setAddress(''); setIsValidating(false); } 
              }
            ]
          );
          return;
        }
      }
      
      // Si todo está bien, iniciar
      onStart(address);
      setAddress('');
    } catch (error) {
      console.log("Error de validación GPS:", error);
      // Si el geocoding falla, permitimos iniciar por si es una dirección nueva no mapeada
      onStart(address);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <GlassModalWrapper visible={visible}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.daily_title || "Configuración Diaria"}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} disabled={isValidating}>
          <Ionicons name="close" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.label}>{t.daily_label || "¿Dónde trabajarás hoy?"}</Text>
      
      <View style={styles.inputContainer}>
        <Ionicons name="map-outline" size={20} color={COLORS.gold} style={{marginRight: 10}}/>
        <TextInput
          style={styles.input}
          placeholder={t.daily_placeholder || "Ej: 5601 Balboa Blvd..."}
          placeholderTextColor="#444"
          value={address}
          onChangeText={setAddress}
          editable={!isValidating}
        />
      </View>

      <LuxuryButton 
        text={isValidating ? "VERIFICANDO GPS..." : (t.daily_btn_start || "INICIAR JORNADA")} 
        onPress={handleStart} 
        disabled={isValidating}
      />
    </GlassModalWrapper>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontFamily: 'Montserrat_700Bold', color: '#FFF', fontSize: 18, letterSpacing: 1 },
  closeBtn: { padding: 5 },
  label: { fontFamily: 'Montserrat_600SemiBold', color: COLORS.textSecondary, marginBottom: 12, fontSize: 12, letterSpacing: 1 },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#000', 
    borderWidth: 1, 
    borderColor: '#333', 
    borderRadius: 12, 
    paddingHorizontal: 15, 
    marginBottom: 25 
  },
  input: { flex: 1, color: '#FFF', paddingVertical: 15, fontFamily: 'Montserrat_400Regular' }
});

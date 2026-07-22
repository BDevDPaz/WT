import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { COLORS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

type ToastType = 'success' | 'error' | 'info';

interface LuxuryContextProps {
  showToast: (msg: string, type?: ToastType) => void;
  // ✅ NUEVOS CONTROLES GLOBALES PARA EL REPORTE
  isWeeklyReportVisible: boolean;
  openWeeklyReport: () => void;
  closeWeeklyReport: () => void;
}

const LuxuryUIContext = createContext<LuxuryContextProps | undefined>(undefined);

export const LuxuryUIProvider = ({ children }: { children: ReactNode }) => {
  // Estado para los mensajes flotantes (Toasts)
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);
  
  // ✅ Estado Global del Modal de Reporte (La fuente de la verdad)
  const [isWeeklyReportVisible, setIsWeeklyReportVisible] = useState(false);

  const showToast = (msg: string, type: ToastType = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Funciones infalibles para abrir/cerrar
  const openWeeklyReport = () => setIsWeeklyReportVisible(true);
  const closeWeeklyReport = () => setIsWeeklyReportVisible(false);

  return (
    <LuxuryUIContext.Provider value={{ 
      showToast, 
      isWeeklyReportVisible, 
      openWeeklyReport, 
      closeWeeklyReport 
    }}>
      {children}
      
      {/* Componente Toast Renderizado Globalmente */}
      {toast && (
        <Animated.View 
          entering={FadeInUp} 
          exiting={FadeOutUp} 
          style={[styles.toast, styles[toast.type]]}
        >
          <Ionicons 
            name={toast.type === 'success' ? 'checkmark-circle' : toast.type === 'error' ? 'alert-circle' : 'information-circle'} 
            size={24} 
            color="#FFF" 
            style={{ marginRight: 10 }}
          />
          <Text style={styles.toastText}>{toast.msg}</Text>
        </Animated.View>
      )}
    </LuxuryUIContext.Provider>
  );
};

export const useLuxuryUI = () => {
  const context = useContext(LuxuryUIContext);
  if (!context) throw new Error('useLuxuryUI must be used within a LuxuryUIProvider');
  return context;
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    zIndex: 9999, // Siempre encima de todo
  },
  success: { backgroundColor: COLORS.success || '#4CAF50' },
  error: { backgroundColor: COLORS.danger || '#F44336' },
  info: { backgroundColor: COLORS.surface || '#333' },
  toastText: {
    color: '#FFF',
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14,
    flex: 1,
  }
});

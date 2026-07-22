import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { COLORS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

type ToastType = 'success' | 'error' | 'info';

interface DialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
}

interface LuxuryContextProps {
  showToast: (msg: string, type?: ToastType) => void;
  showDialog: (options: DialogOptions) => void;
  isWeeklyReportVisible: boolean;
  openWeeklyReport: () => void;
  closeWeeklyReport: () => void;
}

const LuxuryUIContext = createContext<LuxuryContextProps | undefined>(undefined);

export const LuxuryUIProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);
  const [isWeeklyReportVisible, setIsWeeklyReportVisible] = useState(false);

  const showToast = (msg: string, type: ToastType = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const showDialog = ({ title, message, confirmText, isDestructive, onConfirm }: DialogOptions) => {
    Alert.alert(title, message, [
      { text: "CANCELAR", style: "cancel" },
      { 
        text: confirmText || "OK", 
        style: isDestructive ? "destructive" : "default", 
        onPress: onConfirm 
      }
    ]);
  };

  const openWeeklyReport = () => setIsWeeklyReportVisible(true);
  const closeWeeklyReport = () => setIsWeeklyReportVisible(false);

  return (
    <LuxuryUIContext.Provider value={{ 
      showToast, showDialog, isWeeklyReportVisible, openWeeklyReport, closeWeeklyReport 
    }}>
      {children}
      {toast && (
        <Animated.View entering={FadeInUp} exiting={FadeOutUp} style={[styles.toast, styles[toast.type]]}>
          <Ionicons 
            name={toast.type === 'success' ? 'checkmark-circle' : toast.type === 'error' ? 'alert-circle' : 'information-circle'} 
            size={24} color="#FFF" style={{ marginRight: 10 }}
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
  toast: { position: 'absolute', top: 60, left: 20, right: 20, padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', elevation: 8, zIndex: 9999 },
  success: { backgroundColor: COLORS.success },
  error: { backgroundColor: COLORS.danger },
  info: { backgroundColor: COLORS.surface },
  toastText: { color: '#FFF', fontFamily: 'Montserrat_600SemiBold', fontSize: 14, flex: 1 },
});

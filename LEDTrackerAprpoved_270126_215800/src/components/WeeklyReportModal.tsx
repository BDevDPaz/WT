import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassModalWrapper, LuxuryButton } from './LuxuryUI';
import { COLORS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';

interface Props { 
  visible: boolean; 
  onClose: () => void; 
  onDownload: () => void; 
  onEmail: () => void; 
}

export function WeeklyReportModal({ visible, onClose, onDownload, onEmail }: Props) {
  const { t } = useLanguage();

  return (
    <GlassModalWrapper visible={visible}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>REPORTE SEMANAL</Text>
          <Text style={styles.subtitle}>Gestión de Nómina y Auditoría</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* VISTA PREVIA SIMULADA (Estética Premium) */}
      <View style={styles.previewBox}>
        <View style={styles.documentShadow}>
          <Ionicons name="document-text" size={50} color={COLORS.gold} />
          <View style={styles.line} />
          <View style={[styles.line, { width: '60%' }]} />
        </View>
        <Text style={styles.previewStatus}>PDF LISTO PARA GENERAR</Text>
      </View>

      <View style={styles.actions}>
        <LuxuryButton 
          text="DESCARGAR PDF" 
          variant="primary"
          icon={<Ionicons name="download-outline" size={20} color="#000" />}
          onPress={onDownload} 
        />
        
        <View style={{ height: 12 }} />

        <LuxuryButton 
          text="ENVIAR A ALEX LEÓN" 
          variant="success"
          icon={<Ionicons name="mail-outline" size={20} color="#FFF" />}
          onPress={onEmail} 
        />
      </View>

      <Text style={styles.footerNote}>
        * El reporte incluye logs de auditoría y verificación GPS.
      </Text>
    </GlassModalWrapper>
  );
}

const styles = StyleSheet.create({
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 25 
  },
  title: { 
    fontFamily: 'Montserrat_700Bold', 
    color: COLORS.gold, 
    fontSize: 18, 
    letterSpacing: 1 
  },
  subtitle: { 
    fontFamily: 'Montserrat_400Regular', 
    color: COLORS.textSecondary, 
    fontSize: 10, 
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 4
  },
  closeBtn: { padding: 4 },
  previewBox: {
    height: 180,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    overflow: 'hidden'
  },
  documentShadow: {
    alignItems: 'center',
    opacity: 0.8
  },
  line: {
    height: 2,
    width: 40,
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    marginTop: 8,
    borderRadius: 1
  },
  previewStatus: {
    fontFamily: 'Montserrat_700Bold',
    color: '#444',
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 20
  },
  actions: { width: '100%' },
  footerNote: {
    fontFamily: 'Montserrat_400Regular',
    color: '#555',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic'
  }
});

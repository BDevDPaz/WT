import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

// Importaciones adaptadas a la nueva arquitectura
import { useTheme } from '../../src/context/ThemeContext';
import { getSpringConfig } from '../../src/constants/animations';
import { SPACING, RADIUS, FONT } from '../../src/constants/theme';
import { ScreenContainer } from '../../src/components/ui/ScreenContainer';
import { DocumentPreviewWidget } from '../../src/components/ui/DocumentPreviewWidget';
import { Button } from '../../src/components/ui/Button';
import { useToast } from '../../src/context/ToastContext';

export default function ReportScreen() {
  const { showToast } = useToast();
  
  // Consumo dinámico del tema y de las físicas
  const { colors } = useTheme();
  const springConfig = getSpringConfig();

  const [isExporting, setIsExporting] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [forceMemoryError, setForceMemoryError] = useState(false);

  const toggleErrorSimulator = () => {
    const newState = !forceMemoryError;
    setForceMemoryError(newState);

    if (newState) {
      showToast('Modo prueba: error de memoria activado', 'info');
      setHasGenerated(false);
    } else {
      showToast('Modo prueba desactivado', 'success');
    }
  };

  const handleGenerateReport = () => {
    setIsExporting(true);

    setTimeout(() => {
      setIsExporting(false);

      if (forceMemoryError) {
        showToast('No fue posible generar el documento', 'error');
        setHasGenerated(false);
      } else {
        showToast('Reporte generado correctamente', 'success');
        setHasGenerated(true);
      }
    }, 1500);
  };

  return (
    <ScreenContainer noPadding>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <View style={styles.headerRow}>
            <Ionicons name="document-text-outline" size={22} color={colors.textPrimary} />
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Reportes</Text>

            <Pressable onPress={toggleErrorSimulator}>
              <Text 
                style={[
                  styles.simulatorText, 
                  { color: colors.mutedGold },
                  forceMemoryError && { color: colors.deepRed }
                ]}
              >
                {forceMemoryError ? 'Simular fallo' : 'Simular correcto'}
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Resumen semanal
          </Text>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(100)
            .springify()
            .damping(springConfig.damping)
            .stiffness(springConfig.stiffness)} 
          style={[styles.periodSelector, { backgroundColor: colors.graphite }]}
        >
          <Pressable style={styles.arrowButton}>
            <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          </Pressable>

          <View style={styles.periodCenter}>
            <Text style={[styles.periodLabel, { color: colors.textPrimary }]}>Semana actual</Text>
            <Text style={[styles.periodDates, { color: colors.textSecondary }]}>Jun 01 - Jun 07</Text>
          </View>

          <Pressable style={styles.arrowButton}>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(200)
            .springify()
            .damping(springConfig.damping)
            .stiffness(springConfig.stiffness)} 
          style={[styles.summaryCard, { backgroundColor: colors.carbonMist }]}
        >
          <Text style={[styles.summaryTopLabel, { color: colors.textSecondary }]}>Total semanal</Text>
          <Text style={[styles.summaryMassiveMetric, { color: colors.mutedGold }]}>$256.00</Text>

          <View style={styles.summarySubMetricsRow}>
            <Text style={[styles.summarySubMetricText, { color: colors.textPrimary }]}>
              12.8 h • 4 jornadas
            </Text>
            <Text style={[styles.summaryTrailingMetric, { color: colors.textSecondary }]}>
              Horas extra: $0.00
            </Text>
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(300)
            .springify()
            .damping(springConfig.damping)
            .stiffness(springConfig.stiffness)} 
          style={styles.widgetWrapper}
        >
          <DocumentPreviewWidget
            employeeName="Alex León"
            dateRange="Jun 01, 2026 - Jun 07, 2026"
            totalHours="12.8 h"
            totalEarnings="$256.00"
          />
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(400)
            .springify()
            .damping(springConfig.damping)
            .stiffness(springConfig.stiffness)} 
          style={[styles.breakdownGrid, { backgroundColor: colors.graphite }]}
        >
          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownKey, { color: colors.textSecondary }]}>Horas normales</Text>
            <Text style={[styles.breakdownValue, { color: colors.textPrimary }]}>12.8 h</Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownKey, { color: colors.textSecondary }]}>Horas extra</Text>
            <Text style={[styles.breakdownValue, { color: colors.textPrimary }]}>0.0 h</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.steelLine }]} />

          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownKey, { color: colors.textSecondary }]}>Tarifa base</Text>
            <Text style={[styles.breakdownValue, { color: colors.textPrimary }]}>$20.00/h</Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownKey, { color: colors.textSecondary }]}>Multiplicador extra</Text>
            <Text style={[styles.breakdownValue, { color: colors.textPrimary }]}>1.5x</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.steelLine }]} />

          <View style={styles.breakdownTotalRow}>
            <Text style={[styles.breakdownTotalKey, { color: colors.textPrimary }]}>Total neto</Text>
            <Text style={[styles.breakdownTotalValue, { color: colors.mutedGold }]}>$256.00</Text>
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(500)
            .springify()
            .damping(springConfig.damping)
            .stiffness(springConfig.stiffness)} 
          style={styles.actionStack}
        >
          <Button
            label={isExporting ? 'Generando documento...' : (hasGenerated ? 'Generar nuevamente' : 'Generar reporte')}
            variant="primary"
            onPress={handleGenerateReport}
            isLoading={isExporting}
          />

          <Button
            label="Compartir"
            variant="secondary"
            onPress={() => showToast('Abriendo opciones del sistema...', 'info')}
            disabled={isExporting || !hasGenerated}
          />

          <Button
            label="Enviar por correo"
            variant="secondary"
            onPress={() => showToast('Abriendo cliente de correo...', 'info')}
            disabled={isExporting || !hasGenerated}
          />

          <Button
            label="Vista previa"
            variant="ghost"
            onPress={() => showToast('Abriendo vista previa...', 'info')}
            disabled={isExporting || !hasGenerated}
          />
        </Animated.View>

        <Animated.Text 
          entering={FadeInDown.delay(600).duration(400)} 
          style={[styles.trustNote, { color: colors.textSecondary }]}
        >
          Incluye horas, jornadas detalladas y eventos registrados.
        </Animated.Text>

      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 40 },

  header: {
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    // Color movido al componente
  },

  simulatorText: {
    ...FONT.label,
    // Color movido al componente
  },

  headerSubtitle: {
    fontSize: 12,
    marginTop: 4,
    // Color movido al componente
  },

  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: 20,
    marginBottom: SPACING.lg,
    // BackgroundColor movido al componente
  },

  arrowButton: {
    padding: SPACING.xs,
  },

  periodCenter: {
    alignItems: 'center',
  },

  periodLabel: {
    ...FONT.bodyStrong,
    // Color movido al componente
  },

  periodDates: {
    ...FONT.caption,
    marginTop: 2,
    // Color movido al componente
  },

  summaryCard: {
    marginHorizontal: SPACING.xl,
    padding: 20,
    borderRadius: RADIUS.cards,
    marginBottom: SPACING.lg,
    // BackgroundColor movido al componente
  },

  summaryTopLabel: {
    ...FONT.label,
    marginBottom: SPACING.xs,
    // Color movido al componente
  },

  summaryMassiveMetric: {
    fontSize: 40,
    fontWeight: '700',
    marginBottom: SPACING.sm,
    // Color movido al componente
  },

  summarySubMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  summarySubMetricText: {
    fontSize: 15,
    // Color movido al componente
  },

  summaryTrailingMetric: {
    fontSize: 13,
    // Color movido al componente
  },

  widgetWrapper: {
    marginBottom: SPACING.lg,
  },

  breakdownGrid: {
    marginHorizontal: SPACING.xl,
    padding: 18,
    borderRadius: RADIUS.cards,
    marginBottom: SPACING.xl,
    // BackgroundColor movido al componente
  },

  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },

  breakdownKey: {
    ...FONT.body,
    // Color movido al componente
  },

  breakdownValue: {
    ...FONT.bodyStrong,
    // Color movido al componente
  },

  divider: {
    height: 1,
    marginVertical: SPACING.md,
    // BackgroundColor movido al componente
  },

  breakdownTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  breakdownTotalKey: {
    ...FONT.bodyStrong,
    // Color movido al componente
  },

  breakdownTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    // Color movido al componente
  },

  actionStack: {
    marginHorizontal: SPACING.xl,
    gap: 12,
    marginBottom: SPACING.xl,
  },

  trustNote: {
    ...FONT.caption,
    textAlign: 'center',
    marginHorizontal: SPACING.xxl,
    fontStyle: 'italic',
    // Color movido al componente
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown, SlideInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Importaciones adaptadas a la nueva arquitectura
import { useTheme } from '../../src/context/ThemeContext';
import { getSpringConfig } from '../../src/constants/animations';
import { RADIUS, SPACING, FONT } from '../../src/constants/theme';
import { ScreenContainer } from '../../src/components/ui/ScreenContainer';
import { useToast } from '../../src/context/ToastContext';
import { IntegrityBadge } from '../../src/components/ui/IntegrityBadge';
import { Button } from '../../src/components/ui/Button';
import { EditSessionModal } from '../../src/components/modals/EditSessionModal';
import { DeleteSessionModal } from '../../src/components/modals/DeleteSessionModal';

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { showToast } = useToast();

  // Consumo dinámico del tema y de las físicas
  const { colors } = useTheme();
  const springConfig = getSpringConfig();

  const [isEditVisible, setIsEditVisible] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);

  const sessionId = String(id ?? '');

  const handleBack = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const handleSaveEdit = () => {
    setIsEditVisible(false);
    showToast('Jornada actualizada', 'success');
  };

  const handleConfirmDelete = () => {
    setIsDeleteVisible(false);
    showToast('Jornada eliminada', 'error');

    setTimeout(() => {
      router.back();
    }, 500);
  };

  return (
    <ScreenContainer noPadding>
      
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="close" size={28} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Ionicons name="document-text-outline" size={18} color={colors.textPrimary} />
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Detalle de jornada
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        <Animated.View
          entering={FadeInDown.delay(100)
            .springify()
            .damping(springConfig.damping)
            .stiffness(springConfig.stiffness)}
          style={[
            styles.heroBlock,
            { backgroundColor: colors.carbonMist, borderColor: colors.steelLine },
          ]}
        >
          <View style={styles.heroTopRow}>
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>04 jun 2026</Text>
            <IntegrityBadge type="valid" />
          </View>

          <View style={styles.destinationRow}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.destinationText, { color: colors.textPrimary }]}>
              Taller central - Revisión
            </Text>
          </View>

          <Text style={[styles.idText, { color: colors.textMuted }]}>ID: TRK-{sessionId}-88A</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200)
            .springify()
            .damping(springConfig.damping)
            .stiffness(springConfig.stiffness)}
          style={styles.metricsGrid}
        >
          <View 
            style={[
              styles.metricCard, 
              { backgroundColor: colors.graphite, borderColor: colors.steelLine }
            ]}
          >
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Horas totales</Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>8.2 h</Text>
          </View>

          <View 
            style={[
              styles.metricCard, 
              styles.highlightMetricCard,
              { borderColor: colors.mutedGold }
            ]}
          >
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Ganancias estimadas</Text>
            <Text style={[styles.metricValue, { color: colors.mutedGold }]}>
              $164.00
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300)
            .springify()
            .damping(springConfig.damping)
            .stiffness(springConfig.stiffness)}
          style={[
            styles.timelineBlock,
            { backgroundColor: colors.carbonMist, borderColor: colors.steelLine }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Eventos de la jornada</Text>

          <View style={styles.timelineNode}>
            <View style={[styles.nodeDot, { backgroundColor: colors.mutedGold }]} />
            <View style={[styles.nodeLine, { backgroundColor: colors.steelLine }]} />
            <View style={styles.nodeContent}>
              <Text style={[styles.nodeTitle, { color: colors.textPrimary }]}>Inicio de jornada</Text>
              <Text style={[styles.nodeTime, { color: colors.textSecondary }]}>08:14 AM • GPS confirmado</Text>
            </View>
          </View>

          <View style={styles.timelineNode}>
            <View style={[styles.nodeDot, { backgroundColor: colors.successGreen }]} />
            <View style={[styles.nodeLine, { backgroundColor: colors.steelLine }]} />
            <View style={styles.nodeContent}>
              <Text style={[styles.nodeTitle, { color: colors.textPrimary }]}>Llegada al destino</Text>
              <Text style={[styles.nodeTime, { color: colors.textSecondary }]}>08:45 AM • Geolocalización automática</Text>
            </View>
          </View>

          <View style={styles.timelineNode}>
            <View 
              style={[
                styles.nodeDot, 
                { backgroundColor: colors.carbonMist, borderColor: colors.steelLine, borderWidth: 1 }
              ]} 
            />
            <View style={styles.nodeContent}>
              <Text style={[styles.nodeTitle, { color: colors.textPrimary }]}>Fin de jornada</Text>
              <Text style={[styles.nodeTime, { color: colors.textSecondary }]}>04:30 PM • Cierre manual</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Animated.View
        entering={SlideInDown.delay(400)
          .springify()
          .damping(springConfig.damping)
          .stiffness(springConfig.stiffness)}
        style={[
          styles.actionFooter,
          { backgroundColor: colors.obsidian, borderTopColor: colors.steelLine }
        ]}
      >
        <Button
          label="Editar jornada"
          variant="secondary"
          onPress={() => setIsEditVisible(true)}
          style={{ flex: 1 }}
        />

        <Button
          label="Eliminar"
          variant="danger"
          onPress={() => setIsDeleteVisible(true)}
          style={{ width: 110 }}
        />
      </Animated.View>

      <EditSessionModal
        visible={isEditVisible}
        onCancel={() => setIsEditVisible(false)}
        onSave={handleSaveEdit}
      />

      <DeleteSessionModal
        visible={isDeleteVisible}
        onCancel={() => setIsDeleteVisible(false)}
        onConfirm={handleConfirmDelete}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },

  backButton: {
    padding: 4,
    marginLeft: -4,
  },

  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  headerTitle: {
    ...FONT.h3,
    fontSize: 18,
    // Color aplicado dinámicamente en el JSX
  },

  headerSpacer: {
    width: 28,
  },

  scrollContent: {
    paddingHorizontal: SPACING.xl,
  },

  heroBlock: {
    borderRadius: RADIUS.cards,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    // BackgroundColor y borderColor aplicados dinámicamente
  },

  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },

  dateText: {
    ...FONT.bodyStrong,
    // Color aplicado dinámicamente en el JSX
  },

  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.xs,
  },

  destinationText: {
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
    // Color aplicado dinámicamente en el JSX
  },

  idText: {
    ...FONT.caption,
    // Color aplicado dinámicamente en el JSX
  },

  metricsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },

  metricCard: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: RADIUS.cards,
    borderWidth: 1,
    // BackgroundColor y borderColor aplicados dinámicamente
  },

  highlightMetricCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)', // Translúcido de acento estático
    // BorderColor aplicado dinámicamente
  },

  metricLabel: {
    ...FONT.caption,
    marginBottom: SPACING.xs,
    // Color aplicado dinámicamente
  },

  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    // Color aplicado dinámicamente
  },

  timelineBlock: {
    borderRadius: RADIUS.cards,
    padding: SPACING.xl,
    borderWidth: 1,
    // BackgroundColor y borderColor aplicados dinámicamente
  },

  sectionTitle: {
    ...FONT.h3,
    fontSize: 16,
    marginBottom: SPACING.xl,
    // Color aplicado dinámicamente
  },

  timelineNode: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    position: 'relative',
  },

  nodeContent: {
    flex: 1,
  },

  nodeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 4,
    marginRight: SPACING.md,
    zIndex: 2,
    // BackgroundColor aplicado dinámicamente
  },

  nodeLine: {
    position: 'absolute',
    left: 6,
    top: 18,
    bottom: -24,
    width: 2,
    zIndex: 1,
    // BackgroundColor aplicado dinámicamente
  },

  nodeTitle: {
    ...FONT.bodyStrong,
    // Color aplicado dinámicamente
  },

  nodeTime: {
    ...FONT.caption,
    marginTop: 4,
    // Color aplicado dinámicamente
  },

  bottomSpacer: {
    height: 100,
  },

  actionFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.xl,
    borderTopWidth: 1,
    // BackgroundColor y borderTopColor aplicados dinámicamente
  },
});

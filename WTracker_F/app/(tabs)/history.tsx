import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

// Importaciones adaptadas a la nueva arquitectura
import { useTheme } from '../../src/context/ThemeContext';
import { getSpringConfig } from '../../src/constants/animations';
import { RADIUS, SPACING, FONT } from '../../src/constants/theme';
import { IntegrityBadge, BadgeType } from '../../src/components/ui/IntegrityBadge';
import { ScreenContainer } from '../../src/components/ui/ScreenContainer';

const MOCK_HISTORY = [
  {
    id: '101',
    date: 'Hoy, 04 jun',
    destination: 'Taller central - Revisión',
    time: '08:14 AM - 04:30 PM',
    hours: '8.2 h',
    earnings: '$164.00',
    status: 'valid' as BadgeType,
  },
  {
    id: '102',
    date: 'Ayer, 03 jun',
    destination: 'Residencia norte',
    time: '09:00 AM - 01:15 PM',
    hours: '4.2 h',
    earnings: '$84.00',
    status: 'auto' as BadgeType,
  },
  {
    id: '103',
    date: '02 jun 2026',
    destination: 'Oficinas Nexus',
    time: '07:30 AM - 06:00 PM',
    hours: '10.5 h',
    earnings: '$230.00',
    status: 'manual' as BadgeType,
  },
  {
    id: '104',
    date: '01 jun 2026',
    destination: 'Destino no especificado',
    time: '08:00 AM - 05:00 PM',
    hours: '9.0 h',
    earnings: '$180.00',
    status: 'error' as BadgeType,
  },
  {
    id: '105',
    date: '30 may 2026',
    destination: 'Taller central',
    time: '08:00 AM - 12:00 PM',
    hours: '4.0 h',
    earnings: '$80.00',
    status: 'warning' as BadgeType,
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HistoryScreen() {
  const router = useRouter();
  // Inyección del tema y físicas globales
  const { colors } = useTheme();
  const springConfig = getSpringConfig();
  
  const [filter, setFilter] = useState<'Todos' | 'Semana' | 'Mes'>('Todos');

  const renderItem = ({ item, index }: any) => {
    return (
      <AnimatedPressable
        entering={FadeInDown.delay(index * 100 + 200)
          .springify()
          .damping(springConfig.damping)
          .stiffness(springConfig.stiffness)}
        style={({ pressed }: { pressed: boolean }) => [
          styles.sessionCard,
          {
            backgroundColor: colors.carbonMist,
            borderColor: colors.steelLine,
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
          item.status === 'error' && { borderColor: colors.deepRed },
        ]}
        onPress={() => router.push(`/session/${item.id}`)}
      >
        <View style={styles.cardTopRow}>
          <Text style={[styles.sessionDate, { color: colors.textSecondary }]}>{item.date}</Text>
          <IntegrityBadge type={item.status} />
        </View>

        <View style={styles.destinationRow}>
          <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
          <Text
            style={[
              styles.destinationTitle,
              { color: colors.textPrimary },
              item.status === 'error' && { color: colors.deepRed },
            ]}
            numberOfLines={1}
          >
            {item.destination}
          </Text>
        </View>

        <Text style={[styles.timeText, { color: colors.textSecondary }]}>{item.time}</Text>

        <View style={[styles.cardBottomRow, { borderTopColor: colors.graphite }]}>
          <View style={styles.metricRow}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.hoursText, { color: colors.textPrimary }]}>{item.hours}</Text>
          </View>

          <View style={styles.metricRow}>
            <Ionicons name="cash-outline" size={14} color={colors.mutedGold} />
            <Text
              style={[
                styles.earningsText,
                { color: colors.mutedGold },
                item.status === 'error' && { color: colors.deepRed },
              ]}
            >
              {item.earnings}
            </Text>
          </View>
        </View>
      </AnimatedPressable>
    );
  };

  return (
    <ScreenContainer noPadding>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <View style={styles.headerRow}>
          <Ionicons name="time-outline" size={22} color={colors.textPrimary} />
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Historial</Text>
        </View>

        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Actividad registrada</Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        style={styles.filterContainer}
      >
        {['Todos', 'Semana', 'Mes'].map((f) => (
          <Pressable
            key={f}
            style={[
              styles.filterPill,
              {
                backgroundColor: colors.graphite,
                borderColor: colors.steelLine,
              },
              filter === f && [styles.filterPillActive, { borderColor: colors.mutedGold }],
            ]}
            onPress={() => setFilter(f as any)}
          >
            <Text
              style={[
                styles.filterText,
                { color: colors.textSecondary },
                filter === f && { color: colors.mutedGold },
              ]}
            >
              {f}
            </Text>
          </Pressable>
        ))}
      </Animated.View>

      <FlatList
        data={MOCK_HISTORY}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={styles.footerSpacing} />}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    // Color aplicado dinámicamente
  },

  headerSubtitle: {
    fontSize: 12,
    marginTop: 4,
    // Color aplicado dinámicamente
  },

  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },

  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    // BackgroundColor y borderColor aplicados dinámicamente
  },

  filterPillActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)', // Fondo de acento estático translúcido
    // BorderColor aplicado dinámicamente
  },

  filterText: {
    ...FONT.bodyStrong,
    fontSize: 14,
    // Color aplicado dinámicamente
  },

  scrollContent: {
    paddingHorizontal: SPACING.xl,
  },

  sessionCard: {
    borderRadius: RADIUS.cards,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    // BackgroundColor y borderColor aplicados dinámicamente
  },

  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },

  sessionDate: {
    ...FONT.label,
    // Color aplicado dinámicamente
  },

  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },

  destinationTitle: {
    ...FONT.h3,
    fontSize: 18,
    flex: 1,
    // Color aplicado dinámicamente
  },

  timeText: {
    ...FONT.body,
    marginBottom: SPACING.md,
    // Color aplicado dinámicamente
  },

  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    // BorderTopColor aplicado dinámicamente
  },

  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  hoursText: {
    ...FONT.bodyStrong,
    // Color aplicado dinámicamente
  },

  earningsText: {
    fontSize: 16,
    fontWeight: '700',
    // Color aplicado dinámicamente
  },

  footerSpacing: {
    height: 40,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

// Importaciones actualizadas según la arquitectura de contexto
import { useTheme } from '../../context/ThemeContext';
import { getSpringConfig } from '../../constants/animations';
import { RADIUS, FONT, SPACING } from '../../constants/theme';
import { EngineState } from './OperationalHeroCard';

interface SessionTimelineProps {
  engineState: EngineState;
}

export function SessionTimeline({ engineState }: SessionTimelineProps) {
  // Inyección de tokens dinámicos y físicas de animación
  const { colors } = useTheme();
  const springConfig = getSpringConfig();

  const hasStarted = engineState !== 'NO_INICIADA';
  const hasArrived = ['ACTIVA', 'SALIDA_DETECTADA', 'CERRADA'].includes(engineState);

  return (
    <View style={[styles.timelineBlock, { backgroundColor: colors.graphite }]}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        Actividad de la jornada
      </Text>

      {!hasStarted ? (
        <Animated.Text
          entering={FadeInDown.duration(400)}
          style={[styles.emptyText, { color: colors.textMuted }]}
        >
          Aún no hay actividad.
        </Animated.Text>
      ) : (
        <View style={styles.timeline}>
          
          <Animated.View
            entering={FadeInDown.delay(100)
              .springify()
              .damping(springConfig.damping)
              .stiffness(springConfig.stiffness)}
            style={styles.timelineNode}
          >
            <View style={[styles.nodeDot, { backgroundColor: colors.mutedGold }]} />
            <View style={[styles.nodeLine, { backgroundColor: colors.steelLine }]} />
            <View>
              <Text style={[styles.nodeTitle, { color: colors.textPrimary }]}>
                Inicio de jornada
              </Text>
              <Text style={[styles.nodeTime, { color: colors.textSecondary }]}>
                08:14 AM
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(250)
              .springify()
              .damping(springConfig.damping)
              .stiffness(springConfig.stiffness)}
            style={styles.timelineNode}
          >
            <View
              style={[
                styles.nodeDot,
                hasArrived
                  ? { backgroundColor: colors.successGreen }
                  : {
                      backgroundColor: colors.carbonMist,
                      borderWidth: 1,
                      borderColor: colors.steelLine,
                    },
              ]}
            />
            <View>
              <Text style={[styles.nodeTitle, { color: colors.textPrimary }]}>
                Llegada al destino
              </Text>
              <Text style={[styles.nodeTime, { color: colors.textSecondary }]}>
                {hasArrived ? '08:45 AM' : 'Pendiente'}
              </Text>
            </View>
          </Animated.View>

        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  timelineBlock: {
    marginHorizontal: SPACING.xl,
    padding: 18,
    borderRadius: RADIUS.cards,
    marginBottom: SPACING.xl,
    // backgroundColor se aplica dinámicamente en el JSX
  },

  sectionTitle: {
    ...FONT.h3,
    fontSize: 16,
    marginBottom: SPACING.md,
    // color se aplica dinámicamente en el JSX
  },

  emptyText: {
    ...FONT.body,
    fontSize: 14,
    fontStyle: 'italic',
    // color se aplica dinámicamente en el JSX
  },

  timeline: {
    marginTop: SPACING.xs,
  },

  timelineNode: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },

  nodeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: SPACING.md,
    zIndex: 2,
    // backgroundColor y bordes se aplican dinámicamente en el JSX
  },

  nodeLine: {
    position: 'absolute',
    left: 5,
    top: 16,
    bottom: -20,
    width: 2,
    zIndex: 1,
    // backgroundColor se aplica dinámicamente en el JSX
  },

  nodeTitle: {
    ...FONT.bodyStrong,
    // color se aplica dinámicamente en el JSX
  },

  nodeTime: {
    ...FONT.caption,
    marginTop: 2,
    // color se aplica dinámicamente en el JSX
  },
});

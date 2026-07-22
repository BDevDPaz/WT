import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

// --- Context, Theme & Layout ---
import { useTheme } from '../../src/context/ThemeContext';
import { getSpringConfig } from '../../src/constants/animations';
import { SPACING, FONT } from '../../src/constants/theme';
import { ScreenContainer } from '../../src/components/ui/ScreenContainer';

// --- Providers & Modals ---
import { useToast } from '../../src/context/ToastContext';
import { DailySetupModal } from '../../src/components/modals/DailySetupModal';
import { LunchModal } from '../../src/components/modals/LunchModal';
import { ExitDetectionModal } from '../../src/components/modals/ExitDetectionModal';

// --- UI Components ---
import { OperationalHeroCard, EngineState } from '../../src/components/ui/OperationalHeroCard';
import { DailySummaryBlock } from '../../src/components/ui/DailySummaryBlock';
import { SystemHealthBlock } from '../../src/components/ui/SystemHealthBlock';
import { SessionTimeline } from '../../src/components/ui/SessionTimeline';

export default function HoyScreen() {
  // Inyección del tema y físicas globales
  const { colors } = useTheme();
  const springConfig = getSpringConfig();
  const { showToast } = useToast();

  const [engineState, setEngineState] = useState<EngineState>('NO_INICIADA');
  const [currentDestination, setCurrentDestination] = useState('');
  const [isSetupModalVisible, setIsSetupModalVisible] = useState(false);
  const [isLunchModalVisible, setIsLunchModalVisible] = useState(false);
  const [isExitModalVisible, setIsExitModalVisible] = useState(false);

  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.2);

  const getHeaderOrb = () => {
    switch (engineState) {
      case 'NO_INICIADA':
      case 'CERRADA':
        return { icon: 'moon-outline' as const, color: colors.textSecondary, glow: false };
      case 'ESPERANDO_LLEGADA':
        return { icon: 'pin-outline' as const, color: colors.slateBlue, glow: false };
      case 'ASINCRONIA_CHECKIN':
      case 'SALIDA_DETECTADA':
        return { icon: 'alert-circle-outline' as const, color: colors.amberWarning, glow: true };
      case 'NO_SHOW':
        return { icon: 'warning' as const, color: colors.deepRed, glow: true };
      case 'EN_TRASLADO':
        return { icon: 'location-outline' as const, color: colors.mutedGold, glow: true };
      case 'ACTIVA':
        return { icon: 'location' as const, color: colors.mutedGold, glow: true };
      default:
        return { icon: 'moon-outline' as const, color: colors.textSecondary, glow: false };
    }
  };

  const orb = getHeaderOrb();

  useFocusEffect(
    useCallback(() => {
      if (orb.glow) {
        glowScale.value = withRepeat(
          withTiming(1.15, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        );
        glowOpacity.value = withRepeat(
          withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        );
      } else {
        glowScale.value = withTiming(1, { duration: 500 });
        glowOpacity.value = withTiming(0, { duration: 500 });
      }

      return () => {
        glowScale.value = withTiming(1, { duration: 500 });
        glowOpacity.value = withTiming(0, { duration: 500 });
      };
    }, [orb.glow, glowScale, glowOpacity])
  );

  const animatedOrbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    shadowOpacity: glowOpacity.value,
  }));

  const handlePrimaryMockAction = () => {
    switch (engineState) {
      case 'NO_INICIADA':
        setIsSetupModalVisible(true);
        break;
      case 'ESPERANDO_LLEGADA':
        setEngineState('ASINCRONIA_CHECKIN');
        break;
      case 'ASINCRONIA_CHECKIN':
        setEngineState('NO_SHOW');
        break;
      case 'NO_SHOW':
        showToast('Jornada iniciada manualmente', 'info');
        setEngineState('ACTIVA');
        break;
      case 'EN_TRASLADO':
        setEngineState('ACTIVA');
        break;
      case 'ACTIVA':
        setEngineState('SALIDA_DETECTADA');
        break;
      case 'SALIDA_DETECTADA':
        setIsExitModalVisible(true);
        break;
      case 'CERRADA':
        setEngineState('NO_INICIADA');
        setCurrentDestination('');
        break;
    }
  };

  const handleSecondaryMockAction = () => {
    if (engineState === 'ASINCRONIA_CHECKIN') {
      showToast('Esperando señal GPS...', 'info');
    } else if (engineState === 'NO_SHOW') {
      setEngineState('NO_INICIADA');
      showToast('Jornada cancelada por el usuario', 'info');
    } else if (engineState === 'ACTIVA') {
      showToast('Abriendo nota rápida...', 'info');
    } else if (engineState === 'SALIDA_DETECTADA') {
      setEngineState('ACTIVA');
      showToast('Operación restablecida', 'success');
    } else {
      showToast('Acción ejecutada', 'info');
    }
  };

  return (
    <ScreenContainer noPadding>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>W Tracker</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Control diario</Text>
          </View>

          <Animated.View
            style={[
              styles.statusOrb,
              {
                backgroundColor: colors.carbonMist,
                borderColor: colors.steelLine,
              },
              orb.glow && { shadowColor: orb.color, shadowRadius: 10, elevation: 6 },
              animatedOrbStyle,
            ]}
          >
            <Ionicons name={orb.icon} size={20} color={orb.color} />
          </Animated.View>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(50)
            .springify()
            .damping(springConfig.damping)
            .stiffness(springConfig.stiffness)} 
          style={styles.heroWrapper}
        >
          <OperationalHeroCard
            state={engineState}
            destination={currentDestination || undefined}
            timeString={engineState === 'CERRADA' ? '08:14' : '02:45'}
            earnings={engineState === 'CERRADA' ? '$164.80' : '$55.00'}
            onPrimaryAction={handlePrimaryMockAction}
            onSecondaryAction={handleSecondaryMockAction}
          />
        </Animated.View>

        <DailySummaryBlock
          hours={engineState === 'NO_INICIADA' ? '0.0h' : '2.8h'}
          earnings={engineState === 'NO_INICIADA' ? '$0' : '$55'}
        />

        <SystemHealthBlock engineState={engineState} />
        <SessionTimeline engineState={engineState} />
      </ScrollView>

      <DailySetupModal
        visible={isSetupModalVisible}
        onCancel={() => setIsSetupModalVisible(false)}
        onConfirm={(d, a) => {
          setIsSetupModalVisible(false);
          setCurrentDestination(a ? `${a} - ${d}` : d);
          setEngineState('ESPERANDO_LLEGADA');
          showToast('Monitoreo activado', 'success');
        }}
      />

      <LunchModal
        visible={isLunchModalVisible}
        onCancel={() => setIsLunchModalVisible(false)}
        onConfirm={(min) => {
          setIsLunchModalVisible(false);
          setEngineState('CERRADA');
          showToast(`Jornada finalizada. ${min} min descontados`, 'success');
        }}
      />

      <ExitDetectionModal
        visible={isExitModalVisible}
        exitTime="04:30 PM"
        onContinueOperating={() => {
          setIsExitModalVisible(false);
          setEngineState('ACTIVA');
          showToast('Operación restablecida', 'success');
        }}
        onCloseShift={() => {
          setIsExitModalVisible(false);
          setIsLunchModalVisible(true);
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
    minHeight: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    // Color movido al componente para inyección dinámica
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: 2,
    // Color movido al componente para inyección dinámica
  },
  statusOrb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // BackgroundColor y borderColor movidos al componente para inyección dinámica
  },
  heroWrapper: {
    marginBottom: SPACING.lg,
  },
});

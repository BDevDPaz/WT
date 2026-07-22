import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
} from 'react-native';
import Animated, { FadeInDown, SlideInDown } from 'react-native-reanimated';
import * as Crypto from 'expo-crypto';
import { Ionicons } from '@expo/vector-icons';

// Importaciones adaptadas a la nueva arquitectura
import { useTheme } from '../../src/context/ThemeContext';
import { getSpringConfig } from '../../src/constants/animations';
import { SPACING, RADIUS, FONT } from '../../src/constants/theme';
import { ScreenContainer } from '../../src/components/ui/ScreenContainer';
import { Button } from '../../src/components/ui/Button';
import { useToast } from '../../src/context/ToastContext';

const DEMO_ADMIN_PIN_SHA256 =
  '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4';

export default function SettingsScreen() {
  const { showToast } = useToast();
  
  // Consumo dinámico del tema y de las físicas
  const { colors } = useTheme();
  const springConfig = getSpringConfig();

  const [isDirty, setIsDirty] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(true);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const markAsDirty = () => setIsDirty(true);

  const verifyAdminPinSecurely = async (candidatePin: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 650));
    const candidateHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      candidatePin.trim()
    );
    return candidateHash === DEMO_ADMIN_PIN_SHA256;
  };

  const handleUnlock = async () => {
    const normalizedPin = pin.trim();

    if (!normalizedPin) {
      setPinError(true);
      showToast('Ingresa tu PIN para continuar', 'warning');
      return;
    }

    setIsUnlocking(true);
    setPinError(false);

    try {
      const isValid = await verifyAdminPinSecurely(normalizedPin);

      if (isValid) {
        setIsUnlocked(true);
        setPin('');
        showToast('Acceso desbloqueado', 'success');
      } else {
        setIsUnlocked(false);
        setPinError(true);
        showToast('PIN incorrecto', 'error');
      }
    } catch {
      setIsUnlocked(false);
      setPinError(true);
      showToast('No fue posible validar el acceso', 'error');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setPin('');
    setPinError(false);
    showToast('Acceso bloqueado', 'info');
  };

  const handleSave = () => {
    if (!hasPermissions) {
      showToast('Se requieren permisos de ubicación', 'error');
      return;
    }

    setIsDirty(false);
    showToast('Configuración guardada', 'success');
  };

  const togglePermissionsSimulator = () => {
    const newState = !hasPermissions;
    setHasPermissions(newState);

    if (newState) {
      showToast('Permisos restaurados', 'success');
    } else {
      showToast('Permisos de ubicación desactivados', 'warning');
      markAsDirty();
    }
  };

  return (
    <ScreenContainer noPadding>
      
      <Animated.View entering={FadeInDown.duration(400)}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Ajustes</Text>
          </View>

          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Configuración y seguridad
          </Text>
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Animated.View 
          entering={FadeInDown.delay(100)
            .springify()
            .damping(springConfig.damping)
            .stiffness(springConfig.stiffness)}
        >
          <View style={[styles.card, { backgroundColor: colors.carbonMist }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Perfil laboral</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Nombre</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.graphite,
                    borderColor: colors.steelLine,
                    color: colors.textPrimary,
                  }
                ]}
                defaultValue="Alex León"
                onChangeText={markAsDirty}
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Tarifa por hora</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.graphite,
                    borderColor: colors.steelLine,
                    color: colors.textPrimary,
                  }
                ]}
                defaultValue="20.00"
                keyboardType="numeric"
                onChangeText={markAsDirty}
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(200)
            .springify()
            .damping(springConfig.damping)
            .stiffness(springConfig.stiffness)}
        >
          <View style={[styles.card, { backgroundColor: colors.carbonMist }, !isUnlocked && styles.cardLocked]}>
            
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Parámetros de jornada</Text>
              {!isUnlocked && <Ionicons name="lock-closed" size={16} color={colors.mutedGold} />}
            </View>

            <View style={styles.horizontalInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Hora base</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.graphite,
                      borderColor: colors.steelLine,
                      color: colors.textPrimary,
                    },
                    !isUnlocked && { color: colors.textMuted }
                  ]}
                  defaultValue="06:00"
                  editable={isUnlocked}
                  onChangeText={markAsDirty}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Multiplicador extra</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.graphite,
                      borderColor: colors.steelLine,
                      color: colors.textPrimary,
                    },
                    !isUnlocked && { color: colors.textMuted }
                  ]}
                  defaultValue="1.5"
                  editable={isUnlocked}
                  onChangeText={markAsDirty}
                />
              </View>
            </View>

          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(300)
            .springify()
            .damping(springConfig.damping)
            .stiffness(springConfig.stiffness)}
        >
          <View 
            style={[
              styles.card, 
              { backgroundColor: colors.carbonMist }, 
              !hasPermissions && { borderColor: colors.deepRed, borderWidth: 1 }
            ]}
          >
            
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Ubicación</Text>

              <Pressable onPress={togglePermissionsSimulator}>
                <Text style={{ ...FONT.label, color: colors.mutedGold }}>
                  Simular sistema
                </Text>
              </Pressable>
            </View>

            <View style={styles.healthRow}>
              <View
                style={[
                  styles.healthDot,
                  { backgroundColor: hasPermissions ? colors.successGreen : colors.deepRed },
                ]}
              />
              <Text style={[styles.healthText, { color: colors.textSecondary }, !hasPermissions && { color: colors.deepRed }]}>
                {hasPermissions
                  ? 'Permiso de ubicación activo'
                  : 'Permiso de ubicación desactivado'}
              </Text>
            </View>

            <View style={styles.healthRow}>
              <View
                style={[
                  styles.healthDot,
                  { backgroundColor: hasPermissions ? colors.successGreen : colors.deepRed },
                ]}
              />
              <Text style={[styles.healthText, { color: colors.textSecondary }, !hasPermissions && { color: colors.deepRed }]}>
                {hasPermissions
                  ? 'Ubicación en segundo plano activa'
                  : 'Ubicación bloqueada'}
              </Text>
            </View>

          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(400)
            .springify()
            .damping(springConfig.damping)
            .stiffness(springConfig.stiffness)}
        >
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.carbonMist,
                borderColor: isUnlocked ? colors.successGreen : colors.steelLine,
                borderWidth: 1,
              },
            ]}
          >
            
            <View style={styles.secureBlockHeader}>
              <Ionicons
                name={isUnlocked ? 'lock-open' : 'lock-closed'}
                size={20}
                color={isUnlocked ? colors.successGreen : colors.mutedGold}
              />

              <Text
                style={[
                  styles.sectionTitle,
                  {
                    marginBottom: 0,
                    color: isUnlocked ? colors.successGreen : colors.mutedGold,
                  },
                ]}
              >
                Acceso protegido
              </Text>
            </View>

            <Text style={[styles.secureBlockDesc, { color: colors.textSecondary }]}>
              {isUnlocked
                ? 'Parámetros desbloqueados'
                : 'Esta sección requiere autenticación'}
            </Text>

            {!isUnlocked ? (
              <View style={styles.verticalGap}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.graphite,
                      borderColor: colors.steelLine,
                      color: colors.textPrimary,
                    },
                    pinError && { borderColor: colors.deepRed, borderWidth: 1 }
                  ]}
                  placeholder="Ingresa tu PIN"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  secureTextEntry
                  value={pin}
                  editable={!isUnlocking}
                  onChangeText={(t) => {
                    setPin(t);
                    setPinError(false);
                  }}
                />

                <Button
                  label="Desbloquear"
                  variant="ghost"
                  onPress={handleUnlock}
                  isLoading={isUnlocking}
                  disabled={!pin.trim() || isUnlocking}
                />
              </View>
            ) : (
              <Button label="Bloquear acceso" variant="secondary" onPress={handleLock} />
            )}

          </View>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Animated.View 
        entering={SlideInDown.delay(500)
          .springify()
          .damping(springConfig.damping)
          .stiffness(springConfig.stiffness)}
      >
        <View 
          style={[
            styles.actionFooter,
            { backgroundColor: colors.obsidian, borderTopColor: colors.steelLine }
          ]}
        >
          <Button
            label="Guardar cambios"
            variant="primary"
            onPress={handleSave}
            disabled={!isDirty || !hasPermissions}
          />
        </View>
      </Animated.View>

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    // Color movido al componente para inyección dinámica
  },

  headerSubtitle: {
    fontSize: 12,
    marginTop: 4,
    // Color movido al componente para inyección dinámica
  },

  scrollContent: {
    paddingHorizontal: SPACING.xl,
  },

  card: {
    padding: SPACING.lg,
    borderRadius: RADIUS.cards,
    marginBottom: SPACING.lg,
    // BackgroundColor movido al componente
  },

  cardLocked: {
    opacity: 0.7,
  },

  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },

  sectionTitle: {
    ...FONT.h3,
    fontSize: 18,
    marginBottom: SPACING.lg,
    // Color movido al componente
  },

  horizontalInputs: {
    flexDirection: 'row',
    gap: SPACING.md,
  },

  verticalGap: {
    gap: SPACING.md,
  },

  inputGroup: {
    marginBottom: SPACING.md,
  },

  inputLabel: {
    ...FONT.caption,
    marginBottom: 8,
    // Color movido al componente
  },

  input: {
    borderRadius: RADIUS.inputs,
    height: 52,
    paddingHorizontal: SPACING.lg,
    ...FONT.body,
    borderWidth: 1,
    // BackgroundColor, borderColor y color movidos al componente
  },

  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },

  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },

  healthText: {
    ...FONT.body,
    fontSize: 14,
    // Color movido al componente
  },

  secureBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },

  secureBlockDesc: {
    ...FONT.body,
    marginBottom: SPACING.lg,
    // Color movido al componente
  },

  actionFooter: {
    padding: SPACING.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.xl,
    borderTopWidth: 1,
    // BackgroundColor y borderTopColor movidos al componente
  },
});

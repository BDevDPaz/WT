import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import { PALETTE, RADIUS } from '../../theme/tokens';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
interface Props {
  label: string;
  variant: Variant;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({ label, variant, onPress, disabled, loading, fullWidth }: Props) {
  const styles = {
    primary: { backgroundColor: PALETTE.mutedGold, color: PALETTE.obsidian, borderColor: PALETTE.mutedGold },
    secondary: { backgroundColor: PALETTE.graphite, color: PALETTE.white, borderColor: PALETTE.steelLine },
    ghost: { backgroundColor: 'transparent', color: PALETTE.white, borderColor: PALETTE.steelLine },
    danger: { backgroundColor: PALETTE.deepRed, color: PALETTE.white, borderColor: PALETTE.deepRed },
  }[variant];

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={{
        minHeight: 52,
        width: fullWidth ? '100%' : undefined,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: RADIUS.md,
        backgroundColor: disabled ? PALETTE.carbonMist : styles.backgroundColor,
        borderWidth: 1,
        borderColor: styles.borderColor,
        opacity: disabled ? 0.6 : 1,
        paddingHorizontal: 16,
      }}
    >
      {loading ? <ActivityIndicator color={styles.color} /> : <Text style={{ color: styles.color, fontWeight: '700' }}>{label}</Text>}
    </Pressable>
  );
}

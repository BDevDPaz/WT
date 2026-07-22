import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { Card } from '../core/Card';
import { Button } from '../core/Button';
import { PALETTE } from '../../theme/tokens';

export function SecureBlock() {
  const [unlocked, setUnlocked] = useState(false);
  return (
    <Card elevated style={{ marginHorizontal: 24, marginBottom: 24, borderColor: PALETTE.mutedGold, borderWidth: 0.5 }}>
      <Text style={{ color: PALETTE.white, fontWeight: '700', marginBottom: 4 }}>Zona administrativa</Text>
      {!unlocked ? (
        <>
          <Text style={{ color: PALETTE.secondaryText, marginBottom: 12 }}>Esta sección requiere acceso protegido</Text>
          <TextInput secureTextEntry placeholder="Password" placeholderTextColor={PALETTE.mutedText} style={{ backgroundColor: PALETTE.graphite, color: PALETTE.white, borderWidth: 1, borderColor: PALETTE.steelLine, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 12 }} />
          <Button label="Desbloquear" variant="primary" fullWidth onPress={() => setUnlocked(true)} />
        </>
      ) : (
        <>
          <Text style={{ color: PALETTE.successGreen, marginBottom: 12 }}>Acceso desbloqueado</Text>
          <View style={{ gap: 8 }}>
            <Button label="Auditoría" variant="secondary" fullWidth />
            <Button label="Configuración avanzada" variant="secondary" fullWidth />
            <Button label="Validaciones" variant="secondary" fullWidth />
            <Button label="Bloquear" variant="ghost" fullWidth onPress={() => setUnlocked(false)} />
          </View>
        </>
      )}
    </Card>
  );
}

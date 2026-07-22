import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../core/Card';
import { PALETTE } from '../../theme/tokens';

function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
      <Text style={{ color: PALETTE.secondaryText }}>{label}</Text>
      <Text style={{ color, fontWeight: '600' }}>{value}</Text>
    </View>
  );
}

export function SystemHealthBlock() {
  return (
    <Card style={{ marginHorizontal: 24, marginBottom: 16 }}>
      <Text style={{ color: PALETTE.white, fontWeight: '700', marginBottom: 8 }}>Estado del sistema</Text>
      <Row label="Ubicación" value="Activa" color={PALETTE.successGreen} />
      <Row label="Zona" value="Configurada" color={PALETTE.successGreen} />
      <Row label="Última validación" value="2 min" color={PALETTE.secondaryText} />
      <Row label="Notificaciones" value="Activas" color={PALETTE.successGreen} />
    </Card>
  );
}

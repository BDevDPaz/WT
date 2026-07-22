import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../core/Card';
import { PALETTE } from '../../theme/tokens';

const ITEMS = [
  ['08:00', 'Creada', 'done'],
  ['08:14', 'Zona activada', 'done'],
  ['08:16', 'Llegada detectada', 'done'],
  ['08:18', 'Check-in', 'current'],
  ['--:--', 'Salida detectada', 'pending'],
  ['--:--', 'Check-out', 'pending'],
] as const;

export function SessionTimeline() {
  return (
    <Card style={{ marginHorizontal: 24, marginBottom: 24 }}>
      <Text style={{ color: PALETTE.white, fontWeight: '700', marginBottom: 12 }}>Actividad de hoy</Text>
      {ITEMS.map(([time, label, kind], idx) => {
        const color = kind === 'done' ? PALETTE.mutedGold : kind === 'current' ? PALETTE.white : PALETTE.mutedText;
        return (
          <View key={idx} style={{ flexDirection: 'row', gap: 12, paddingVertical: 8, opacity: kind === 'pending' ? 0.4 : 1 }}>
            <Text style={{ color: PALETTE.secondaryText, width: 56 }}>{time}</Text>
            <View style={{ width: 10, alignItems: 'center' }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, marginTop: 4 }} />
              {idx < ITEMS.length - 1 ? <View style={{ width: 2, flex: 1, backgroundColor: PALETTE.steelLine, marginTop: 2 }} /> : null}
            </View>
            <Text style={{ color, flex: 1 }}>{label}</Text>
          </View>
        );
      })}
    </Card>
  );
}

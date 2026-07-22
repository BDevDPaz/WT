import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../core/Card';
import { PALETTE } from '../../theme/tokens';

export function WeeklySummaryBlock() {
  return (
    <Card style={{ marginHorizontal: 24, marginBottom: 16 }}>
      <Text style={{ color: PALETTE.secondaryText, textTransform: 'uppercase', letterSpacing: 2, fontSize: 10 }}>ESTA SEMANA</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 12 }}>
        <Text style={{ color: PALETTE.white, fontSize: 30, fontWeight: '700' }}>32.4 h</Text>
        <Text style={{ color: PALETTE.mutedGold, fontSize: 30, fontWeight: '700' }}>$740</Text>
      </View>
      <Text style={{ color: PALETTE.secondaryText, marginTop: 8 }}>5 sesiones • 1 ajuste manual</Text>
    </Card>
  );
}

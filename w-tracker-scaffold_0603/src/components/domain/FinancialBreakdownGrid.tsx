import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../core/Card';
import { PALETTE } from '../../theme/tokens';

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: strong ? 0 : 1, borderBottomColor: PALETTE.steelLine }}>
      <Text style={{ color: PALETTE.secondaryText, fontWeight: strong ? '700' : '400' }}>{k}</Text>
      <Text style={{ color: strong ? PALETTE.mutedGold : PALETTE.white, fontWeight: '700' }}>{v}</Text>
    </View>
  );
}

export function FinancialBreakdownGrid() {
  return (
    <Card style={{ marginHorizontal: 24, marginBottom: 16 }}>
      <Row k="Horas normales" v="30.3 h" />
      <Row k="Overtime" v="2.1 h" />
      <Row k="Tarifa base" v="$20/h" />
      <Row k="Multiplicador OT" v="1.5x" />
      <Row k="Ingreso base" v="$606" />
      <Row k="Ingreso OT" v="$134" />
      <Row k="TOTAL" v="$740" strong />
    </Card>
  );
}

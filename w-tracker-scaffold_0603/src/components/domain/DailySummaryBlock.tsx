import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../core/Card';
import { PALETTE } from '../../theme/tokens';

function MetricCard({ title, subtitle, value }: { title: string; subtitle: string; value: string }) {
  return (
    <Card style={{ flex: 1, minHeight: 110 }}>
      <Text style={{ color: PALETTE.secondaryText, textTransform: 'uppercase', fontSize: 10, letterSpacing: 2 }}>{title}</Text>
      <Text style={{ color: PALETTE.secondaryText, marginTop: 4 }}>{subtitle}</Text>
      <Text style={{ color: PALETTE.white, fontSize: 28, fontWeight: '700', marginTop: 16 }}>{value}</Text>
    </Card>
  );
}

export function DailySummaryBlock() {
  return (
    <View style={{ flexDirection: 'row', gap: 12, marginHorizontal: 24, marginBottom: 16 }}>
      <MetricCard title="HORAS" subtitle="hoy" value="8.6" />
      <MetricCard title="INGRESO" subtitle="estimado" value="$194" />
      <MetricCard title="OVERTIME" subtitle="extra" value="1.2" />
    </View>
  );
}

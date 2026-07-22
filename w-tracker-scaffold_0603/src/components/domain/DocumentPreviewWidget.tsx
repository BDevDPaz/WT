import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../core/Card';
import { PALETTE } from '../../theme/tokens';

export function DocumentPreviewWidget() {
  return (
    <Card paper style={{ marginHorizontal: 24, marginBottom: 16, minHeight: 220 }}>
      <Text style={{ color: '#222', fontSize: 12 }}>W Tracker</Text>
      <Text style={{ color: '#222', fontSize: 20, fontWeight: '700', marginTop: 8 }}>Reporte semanal</Text>
      <Text style={{ color: '#555', marginTop: 8 }}>May 20 — May 26</Text>
      <Text style={{ color: '#222', marginTop: 8 }}>Total: $740 • 32.4 horas</Text>
      <View style={{ gap: 8, marginTop: 20 }}>
        {[80, 92, 76, 88, 68, 95].map((w, idx) => <View key={idx} style={{ height: 4, borderRadius: 2, backgroundColor: PALETTE.paperLine, width: `${w}%` }} />)}
      </View>
    </Card>
  );
}

import React from 'react';
import { Text } from 'react-native';
import { Card } from '../core/Card';
import { PALETTE } from '../../theme/tokens';

export function FinancialSummaryCard() {
  return (
    <Card elevated style={{ marginHorizontal: 24, marginBottom: 16 }}>
      <Text style={{ color: PALETTE.secondaryText, textTransform: 'uppercase', letterSpacing: 2, fontSize: 10 }}>TOTAL SEMANA</Text>
      <Text style={{ color: PALETTE.mutedGold, fontSize: 40, fontWeight: '700', marginTop: 8 }}>$740</Text>
      <Text style={{ color: PALETTE.white, marginTop: 8, fontSize: 16 }}>32.4 h • 5 sesiones</Text>
      <Text style={{ color: PALETTE.secondaryText, marginTop: 4 }}>Overtime y ajustes incluidos</Text>
    </Card>
  );
}

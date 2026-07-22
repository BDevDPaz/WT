import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../core/Card';
import { StatusPill } from '../core/StatusPill';
import { Button } from '../core/Button';
import { HERO_STATE_UI } from '../../stateMappings';
import { HoyState } from '../../types';
import { PALETTE, FONT } from '../../theme/tokens';

export function OperationalHeroCard({ state, destination = 'Destino pendiente', relevantTime = '8:14 AM' }: { state: HoyState; destination?: string; relevantTime?: string }) {
  const ui = HERO_STATE_UI[state];
  return (
    <Card elevated style={{ marginHorizontal: 24, marginBottom: 16, minHeight: 220 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
        <StatusPill label={ui.pill} />
        <Text style={{ color: PALETTE.secondaryText }}>{relevantTime}</Text>
      </View>
      <Text style={{ color: PALETTE.secondaryText, textTransform: 'uppercase', letterSpacing: 2, fontSize: 10 }}>DESTINO</Text>
      <Text style={{ color: PALETTE.white, marginTop: 8, ...FONT.h3 }}>{destination}</Text>
      <Text style={{ color: PALETTE.secondaryText, marginTop: 4 }}>{ui.subtext}</Text>
      <Text style={{ color: PALETTE.white, fontSize: 40, fontWeight: '700', marginTop: 20 }}>{ui.metric}</Text>
      <View style={{ marginTop: 20, gap: 12 }}>
        <Button label={ui.primary} variant="primary" fullWidth />
        {ui.secondary ? <Button label={ui.secondary} variant="ghost" fullWidth /> : null}
      </View>
    </Card>
  );
}

import React from 'react';
import { ScrollView, Text, Pressable } from 'react-native';
import { PALETTE, RADIUS } from '../../theme/tokens';

const FILTERS = ['Todo', 'Semana', 'Mes', 'Ajustadas', 'Auto cerradas', 'Pendientes'];
export function FilterCarousel() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 24, paddingBottom: 16 }}>
      {FILTERS.map((label, index) => {
        const active = index === 0;
        return (
          <Pressable key={label} style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: RADIUS.pill, backgroundColor: active ? 'rgba(197,160,89,0.15)' : PALETTE.carbonMist }}>
            <Text style={{ color: active ? PALETTE.mutedGold : PALETTE.secondaryText, fontWeight: '600' }}>{label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

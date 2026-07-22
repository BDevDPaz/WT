import React from 'react';
import { View, Text } from 'react-native';
import { INTEGRITY_UI } from '../../stateMappings';
import { RADIUS } from '../../theme/tokens';
import { IntegrityType } from '../../types';

export function IntegrityBadge({ type }: { type: IntegrityType }) {
  const ui = INTEGRITY_UI[type];
  return (
    <View style={{ alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 8, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: ui.color }}>
      <Text style={{ color: ui.color, fontWeight: '600', fontSize: 12 }}>{ui.label}</Text>
    </View>
  );
}

import React from 'react';
import { View, Text } from 'react-native';
import { PALETTE, RADIUS } from '../../theme/tokens';

export function StatusPill({ label }: { label: string }) {
  return (
    <View style={{ alignSelf: 'flex-start', flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: PALETTE.steelLine, backgroundColor: PALETTE.graphite }}>
      <Text style={{ color: PALETTE.white, fontWeight: '600', fontSize: 12 }}>{label}</Text>
    </View>
  );
}

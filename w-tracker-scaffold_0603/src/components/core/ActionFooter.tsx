import React from 'react';
import { View } from 'react-native';
import { Button } from './Button';

export function ActionFooter({ primary, secondary }: { primary: string; secondary?: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      {secondary ? <View style={{ flex: 1 }}><Button label={secondary} variant="ghost" fullWidth /></View> : null}
      <View style={{ flex: 1 }}><Button label={primary} variant="primary" fullWidth /></View>
    </View>
  );
}

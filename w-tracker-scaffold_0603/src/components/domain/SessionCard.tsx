import React from 'react';
import { Pressable, View, Text } from 'react-native';
import { Card } from '../core/Card';
import { IntegrityBadge } from '../core/IntegrityBadge';
import { Session } from '../../types';
import { PALETTE } from '../../theme/tokens';

export function SessionCard({ session }: { session: Session }) {
  return (
    <Pressable>
      <Card style={{ marginHorizontal: 24, marginBottom: 14, minHeight: 132 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: PALETTE.secondaryText, fontSize: 12 }}>{session.date}</Text>
          <IntegrityBadge type={session.integrityType} />
        </View>
        <Text style={{ color: PALETTE.white, fontSize: 18, fontWeight: '600', marginTop: 10 }}>{session.destination}</Text>
        <Text style={{ color: PALETTE.secondaryText, marginTop: 6 }}>{session.start} – {session.end}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }}>
          <Text style={{ color: PALETTE.white, fontWeight: '700' }}>{session.totalHours} h</Text>
          <Text style={{ color: PALETTE.mutedGold, fontWeight: '700' }}>${session.totalEarnings}</Text>
        </View>
      </Card>
    </Pressable>
  );
}

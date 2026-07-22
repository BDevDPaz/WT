import React from 'react';
import { SafeAreaView, ScrollView, View, Text } from 'react-native';
import { PALETTE } from '../theme/tokens';
import { OperationalHeroCard } from '../components/domain/OperationalHeroCard';
import { DailySummaryBlock } from '../components/domain/DailySummaryBlock';
import { SystemHealthBlock } from '../components/domain/SystemHealthBlock';
import { SessionTimeline } from '../components/domain/SessionTimeline';

function Header() {
  return (
    <View style={{ marginHorizontal: 24, marginTop: 8, marginBottom: 24, minHeight: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <View>
        <Text style={{ color: PALETTE.white, fontSize: 28, fontWeight: '700' }}>W Tracker</Text>
        <Text style={{ color: PALETTE.secondaryText, fontSize: 11, fontWeight: '600', letterSpacing: 2 }}>Control diario</Text>
      </View>
      <View style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: PALETTE.steelLine, backgroundColor: PALETTE.carbonMist }} />
    </View>
  );
}

export function HoyScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PALETTE.obsidian }}>
      <ScrollView>
        <Header />
        <OperationalHeroCard state="ACTIVA" destination="Cliente principal" />
        <DailySummaryBlock />
        <SystemHealthBlock />
        <SessionTimeline />
      </ScrollView>
    </SafeAreaView>
  );
}

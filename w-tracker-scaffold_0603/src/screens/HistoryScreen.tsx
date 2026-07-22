import React from 'react';
import { SafeAreaView, FlatList, View, Text } from 'react-native';
import { PALETTE } from '../theme/tokens';
import { WeeklySummaryBlock } from '../components/domain/WeeklySummaryBlock';
import { FilterCarousel } from '../components/domain/FilterCarousel';
import { SessionCard } from '../components/domain/SessionCard';
import { sessions } from '../data/mockData';
import { Button } from '../components/core/Button';

function HeaderWithExport() {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 24, marginTop: 8, marginBottom: 20 }}>
      <View>
        <Text style={{ color: PALETTE.white, fontSize: 32, fontWeight: '700' }}>Historial</Text>
        <Text style={{ color: PALETTE.secondaryText, fontSize: 11, letterSpacing: 2 }}>Resumen de sesiones</Text>
      </View>
      <View style={{ width: 120 }}><Button label="Exportar" variant="ghost" fullWidth /></View>
    </View>
  );
}

export function HistoryScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PALETTE.obsidian }}>
      <HeaderWithExport />
      <WeeklySummaryBlock />
      <FilterCarousel />
      <FlatList data={sessions} keyExtractor={(item) => item.id} renderItem={({ item }) => <SessionCard session={item} />} contentContainerStyle={{ paddingBottom: 120 }} />
    </SafeAreaView>
  );
}

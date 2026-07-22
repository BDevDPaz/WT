import React from 'react';
import { SafeAreaView, ScrollView, View, Text } from 'react-native';
import { PALETTE } from '../theme/tokens';
import { FinancialSummaryCard } from '../components/domain/FinancialSummaryCard';
import { DocumentPreviewWidget } from '../components/domain/DocumentPreviewWidget';
import { FinancialBreakdownGrid } from '../components/domain/FinancialBreakdownGrid';
import { ActionStack } from '../components/domain/ActionStack';
import { Card } from '../components/core/Card';

function Header() {
  return (
    <View style={{ marginHorizontal: 24, marginTop: 8, marginBottom: 24 }}>
      <Text style={{ color: PALETTE.white, fontSize: 28, fontWeight: '700' }}>Reportes</Text>
      <Text style={{ color: PALETTE.secondaryText, fontSize: 11, letterSpacing: 2 }}>Resumen semanal</Text>
    </View>
  );
}

function PeriodSelector() {
  return (
    <Card style={{ marginHorizontal: 24, marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: PALETTE.white }}>←</Text>
        <View>
          <Text style={{ color: PALETTE.white, textAlign: 'center', fontWeight: '700' }}>Semana actual</Text>
          <Text style={{ color: PALETTE.secondaryText, textAlign: 'center' }}>May 20 — May 26</Text>
        </View>
        <Text style={{ color: PALETTE.white }}>→</Text>
      </View>
    </Card>
  );
}

export function ReportsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PALETTE.obsidian }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Header />
        <PeriodSelector />
        <FinancialSummaryCard />
        <DocumentPreviewWidget />
        <FinancialBreakdownGrid />
        <ActionStack state="IDLE" />
      </ScrollView>
    </SafeAreaView>
  );
}

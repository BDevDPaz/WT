import React from 'react';
import { SafeAreaView, ScrollView, View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { PALETTE } from '../theme/tokens';
import { ProfileSection, WorkParametersSection, LocationHealthSection, PreferencesSection } from '../components/domain/SettingsSections';
import { SecureBlock } from '../components/domain/SecureBlock';
import { GlobalSaveAction } from '../components/domain/GlobalSaveAction';

function Header() {
  return (
    <View style={{ marginHorizontal: 24, marginTop: 8, marginBottom: 24 }}>
      <Text style={{ color: PALETTE.white, fontSize: 28, fontWeight: '700' }}>Ajustes</Text>
      <Text style={{ color: PALETTE.secondaryText, fontSize: 11, letterSpacing: 2 }}>Configuración y seguridad</Text>
    </View>
  );
}

function SystemFooter() {
  return (
    <View style={{ alignItems: 'center', paddingBottom: 40, opacity: 0.5 }}>
      <Text style={{ color: PALETTE.secondaryText }}>W Tracker</Text>
      <Text style={{ color: PALETTE.secondaryText }}>by BDevDPaz</Text>
      <Text style={{ color: PALETTE.secondaryText }}>Versión 1.0.X</Text>
    </View>
  );
}

export function SettingsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PALETTE.obsidian }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <Header />
          <ProfileSection />
          <WorkParametersSection />
          <LocationHealthSection />
          <PreferencesSection />
          <SecureBlock />
          <SystemFooter />
        </ScrollView>
        <GlobalSaveAction state="dirty" />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

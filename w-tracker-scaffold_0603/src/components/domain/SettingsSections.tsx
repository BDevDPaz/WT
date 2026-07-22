import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Card } from '../core/Card';
import { Button } from '../core/Button';
import { PALETTE } from '../../theme/tokens';

export function ProfileSection() {
  return (
    <Card style={{ marginHorizontal: 24, marginBottom: 16 }}>
      <Text style={{ color: PALETTE.white, fontWeight: '700', marginBottom: 12 }}>Perfil laboral</Text>
      <Field label="Nombre" placeholder="Tu nombre" />
      <Field label="Tarifa por hora" placeholder="$20.00" keyboardType="numeric" />
      <Field label="Correo para reportes" placeholder="tu@correo.com" keyboardType="email-address" />
    </Card>
  );
}

export function WorkParametersSection() {
  return (
    <Card style={{ marginHorizontal: 24, marginBottom: 16 }}>
      <Text style={{ color: PALETTE.white, fontWeight: '700', marginBottom: 12 }}>Parámetros de jornada</Text>
      <Field label="Hora base" placeholder="06:00" />
      <Field label="Multiplicador overtime" placeholder="1.5" keyboardType="numeric" />
      <Field label="Descuento almuerzo (min)" placeholder="30" keyboardType="numeric" />
      <Field label="Radio de zona (m)" placeholder="50" keyboardType="numeric" />
    </Card>
  );
}

export function LocationHealthSection() {
  return (
    <Card style={{ marginHorizontal: 24, marginBottom: 16 }}>
      <Text style={{ color: PALETTE.white, fontWeight: '700', marginBottom: 12 }}>Ubicación y monitoreo</Text>
      <Status label="Permiso de ubicación" value="Activo" color={PALETTE.successGreen} />
      <Status label="Ubicación en segundo plano" value="Activa" color={PALETTE.successGreen} />
      <Status label="Monitoreo de jornada" value="Activo" color={PALETTE.successGreen} />
      <View style={{ marginTop: 12 }}><Button label="Revisar permisos" variant="secondary" fullWidth /></View>
    </Card>
  );
}

export function PreferencesSection() {
  return (
    <Card style={{ marginHorizontal: 24, marginBottom: 16 }}>
      <Text style={{ color: PALETTE.white, fontWeight: '700', marginBottom: 12 }}>Preferencias</Text>
      <Text style={{ color: PALETTE.secondaryText }}>Recordatorio diario, alertas de jornada, reportes listos e idioma se conectan al store de preferencias.</Text>
    </Card>
  );
}

function Field({ label, placeholder, keyboardType }: { label: string; placeholder: string; keyboardType?: 'default' | 'numeric' | 'email-address' }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: PALETTE.secondaryText, marginBottom: 6 }}>{label}</Text>
      <TextInput keyboardType={keyboardType} placeholder={placeholder} placeholderTextColor={PALETTE.mutedText} style={{ backgroundColor: PALETTE.carbonMist, color: PALETTE.white, borderWidth: 1, borderColor: PALETTE.steelLine, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 14 }} />
    </View>
  );
}

function Status({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
      <Text style={{ color: PALETTE.secondaryText }}>{label}</Text>
      <Text style={{ color, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

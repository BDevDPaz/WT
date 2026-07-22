import React from 'react';
import { View } from 'react-native';
import { Button } from '../core/Button';
import { ExporterState } from '../../types';
import { EXPORT_STATE_LABEL } from '../../stateMappings';

export function ActionStack({ state = 'IDLE' as ExporterState }) {
  const loading = state === 'LOADING';
  return (
    <View style={{ marginHorizontal: 24, gap: 12, marginBottom: 20 }}>
      <Button label={EXPORT_STATE_LABEL[state]} variant="primary" fullWidth disabled={loading} loading={loading} />
      <Button label="Compartir" variant="secondary" fullWidth disabled={loading} />
      <Button label="Enviar por correo" variant="secondary" fullWidth disabled={loading} />
      <Button label="Previsualizar" variant="ghost" fullWidth disabled={loading} />
    </View>
  );
}

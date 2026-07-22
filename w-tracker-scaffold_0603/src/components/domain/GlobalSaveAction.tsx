import React from 'react';
import { View } from 'react-native';
import { Button } from '../core/Button';

export function GlobalSaveAction({ state = 'pristine' as 'pristine' | 'dirty' | 'saving' }) {
  const disabled = state !== 'dirty';
  const loading = state === 'saving';
  const label = state === 'saving' ? 'Guardando...' : 'Guardar cambios';
  return (
    <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
      <Button label={label} variant="primary" fullWidth disabled={disabled && !loading} loading={loading} />
    </View>
  );
}

import React from 'react';
import { HoyScreen } from '../screens/HoyScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

// Placeholder para conectar con tu librería de navegación.
export const ROOT_TABS = [
  { name: 'Hoy', component: HoyScreen },
  { name: 'Historial', component: HistoryScreen },
  { name: 'Reportes', component: ReportsScreen },
  { name: 'Ajustes', component: SettingsScreen },
];

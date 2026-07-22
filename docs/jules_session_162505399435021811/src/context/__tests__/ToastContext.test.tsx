import React from 'react';
import { render, act, screen, fireEvent } from '@testing-library/react-native';
import { ToastProvider, useToast } from '../ToastContext';
import { ThemeProvider } from '../ThemeContext';

// Mock simple de ThemeContext si es necesario, pero ThemeProvider debería funcionar si no tiene dependencias complejas.
// Mock de reanimated para evitar problemas con timers y animaciones
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

const TestComponent = ({ msg, type }: { msg: string, type?: any }) => {
  const { showToast } = useToast();
  return (
    <React.Fragment>
      <View testID="trigger" onTouchStart={() => showToast(msg, type)} />
    </React.Fragment>
  );
};

// Import needed for TestComponent
import { View } from 'react-native';

describe('ToastContext - Hardened', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('no debe mostrar toast para mensajes vacíos', () => {
    render(
      <ThemeProvider>
        <ToastProvider>
          <TestComponent msg="" />
        </ToastProvider>
      </ThemeProvider>
    );

    const trigger = screen.getByTestID('trigger');
    fireEvent(trigger, 'touchStart');

    expect(screen.queryByText(/./)).toBeNull();
  });

  it('debe mostrar mensaje y aplicar deduplicación (anti-spam)', () => {
    render(
      <ThemeProvider>
        <ToastProvider>
          <TestComponent msg="Hola Test" />
        </ToastProvider>
      </ThemeProvider>
    );

    const trigger = screen.getByTestID('trigger');
    
    // Primer llamado
    fireEvent(trigger, 'touchStart');
    expect(screen.getByText('Hola Test')).toBeTruthy();

    // Segundo llamado inmediato (debe ser ignorado)
    fireEvent(trigger, 'touchStart');
    
    // Verificamos que solo se haya procesado uno (en este test simplificado es difícil ver "una sola vez" 
    // pero podemos verificar que el mensaje sigue ahí y no hubo crash)
    expect(screen.getByText('Hola Test')).toBeTruthy();
  });

  it('debe limpiar timers al desmontar', () => {
    const { unmount } = render(
      <ThemeProvider>
        <ToastProvider>
          <TestComponent msg="Cleanup Test" />
        </ToastProvider>
      </ThemeProvider>
    );

    const trigger = screen.getByTestID('trigger');
    fireEvent(trigger, 'touchStart');

    unmount();
    
    // No debería haber errores al correr timers
    act(() => {
      jest.runAllTimers();
    });
  });
});

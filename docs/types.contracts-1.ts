import { WorkSession, AppSettings, CheckoutSource } from '../../types';

export { WorkSession, AppSettings, CheckoutSource };

export interface EngineState {
  activeSession: WorkSession | null;
  settings: AppSettings | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;
}

export type StopSessionRequestEvent = {
  type: 'STOP_SESSION_REQUEST';
  lunchMinutes: number;
  checkoutSource: CheckoutSource;
};

export type EngineEvent =
  | { type: 'APP_INIT' }
  | { type: 'DATA_LOADED'; state: Partial<EngineState> }
  | { type: 'START_SESSION_REQUEST'; address: string; client: string; notes: string }
  | StopSessionRequestEvent
  | { type: 'SETTINGS_UPDATE_REQUEST'; settings: AppSettings }
  | { type: 'ERROR_OCCURRED'; error: string }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'BACKGROUND_SESSION_TIMEOUT'; checkoutSource?: 'failsafe' }
  | { type: 'SYNC_ACTIVE_SESSION' }; // New event for targeted re-sync

export interface EngineEffect {
  run: (event: EngineEvent, state: EngineState, dispatch: (event: EngineEvent) => void) => Promise<void>;
}

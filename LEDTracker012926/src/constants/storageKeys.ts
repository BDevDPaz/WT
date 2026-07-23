// src/constants/storageKeys.ts
// Single source of truth for all AsyncStorage keys used across the app.

export const STORAGE_KEYS = {
  /** Timestamp (ms) of the most recent geofence exit event. Used by the Auto-Checkout failsafe timer. */
  LAST_GEOFENCE_EXIT_AT: 'lastGeofenceExitAt',

  /** Timestamp (ms) of the last time the user explicitly responded to an exit notification. */
  LAST_USER_DECISION_AT: 'lastUserDecisionAt',

  /** Week ID string (e.g. "2026-W03") of the last week for which a report was auto-generated. */
  LAST_REPORT_WEEK_ID: 'LAST_REPORT_WEEK_ID',
} as const;

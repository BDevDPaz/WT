# Project Units Comparison

Comparison of every detected package.json project unit.

| Project root | Classification | Package name | Version | Files | Dirs | Tests | TS | JS | Has gm | Has typecheck | Has test | Key features |
|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| GEOTrack_Trial_and_Trace_REPO | modern-core-app | w-tracker | 1.0.0 | 125 | 36 | 21 | 107 | 4 | yes | yes | yes | tabs, session, core, db, services, audit, image-scripts |
| LEDTracker (1) | legacy-expo-app | ledtracker | 1.0.0 | 33 | 12 | 0 | 24 | 1 |  |  |  | tabs, db, services |
| LEDTracker | legacy-expo-app | ledtracker | 1.0.0 | 51 | 17 | 0 | 34 | 2 |  |  |  | tabs, db, services |
| LEDTracker012926 | legacy-expo-app | ledtracker | 1.0.0 | 36 | 13 | 4 | 26 | 1 |  |  | yes | tabs, db, services |
| LEDTracker012926_202100 | legacy-expo-app | ledtracker | 1.0.0 | 36 | 13 | 4 | 26 | 1 |  |  | yes | tabs, db, services |
| LEDTracker012926_2242 | legacy-expo-app | ledtracker | 1.0.0 | 36 | 13 | 4 | 26 | 1 |  |  | yes | tabs, db, services |
| LEDTracker020326 | legacy-expo-app | ledtracker | 1.0.0 | 36 | 13 | 4 | 26 | 1 |  |  | yes | tabs, db, services |
| LEDTracker020326_Actualizada | legacy-expo-app | ledtracker | 1.0.0 | 36 | 13 | 4 | 26 | 1 |  |  | yes | tabs, db, services |
| LEDTracker020326_Actualizada_Final | legacy-expo-app | ledtracker | 1.0.0 | 36 | 13 | 4 | 26 | 1 |  |  | yes | tabs, db, services |
| LEDTrackerAprpoved_270126_215800 | legacy-expo-app | ledtracker | 1.0.0 | 33 | 12 | 0 | 24 | 1 |  |  |  | tabs, db, services |
| LEDTracker_REPO/LEDTracker | engine-audit-app | wtracker | 1.0.0 | 103 | 36 | 19 | 86 | 5 | yes | yes | yes | tabs, engine, runtime, db, services, audit, image-scripts |
| LEDTracker_REPO | legacy-expo-app | ledtracker | 1.0.0 | 132 | 49 | 19 | 110 | 6 |  |  |  | tabs, db, services |
| LEDTracker_V2 | legacy-expo-app | ledtracker | 1.0.0 | 19 | 9 | 0 | 15 | 0 |  |  |  | tabs, db, services |
| LEDTracker_V2_Aprovada | legacy-expo-app | ledtracker | 1.0.0 | 30 | 11 | 0 | 16 | 0 |  |  |  | tabs, db, services |
| LEDTracker_clean_REPO | engine-audit-app | wtracker | 1.0.0 | 84 | 31 | 9 | 68 | 6 | yes | yes | yes | tabs, engine, runtime, db, services, audit, image-scripts |
| LEDTrackerv2_2 | legacy-expo-app | ledtracker | 1.0.0 | 62 | 20 | 5 | 47 | 4 | yes | yes | yes | tabs, db, services, audit |
| LED_Tracker | legacy-expo-app | ledtracker | 1.0.0 | 17 | 13 | 1 | 11 | 1 |  |  | yes | tabs, db, services |
| WORK Tracker_02102026 | legacy-expo-app | ledtracker | 1.0.0 | 53 | 25 | 0 | 23 | 1 |  |  | yes | tabs, db, services, ios |
| WTracker (1) | legacy-expo-app | ledtracker | 1.0.0 | 19 | 12 | 0 | 13 | 1 |  |  |  | tabs, db, services |
| WTracker_F | package-project | wtracker | 2.1.0 | 34 | 9 | 0 | 28 | 2 |  |  |  | tabs, session |
| WTracker_REPO | core-architecture-app | w-tracker | 1.0.0 | 69 | 26 | 5 | 61 | 3 | yes | yes | yes | tabs, session, core, db, services |
| WTrackerv_0608 | core-architecture-app | w-tracker | 1.0.0 | 69 | 26 | 5 | 60 | 0 | yes | yes | yes | tabs, session, core, db, services, docs |
| W_Tracker_0601 | legacy-expo-app | w-tracker | 1.0.0 | 69 | 24 | 5 | 47 | 4 | yes | yes | yes | tabs, db, services, audit, image-scripts |
| WorkTrack1_0_APK | early-expo-app | leonstrack | 1.0.0 | 40 | 8 | 0 | 3 | 11 |  |  |  | db, services |
| docs/jules_session_12566545746299858777 | legacy-expo-app | wtracker | 1.0.0 | 9 | 5 | 0 | 6 | 0 | yes | yes | yes | tabs, db, services |
| leonsTrack_ | early-expo-app | leonstrack | 1.0.0 | 41 | 8 | 0 | 3 | 11 |  |  |  | db, services |

## Notes

- This report treats every package.json as a separate project unit.
- Nested project units must be reviewed before deleting, merging, or flattening folders.
- This is structural only. Runtime validation requires installing dependencies and running scripts.

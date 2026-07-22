# Hash Diff Analysis

Content-hash and relative-path comparison for preserved root folders and nested package units.

## Scope

- Units analyzed: 28
- Duplicate content groups across units: 221
- Excluded generated/local folders: `.git`, `.github`, `node_modules`, `.expo`, `.expo-shared`, `coverage`, `dist`, `build`, `web-build`, `.cache`, `tmp`, `temp`.
- Excluded local/sensitive files: `.env`, `.env.local`, `.env.production`, `.env.development`, `*.log`, `*.tsbuildinfo`.
- Nested package roots are treated as separate units and skipped from their parent unit comparison.

## Unit Inventory

| Unit | Kind | Package | Files | Bytes |
|---|---:|---:|---:|---:|
| docs | root-folder |  | 151 | 10856173 |
| docs/jules_session_12566545746299858777 | nested-package | yes | 9 | 727820 |
| GEOTrack_Trial_and_Trace_REPO | root-folder | yes | 125 | 1228194 |
| LED_Tracker | root-folder | yes | 17 | 687350 |
| LEDTracker | root-folder | yes | 51 | 4070223 |
| LEDTracker (1) | root-folder | yes | 33 | 3684897 |
| LEDTracker_clean_REPO | root-folder | yes | 84 | 976629 |
| LEDTracker_REPO | root-folder | yes | 29 | 115825 |
| LEDTracker_REPO/LEDTracker | nested-package | yes | 103 | 1116307 |
| LEDTracker_V2 | root-folder | yes | 19 | 52877 |
| LEDTracker_V2_Aprovada | root-folder | yes | 30 | 1090403 |
| LEDTracker012926 | root-folder | yes | 36 | 4010031 |
| LEDTracker012926_202100 | root-folder | yes | 36 | 4010031 |
| LEDTracker012926_2242 | root-folder | yes | 36 | 4012643 |
| LEDTracker020326 | root-folder | yes | 36 | 4015933 |
| LEDTracker020326_Actualizada | root-folder | yes | 36 | 4018317 |
| LEDTracker020326_Actualizada_Final | root-folder | yes | 36 | 4022204 |
| LEDTrackerAprpoved_270126_215800 | root-folder | yes | 33 | 3684897 |
| LEDTrackerv2_2 | root-folder | yes | 61 | 4103891 |
| leonsTrack_ | root-folder | yes | 41 | 1128120 |
| W_Tracker_0601 | root-folder | yes | 68 | 2102601 |
| w-tracker-scaffold_0603 | root-folder |  | 29 | 31746 |
| WORK Tracker_02102026 | root-folder | yes | 53 | 12896231 |
| WorkTrack1_0_APK | root-folder | yes | 40 | 643701 |
| WTracker (1) | root-folder | yes | 19 | 578375 |
| WTracker_F | root-folder | yes | 34 | 144722 |
| WTracker_REPO | root-folder | yes | 69 | 279264 |
| WTrackerv_0608 | root-folder | yes | 69 | 1532740 |

## Exact Duplicate Unit Pairs

| A | B | Files |
|---|---|---:|
| LEDTracker (1) | LEDTrackerAprpoved_270126_215800 | 33 |
| LEDTracker012926 | LEDTracker012926_202100 | 36 |

## Closest Non-Exact Pairs

| A | B | Same path+hash | Path similarity | Content similarity | Changed same-path files | Only in A | Only in B |
|---|---|---:|---:|---:|---:|---:|---:|
| leonsTrack_ | WorkTrack1_0_APK | 97.6% | 97.6% | 95.8% | 0 | 1 | 0 |
| LEDTracker012926 | LEDTracker012926_2242 | 89.5% | 100.0% | 88.9% | 2 | 0 | 0 |
| LEDTracker012926_202100 | LEDTracker012926_2242 | 89.5% | 100.0% | 88.9% | 2 | 0 | 0 |
| LEDTracker (1) | LEDTracker_REPO | 87.9% | 87.9% | 90.6% | 0 | 4 | 0 |
| LEDTracker_REPO | LEDTrackerAprpoved_270126_215800 | 87.9% | 87.9% | 90.6% | 0 | 0 | 4 |
| WTracker_REPO | WTrackerv_0608 | 81.6% | 84.0% | 84.0% | 1 | 6 | 6 |
| LEDTracker012926 | LEDTracker020326 | 80.0% | 100.0% | 78.9% | 4 | 0 | 0 |
| LEDTracker012926_202100 | LEDTracker020326 | 80.0% | 100.0% | 78.9% | 4 | 0 | 0 |
| LEDTracker012926_2242 | LEDTracker020326 | 80.0% | 100.0% | 78.9% | 4 | 0 | 0 |
| LEDTracker020326_Actualizada | LEDTracker020326_Actualizada_Final | 80.0% | 100.0% | 78.9% | 4 | 0 | 0 |
| LEDTracker020326 | LEDTracker020326_Actualizada | 75.6% | 100.0% | 74.4% | 5 | 0 | 0 |
| LEDTrackerv2_2 | W_Tracker_0601 | 72.0% | 87.0% | 74.0% | 6 | 1 | 8 |
| LEDTracker020326 | LEDTracker020326_Actualizada_Final | 71.4% | 100.0% | 70.0% | 6 | 0 | 0 |
| LEDTracker012926 | LEDTracker020326_Actualizada | 63.6% | 100.0% | 61.9% | 8 | 0 | 0 |
| LEDTracker012926 | LEDTracker020326_Actualizada_Final | 63.6% | 100.0% | 61.9% | 8 | 0 | 0 |
| LEDTracker012926_202100 | LEDTracker020326_Actualizada | 63.6% | 100.0% | 61.9% | 8 | 0 | 0 |
| LEDTracker012926_202100 | LEDTracker020326_Actualizada_Final | 63.6% | 100.0% | 61.9% | 8 | 0 | 0 |
| LEDTracker012926_2242 | LEDTracker020326_Actualizada | 63.6% | 100.0% | 61.9% | 8 | 0 | 0 |
| LEDTracker012926_2242 | LEDTracker020326_Actualizada_Final | 63.6% | 100.0% | 61.9% | 8 | 0 | 0 |
| LEDTracker_REPO | WTracker (1) | 50.0% | 60.0% | 50.0% | 2 | 11 | 1 |
| LEDTracker_clean_REPO | LEDTracker_REPO/LEDTracker | 35.5% | 74.8% | 35.5% | 31 | 4 | 23 |
| LEDTracker (1) | LEDTracker012926 | 30.2% | 76.9% | 29.4% | 14 | 3 | 6 |
| LEDTracker (1) | LEDTracker012926_202100 | 30.2% | 76.9% | 29.4% | 14 | 3 | 6 |
| LEDTracker (1) | LEDTracker012926_2242 | 30.2% | 76.9% | 29.4% | 14 | 3 | 6 |
| LEDTracker (1) | LEDTracker020326 | 30.2% | 76.9% | 29.4% | 14 | 3 | 6 |
| LEDTracker (1) | LEDTracker020326_Actualizada | 30.2% | 76.9% | 29.4% | 14 | 3 | 6 |
| LEDTracker (1) | LEDTracker020326_Actualizada_Final | 30.2% | 76.9% | 29.4% | 14 | 3 | 6 |
| LEDTracker012926 | LEDTrackerAprpoved_270126_215800 | 30.2% | 76.9% | 29.4% | 14 | 6 | 3 |
| LEDTracker012926_202100 | LEDTrackerAprpoved_270126_215800 | 30.2% | 76.9% | 29.4% | 14 | 6 | 3 |
| LEDTracker012926_2242 | LEDTrackerAprpoved_270126_215800 | 30.2% | 76.9% | 29.4% | 14 | 6 | 3 |
| LEDTracker020326 | LEDTrackerAprpoved_270126_215800 | 30.2% | 76.9% | 29.4% | 14 | 6 | 3 |
| LEDTracker020326_Actualizada | LEDTrackerAprpoved_270126_215800 | 30.2% | 76.9% | 29.4% | 14 | 6 | 3 |
| LEDTracker020326_Actualizada_Final | LEDTrackerAprpoved_270126_215800 | 30.2% | 76.9% | 29.4% | 14 | 6 | 3 |
| LED_Tracker | WTracker (1) | 24.1% | 89.5% | 24.1% | 10 | 0 | 2 |

## Unique Files By Unit

| Unit | Unique files | Total files | Unique ratio |
|---|---:|---:|---:|
| w-tracker-scaffold_0603 | 29 | 29 | 100.0% |
| docs/jules_session_12566545746299858777 | 9 | 9 | 100.0% |
| docs | 136 | 151 | 90.1% |
| GEOTrack_Trial_and_Trace_REPO | 104 | 125 | 83.2% |
| WORK Tracker_02102026 | 28 | 53 | 52.8% |
| LEDTracker_V2 | 10 | 19 | 52.6% |
| LEDTracker_REPO/LEDTracker | 53 | 103 | 51.5% |
| LEDTracker | 25 | 51 | 49.0% |
| LEDTracker_clean_REPO | 35 | 84 | 41.7% |
| WTracker_F | 13 | 34 | 38.2% |
| LEDTracker_V2_Aprovada | 10 | 30 | 33.3% |
| WTracker (1) | 3 | 19 | 15.8% |
| LEDTracker020326_Actualizada_Final | 4 | 36 | 11.1% |
| W_Tracker_0601 | 6 | 68 | 8.8% |
| LEDTracker020326_Actualizada | 3 | 36 | 8.3% |
| WTracker_REPO | 5 | 69 | 7.2% |
| LED_Tracker | 1 | 17 | 5.9% |
| LEDTracker012926_2242 | 2 | 36 | 5.6% |
| LEDTrackerv2_2 | 3 | 61 | 4.9% |
| LEDTracker020326 | 1 | 36 | 2.8% |
| leonsTrack_ | 1 | 41 | 2.4% |
| WTrackerv_0608 | 1 | 69 | 1.4% |
| LEDTracker (1) | 0 | 33 | 0.0% |
| LEDTracker_REPO | 0 | 29 | 0.0% |
| LEDTracker012926 | 0 | 36 | 0.0% |
| LEDTracker012926_202100 | 0 | 36 | 0.0% |
| LEDTrackerAprpoved_270126_215800 | 0 | 33 | 0.0% |
| WorkTrack1_0_APK | 0 | 40 | 0.0% |

## Largest Duplicate Content Groups

| Hash prefix | Size | Occurrences | Units | Example paths |
|---|---:|---:|---:|---|
| `eb73f209eae3` | 2937387 | 11 | 11 | LEDTracker/assets/images/splash.png<br>LEDTracker (1)/assets/images/splash.png<br>LEDTracker012926/assets/images/splash.png<br>LEDTracker012926_202100/assets/images/splash.png<br>LEDTracker012926_2242/assets/images/splash.png<br>LEDTracker020326/assets/images/splash.png |
| `4da62a8f4265` | 514406 | 2 | 2 | W_Tracker_0601/assets/images/splash-icon.png<br>WTrackerv_0608/assets/images/splash-icon.png |
| `8ab2dc1d478a` | 315278 | 34 | 12 | LEDTracker/assets/images/android-icon-foreground.png<br>LEDTracker/assets/images/icon.png<br>LEDTracker/assets/images/splash-icon.png<br>LEDTracker (1)/assets/images/icon.png<br>LEDTracker (1)/assets/images/splash-icon.png<br>LEDTracker_V2_Aprovada/assets/images/android-icon-foreground.png |
| `f011a60e2beb` | 288779 | 2 | 2 | W_Tracker_0601/assets/images/adaptive-icon.png<br>WTrackerv_0608/assets/images/adaptive-icon.png |
| `919639c79db6` | 236836 | 2 | 2 | W_Tracker_0601/assets/images/splash.png<br>WTrackerv_0608/assets/images/splash.png |
| `ac3682f71ae0` | 184730 | 2 | 2 | W_Tracker_0601/assets/images/icon.png<br>WTrackerv_0608/assets/images/icon.png |
| `78db43e95187` | 34625 | 28 | 2 | leonsTrack_/assets/adaptive-icon.png<br>leonsTrack_/assets/android-icon-background.png<br>leonsTrack_/assets/android-icon-foreground.png<br>leonsTrack_/assets/android-icon-monochrome.png<br>leonsTrack_/assets/favicon.png<br>leonsTrack_/assets/icon.png |
| `6f2dc19054f6` | 23133 | 2 | 2 | LEDTrackerv2_2/app/(tabs)/index.tsx<br>W_Tracker_0601/app/(tabs)/index.tsx |
| `cd84e02a5d54` | 21252 | 6 | 4 | LEDTracker/assets/images/react-logo@3x.png<br>LEDTracker_V2_Aprovada/assets/images/react-logo@3x.png<br>leonsTrack_/assets/images/react-logo@3x.png<br>leonsTrack_/assets/react-logo@3x.png<br>WorkTrack1_0_APK/assets/images/react-logo@3x.png<br>WorkTrack1_0_APK/assets/react-logo@3x.png |
| `1e77f30e8832` | 18545 | 5 | 5 | LED_Tracker/app/(tabs)/index.tsx<br>LEDTracker012926/app/(tabs)/index.tsx<br>LEDTracker012926_202100/app/(tabs)/index.tsx<br>LEDTracker012926_2242/app/(tabs)/index.tsx<br>LEDTracker020326/app/(tabs)/index.tsx |
| `fb139c2dee36` | 17549 | 2 | 2 | LEDTracker/assets/images/android-icon-background.png<br>LEDTracker_V2_Aprovada/assets/images/android-icon-background.png |
| `205932a03518` | 16537 | 4 | 4 | LEDTracker (1)/app/(tabs)/index.tsx<br>LEDTracker_REPO/app/(tabs)/index.tsx<br>LEDTrackerAprpoved_270126_215800/app/(tabs)/index.tsx<br>WTracker (1)/app/(tabs)/index.tsx |
| `9c13daa38d66` | 14757 | 2 | 2 | WTracker_REPO/app/(tabs)/settings.tsx<br>WTrackerv_0608/app/(tabs)/settings.tsx |
| `fa600be9ad2f` | 14225 | 6 | 4 | LEDTracker/assets/images/react-logo@2x.png<br>LEDTracker_V2_Aprovada/assets/images/react-logo@2x.png<br>leonsTrack_/assets/images/react-logo@2x.png<br>leonsTrack_/assets/react-logo@2x.png<br>WorkTrack1_0_APK/assets/images/react-logo@2x.png<br>WorkTrack1_0_APK/assets/react-logo@2x.png |
| `11bee12aeeed` | 14113 | 2 | 2 | LEDTracker020326_Actualizada/app/(tabs)/settings.tsx<br>LEDTracker020326_Actualizada_Final/app/(tabs)/settings.tsx |
| `333b1a423459` | 12798 | 2 | 2 | LEDTrackerv2_2/app/(tabs)/settings.tsx<br>W_Tracker_0601/app/(tabs)/settings.tsx |
| `4384c389666d` | 12575 | 2 | 2 | LEDTrackerv2_2/app/(tabs)/history.tsx<br>W_Tracker_0601/app/(tabs)/history.tsx |
| `077445d5c3aa` | 12513 | 2 | 2 | docs/jules_session_16201328843435181280/src/services/ReportGenerator.ts<br>GEOTrack_Trial_and_Trace_REPO/src/services/ReportGenerator.ts |
| `cb1e2bdfa350` | 12459 | 5 | 5 | LEDTracker012926/src/services/ReportGenerator.ts<br>LEDTracker012926_202100/src/services/ReportGenerator.ts<br>LEDTracker012926_2242/src/services/ReportGenerator.ts<br>LEDTracker020326/src/services/ReportGenerator.ts<br>WORK Tracker_02102026/src/services/ReportGenerator.ts |
| `48e4c4b552e9` | 12333 | 4 | 4 | LEDTrackerv2_2/src/services/ReportGenerator.ts<br>W_Tracker_0601/src/services/ReportGenerator.ts<br>WTracker_REPO/src/services/ReportGenerator.ts<br>WTrackerv_0608/src/services/ReportGenerator.ts |
| `916792938a16` | 12038 | 5 | 5 | LEDTracker/app/(tabs)/settings.tsx<br>LEDTracker (1)/app/(tabs)/settings.tsx<br>LEDTracker_REPO/app/(tabs)/settings.tsx<br>LEDTrackerAprpoved_270126_215800/app/(tabs)/settings.tsx<br>WTracker (1)/app/(tabs)/settings.tsx |
| `4c06c03c5dea` | 12038 | 2 | 2 | WTracker_REPO/app/session/[id].tsx<br>WTrackerv_0608/app/session/[id].tsx |
| `3e27c0c976c5` | 12037 | 5 | 5 | LED_Tracker/app/(tabs)/settings.tsx<br>LEDTracker012926/app/(tabs)/settings.tsx<br>LEDTracker012926_202100/app/(tabs)/settings.tsx<br>LEDTracker012926_2242/app/(tabs)/settings.tsx<br>WORK Tracker_02102026/app/(tabs)/settings.tsx |
| `c7bbf4b7cbda` | 11795 | 2 | 2 | leonsTrack_/src/components/HistoryModal.js<br>WorkTrack1_0_APK/src/components/HistoryModal.js |
| `0139401be949` | 11663 | 2 | 2 | LEDTrackerv2_2/src/context/LuxuryUIContext.tsx<br>W_Tracker_0601/src/context/LuxuryUIContext.tsx |
| `048b7aacbf59` | 11425 | 4 | 4 | LEDTrackerv2_2/src/database/db.ts<br>W_Tracker_0601/src/database/db.ts<br>WTracker_REPO/src/database/db.ts<br>WTrackerv_0608/src/database/db.ts |
| `50ac97c1fb00` | 11153 | 6 | 6 | LED_Tracker/app/(tabs)/history.tsx<br>LEDTracker012926/app/(tabs)/history.tsx<br>LEDTracker012926_202100/app/(tabs)/history.tsx<br>LEDTracker012926_2242/app/(tabs)/history.tsx<br>LEDTracker020326/app/(tabs)/history.tsx<br>WORK Tracker_02102026/app/(tabs)/history.tsx |
| `64ed07c42187` | 11037 | 5 | 5 | LEDTracker/app/(tabs)/history.tsx<br>LEDTracker (1)/app/(tabs)/history.tsx<br>LEDTracker_REPO/app/(tabs)/history.tsx<br>LEDTrackerAprpoved_270126_215800/app/(tabs)/history.tsx<br>WTracker (1)/app/(tabs)/history.tsx |
| `612a5becb880` | 10591 | 2 | 2 | docs/jules_session_16201328843435181280/src/core/runtime/reportsAdapter.ts<br>GEOTrack_Trial_and_Trace_REPO/src/core/runtime/reportsAdapter.ts |
| `b6b5df91efe7` | 10316 | 2 | 2 | WTracker_REPO/src/core/runtime/reportsAdapter.ts<br>WTrackerv_0608/src/core/runtime/reportsAdapter.ts |
| `8314b92d02ef` | 9861 | 2 | 2 | WTracker_REPO/app/(tabs)/report.tsx<br>WTrackerv_0608/app/(tabs)/report.tsx |
| `6933f57cf2f4` | 9569 | 2 | 2 | leonsTrack_/app/index.tsx<br>WorkTrack1_0_APK/app/index.tsx |
| `ff9d09a47a7b` | 9471 | 4 | 4 | LEDTrackerv2_2/src/feedback/logBridge.ts<br>W_Tracker_0601/src/feedback/logBridge.ts<br>WTracker_REPO/src/feedback/logBridge.ts<br>WTrackerv_0608/src/feedback/logBridge.ts |
| `232d0aa735cc` | 9037 | 3 | 3 | WTracker_F/src/components/modals/EditSessionModal.tsx<br>WTracker_REPO/src/components/modals/EditSessionModal.tsx<br>WTrackerv_0608/src/components/modals/EditSessionModal.tsx |
| `a778a04cdea6` | 8873 | 2 | 2 | WTracker_REPO/src/core/contracts/types.ts<br>WTrackerv_0608/src/core/contracts/types.ts |
| `24e02040888e` | 8829 | 2 | 2 | docs/jules_session_16201328843435181280/src/core/__tests__/effects.test.ts<br>GEOTrack_Trial_and_Trace_REPO/src/core/__tests__/effects.test.ts |
| `31801d555282` | 8754 | 2 | 2 | docs/jules_session_16201328843435181280/app/(tabs)/history.tsx<br>GEOTrack_Trial_and_Trace_REPO/app/(tabs)/history.tsx |
| `dc25d57efa1e` | 8452 | 2 | 2 | leonsTrack_/src/services/ReportGenerator.js<br>WorkTrack1_0_APK/src/services/ReportGenerator.js |
| `5261d821d964` | 8113 | 2 | 2 | LEDTracker020326_Actualizada/src/utils/i18n.ts<br>LEDTracker020326_Actualizada_Final/src/utils/i18n.ts |
| `dc9cd718c54d` | 7912 | 2 | 2 | WTracker_REPO/app/(tabs)/history.tsx<br>WTrackerv_0608/app/(tabs)/history.tsx |
| `e508cf187628` | 7869 | 3 | 3 | LEDTracker (1)/src/services/ReportGenerator.ts<br>LEDTracker_REPO/src/services/ReportGenerator.ts<br>LEDTrackerAprpoved_270126_215800/src/services/ReportGenerator.ts |
| `9c64f4c0ac46` | 7698 | 4 | 4 | LEDTrackerv2_2/src/services/BackgroundTasks.ts<br>W_Tracker_0601/src/services/BackgroundTasks.ts<br>WTracker_REPO/src/services/BackgroundTasks.ts<br>WTrackerv_0608/src/services/BackgroundTasks.ts |
| `f51cd5ca72ba` | 7617 | 2 | 2 | WTracker_REPO/app/(tabs)/index.tsx<br>WTrackerv_0608/app/(tabs)/index.tsx |
| `b818fee6adb1` | 7475 | 9 | 9 | LEDTracker012926/src/utils/i18n.ts<br>LEDTracker012926_202100/src/utils/i18n.ts<br>LEDTracker012926_2242/src/utils/i18n.ts<br>LEDTracker020326/src/utils/i18n.ts<br>LEDTrackerv2_2/src/utils/i18n.ts<br>W_Tracker_0601/src/utils/i18n.ts |
| `0d0646309635` | 7387 | 2 | 2 | docs/jules_session_16201328843435181280/src/utils/i18n.ts<br>GEOTrack_Trial_and_Trace_REPO/src/utils/i18n.ts |
| `d09b0b36f577` | 7115 | 2 | 2 | LEDTracker020326/src/database/db.ts<br>LEDTracker020326_Actualizada/src/database/db.ts |
| `8ec1bdb7a002` | 7068 | 4 | 4 | LEDTracker/src/database/db.ts<br>LEDTracker (1)/src/database/db.ts<br>LEDTracker_REPO/src/database/db.ts<br>LEDTrackerAprpoved_270126_215800/src/database/db.ts |
| `edf1b2deb5a7` | 6542 | 3 | 3 | WTracker_F/src/components/ui/OperationalHeroCard.tsx<br>WTracker_REPO/src/components/ui/OperationalHeroCard.tsx<br>WTrackerv_0608/src/components/ui/OperationalHeroCard.tsx |
| `44d6695655ac` | 6371 | 3 | 3 | LEDTracker020326/src/services/BackgroundTasks.ts<br>LEDTracker020326_Actualizada/src/services/BackgroundTasks.ts<br>LEDTracker020326_Actualizada_Final/src/services/BackgroundTasks.ts |
| `224b7636b15e` | 6341 | 6 | 4 | LEDTracker/assets/images/react-logo.png<br>LEDTracker_V2_Aprovada/assets/images/react-logo.png<br>leonsTrack_/assets/images/react-logo.png<br>leonsTrack_/assets/react-logo.png<br>WorkTrack1_0_APK/assets/images/react-logo.png<br>WorkTrack1_0_APK/assets/react-logo.png |

## Notes

- `Same path+hash` means files match at the same relative path with identical content.
- `Path similarity` means the two units share relative file paths, regardless of content.
- `Content similarity` means the two units share file content hashes, regardless of path.
- A high path similarity with many changed same-path files suggests a fork/snapshot rather than an exact clone.
- A high content similarity with lower path similarity suggests files were moved or reorganized.

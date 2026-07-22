# Version Classification

Official classification matrix for preserved project units in this repository.

## Classification Rules

- `baseline-candidate`: structurally strong project with `gm`, `typecheck`, and `test` scripts.
- `architecture-candidate`: structurally strong project, but executable validation is still required.
- `legacy-validated-candidate`: older Expo app with validation scripts available.
- `legacy-snapshot`: historical Expo snapshot, usually not baseline material unless unique logic is found.
- `duplicate-exact`: exact duplicate by relative path and content hash.
- `ui-donor`: useful for interface or UX migration, not a baseline by itself.
- `frontend-scaffold`: standalone frontend scaffold or design system reference.
- `documentation-or-patch-unit`: docs, Jules sessions, patches, or partial evidence.
- `early-historical-version`: early app generation, useful for traceability.

## Official Matrix

| Unit | Official type | Priority | Structural class | gm | typecheck | test | Tests | Unique ratio | Closest unit | Same path+hash | Relation | Recommended action |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|---|
| GEOTrack_Trial_and_Trace_REPO | baseline-candidate | high | modern-core-app | yes | yes | yes | 21 | 83.2% | WTracker_REPO | 1.0% | Closest to WTracker_REPO | Run executable validation: npm install, typecheck, lint, test, gm, audit. Candidate for baseline only after passing. |
| LEDTracker_clean_REPO | baseline-candidate | high | engine-audit-app | yes | yes | yes | 9 | 41.7% | LEDTracker_REPO/LEDTracker | 35.5% | Closest to LEDTracker_REPO/LEDTracker | Run executable validation: npm install, typecheck, lint, test, gm, audit. Candidate for baseline only after passing. |
| LEDTracker_REPO/LEDTracker | baseline-candidate | high | engine-audit-app | yes | yes | yes | 19 | 51.5% | LEDTracker_clean_REPO | 35.5% | Closest to LEDTracker_clean_REPO | Run executable validation: npm install, typecheck, lint, test, gm, audit. Candidate for baseline only after passing. |
| WTracker_REPO | baseline-candidate | high | core-architecture-app | yes | yes | yes | 5 | 7.2% | WTrackerv_0608 | 81.6% | Closest to WTrackerv_0608 | Run executable validation: npm install, typecheck, lint, test, gm, audit. Candidate for baseline only after passing. |
| WTrackerv_0608 | baseline-candidate | high | core-architecture-app | yes | yes | yes | 5 | 1.4% | WTracker_REPO | 81.6% | Closest to WTracker_REPO | Run executable validation: npm install, typecheck, lint, test, gm, audit. Candidate for baseline only after passing. |
| LEDTrackerv2_2 | legacy-validated-candidate | medium | legacy-expo-app | yes | yes | yes | 5 | 4.9% | W_Tracker_0601 | 72.0% | Closest to W_Tracker_0601 | Run executable validation and compare with modern candidates. Preserve as possible donor or fallback baseline. |
| W_Tracker_0601 | legacy-validated-candidate | medium | legacy-expo-app | yes | yes | yes | 5 | 8.8% | LEDTrackerv2_2 | 72.0% | Closest to LEDTrackerv2_2 | Run executable validation and compare with modern candidates. Preserve as possible donor or fallback baseline. |
| WTracker_F | ui-donor | medium | package-project |  |  |  | 0 | 38.2% | WTracker_REPO | 25.6% | Closest to WTracker_REPO | Review as UX/UI donor, especially session and report screens. Do not use as baseline without services/database validation. |
| docs/jules_session_12566545746299858777 | documentation-or-patch-unit | low | legacy-expo-app | yes | yes | yes | 0 | 100.0% | LEDTracker_V2 | 0.0% | Closest to LEDTracker_V2 | Preserve as documentation, patch evidence, or session artifact. Do not use as baseline app. |
| LEDTracker (1) | duplicate-exact | low | legacy-expo-app |  |  |  | 0 | 0.0% | LEDTrackerAprpoved_270126_215800 | 100.0% | Exact duplicate of LEDTrackerAprpoved_270126_215800 | Preserve as historical duplicate. Do not merge or delete until human review confirms identity and purpose. |
| LEDTracker012926 | duplicate-exact | low | legacy-expo-app |  |  | yes | 4 | 0.0% | LEDTracker012926_202100 | 100.0% | Exact duplicate of LEDTracker012926_202100 | Preserve as historical duplicate. Do not merge or delete until human review confirms identity and purpose. |
| LEDTracker012926_202100 | duplicate-exact | low | legacy-expo-app |  |  | yes | 4 | 0.0% | LEDTracker012926 | 100.0% | Exact duplicate of LEDTracker012926 | Preserve as historical duplicate. Do not merge or delete until human review confirms identity and purpose. |
| LEDTrackerAprpoved_270126_215800 | duplicate-exact | low | legacy-expo-app |  |  |  | 0 | 0.0% | LEDTracker (1) | 100.0% | Exact duplicate of LEDTracker (1) | Preserve as historical duplicate. Do not merge or delete until human review confirms identity and purpose. |
| leonsTrack_ | early-historical-version | low | early-expo-app |  |  |  | 0 | 2.4% | WorkTrack1_0_APK | 97.6% | Closest to WorkTrack1_0_APK | Preserve for historical traceability and simple logic reference. Not a baseline candidate. |
| WorkTrack1_0_APK | early-historical-version | low | early-expo-app |  |  |  | 0 | 0.0% | leonsTrack_ | 97.6% | Closest to leonsTrack_ | Preserve for historical traceability and simple logic reference. Not a baseline candidate. |
| LED_Tracker | legacy-snapshot | low | legacy-expo-app |  |  | yes | 1 | 5.9% | WTracker (1) | 24.1% | Closest to WTracker (1) | Archive as historical version. Compare only if it contains unique business logic or config. |
| LEDTracker | legacy-snapshot | low | legacy-expo-app |  |  |  | 0 | 49.0% | LEDTracker_V2_Aprovada | 22.7% | Closest to LEDTracker_V2_Aprovada | Archive as historical version. Compare only if it contains unique business logic or config. |
| LEDTracker_REPO | legacy-snapshot | low | legacy-expo-app |  |  |  | 19 | 0.0% | LEDTracker (1) | 87.9% | Closest to LEDTracker (1) | Archive as historical version. Compare only if it contains unique business logic or config. |
| LEDTracker_V2 | legacy-snapshot | low | legacy-expo-app |  |  |  | 0 | 52.6% | LEDTracker_REPO | 6.7% | Closest to LEDTracker_REPO | Archive as historical version. Compare only if it contains unique business logic or config. |
| LEDTracker_V2_Aprovada | legacy-snapshot | low | legacy-expo-app |  |  |  | 0 | 33.3% | LEDTracker_V2 | 22.5% | Closest to LEDTracker_V2 | Archive as historical version. Compare only if it contains unique business logic or config. |
| LEDTracker012926_2242 | legacy-snapshot | low | legacy-expo-app |  |  | yes | 4 | 5.6% | LEDTracker012926 | 89.5% | Closest to LEDTracker012926 | Archive as historical version. Compare only if it contains unique business logic or config. |
| LEDTracker020326 | legacy-snapshot | low | legacy-expo-app |  |  | yes | 4 | 2.8% | LEDTracker012926 | 80.0% | Closest to LEDTracker012926 | Archive as historical version. Compare only if it contains unique business logic or config. |
| LEDTracker020326_Actualizada | legacy-snapshot | low | legacy-expo-app |  |  | yes | 4 | 8.3% | LEDTracker020326_Actualizada_Final | 80.0% | Closest to LEDTracker020326_Actualizada_Final | Archive as historical version. Compare only if it contains unique business logic or config. |
| LEDTracker020326_Actualizada_Final | legacy-snapshot | low | legacy-expo-app |  |  | yes | 4 | 11.1% | LEDTracker020326_Actualizada | 80.0% | Closest to LEDTracker020326_Actualizada | Archive as historical version. Compare only if it contains unique business logic or config. |
| WORK Tracker_02102026 | legacy-snapshot | low | legacy-expo-app |  |  | yes | 0 | 52.8% | LEDTracker012926 | 36.9% | Closest to LEDTracker012926 | Archive as historical version. Compare only if it contains unique business logic or config. |
| WTracker (1) | legacy-snapshot | low | legacy-expo-app |  |  |  | 0 | 15.8% | LED_Tracker | 24.1% | Closest to LED_Tracker | Archive as historical version. Compare only if it contains unique business logic or config. |

## High Priority Baseline Candidates

### GEOTrack_Trial_and_Trace_REPO

- Official type: baseline-candidate
- Structural class: modern-core-app
- Scripts: gm=yes, typecheck=yes, test=yes
- Tests detected: 21
- Unique ratio: 83.2%
- Closest unit: WTracker_REPO
- Recommended action: Run executable validation: npm install, typecheck, lint, test, gm, audit. Candidate for baseline only after passing.

### LEDTracker_clean_REPO

- Official type: baseline-candidate
- Structural class: engine-audit-app
- Scripts: gm=yes, typecheck=yes, test=yes
- Tests detected: 9
- Unique ratio: 41.7%
- Closest unit: LEDTracker_REPO/LEDTracker
- Recommended action: Run executable validation: npm install, typecheck, lint, test, gm, audit. Candidate for baseline only after passing.

### LEDTracker_REPO/LEDTracker

- Official type: baseline-candidate
- Structural class: engine-audit-app
- Scripts: gm=yes, typecheck=yes, test=yes
- Tests detected: 19
- Unique ratio: 51.5%
- Closest unit: LEDTracker_clean_REPO
- Recommended action: Run executable validation: npm install, typecheck, lint, test, gm, audit. Candidate for baseline only after passing.

### WTracker_REPO

- Official type: baseline-candidate
- Structural class: core-architecture-app
- Scripts: gm=yes, typecheck=yes, test=yes
- Tests detected: 5
- Unique ratio: 7.2%
- Closest unit: WTrackerv_0608
- Recommended action: Run executable validation: npm install, typecheck, lint, test, gm, audit. Candidate for baseline only after passing.

### WTrackerv_0608

- Official type: baseline-candidate
- Structural class: core-architecture-app
- Scripts: gm=yes, typecheck=yes, test=yes
- Tests detected: 5
- Unique ratio: 1.4%
- Closest unit: WTracker_REPO
- Recommended action: Run executable validation: npm install, typecheck, lint, test, gm, audit. Candidate for baseline only after passing.

## Exact Duplicates

| Unit | Exact duplicate of |
|---|---|
| LEDTracker (1) | LEDTrackerAprpoved_270126_215800 |
| LEDTracker012926 | LEDTracker012926_202100 |
| LEDTracker012926_202100 | LEDTracker012926 |
| LEDTrackerAprpoved_270126_215800 | LEDTracker (1) |

## Notes

- This classification is derived from structural, script, and hash/diff reports.
- It is not a runtime verdict. Baseline selection still requires executable validation.
- Do not delete, flatten, or merge duplicate folders until their historical purpose is reviewed.

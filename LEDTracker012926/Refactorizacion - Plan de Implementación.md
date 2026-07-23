# Plan de implementación sprint por sprint  
## Refactor del sistema Auto-Check en `LEDTracker012926`

## 1. Objetivo

Ejecutar la evolución del sistema de **Auto-Check-in / Auto-Check-out** de `LEDTracker012926` de forma incremental, segura y validable, aprovechando:

- la **Fase 0** ya aplicada en la rama copilot/research-ledtracker012926-auto-check
- los hallazgos del gap analysis
- las mejoras tácticas ya ensayadas en `LEDTracker020326_Actualizada_Final`
- la arquitectura objetivo inspirada en `GEOTrack_Trial_and_Trace_REPO`

---

# 2. Supuestos de planificación

## Duración sugerida por sprint
- **1 sprint = 1 semana** o **2 semanas**
- el plan funciona mejor con sprints de **1 semana técnica intensa** o **2 semanas estándar**

## Criterio de éxito global
Al final del plan, el sistema debe tener:

- Auto-Check estable
- menor acoplamiento
- mejor trazabilidad
- mayor cobertura de pruebas
- separación dominio / infraestructura
- camino claro hacia arquitectura canónica

---

# 3. Estado de partida

## Ya completado en Fase 0
- centralización de storage keys
- hardening de `LocationManager.ts`
- mejoras en `BackgroundTasks.ts`
- mejoras en `db.ts`
- correcciones en `index.tsx`
- correcciones en `history.tsx`
- configuración de Jest
- tests existentes pasando

## Estado actual recomendado para arrancar Sprint 1
Tomar como baseline la rama/cambios de la Fase 0 ya aplicada.

---

# 4. Roadmap sprint por sprint

---

# Sprint 1 — Estabilización operativa y cierre de quick wins pendientes

## Objetivo
Consolidar la Fase 0, limpiar residuos y cerrar inconsistencias visibles de producción.

## Entregables
- rama estable con quick wins integrados formalmente
- validación manual del flujo completo
- limpieza de cambios accesorios/no deseados
- checklist funcional del Auto-Check actual

## Tareas
### 1. Revisar e integrar formalmente los cambios de Fase 0
Archivos:
- `src/constants/storageKeys.ts`
- `src/services/LocationManager.ts`
- `src/services/BackgroundTasks.ts`
- `src/database/db.ts`
- `app/(tabs)/index.tsx`
- `app/(tabs)/history.tsx`
- `package.json`

### 2. Limpiar artefactos no deseados
- revisar si `package-lock.json` debe versionarse
- descartar lockfiles accidentales de variantes externas
- validar que `LEDTracker020326_Actualizada_Final/package-lock.json` no contamine el cambio

### 3. Validación manual E2E
Escenarios mínimos:
- iniciar jornada
- entrar a geocerca → auto check-in
- salir de geocerca → prompt
- reingresar antes de 15 minutos
- terminar jornada manual
- tránsito a otro sitio
- borrar sesión
- validar reporte con evento GPS

### 4. Documentar baseline operativo
Crear `docs/auto-check-phase0-baseline.md` con:
- flujo actual
- decisiones implementadas
- límites conocidos

## Riesgos
- conflictos entre listener de notificaciones y navegación
- comportamiento distinto en Android real vs simulador
- efectos colaterales de la migración DB

## Criterios de aceptación
- tests existentes en verde
- flujo base sin regresiones graves
- quick wins mergeables
- baseline documentado

---

# Sprint 2 — Encapsulación del dominio actual

## Objetivo
Sacar lógica de negocio de las pantallas sin introducir aún el engine completo.

## Entregables
- `AutoCheckService`
- `SessionQueryService` o `ActiveSessionRepository`
- menor lógica imperativa en `index.tsx`

## Tareas
### 1. Crear servicio de dominio `AutoCheckService`
Responsabilidades:
- iniciar setup de jornada
- iniciar tránsito
- resolver salida del área
- ejecutar cancelación de pending
- cerrar sesión manual
- resolver failsafe

### 2. Crear `ActiveSessionRepository`
Responsabilidades:
- obtener sesión activa vigente
- obtener sesión pending/travel/active consistente
- encapsular queries hoy dispersas

### 3. Mover lógica desde `index.tsx`
Mover fuera de la pantalla:
- creación de sesión
- actualización de tránsito
- resolución de clock out
- cancelación de pending
- reglas de qué estado puede cambiar a cuál

### 4. Unificar semántica de sesión activa
Formalizar un helper:
- `getCurrentOperationalSession()`

### 5. Añadir tests unitarios del nuevo servicio
Pruebas:
- create pending session
- transit update
- close active session
- cancel pending
- ignore deleted in stats preconditions

## Riesgos
- mover demasiada lógica de golpe
- duplicar lógica temporalmente

## Criterios de aceptación
- `index.tsx` reducido y más declarativo
- no hay queries críticas sueltas en la pantalla
- servicios nuevos cubiertos por tests

---

# Sprint 3 — Separación de infraestructura: geofence, notifications y storage

## Objetivo
Convertir módulos operativos en adapters más limpios.

## Entregables
- `locationAdapter`
- `notificationsAdapter`
- `runtimeStorageAdapter`
- servicios de dominio usando interfaces, no Expo APIs directas

## Tareas
### 1. Refactor de `LocationManager.ts`
Convertirlo en adapter de infraestructura:
- pedir permisos
- start geofence
- stop geofence
- emitir callbacks/eventos de enter/exit

No debe:
- escribir DB directamente
- decidir estados finales

### 2. Refactor de `Notifications.ts`
Centralizar:
- permisos
- canal Android
- immediate notifications
- daily reminder
- notification payload contracts

### 3. Crear adapter para storage temporal
Ejemplo:
- `runtimeStorageAdapter.ts`

Responsabilidades:
- get/set/clear last exit timestamp
- get/set/clear last user decision timestamp
- get/set last report week

### 4. Sustituir strings directos de keys y payloads
Formalizar:
- acciones de notificación
- keys de runtime
- ids/canales si aplica

### 5. Tests de adapters
Mockear:
- expo-location
- expo-notifications
- AsyncStorage

## Riesgos
- edge cases de Expo APIs
- comportamiento diferente entre runtime real y mocks

## Criterios de aceptación
- dominio ya no conoce detalles internos de Expo
- `LocationManager.ts` y `Notifications.ts` más pequeños y claros
- AsyncStorage desacoplado del dominio

---

# Sprint 4 — Reestructuración del background y foreground runtime

## Objetivo
Separar orquestación de runtime de la lógica de negocio.

## Entregables
- `FailsafeService`
- `BackgroundOrchestrator`
- `AppBootstrapService`

## Tareas
### 1. Extraer `checkFailsafeLogic()` a `FailsafeService`
Debe:
- decidir si hay auto checkout
- devolver un resultado explícito
- no depender del archivo `BackgroundTasks.ts`

### 2. Reducir `BackgroundTasks.ts` a orquestador
Debe:
- disparar verificación de failsafe
- disparar lógica de reportes
- registrar/desregistrar tasks

No debe:
- contener todo el negocio inline

### 3. Crear `AppBootstrapService`
Desde `app/_layout.tsx`:
- init DB
- init notifications
- register background tasks
- run foreground recovery checks

### 4. Formalizar resultado de checks
Ejemplo:
- `FailsafeCheckResult`
- `WeeklyReportCheckResult`

### 5. Añadir tests de runtime orchestration
Casos:
- foreground recovery triggers failsafe
- no-op when no exit timestamp
- background run with no active session
- unregister behavior

## Riesgos
- regresión en arranque de app
- duplicar comportamiento entre bootstrap y background

## Criterios de aceptación
- `_layout.tsx` queda más limpio
- `BackgroundTasks.ts` deja de ser service híbrido
- foreground/background comparten caso de uso común

---

# Sprint 5 — Modelo explícito de eventos del dominio

## Objetivo
Introducir un catálogo formal de eventos sin migrar aún toda la UI al engine completo.

## Entregables
- `domain/events.ts`
- `sessionLifecycle.ts`
- `auditEventMapper.ts`

## Tareas
### 1. Definir eventos de dominio
Mínimos:
- `SESSION_SETUP_STARTED`
- `SESSION_DESTINATION_SET`
- `SESSION_AUTO_CHECKIN_GPS`
- `SESSION_EXIT_DETECTED`
- `SESSION_EXIT_RESOLVED_CONTINUE`
- `SESSION_AUTO_CHECKOUT_FAILSAFE`
- `SESSION_CLOSED_MANUAL`
- `SESSION_DELETED_SOFT`

### 2. Mapear eventos a auditoría
Crear un mapper:
- evento → audit_log entry

### 3. Formalizar lifecycle
Estados recomendados:
- `GEOFENCE_CREATED`
- `TRAVEL`
- `ACTIVE_WORK`
- `PENDING_EXIT_CONFIRMATION`
- `CLOSED`

### 4. Adaptar servicios creados en sprints anteriores
Que operen con eventos, no solo con updates ad hoc.

### 5. Tests de transición
- pending → active
- active → pending exit
- pending exit → travel
- pending exit → closed
- active → auto checkout failsafe

## Riesgos
- convivencia entre estados viejos y nuevos
- sobreingeniería si no se mantiene incremental

## Criterios de aceptación
- catálogo de eventos estable
- auditoría derivable desde eventos
- lifecycle más explícito

---

# Sprint 6 — Cobertura de pruebas del Auto-Check real

## Objetivo
Blindar comportamiento antes de un refactor mayor.

## Entregables
- suite de tests del flujo Auto-Check
- mocks de runtime
- regresión mínima automatizada

## Tareas
### 1. Tests de flujo principal
- setup start
- geofence enter → active
- geofence exit → timer set
- reentry clears timer
- failsafe closes session
- manual close from decision prompt
- transit after exit decision

### 2. Tests de persistencia
- audit log creation
- overlap validation
- cached rate snapshot
- deleted sessions excluded

### 3. Tests de notifications/runtime
- duplicate listener no longer exists
- notification action routes correctly
- report generation prompt scheduling

### 4. Tests de background orchestration
- task register
- task unregister
- no action when state invalid
- cleanup after no active session

## Riesgos
- costo de mocks
- falsos positivos si los adapters siguen poco desacoplados

## Criterios de aceptación
- cobertura significativa del dominio Auto-Check
- fallos de regresión detectables en CI/local

---

# Sprint 7 — Introducción del reducer del dominio

## Objetivo
Preparar la transición hacia una arquitectura canónica sin reemplazar todo de golpe.

## Entregables
- `workTrackerReducer`
- `initialState`
- selectors básicos
- estado canónico parcial

## Tareas
### 1. Crear estado canónico mínimo
Campos:
- activeSessionId
- sessions by id
- geofence runtime
- permissions
- background registration
- notifications state

### 2. Reducer para eventos críticos
Soportar:
- setup
- arrival
- exit detected
- continue travel
- auto checkout
- manual close

### 3. Selectors
- current operational session
- today stats
- current lifecycle
- should show checkout decision

### 4. Sincronización con DB
En esta fase puede seguir coexistiendo DB como source-of-persistence, mientras reducer es source-of-runtime.

## Riesgos
- doble fuente de verdad si no se delimita bien
- complejidad adicional temporal

## Criterios de aceptación
- reducer funcional con tests
- selectors confiables
- capacidad de empezar a leer estado desde el store canónico

---

# Sprint 8 — Motor de dominio y effects

## Objetivo
Adoptar patrón cercano a `GEOTrack_Trial_and_Trace_REPO`.

## Entregables
- `WorkTrackerEngine`
- `executeEffects`
- runtime adapters conectados
- UI consumiendo el nuevo modelo en los flujos críticos

## Tareas
### 1. Implementar engine
- cola serializada
- dispatch de eventos
- listeners de estado

### 2. Implementar effects
- persist session updates
- schedule notifications
- start/stop geofence
- persist audit logs

### 3. Migrar UI principal
`index.tsx` debe:
- leer estado
- disparar eventos
- no tocar DB directamente

### 4. Migrar `BackgroundTasks.ts`
Debe despachar eventos al engine o llamar a casos de uso equivalentes.

### 5. Migrar listeners de notificación
Payload → evento de dominio

## Riesgos
- este es el sprint de mayor complejidad
- errores de sincronización entre estado y persistencia

## Criterios de aceptación
- `index.tsx` sin lógica de negocio densa
- `LocationManager`/`BackgroundTasks` como adaptadores o entrypoints
- flujo crítico operativo sobre engine

---

# Sprint 9 — Observabilidad, auditoría extendida y hardening

## Objetivo
Hacer el sistema operable y defendible.

## Entregables
- auditoría extendida
- logging estructurado
- mejores reportes
- métricas operativas

## Tareas
### 1. Extender audit logs
Agregar metadata como:
- trigger source
- session status previo/posterior
- reason code
- timestamps relevantes
- coordenadas si aplica

### 2. Logging estructurado
Para:
- geofence enter/exit
- failsafe
- background runs
- notification actions
- bootstrap failures

### 3. Reportes enriquecidos
Mostrar:
- source del check-in
- source del checkout
- integrity notes
- soft deletes

### 4. Scripts de verificación
Inspirarse en:
- `verify-auto-checkout-flow.mjs`
- scripts de auditoría de `GEOTrack_Trial_and_Trace_REPO`

## Riesgos
- exceso de logs
- ruido si no se normalizan categorías

## Criterios de aceptación
- capacidad de reconstruir incidentes
- reportes más defendibles
- debugging más rápido

---

# Sprint 10 — Consolidación final y preparación de release

## Objetivo
Cerrar deuda residual y dejar listo para despliegue controlado.

## Entregables
- cleanup del código legado
- documentación final
- checklist release
- plan rollback

## Tareas
### 1. Eliminar código obsoleto
- listeners redundantes
- queries viejas no usadas
- helpers legacy reemplazados

### 2. Documentación técnica final
- arquitectura
- flujo de Auto-Check
- contratos
- fallos conocidos
- runbooks

### 3. Checklist release
- permisos Android/iOS
- validación en dispositivo real
- smoke tests
- tests unitarios
- pruebas de background

### 4. Plan rollback
- cómo revertir si falla geofence
- cómo desactivar features por flags si se requiere

## Criterios de aceptación
- release candidate estable
- runbook técnico completo
- deuda residual acotada

---

# 5. Priorización resumida por sprint

## Alta prioridad inmediata
- Sprint 1
- Sprint 2
- Sprint 3
- Sprint 4
- Sprint 6

## Alta prioridad estructural
- Sprint 5
- Sprint 7
- Sprint 8

## Cierre y hardening
- Sprint 9
- Sprint 10

---

# 6. Dependencias entre sprints

- **Sprint 1** depende de tener la Fase 0 como baseline
- **Sprint 2** depende de Sprint 1 estable
- **Sprint 3** depende de Sprint 2 para no mover lógica dos veces
- **Sprint 4** depende de Sprint 3
- **Sprint 5** puede iniciarse al final de Sprint 3 / principio de Sprint 4
- **Sprint 6** debe correr en paralelo desde Sprint 2, pero se vuelve crítica antes de Sprint 7
- **Sprint 7 y 8** dependen de que servicios/adapters estén desacoplados
- **Sprint 9 y 10** son de consolidación final

---

# 7. Riesgos globales del plan

## Riesgo 1 — Refactor demasiado ambicioso muy pronto
**Mitigación:** no saltar a engine completo antes de encapsular servicios.

## Riesgo 2 — Romper geofence en Android real
**Mitigación:** pruebas en dispositivo real desde Sprint 1 y Sprint 3.

## Riesgo 3 — Doble fuente de verdad durante migración
**Mitigación:** delimitar claramente runtime-state vs persisted-state.

## Riesgo 4 — Cobertura insuficiente durante cambios
**Mitigación:** priorizar Sprint 6 antes del cambio estructural mayor.

## Riesgo 5 — Mezclar fixes tácticos con rediseño profundo en un mismo PR
**Mitigación:** PRs pequeños por sprint o por capability.

---

# 8. Recomendación de ejecución realista

Si quieres una ruta más pragmática y menos larga, recomiendo este bloque mínimo viable:

## MVP de refactor seguro
- Sprint 1
- Sprint 2
- Sprint 3
- Sprint 4
- Sprint 6

Eso ya te deja con:
- Auto-Check más estable
- menos lógica en UI
- menos acoplamiento con Expo APIs
- mejor testabilidad
- menos riesgo operacional

## Ruta full arquitectura
Luego sumar:
- Sprint 5
- Sprint 7
- Sprint 8
- Sprint 9
- Sprint 10

---

# 9. KPIs sugeridos por sprint

## KPIs técnicos
- tests passing
- cobertura de flujo Auto-Check
- errores silenciosos reducidos
- número de queries directas desde UI
- número de strings hardcodeadas críticas
- número de módulos con side effects mixtos

## KPIs funcionales
- check-ins automáticos correctos
- auto-checkouts correctos
- prompts correctos
- sesiones borradas no afectan stats
- reportes consistentes con auditoría GPS

---

# 10. Recomendación final

## Orden recomendado
1. **consolidar quick wins**
2. **sacar lógica de las pantallas**
3. **aislar infraestructura**
4. **fortalecer tests**
5. **formalizar eventos**
6. **migrar a engine**
7. **cerrar con observabilidad y cleanup**

## Mejor estrategia
No hacer big-bang.  
Haz el refactor como una serie de **pequeñas victorias seguras**, con test coverage creciente y validación en dispositivos reales.
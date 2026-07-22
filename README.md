# WTracker / WTracker

> **Automatic field-work time tracking with geofencing, local persistence, and bilingual operational workflows.**  
> **Registro automático de jornadas de trabajo en campo con geocercas, persistencia local y flujos operativos bilingües.**

## Overview / Descripción general

**EN**  
WTracker is a mobile time-tracking application for field workers. It is designed to automate attendance and session registration using geofencing, background tasks, and local-first persistence. The system aims to reduce manual check-in/check-out actions by detecting arrival and departure from a work site, while keeping an auditable history of sessions, lunch breaks, reports, and administrative actions.

**ES**  
WTracker es una aplicación móvil de control de jornada para trabajadores de campo. Está diseñada para automatizar el registro de asistencia y sesiones mediante geocercas, tareas en segundo plano y persistencia local-first. El sistema busca reducir la necesidad de hacer check-in/check-out manual detectando la llegada y salida del sitio de trabajo, mientras conserva un historial auditable de sesiones, almuerzos, reportes y acciones administrativas.

---

## Repository status / Estado del repositorio

**EN**  
This repository is a **historical multi-version workspace**, not a single clean root application. The most relevant and technically advanced implementation is currently located in:

```text
WTracker_REPO/
```

That folder should be treated as the active application baseline.

**ES**  
Este repositorio es un **espacio histórico con múltiples versiones**, no una única aplicación limpia en la raíz. La implementación más relevante y técnicamente avanzada se encuentra actualmente en:

```text
WTracker_REPO/
```

Esa carpeta debe considerarse la base activa de la aplicación.

---

## Core purpose / Propósito principal

**EN**  
The project addresses a common field-operations problem: workers should not need to manually start and end their workday every time they arrive at or leave a job site. WTracker is built to:

- detect arrival through geofencing,
- create and close work sessions automatically,
- persist operational data locally,
- support lunch registration,
- calculate hours and estimated pay,
- generate PDF reports,
- maintain an auditable operational trail.

**ES**  
El proyecto resuelve un problema común en operaciones de campo: el trabajador no debería tener que iniciar y cerrar manualmente su jornada cada vez que llega o sale de un sitio. WTracker está construido para:

- detectar la llegada mediante geocercas,
- crear y cerrar sesiones automáticamente,
- persistir datos operativos de forma local,
- registrar almuerzos,
- calcular horas y pago estimado,
- generar reportes PDF,
- mantener una trazabilidad auditable de la operación.

---

## Technology stack / Stack tecnológico

The active implementation in `WTracker_REPO/` is based on the following technologies:

- **React Native 0.81.5**
- **Expo 54**
- **Expo Router 6**
- **TypeScript 5**
- **expo-sqlite** for local database storage
- **expo-location** for geolocation and geofencing
- **expo-task-manager** and **expo-background-task** for background execution
- **expo-notifications** for user notifications
- **expo-print** and **expo-sharing** for PDF export and sharing
- **expo-mail-composer** for email sending
- **dayjs** for date handling
- **i18n-js** for bilingual UI support
- **Jest + jest-expo + Testing Library** for testing

---

## Main application structure / Estructura principal de la aplicación

```text
WTracker_REPO/
├── app/                     # Expo Router routes and tab navigation
├── src/
│   ├── core/                # Engine, reducer, effects, selectors, runtime adapters
│   ├── database/            # SQLite schema and persistence logic
│   ├── services/            # Geofencing, background tasks, notifications, reports
│   ├── components/          # UI components and operational modals
│   ├── constants/           # Theme, icons, animations
│   ├── context/             # Theme and toast providers
│   ├── feedback/            # Feedback bridge and logging UI integration
│   └── utils/               # Payroll, geo, date, i18n, logger utilities
├── app.json
├── package.json
├── tsconfig.json
├── babel.config.js
├── jest.config.js
└── eas.json
```

---

## Architecture / Arquitectura

**EN**  
The codebase is structured around a state-driven operational engine. The intended flow is:

```text
UI → Hook → Engine → Reducer → Effects → Runtime adapters → Persistence / OS services
```

The architecture separates:

- **presentation** (screens, tabs, modals, UI components),
- **domain/state orchestration** (`src/core`),
- **infrastructure adapters** (location, notifications, reports, security, storage),
- **local persistence** (SQLite),
- **background operational services**.

**ES**  
La base de código está organizada alrededor de un motor operativo orientado por estado. El flujo previsto es:

```text
UI → Hook → Engine → Reducer → Effects → Adaptadores runtime → Persistencia / servicios del SO
```

La arquitectura separa:

- **presentación** (pantallas, tabs, modales, componentes UI),
- **orquestación de dominio/estado** (`src/core`),
- **adaptadores de infraestructura** (ubicación, notificaciones, reportes, seguridad, almacenamiento),
- **persistencia local** (SQLite),
- **servicios operativos en segundo plano**.

---

## Current functional areas / Áreas funcionales actuales

The active application includes these main areas:

- **Today / Hoy**: operational dashboard
- **History / Historial**: recorded sessions and summaries
- **Reports / Reportes**: report generation and export
- **Settings / Configuración**: employee settings, language, rates, admin zone
- **Session detail / Detalle de sesión**: review and controlled editing of session records

Operational modals include flows for:

- daily work-site setup,
- lunch registration,
- exit detection,
- session editing,
- note creation,
- soft deletion.

---

## Key implemented capabilities / Capacidades implementadas clave

**Confirmed in code / Confirmado en código:**

- local SQLite storage,
- session persistence,
- system and audit logging,
- geofence/background task foundations,
- report generation in PDF format,
- bilingual UI support (Spanish/English),
- payroll-related utilities,
- admin PIN validation via SHA-256 hash,
- modular design system and reusable operational UI.

---

## Important limitations / Limitaciones importantes

**EN**  
This README intentionally avoids overstating the current maturity of the app.

The repository contains strong architecture and a substantial amount of implementation, but the most advanced version is **not fully production-ready yet**. In particular:

- the repository root is not the runnable app; `WTracker_REPO/` is the active target,
- the engine architecture is present, but the reducer/effects layer is only partially implemented,
- some audit scripts referenced in `package.json` are missing from `WTracker_REPO/`,
- `app.json` still includes a placeholder EAS project ID,
- no external backend or cloud sync layer is implemented,
- web support should not be treated as feature-complete for geofencing/background behavior,
- geofencing/background behavior must be validated on physical devices.

**ES**  
Este README evita intencionalmente exagerar el nivel de madurez actual de la app.

El repositorio contiene una arquitectura sólida y una cantidad importante de implementación, pero la versión más avanzada **todavía no está completamente lista para producción**. En particular:

- la raíz del repositorio no es la app ejecutable; `WTracker_REPO/` es el objetivo activo,
- la arquitectura del motor existe, pero la capa reducer/effects está implementada solo de forma parcial,
- algunos scripts de auditoría referenciados en `package.json` no están presentes en `WTracker_REPO/`,
- `app.json` aún incluye un placeholder para el project ID de EAS,
- no existe backend externo ni sincronización cloud implementada,
- el soporte web no debe considerarse completo para geocercas/tareas en segundo plano,
- el comportamiento de geofencing/background debe validarse en dispositivos físicos.

---

## Local development / Desarrollo local

### Prerequisites / Requisitos

- **Node.js 18+**
- **npm 10+**
- **Expo CLI**
- Android Studio and/or Xcode for native builds
- A **physical device** for realistic geofencing/background validation

### Install / Instalación

```bash
cd WTracker_REPO
npm install
```

### Start development server / Iniciar servidor de desarrollo

```bash
npm start
```

### Run on Android / Ejecutar en Android

```bash
npm run android
```

### Run on iOS / Ejecutar en iOS

```bash
npm run ios
```

### Run on web / Ejecutar en web

```bash
npm run web
```

---

## Available scripts / Scripts disponibles

From `WTracker_REPO/package.json`:

```bash
npm start
npm run android
npm run ios
npm run web
npm run lint
npm run test
npm run typecheck
npm run audit:gm
npm run audit:time
npm run audit:db
npm run audit:logs
npm run audit:concurrency
npm run audit:geo
npm run audit:payroll
npm run audit:ui
npm run audit:android
npm run audit:security
npm run gm
```

### Note / Nota

**EN**  
Some `audit:*` scripts reference files that are not currently present inside `WTracker_REPO/`. Those commands may fail unless the missing audit sources are restored.

**ES**  
Algunos scripts `audit:*` referencian archivos que actualmente no están presentes dentro de `WTracker_REPO/`. Esos comandos pueden fallar a menos que se restauren las fuentes de auditoría faltantes.

---

## Build profiles / Perfiles de build

The repository includes an `eas.json` file with profiles for:

- `development`
- `preview`
- `production`

Typical usage:

```bash
eas build --profile preview --platform android
eas build --profile production --platform android
```

Before using EAS builds, make sure the Expo project configuration is fully completed.

---

## Persistence and services / Persistencia y servicios

**Local persistence / Persistencia local**
- SQLite database
- audit logs
- system logs
- settings
- work sessions

**Platform/service integrations / Integraciones de plataforma/servicio**
- location and geofencing
- background execution
- notifications
- PDF generation
- sharing
- mail composition

---

## Internationalization / Internacionalización

The project includes bilingual support:

- **English**
- **Español**

The i18n layer is implemented in the utility layer and is already reflected in the operational design of the application.

---

## Recommended reading order / Orden recomendado de lectura

If you want to understand the project quickly, start here:

1. `TARGET_SPEC.md`
2. `PRESERVATION_POLICY.md`
3. `SOURCE_FOLDER_MAP.md`
4. `docs/`
5. `WTracker_REPO/package.json`
6. `WTracker_REPO/src/core/`
7. `WTracker_REPO/src/services/`
8. `WTracker_REPO/src/database/`

---

## Suggested roadmap / Roadmap sugerido

**EN**
- complete reducer coverage for the operational event catalog,
- complete effects orchestration for the full session lifecycle,
- restore or add missing audit scripts,
- replace placeholder Expo/EAS configuration values,
- add CI workflows,
- document environment and release steps explicitly,
- validate end-to-end behavior on physical devices.

**ES**
- completar la cobertura del reducer para el catálogo operativo de eventos,
- completar la orquestación de effects para el ciclo completo de sesión,
- restaurar o agregar los scripts de auditoría faltantes,
- reemplazar valores placeholder de configuración Expo/EAS,
- agregar workflows de CI,
- documentar explícitamente variables y pasos de release,
- validar el comportamiento end-to-end en dispositivos físicos.

---

## Contribution note / Nota de contribución

**EN**  
Because this repository preserves multiple historical variants, contributors should avoid deleting legacy folders without first documenting the migration or preservation rationale.

**ES**  
Debido a que este repositorio conserva múltiples variantes históricas, quienes contribuyan deben evitar eliminar carpetas legacy sin documentar primero la razón de migración o preservación.

---

## Disclaimer / Aclaración

**EN**  
This README is based on the current repository contents as analyzed on **July 22, 2026**, and is intentionally conservative where implementation is partial.

**ES**  
Este README está basado en el contenido actual del repositorio analizado el **22 de julio de 2026**, y es intencionalmente conservador en los puntos donde la implementación es parcial.

# Preservation Policy

This repository is a historical monorepo containing multiple independent versions of the Work Tracker family of apps.

Important rule:

Do not delete folders or files only because names look duplicated.

Some projects were copied or moved into other folders by mistake, but their internal code may be different. Every version must be treated as potentially important until reviewed and documented.

## Reorganization Rules

1. Preserve all project code.
2. Do not flatten nested projects destructively.
3. If a complete project is found inside another project, extract it into its own folder.
4. Keep original identity in `VERSION_INDEX.md`.
5. Mark versions as current, legacy, experimental, archived, or unknown.
6. Remove only generated dependencies, build artifacts, caches, logs, and sensitive local files.

## Nested Project Rule

If a complete project is found inside another project because of a copy or move mistake, it must not be deleted or merged automatically.

The outer project and the nested project must be treated as separate versions.

Example:

LEDTracker_REPO/
  app/
  src/
  package.json
  LEDTracker/

In this case:

- LEDTracker_REPO excluding LEDTracker/ is one project.
- LEDTracker_REPO/LEDTracker/ is another project.

Both must be preserved and moved into separate version folders.


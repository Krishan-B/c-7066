# Scripts Directory Index

This README provides an overview of all scripts in the `scripts/` directory. Each script is briefly
described to help you understand its purpose and usage.

---

## Top-Level Scripts

- **DisposableRegistry.ts** — Utility for tracking and managing disposables in listener-heavy
  scripts or diagnostics.
- **MODULAR_DIAGNOSTICS.md** — Documentation for modular diagnostics and troubleshooting.
- **assert-local-db-health.sh** — Checks the health of the local database instance.
- **assert-vscode-health.sh** — Checks the health of the VS Code environment.
- **checkListeners.ts** — Utility to check for event listener leaks or issues.
- **cleanup-extensions.sh** — Cleans up unnecessary or conflicting VS Code extensions.
- **codespaces-setup.sh** — Sets up the Codespaces environment for development.
- **configure-workspace.sh** — Configures workspace settings and environment variables.
- **db-migrate-seed.sh** — Runs database migrations and seeds initial data.
- **diagnose-vscode-environment.sh** — Diagnoses common VS Code environment issues.
- **find-long-lines.sh** — Finds lines in code files that exceed a certain length (code quality).
- **generate-supabase-types.sh** — Generates TypeScript types from Supabase schema.
- **health-check-all.sh** — Runs all health checks for the workspace.
- **install-extensions.sh** — Installs recommended VS Code extensions for the project.
- **lint-json-configs.sh** — Lints and validates JSON configuration files.
- **mockEmitterCluster.ts** — Utility for mocking event emitter clusters in tests.
- **open-supabase-extension.sh** — Opens the Supabase extension for development or debugging.
- **restore-removed-files.sh** — Restores files that were accidentally removed.
- **supabase-health-check.sh** — Checks the health of the Supabase backend.
- **supabase-sync.sh** — Syncs Supabase schema and data.
- **sync-supabase.sh** — Alternative or legacy script for syncing Supabase (check usage).
- **test-diagnostics.sh** — Runs diagnostics tests.
- **test-push-pull.sh** — Tests push/pull operations (likely for git or data sync).
- **validate-diagnostics.sh** — Validates diagnostic results or outputs.
- **verify-deps-update.js** — Verifies that dependencies are up to date.
- **verify-sync.sh** — Verifies that sync operations completed successfully.

## diagnostics/

- Contains advanced troubleshooting and environment scripts:
  - **cache.sh** — Analyzes and manages cache files and directories.
  - **checkSchemaSeed.ts** — Checks schema and seed data for consistency.
  - **core.sh** — Core diagnostics logic.
  - **extensions.sh** — Diagnostics for VS Code extensions.
  - **headers.js / headers.sh** — Checks or manipulates HTTP headers.
  - **keychain.sh** — Diagnostics for keychain or credential storage.
  - **listeners.sh** — Checks for event listener issues.
  - **logs.sh** — Analyzes log files for errors or issues.
  - **save-hooks.sh** — Manages git or editor save hooks.
  - **scheduler.sh** — Diagnoses scheduling and performance issues.
  - **similarity.sh** — Checks for file or code similarity (potential duplicates).
  - **websocket.sh** — Diagnoses WebSocket connections.
  - **workspace.sh** — Workspace-level diagnostics and checks.
  - **README.md** — Documentation for diagnostics scripts.

---

**Note:**

- All scripts are intended for workspace setup, diagnostics, or maintenance.
- If a script is deprecated or replaced, mark it clearly at the top of the file and/or move it to an
  `archive/` folder.
- For usage instructions, check the script header or run with `--help` if supported.

![Diagnostics](https://github.com/<your-org>/<your-repo>/actions/workflows/diagnostics.yml/badge.svg)

# Diagnostics Suite

This folder contains modular, CI-friendly health-check tools for your workspace.

## Tools

- `checkListeners.ts`: Detects event listener leaks and hot spots.
- `checkSchemaSeed.ts`: Validates that your seed files match the live database schema for specified
  tables.

## Usage

Each tool can be run standalone or as part of your CI pipeline. See individual script headers for
CLI options.

## Extending

Add new diagnostics here to keep your workspace robust and developer-friendly.

## 🔎 Diagnostics Suite

This repo includes a listener diagnostics framework that tracks disposable registration by lifecycle
phase and context.

### 📦 Running Tests

Run regression-proof diagnostics to catch potential listener leaks:

```bash
npm run test:diagnostics
```

This runs:

- Lifecycle summary reporting via `dumpByLifecycle()`
- Bloat detection via `warnIfTooMany()`

### 🛠️ Diagnostic Utilities

You can use:

- `track(disposable, { context, lifecyclePhase })` to tag listener lifecycles
- `dumpByLifecycle()` for summary output
- `warnIfTooMany(threshold)` to catch noisy registration patterns

# Project Cleanup & Configuration

## Removed/Merged Files

- Merged all TypeScript configs into `tsconfig.unified.json` (replaces `tsconfig.app.json`, `tsconfig.node.json`, `tests/tsconfig.json`)
- Marked legacy/obsolete scripts and markdowns for removal (see below)

## Unused/Obsolete Scripts

- `validation-script.js` (root)
- `/scripts/diagnostics/*` (all .bat/.sh)
- `/scripts/maintenance/*` (all .bat/.sh)
- `/scripts/validation/basic-component-test.mjs`
- `/scripts/validation/vercel-deployment-check.js`
- `/scripts/generate-perf-report.js`

## Unused/Obsolete Markdown

- `PHASE_A_VALIDATION_COMPLETE.md`
- `WORKSPACE_OPTIMIZATION_COMPLETE.md`
- Any report in `/docs/reports/` older than 2025-01-01

## Best-Practice Files Added

- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `SUPPORT.md`

## Next Steps

- Remove the above files from the repo.
- Update all references to old tsconfig files to use `tsconfig.unified.json`.
- Add documentation headers to all scripts/configs that remain.
- See `SECURITY.md` and `/docs/security/best-practices.md` for security guidance.

---

This file documents the cleanup and configuration changes as of June 16, 2025.

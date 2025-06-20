# MIGRATION & MAINTENANCE LOG

## June 2025

- Enforced TypeScript-only codebase (no `.js`/`.jsx` in source or tests).
- Cleaned up duplicate Tailwind config files; only `tailwind.config.ts` remains.
- Ran `npm prune` and `npm update` to clean up and update dependencies.
- Standardized on npm as the project's package manager.
- All scripts in `package.json` are currently relevant to Supabase, development, or tooling. No unused scripts were removed at this time.

Refer to this file for a summary of major workspace maintenance and migration actions.

# Developer Notes

## Context/Provider and Hook Best Practices

- Use React Context Providers for cross-cutting concerns (theme, auth, trade panel, etc.).
- Always wrap your app (or relevant subtree) with the required provider.
- Use custom hooks (e.g., `useTheme`, `useAuth`) to access context values and actions.
- Keep context logic focused and avoid unnecessary re-renders.
- Document the purpose and usage of each provider and hook.

## Folder Structure

- Organize code by feature/domain (`src/features`, `src/components`, etc.).
- Place shared utilities in `src/utils` and shared types in `src/types`.

## Testing

- Use Vitest for new tests; keep legacy Jest tests until migrated.
- Maintain high test coverage and run tests in CI.

## Linting & Formatting

- Use ESLint and Prettier for code quality and consistency.
- Run lint and format checks before committing (via Husky/lint-staged).

## Environment Variables

- Never commit real secrets. Use `.env.example` as a template.

## Contribution

- See `.github/CONTRIBUTING.md` for guidelines.

_Add more notes as the project evolves._

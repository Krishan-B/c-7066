<!--
1. For new code in this modern React/TypeScript Vite project, use Vitest as the test runner. It is fast, works well with modern tooling, and has a similar syntax to Jest.

2. All tests should be migrated to Vitest. Jest is no longer used in this project.
3. Always focus on one specific, actionable task at a time. Use only the immediate context (the open file, function, or explicit user comment) to generate code or test suggestions. Ignore unrelated action plan steps or project-wide goals unless explicitly asked.
-->

# Trading Pro - Simulated CFD Trading Platform

[![CI](https://github.com/Krishan-B/c-7066/actions/workflows/ci.yml/badge.svg)](https://github.com/Krishan-B/c-7066/actions/workflows/ci.yml)

A multi-asset simulated CFD trading platform that allows users to practice trading
across multiple asset classes without risking real money.

## Features

### Core Trading Features

- Simulated CFD trading across 5 asset classes:
  - Cryptocurrency
  - Stocks
  - Forex
  - Indices
  - Commodities
- Real-time market data integration
- Advanced order types (Market and Pending/Entry)
- Leverage-based trading with asset-specific leverage rules
- Take profit and stop loss management
- Position tracking and P&L calculation
- Comprehensive account metrics

### User Management

- User registration and authentication
- Secure profile management
- Paper trading accounts with initial balance

### Portfolio Management

- Real-time portfolio tracking
- Position management
- Trade history and reporting
- Performance analytics

## Technical Implementation

### Database Structure

- User accounts and profiles
- Trading positions and orders
- Portfolio management
- Market data

### Trading Engine

- Order processing system
- Position management
- P&L calculation
- Risk management

### API Services

- Market data integration
- Real-time price updates
- Order execution
- Account metrics

## Getting Started

1. Register for an account
2. Browse available markets
3. Create a watchlist of assets you're interested in
4. Execute your first trade using the Trade Panel
5. Monitor your open positions
6. Track your performance

## Default Leverage Settings

- Stocks: 20:1 (5% margin)
- Indices: 50:1 (2% margin)
- Commodities: 50:1 (2% margin)
- Forex: 100:1 (1% margin)
- Crypto: 50:1 (2% margin)

## Context & Provider Architecture

This project uses React Context Providers and custom hooks for state management and
cross-cutting concerns. Key providers and hooks include:

### Theme Context

- **File:** `src/components/theme/ThemeProviderContent.tsx`
- **Usage:** Wrap your app with `<ThemeProvider>` to provide theme state and toggling.
- **Access:** Use the `useTheme` hook from `src/components/theme/use-theme.ts`.

### Trade Panel Context

- **File:** `src/components/trade/TradePanelProviderContent.tsx`
- **Usage:** Wrap relevant parts of your app with `<TradePanelProvider>`.
- **Access:** Use the `useTradePanelContext` hook from `components/trade/use-trade-panel.ts`.

### Auth Context

- **File:** `src/components/AuthProvider.tsx` and `src/components/AuthContext.tsx`
- **Usage:** Wrap your app with `<AuthProvider>` to provide authentication.
- **Access:** Use the `useAuth` hook from `src/hooks/auth/useAuth.ts`.

### Best Practices

- Always wrap your app (or relevant subtree) with the required provider.
- Use the provided custom hooks to access context values and actions.
- See `DEVELOPER_NOTES.md` for more on context/provider and hook best practices.

## Formatting & Linting Workflow

- Code style is enforced using ESLint and Prettier.
- Recommended VS Code extensions: ESLint, Prettier, Error Lens, Tailwind CSS IntelliSense (see .vscode/extensions.json).
- Code is automatically linted and formatted on commit using Husky and lint-staged.
- To manually lint and fix code, run:
  - `npm run lint` to check for lint errors
  - `npm run lint:fix` to auto-fix issues
  - `npm run lint:ci` for CI environments
- To format markdown and JSON files, use Prettier or run `npm run lint:fix`.
- TypeScript type checks can be run with `npm run typecheck`.

## Scripts

| Script             | Description                                         |
| ------------------ | --------------------------------------------------- |
| `dev`              | Start the Vite development server                   |
| `build`            | Build the app for production                        |
| `build:dev`        | Build the app in development mode                   |
| `lint`             | Run ESLint with cache                               |
| `lint:fix`         | Run ESLint and auto-fix issues                      |
| `lint:clear-cache` | Remove ESLint cache file                            |
| `lint:ci`          | Run ESLint in CI mode (no cache, compact output)    |
| `preview`          | Preview the production build                        |
| `test`             | Run all tests with Vitest                           |
| `test:coverage`    | Run tests and generate coverage report with Vitest  |
| `test:ci`          | Run tests in CI mode with basic reporter            |
| `test:security:ci` | Run security-related tests with coverage in CI      |
| `ci:check`         | Run lint, typecheck, test, and build in CI          |
| `prepare`          | Install Husky git hooks                             |
| `typecheck`        | Run TypeScript type checking without emitting files |

## Social Login (Google, Apple)

- Users can sign in or sign up using Google or Apple accounts via OAuth.
- On the authentication page (`/auth`), click "Continue with Google" or "Continue with Apple" to start the OAuth flow.
- After successful authentication, you will be redirected back to the app and logged in automatically.
- The OAuth flow is powered by Supabase Auth and is fully integrated with the user management system.

### Testing Social Login

- End-to-end tests for Google and Apple login buttons and redirect flow are located in `tests/e2e/oauth-login.spec.ts`.
- For CI, use test Google/Apple accounts or appropriate Playwright plugins/mocks for OAuth.
- Manual testing: Click the social login buttons and verify successful login and redirection to the dashboard.

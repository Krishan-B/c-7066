<!--
1. For new code in this modern React/TypeScript Vite project, use Vitest as the test runner. It is fast, works well with modern tooling, and has a similar syntax to Jest.

2. All tests should be migrated to Vitest. Jest is no longer used in this project.
3. Always focus on one specific, actionable task at a time. Use only the immediate context (the open file, function, or explicit user comment) to generate code or test suggestions. Ignore unrelated action plan steps or project-wide goals unless explicitly asked.
-->

# Trading Pro - Simulated CFD Trading Platform

[![CI](https://github.com/Krishan-B/c-7066/actions/workflows/ci.yml/badge.svg)](https://github.com/Krishan-B/c-7066/actions/workflows/ci.yml)

A multi-asset simulated CFD trading platform that allows users to practice trading
across multiple asset classes without risking real money.

## Project Structure

The project follows a clean, modular architecture:

```
/
├── client/           # Frontend application
│   ├── public/         # Static assets
│   └── src/            # Client source code
│       ├── assets/       # Images, fonts, etc.
│       ├── components/   # React components
│       ├── hooks/        # Custom hooks
│       ├── pages/        # Page components
│       └── ...
├── server/           # Backend application
│   ├── db.ts           # Database connection
│   ├── index.ts        # Server entry point
│   ├── routes.ts       # API routes
│   └── ...
├── shared/           # Shared code between client and server
│   └── schema.ts       # Database schema and types
├── drizzle.config.ts # Drizzle ORM configuration
├── tsconfig.json     # TypeScript configuration
└── ...
```

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

## TypeScript-Only Standard

This project enforces a strict TypeScript-only codebase. All source and test files must use `.ts` or `.tsx` extensions. JavaScript (`.js`, `.jsx`) files are not permitted in `src/` or `tests/` and will be ignored by the build and type checking process. See `tsconfig.json` for enforcement details.

- If you find any `.js`/`.jsx` files in the codebase, convert them to TypeScript or remove them.
- All new code and tests must be written in TypeScript.

## June 2025 Maintenance & Cleanup

- Standardized the codebase to TypeScript-only. All `.js`/`.jsx` files are now excluded from source and tests.
- Cleaned up duplicate Tailwind config files. Only `tailwind.config.ts` is used.
- Ran `pnpm prune` and `pnpm update` to remove unused dependencies and update all packages.
- Reviewed all scripts in `package.json` and confirmed all are currently relevant to Supabase, development, or tooling. No unused scripts were removed at this time.
- Restructured the project to a cleaner client/server/shared architecture

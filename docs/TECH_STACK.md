# Technology Stack & Infrastructure

## Frontend

- **React** (v18.x or v19.x, as compatible)
- **TypeScript**
- **Vite**
- **Material-UI (MUI)**
- **Radix UI (shadcn/ui)**
- **Tailwind CSS** (custom theme, HSL variables)
- **TradingView Charting Library**
- **Redux Toolkit** (and/or Zustand)
- **React Router**
- **React Hook Form**
- **Framer Motion**
- **clsx, class-variance-authority, zod, date-fns, sonner, etc.**

## Backend / BaaS

- **Supabase** (PostgreSQL, Auth, Storage, Realtime)
- **Supabase Edge Functions** (Deno runtime)
- **RESTful API** (via Supabase)
- **Migrations:** SQL files in `supabase/migrations/`
- **Seed Data:** `supabase/seed.sql`

## Testing & Quality

- **Vitest**
- **React Testing Library**
- **ESLint**
- **Prettier**
- **TypeScript**

## DevOps & Tooling

- **npm**
- **Husky**
- **EditorConfig**
- **GitHub Actions**
- **Custom Scripts** (`scripts/`)

## Monitoring & Security

- **Supabase dashboard, custom logging, alerting**
- **RLS (Row Level Security)**
- **Security policies, CODEOWNERS**

## Documentation

- **Markdown docs** (`docs/`)

---

### Best Practices

- All dependencies are kept up-to-date and compatible.
- Scripts are optimized for build, lint, typecheck, health, and diagnostics.
- VS Code extensions and settings are recommended and configured.
- Environment variables are used for all secrets and endpoints.
- Modular scripts and documentation for onboarding and troubleshooting.
- Pre-commit hooks enforce code quality.
- CI/CD pipelines for validation and deployment.

---

This document is auto-generated and should be updated as the stack evolves.

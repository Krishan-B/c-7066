# Tech Stack Rules & Performance Guidelines

## Overview

This document outlines the finalized tech stack, dependencies, performance rules, and configuration guidelines for Trade-Pro.

## Core Technology Stack

### Frontend Framework

- **React 18.3+** - Main UI library with concurrent features
- **TypeScript 5.8+** - Type safety and modern JS features
- **Vite 6.3+** - Build tool and dev server with SWC
- **React Router 6.30+** - Client-side routing

### UI Framework & Styling

- **Tailwind CSS 3.4+** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion 12+** - Animation library
- **Lucide React** - Icon library (lightweight alternative to Heroicons)

### State Management & Data Fetching

- **TanStack Query 5.80+** - Server state management
- **React Hook Form 7.58+** - Form state management
- **Zod 3.25+** - Schema validation
- **Supabase JS 2.50+** - Backend as a Service

### Development Tools

- **ESLint 9+** - Code linting with flat config
- **Prettier 3.5+** - Code formatting
- **Vitest 3.2+** - Unit testing framework
- **Playwright 1.53+** - E2E testing
- **Husky 9+** - Git hooks

## Dependency Rules

### ✅ APPROVED Dependencies

#### Core UI Components

```json
{
  "@radix-ui/react-accordion": "^1.2.11",
  "@radix-ui/react-alert-dialog": "^1.1.14",
  "@radix-ui/react-avatar": "^1.1.10",
  "@radix-ui/react-checkbox": "^1.3.2",
  "@radix-ui/react-dialog": "^1.1.14",
  "@radix-ui/react-dropdown-menu": "^2.1.15",
  "@radix-ui/react-hover-card": "^1.1.14",
  "@radix-ui/react-label": "^2.1.7",
  "@radix-ui/react-popover": "^1.1.14",
  "@radix-ui/react-progress": "^1.1.7",
  "@radix-ui/react-scroll-area": "^1.2.9",
  "@radix-ui/react-select": "^2.2.5",
  "@radix-ui/react-separator": "^1.1.7",
  "@radix-ui/react-slider": "^1.3.5",
  "@radix-ui/react-slot": "^1.2.3",
  "@radix-ui/react-switch": "^1.2.5",
  "@radix-ui/react-tabs": "^1.1.12",
  "@radix-ui/react-toast": "^1.2.14",
  "@radix-ui/react-tooltip": "^1.2.7"
}
```

#### State & Data Management

```json
{
  "@tanstack/react-query": "^5.80.7",
  "@supabase/supabase-js": "^2.50.0",
  "react-hook-form": "^7.58.0",
  "@hookform/resolvers": "^3.10.0",
  "zod": "^3.25.65"
}
```

#### Utilities & Styling

```json
{
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.6.0",
  "date-fns": "^3.6.0",
  "framer-motion": "^12.18.1",
  "lucide-react": "^0.451.0",
  "next-themes": "^0.3.0"
}
```

### ❌ REMOVED Dependencies (Conflicts/Unnecessary)

#### Security/Crypto Libraries

- `crypto-js` - Use Web Crypto API instead
- `bcrypt` - Handled by Supabase
- `jsonwebtoken` - Handled by Supabase
- `otpauth` - Use Supabase Auth
- `qrcode` - Not needed for core functionality

#### UI Components (Redundant)

- `@radix-ui/react-aspect-ratio` - Use CSS aspect-ratio
- `@radix-ui/react-collapsible` - Use accordion instead
- `@radix-ui/react-context-menu` - Not used in design
- `@radix-ui/react-form` - Using react-hook-form
- `@radix-ui/react-menubar` - Not used in design
- `@radix-ui/react-navigation-menu` - Custom navigation
- `@radix-ui/react-radio-group` - Not needed
- `@radix-ui/react-toggle` - Not used
- `@radix-ui/react-toggle-group` - Not used

#### Other Removed

- `dompurify` - Not needed with proper validation
- `embla-carousel-react` - Using custom carousel
- `input-otp` - Using custom OTP component
- `react-day-picker` - Using Radix calendar
- `react-resizable-panels` - Custom implementation
- `react-ts-tradingview-widgets` - Custom trading widgets
- `use-debounce` - Custom debounce hook
- `vaul` - Using Radix dialog
- `markdownlint-cli` - Not needed for this project

## Performance Rules

### Bundle Size Optimization

1. **Chunk Size Limit**: Keep chunks under 1MB
2. **Tree Shaking**: Only import used functions
3. **Code Splitting**: Use dynamic imports for routes
4. **Manual Chunks**: Group related dependencies

### Development Performance

1. **HMR Port**: Use separate port (8081) for HMR
2. **Polling**: Enable for dev containers
3. **SWC**: Use SWC for faster transpilation
4. **TypeScript**: Incremental compilation enabled

### Testing Performance

1. **Parallel Tests**: Maximum 3-4 threads
2. **Test Timeout**: 15 seconds max
3. **Coverage Thresholds**: 80% minimum
4. **Isolation**: Run tests in isolation

## Configuration Guidelines

### Package.json Scripts

```json
{
  "dev": "vite --host 0.0.0.0 --port 8080",
  "build": "tsc --noEmit && vite build",
  "test": "vitest run",
  "test:watch": "vitest --ui",
  "test:coverage": "vitest run --coverage --reporter=verbose",
  "test:e2e": "playwright test",
  "lint": "eslint . --cache --max-warnings 0",
  "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md,yml,yaml}\"",
  "typecheck": "tsc --noEmit --incremental"
}
```

### Vite Configuration

- **Host**: `0.0.0.0` for dev containers
- **Port**: `8080` for development
- **HMR**: Separate port for better performance
- **Target**: `esnext` for modern browsers
- **Minifier**: `esbuild` for speed

### TypeScript Configuration

- **Target**: `ESNext`
- **Module**: `ESNext`
- **Strict Mode**: Enabled
- **Incremental**: Enabled for performance
- **Path Mapping**: `@/*` for `./src/*`

## Dependency Management

### Version Strategy

- **Patch Updates**: Auto-update (`^` prefix)
- **Minor Updates**: Review before updating
- **Major Updates**: Thorough testing required

### Security Rules

1. **Audit**: Run `pnpm audit` regularly
2. **Updates**: Check `pnpm outdated` weekly
3. **Lockfile**: Always commit `pnpm-lock.yaml`
4. **Node Version**: Minimum Node 18.0.0

### Package Manager

- **Primary**: PNPM 9.0+ for performance
- **Fallback**: NPM 8.0+ if needed
- **Workspace**: Single workspace setup

## Build Optimization

### Production Bundle

```javascript
manualChunks: {
  'react-vendor': ['react', 'react-dom'],
  'router-vendor': ['react-router-dom'],
  'ui-vendor': ['@radix-ui/...'],
  'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
  'chart-vendor': ['recharts'],
  'query-vendor': ['@tanstack/react-query'],
  'supabase-vendor': ['@supabase/supabase-js'],
  'animation-vendor': ['framer-motion'],
  'utils-vendor': ['date-fns', 'clsx', 'tailwind-merge', 'class-variance-authority']
}
```

### Development Optimization

- **Optimized Deps**: Pre-bundle common dependencies
- **SWC**: Fast React refresh and transpilation
- **Hot Reload**: Efficient change detection

## Code Quality Rules

### ESLint Configuration

- **Flat Config**: Use new ESLint 9+ configuration
- **React Hooks**: Enforce hooks rules
- **Unused Imports**: Auto-remove unused imports
- **Max Warnings**: Zero warnings in CI

### Prettier Configuration

- **Consistent**: Format all supported file types
- **Import Sorting**: Automatic import organization
- **Tailwind**: Plugin for class sorting

### Testing Standards

- **Coverage**: Minimum 80% coverage
- **Unit Tests**: Test all business logic
- **E2E Tests**: Test critical user paths
- **Component Tests**: Test UI components

## Monitoring & Performance

### Build Analysis

```bash
npm run build:analyze  # Analyze bundle size
```

### Performance Metrics

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Development Metrics

- **Dev Server Start**: < 3s
- **HMR Update**: < 200ms
- **TypeScript Check**: < 5s
- **Test Suite**: < 30s

## Migration & Updates

### Dependency Updates

1. Check changelog and breaking changes
2. Update dev dependencies first
3. Run full test suite
4. Update production dependencies
5. Test in staging environment

### Version Control

- **Semantic Versioning**: Follow semver strictly
- **Lockfile**: Update lockfile with dependencies
- **Documentation**: Update this document with changes

## Troubleshooting

### Common Issues

1. **Memory Issues**: Increase Node memory limit
2. **Port Conflicts**: Use different ports for services
3. **Cache Issues**: Clear `.vite` and `node_modules/.cache`
4. **Type Errors**: Run `tsc --noEmit` to check types

### Performance Issues

1. **Bundle Size**: Check manual chunks configuration
2. **Dev Server**: Enable polling in containers
3. **Test Performance**: Reduce thread count
4. **Build Time**: Use SWC for transpilation

---

**Last Updated**: June 17, 2025
**Version**: 1.0.0
**Maintainer**: Trade-Pro Development Team

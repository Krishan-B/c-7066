# Frontend Reorganization Strategy

## Current Structure Analysis

The current frontend structure has several challenges:

1. **Mixed Organization Approaches**: Some code is organized by feature (in `/src/features`), while
   most UI components are in the general `/src/components` directory.
2. **Deep Nesting**: Components are nested in subdirectories with varying levels of specificity.
3. **Inconsistent Component Categorization**: Some components that belong together functionally are
   separated in the directory structure.

## Reorganization Principles

1. **Feature-First**: Organize code primarily around features rather than technical concepts.
2. **Co-location**: Keep related files (components, hooks, utils, types) close to where they're
   used.
3. **Consistent Naming**: Use consistent naming conventions across the codebase.
4. **Shared Components**: Only components used across multiple features should be in shared
   directories.

## New Directory Structure

```
/src
  /features                     # Feature modules
    /auth                       # Authentication feature
      /components               # Auth-specific components
      /hooks                    # Auth-specific hooks
      /utils                    # Auth-specific utilities
      /types                    # Auth-specific types
      AuthPage.tsx              # Main page component
      index.ts                  # Public API for the feature
    /trading                    # Trading feature
      /components               # Trading-specific components
      /hooks                    # Trading-specific hooks
      /utils                    # Trading-specific utils
      /types                    # Trading-specific types
      TradingPage.tsx           # Main page component
      index.ts                  # Public API for the feature
    /kyc                        # KYC feature
      ...
    /profile                    # User profile feature
      ...
    /market                     # Market data feature
      ...
    /wallet                     # Wallet management feature
      ...
    /analytics                  # Trading analytics feature
      ...
  /layouts                      # Layout components
    MainLayout.tsx              # Main application layout
    AuthLayout.tsx              # Authentication pages layout
    DashboardLayout.tsx         # Dashboard layout
    index.ts                    # Export all layouts
  /components                   # Shared components
    /ui                         # UI primitives (buttons, inputs, etc.)
    /data-display               # Data display components (tables, charts)
    /feedback                   # Feedback components (alerts, toasts)
    /navigation                 # Navigation components
    /providers                  # Context providers
    /hoc                        # Higher-order components
  /hooks                        # Shared hooks
  /utils                        # Shared utilities
  /services                     # API services
  /lib                          # Library code and integrations
  /types                        # Shared TypeScript types
  /assets                       # Static assets
  /context                      # Global context providers
  /store                        # Global state (if using Redux)
  App.tsx                       # Root component
  main.tsx                      # Application entry point
  routes.tsx                    # Application routes
```

## Implementation Plan

### Phase 1: Create New Directory Structure

- Create all necessary directories in the new structure

### Phase 2: Migrate Core Features

- Migrate feature modules (auth, kyc, profile) to the new structure
- Create proper index.ts exports

### Phase 3: Reorganize Components

- Move components to appropriate feature directories
- Move shared components to categorized shared component directories

### Phase 4: Update Layouts

- Create layouts directory
- Move and refactor layout components

### Phase 5: Update Imports

- Update import paths throughout the codebase
- Ensure all references are correct

### Phase 6: Verify and Test

- Run tests to ensure everything works
- Fix any issues discovered during testing

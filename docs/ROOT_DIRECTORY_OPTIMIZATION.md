# Root Directory Optimization Plan

## Overview

This document outlines the plan for optimizing the root directory structure of the Trade-Pro
application, following industry best practices and ensuring compliance with the PRD.

## Current Issues

- Configuration files scattered throughout the root directory
- Inconsistent naming conventions
- Limited documentation on configuration relationships
- Mixed organization patterns
- Unclear boundaries between frontend and backend code

## Optimization Goals

1. Improve developer experience
2. Enhance maintainability
3. Clarify project structure
4. Standardize naming conventions
5. Ensure PRD compliance
6. Facilitate better onboarding

## Proposed Directory Structure

```
/workspaces/Trade-Pro/
├── .github/                  # GitHub workflows and templates
├── config/                   # Centralized configuration
│   ├── eslint/               # ESLint configuration
│   ├── jest/                 # Jest configuration
│   ├── typescript/           # TypeScript configuration
│   └── vite/                 # Vite configuration
├── docs/                     # Documentation
├── public/                   # Static assets
├── scripts/                  # Utility and automation scripts
├── src/                      # Frontend source code
│   ├── assets/               # Frontend assets
│   ├── components/           # Shared UI components
│   ├── features/             # Feature modules
│   │   ├── auth/             # Authentication feature
│   │   ├── trading/          # Trading feature
│   │   ├── kyc/              # KYC feature
│   │   └── wallet/           # Wallet feature
│   ├── hooks/                # Custom React hooks
│   ├── layouts/              # Layout components
│   ├── pages/                # Page components
│   ├── services/             # Frontend services
│   ├── styles/               # Global styles
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Utility functions
├── server/                   # Backend code (renamed from backend-api)
│   ├── src/                  # Backend source code
│   ├── tests/                # Backend tests
│   └── config/               # Backend configuration
├── supabase/                 # Supabase configuration
├── tests/                    # Frontend tests
│   ├── e2e/                  # End-to-end tests
│   ├── integration/          # Integration tests
│   ├── unit/                 # Unit tests
│   └── utils/                # Test utilities
├── .env.example              # Example environment variables
├── .gitignore                # Git ignore file
├── package.json              # Project dependencies and scripts
└── README.md                 # Project documentation
```

## Migration Strategy

### Phase 1: Configuration Consolidation

1. Create a centralized `config/` directory
2. Move all configuration files into appropriate subdirectories
3. Update references in build scripts and code

### Phase 2: Frontend Organization

1. Reorganize `src/` directory following feature-based architecture
2. Update import paths throughout the codebase
3. Ensure all components have consistent file naming and organization

### Phase 3: Backend Reorganization

1. Rename `backend-api/` to `server/` for clarity
2. Standardize backend directory structure
3. Update references in documentation and code

### Phase 4: Testing Structure

1. Organize tests by type (unit, integration, e2e)
2. Ensure test utilities are centralized
3. Standardize test naming conventions

## Compatibility Considerations

- Ensure all build tools work with the new structure
- Update import paths throughout the codebase
- Update documentation references
- Maintain backward compatibility where possible

## Rollback Plan

In case of issues, the backup created before migration will be used to restore the previous state
following the procedure in the Backup Strategy document.

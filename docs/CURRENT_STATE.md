# Current State Documentation

## Overview

This document captures the current state of the Trade-Pro application before the Phase 3 migration
and reorganization. It serves as a reference point for rollback if needed and to verify
functionality after migration.

## Directory Structure

The current project structure follows a mixed organization pattern with some features organized by
technical concerns and others by domain features.

### Root Directory

- Configuration files (package.json, tsconfig.json, etc.)
- Build tools configuration (vite.config.ts, etc.)
- Testing configuration (jest.config.mjs)
- Documentation and README files

### Source Code Organization

- `src/components/` - UI components, mixed by feature and generic
- `src/features/` - Feature modules with some business logic
- `src/hooks/` - Custom React hooks for shared functionality
- `src/services/` - API services and data handling
- `src/integrations/` - Third-party integrations
- `src/pages/` - Page components and routes
- `src/utils/` - Utility functions
- `src/types/` - Type definitions

### Backend Structure

- `backend-api/` - Backend API implementation
- `supabase/` - Supabase configuration and migrations

## Key Features and Their Implementation

### Authentication System

- Sign-in, registration, and password reset functionality
- JWT token management
- Protected routes

### Trading Platform

- Market data display and visualization
- Order management (create, update, cancel)
- Position tracking and management
- Portfolio analytics

### KYC Process

- Document upload and verification
- Status tracking
- RLS policies for security

### Wallet Management

- Deposit and withdrawal simulation
- Balance tracking
- Transaction history

## Configuration Management

Currently, configuration is spread across multiple files:

- Environment variables in .env files
- Build configuration in vite.config.ts
- TypeScript configuration in tsconfig\*.json files
- Testing configuration in jest\*.config.js files

## Testing Coverage

- Unit tests for core services
- Integration tests for Supabase features
- Limited component testing

## Known Issues

- Some inconsistent import paths
- Mixed organization patterns causing confusion
- Configuration spread across multiple files
- Incomplete test coverage for some features

## Performance Baseline

- Initial load time: ~1.2 seconds
- API response times: 200-500ms average
- Real-time updates: ~50ms latency

## Integration Points

- Supabase for backend services
- TradingView for charts
- Market data providers
- KYC verification services

This document serves as the baseline against which all changes will be measured during the Phase 3
migration process.

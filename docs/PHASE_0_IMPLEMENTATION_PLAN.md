# Phase 0: Pre-requisites & Critical Alignment - Implementation Plan

**Date:** June 18, 2025
**Status:** Draft - Requires Review & Decision
**Priority:** Critical - Foundation for entire project

## Executive Summary

This document addresses the 5 critical Phase 0 items identified in the implementation plan. Each item has been thoroughly analyzed with the current codebase, and actionable recommendations are provided with timelines and technical implementation details.

---

## 1. Decision on UI Library

### Current State Analysis

- **✅ Current Implementation:** shadcn/ui with Radix UI primitives
- **📦 Components Identified:** 15+ Radix UI components actively used
- **🎨 Styling:** Tailwind CSS with custom theme system
- **🔧 Integration:** Deep integration with existing components

### Current shadcn/ui Implementation Evidence:

```typescript
// Current dependencies show extensive shadcn/ui usage:
"@radix-ui/react-accordion": "^1.2.11",
"@radix-ui/react-alert-dialog": "^1.1.14",
"@radix-ui/react-avatar": "^1.1.10",
// ... 15+ more Radix UI components
```

### PRD vs Current Implementation Gap:

- **PRD States:** Material-UI/Ant Design preference
- **Reality:** shadcn/ui is modern, TypeScript-native, and well-integrated
- **Migration Cost:** 2-3 weeks of development time

### **RECOMMENDATION: Keep shadcn/ui**

**Rationale:**

1. **Modern & Capable:** shadcn/ui provides all required components
2. **TypeScript Native:** Better type safety than Material-UI
3. **Performance:** Smaller bundle size than Ant Design
4. **Customization:** Superior theming flexibility
5. **Migration Risk:** High risk of introducing bugs

### Action Items:

- [ ] **Update PRD** to reflect shadcn/ui as the chosen UI library
- [ ] **Document component inventory** in `/docs/UI_COMPONENT_LIBRARY.md`
- [ ] **Standardize component usage** patterns across the codebase

**Timeline:** 2 days
**Owner:** Frontend Team Lead

---

## 2. Market Data Source Migration Planning

### Current State Analysis

**Existing Data Sources:**

- ✅ Alpha Vantage (Rate limited: 5 req/min, 500/day)
- ✅ Finnhub (Rate limited: 60 req/min)
- ✅ Polygon (Rate limited: 5 req/min free tier)
- ✅ CoinGecko (Crypto data)
- ❌ Yahoo Finance (PRD requirement - not implemented)

### Current Architecture:

```typescript
// Existing data source handlers:
/client/src/hooks/market/api/
├── alphaVantageHandler.ts    ✅ Implemented
├── finnhubHandler.ts         ✅ Implemented
├── polygonHandler.ts         ✅ Implemented
└── yahooFinanceHandler.ts    ❌ Missing (PRD requirement)
```

### Yahoo Finance API Analysis:

**✅ Advantages:**

- Free tier with generous limits
- Comprehensive asset coverage
- Real-time data for major markets
- Historical data availability
- No API key required

**⚠️ Challenges:**

- Unofficial API (subject to changes)
- Rate limiting exists but less documented
- Data reliability concerns for production use

### **RECOMMENDATION: Hybrid Approach**

**Phase 1: Implement Yahoo Finance**

- Primary source for stocks, indices, forex
- Fallback to existing providers on failure

**Phase 2: Smart Routing**

- Route requests based on asset type and availability
- Implement caching layer to reduce API calls

### Implementation Plan:

#### Week 1: Yahoo Finance Integration

```typescript
// New file: /client/src/hooks/market/api/yahooFinanceHandler.ts
export const fetchYahooFinanceData = async (
  symbols: string[]
): Promise<Asset[]> => {
  // Implementation using Yahoo Finance API
  const response = await fetch(
    `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(',')}`
  );
  // Transform and return data
};
```

#### Week 2: Smart Data Source Router

```typescript
// Enhanced: /client/src/hooks/market/useMarketData.ts
const DATA_SOURCE_PRIORITY = {
  Stock: ['yahoo', 'alphavantage', 'polygon'],
  Forex: ['yahoo', 'alphavantage'],
  Crypto: ['coingecko', 'yahoo'],
  Index: ['yahoo', 'alphavantage'],
  Commodity: ['alphavantage', 'yahoo'],
};
```

#### Week 3: Migration & Testing

- Gradual migration of existing endpoints
- A/B testing between data sources
- Performance monitoring and comparison

### Action Items:

- [ ] **Research Yahoo Finance API** limitations and terms of service
- [ ] **Implement Yahoo Finance handler** following existing patterns
- [ ] **Create data source comparison dashboard** for monitoring
- [ ] **Update PRD** with final data source strategy

**Timeline:** 3 weeks
**Owner:** Backend/API Team

---

## 3. Plexop Internal Tool - Initial Scoping & Design

### Current State Analysis

**Existing Components for Admin Functionality:**

```typescript
// Found in codebase:
/client/src/components/admin/
└── IPAllowlistManager.tsx    ✅ Security management component

// Database structure supports admin needs:
/supabase/migrations/
├── create_user_account_table.sql     ✅ User accounts
├── create_user_portfolio_table.sql   ✅ Portfolio management
└── create_user_trades_table.sql      ✅ Trade history
```

### PRD Requirements Analysis:

**Core Admin Features Needed:**

1. **User Management Dashboard** - View/manage all users
2. **KYC Document Review** - Approve/reject documents
3. **Account Balance Management** - Add/subtract balances
4. **Analytics & Reporting** - User metrics, KYC stats

### **RECOMMENDATION: Integrated Admin Module**

**Architecture Decision: Admin module within main application**

- Leverage existing authentication system
- Reuse UI components and styling
- Single deployment and maintenance

### Technical Implementation Plan:

#### Week 1: Admin Route & Authentication

```typescript
// New routes in /client/src/App.tsx
<Route path="/admin/*" element={<AdminLayout />}>
  <Route path="dashboard" element={<AdminDashboard />} />
  <Route path="users" element={<UserManagement />} />
  <Route path="kyc" element={<KYCManagement />} />
  <Route path="analytics" element={<AdminAnalytics />} />
</Route>
```

#### Week 2: User Management Interface

```typescript
// New component: /client/src/components/admin/UserManagement.tsx
export const UserManagement = () => {
  // User list with filtering, searching, status management
  // Account balance adjustment interface
  // User activity monitoring
};
```

#### Week 3: KYC Management System

```typescript
// New component: /client/src/components/admin/KYCManagement.tsx
export const KYCManagement = () => {
  // Document review interface
  // Bulk approval/rejection
  // Document viewer with zoom
};
```

#### Week 4: Analytics Dashboard

```typescript
// New component: /client/src/components/admin/AdminAnalytics.tsx
export const AdminAnalytics = () => {
  // User registration trends
  // KYC approval rates
  // Trading activity metrics
};
```

### Database Schema Requirements:

```sql
-- New table needed for admin users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT NOT NULL DEFAULT 'admin',
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- KYC documents table (enhance existing if present)
CREATE TABLE kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  document_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  reviewed_by UUID REFERENCES admin_users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  comments TEXT
);
```

### Action Items:

- [ ] **Create admin user role system** in Supabase
- [ ] **Design admin interface mockups** using existing shadcn/ui components
- [ ] **Implement role-based access control** for admin routes
- [ ] **Create KYC document upload/review workflow**

**Timeline:** 4 weeks
**Owner:** Full-stack Team

---

## 4. Database Schema Alignment Strategy

### Current Schema Analysis

**✅ Existing Tables (Supabase):**

```sql
-- User accounts with financial data
user_account (
  id UUID PRIMARY KEY,
  cash_balance DECIMAL(18, 8) DEFAULT 10000.00,
  equity DECIMAL(18, 8) DEFAULT 10000.00,
  used_margin DECIMAL(18, 8) DEFAULT 0.00,
  -- ... additional fields
)

-- Portfolio holdings
user_portfolio (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  asset_symbol TEXT NOT NULL,
  market_type TEXT NOT NULL,
  units DECIMAL(18, 8) NOT NULL,
  -- ... position details
)

-- Trade history
user_trades (
  -- Trade execution records
)
```

**❌ Missing Tables (Per PRD):**

```sql
-- PRD requires these additional tables:
assets (          -- Asset definitions and metadata
kyc_documents (   -- KYC document management
orders (          -- Order management system
positions (       -- Live position tracking
admin_users (     -- Admin role management
```

### Schema Gap Analysis:

| PRD Table       | Current Status | Priority | Implementation Complexity           |
| --------------- | -------------- | -------- | ----------------------------------- |
| `assets`        | ❌ Missing     | High     | Medium - Asset metadata management  |
| `kyc_documents` | ❌ Missing     | Critical | Low - Simple document tracking      |
| `orders`        | ❌ Missing     | High     | High - Complex order lifecycle      |
| `positions`     | ✅ Partial     | High     | Medium - Enhance existing portfolio |
| `admin_users`   | ❌ Missing     | Medium   | Low - Simple role management        |

### **RECOMMENDATION: Phased Migration Approach**

#### Phase 1 (Week 1): Critical Missing Tables

```sql
-- KYC Documents (Critical for user onboarding)
CREATE TABLE kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  document_type TEXT NOT NULL,
  category TEXT NOT NULL, -- 'ID_VERIFICATION', 'ADDRESS_VERIFICATION', 'OTHER'
  file_url TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  comments TEXT
);

-- Assets Master Table
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  asset_class TEXT NOT NULL, -- 'FOREX', 'STOCKS', 'CRYPTO', etc.
  base_currency TEXT,
  quote_currency TEXT,
  leverage_max INTEGER,
  spread_base DECIMAL(8,5),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### Phase 2 (Week 2): Order Management System

```sql
-- Orders Table (Complex - requires careful design)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES user_account(id),
  asset_id UUID REFERENCES assets(id),
  order_type TEXT NOT NULL, -- 'MARKET', 'LIMIT', 'STOP'
  side TEXT NOT NULL, -- 'BUY', 'SELL'
  quantity DECIMAL(15,4) NOT NULL,
  price DECIMAL(15,5),
  status TEXT DEFAULT 'PENDING', -- 'PENDING', 'FILLED', 'CANCELLED'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  filled_at TIMESTAMP WITH TIME ZONE
);
```

#### Phase 3 (Week 3): Enhanced Position Tracking

```sql
-- Enhance existing user_portfolio or create new positions table
ALTER TABLE user_portfolio ADD COLUMN leverage INTEGER DEFAULT 1;
ALTER TABLE user_portfolio ADD COLUMN margin_required DECIMAL(15,2);
ALTER TABLE user_portfolio ADD COLUMN take_profit DECIMAL(15,5);
ALTER TABLE user_portfolio ADD COLUMN stop_loss DECIMAL(15,5);
```

### Migration Strategy:

1. **Zero-downtime migrations** using Supabase migrations
2. **Data preservation** - migrate existing data to new schema
3. **Rollback plan** - keep old tables until migration is confirmed
4. **API compatibility** - update endpoints to use new schema

### Action Items:

- [ ] **Create detailed migration scripts** for each phase
- [ ] **Test migrations** in staging environment
- [ ] **Update API endpoints** to use new schema
- [ ] **Migrate existing data** to new structure

**Timeline:** 3 weeks
**Owner:** Database/Backend Team

---

## 5. Security Requirements - Foundational Review

### Current Security Analysis

**✅ Existing Security Measures:**

```typescript
// Authentication (Supabase Auth)
- JWT tokens with expiry
- Row Level Security (RLS) policies
- Password requirements enforced by Supabase

// Input Validation
- Zod schemas for form validation
- TypeScript type safety
- React Hook Form integration

// API Security
- CORS headers configured
- Rate limiting on Supabase functions
- Environment variable protection
```

**❌ Security Gaps Identified:**

| Vulnerability      | Current State                       | Risk Level | Priority |
| ------------------ | ----------------------------------- | ---------- | -------- |
| API Key Exposure   | Client-side API keys                | High       | Critical |
| Input Sanitization | Limited backend validation          | Medium     | High     |
| SQL Injection      | Supabase client provides protection | Low        | Medium   |
| XSS Prevention     | No explicit sanitization            | Medium     | High     |
| Rate Limiting      | Basic Supabase limits               | Medium     | Medium   |

### **RECOMMENDATION: Security-First Approach**

#### Critical Issues (Week 1):

**1. API Key Security**

```typescript
// CURRENT PROBLEM: API keys in client code
const POLYGON_API_KEY = 'exposed_in_client'; // ❌ CRITICAL

// SOLUTION: Move to server-side Supabase functions
// All external API calls through secured edge functions
```

**2. Input Validation & Sanitization**

```typescript
// IMPLEMENT: Server-side validation layer
// New file: /supabase/functions/_shared/validation.ts
export const validateTradeInput = (input: unknown) => {
  // Zod schema validation
  // SQL injection prevention
  // XSS sanitization
};
```

#### High Priority (Week 2):

**3. Rate Limiting Enhancement**

```typescript
// Current: Basic Supabase rate limiting
// Enhanced: Custom rate limiting per user/endpoint
export const rateLimiter = {
  trading: '10 requests per minute per user',
  marketData: '100 requests per minute per user',
  auth: '5 failed attempts per 15 minutes',
};
```

**4. Security Headers & CORS**

```typescript
// Enhance CORS configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS,
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
};
```

### Implementation Plan:

#### Week 1: Critical Security Fixes

- [ ] **Move all API keys** to Supabase environment variables
- [ ] **Implement server-side input validation** for all endpoints
- [ ] **Add XSS protection** to user-generated content
- [ ] **Enhanced password policies** and 2FA preparation

#### Week 2: Security Infrastructure

- [ ] **Implement custom rate limiting** per user/endpoint
- [ ] **Add security headers** to all responses
- [ ] **Create security monitoring** dashboard
- [ ] **Establish incident response** procedures

#### Week 3: Security Testing & Monitoring

- [ ] **Penetration testing** of critical endpoints
- [ ] **Security audit** of authentication flows
- [ ] **Implement logging** for security events
- [ ] **Create security documentation** for team

### Security Checklist:

```markdown
- [ ] No API keys in client-side code
- [ ] All user inputs validated server-side
- [ ] SQL injection protection via Supabase client
- [ ] XSS prevention implemented
- [ ] Rate limiting per user implemented
- [ ] Security headers configured
- [ ] Authentication flows secured
- [ ] File upload security (for KYC documents)
- [ ] Error messages don't expose sensitive data
- [ ] Logging for security events
```

### Action Items:

- [ ] **Security audit** of current implementation
- [ ] **Move API keys** to server-side immediately
- [ ] **Implement comprehensive input validation**
- [ ] **Create security monitoring dashboard**

**Timeline:** 3 weeks (Critical items in Week 1)
**Owner:** Security Team Lead + Full-stack Team

---

## Phase 0 Implementation Timeline

### Overall Schedule:

```
Week 1: Critical Security + UI Library Decision
├── Day 1-2: UI Library decision & PRD update
├── Day 3-5: Move API keys to server-side (CRITICAL)
└── Day 6-7: Begin input validation implementation

Week 2: Database Schema + Yahoo Finance
├── Database schema migration (Phase 1)
├── Yahoo Finance API integration
└── Continue security implementations

Week 3: Admin Tool Foundation + Testing
├── Admin module architecture
├── Security testing and validation
└── Integration testing of all components

Week 4: Final Integration + Documentation
├── Complete admin tool basic features
├── Final security audit
└── Documentation and handoff
```

### Resource Requirements:

- **Frontend Developer:** 1 FTE (UI decisions, admin interface)
- **Backend Developer:** 1 FTE (API migrations, security)
- **Full-stack Developer:** 0.5 FTE (integration, testing)
- **Security Specialist:** 0.25 FTE (audit, guidance)

### Risk Mitigation:

1. **API Key Security:** Highest priority - immediate action required
2. **Database Migration:** Test thoroughly in staging first
3. **Yahoo Finance Integration:** Have fallback to existing providers
4. **Admin Tool:** Start with MVP, iterate based on feedback

---

## Next Steps

### Immediate Actions (Next 48 Hours):

1. **📝 Team Review:** Schedule review meeting with all stakeholders
2. **🔒 Security:** Begin moving API keys to server-side immediately
3. **📋 Decision:** Finalize UI library decision (recommend keeping shadcn/ui)
4. **📊 Planning:** Create detailed sprint planning for 4-week timeline

### Success Criteria:

- [ ] All API keys moved to server-side (Security)
- [ ] Yahoo Finance integration working (Market Data)
- [ ] Admin tool MVP deployed (Internal Tool)
- [ ] Database schema aligned with PRD (Data Structure)
- [ ] Security audit passed (Foundation)

---

**Document Owner:** Technical Lead  
**Last Updated:** June 18, 2025  
**Next Review:** June 20, 2025  
**Status:** Ready for Team Review

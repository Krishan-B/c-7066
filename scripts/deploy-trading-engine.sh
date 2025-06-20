#!/bin/bash

# Trading Engine Deployment Script
# Deploy Trading Engine and Risk Management Functions to Supabase
# Date: June 19, 2025

set -e

echo "🚀 Trading Engine Deployment Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="/workspaces/Trade-Pro"
cd "$PROJECT_ROOT"

# Check if project ID is configured
if [ ! -f "supabase/config.toml" ]; then
    echo -e "${RED}❌ Error: supabase/config.toml not found${NC}"
    exit 1
fi

PROJECT_ID=$(grep "project_id" supabase/config.toml | cut -d'"' -f2)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ Error: project_id not found in supabase/config.toml${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Project ID: $PROJECT_ID${NC}"

# Function to deploy using curl (manual deployment)
deploy_function() {
    local function_name=$1
    local function_path=$2
    
    echo -e "${YELLOW}📦 Preparing $function_name for deployment...${NC}"
    
    if [ ! -d "$function_path" ]; then
        echo -e "${RED}❌ Function directory not found: $function_path${NC}"
        return 1
    fi
    
    if [ ! -f "$function_path/index.ts" ]; then
        echo -e "${RED}❌ Function index.ts not found in: $function_path${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Function $function_name is ready for deployment${NC}"
    echo -e "${BLUE}   Path: $function_path${NC}"
    echo -e "${BLUE}   Files:$(ls -la $function_path)${NC}"
    
    return 0
}

# Function to check database migrations
check_migrations() {
    echo -e "${YELLOW}🗄️  Checking database migrations...${NC}"
    
    if [ ! -d "supabase/migrations" ]; then
        echo -e "${RED}❌ Migrations directory not found${NC}"
        return 1
    fi
    
    migration_count=$(ls supabase/migrations/*.sql 2>/dev/null | wc -l)
    echo -e "${BLUE}📊 Found $migration_count migration files${NC}"
    
    if [ $migration_count -gt 0 ]; then
        echo -e "${GREEN}✅ Database migrations ready${NC}"
        ls -la supabase/migrations/
    else
        echo -e "${YELLOW}⚠️  No migration files found${NC}"
    fi
    
    return 0
}

# Main deployment process
main() {
    echo -e "${BLUE}🔍 Pre-deployment checks...${NC}"
    
    # Check Trading Engine function
    if deploy_function "trading-engine" "supabase/functions/trading-engine"; then
        echo -e "${GREEN}✅ Trading Engine function validated${NC}"
    else
        echo -e "${RED}❌ Trading Engine function validation failed${NC}"
        exit 1
    fi
    
    # Check Risk Management function
    if deploy_function "risk-management" "supabase/functions/risk-management"; then
        echo -e "${GREEN}✅ Risk Management function validated${NC}"
    else
        echo -e "${RED}❌ Risk Management function validation failed${NC}"
        exit 1
    fi
    
    # Check database migrations
    check_migrations
    
    echo -e "${GREEN}🎉 All pre-deployment checks passed!${NC}"
    echo ""
    echo -e "${YELLOW}📋 Manual Deployment Instructions:${NC}"
    echo -e "${BLUE}===================================${NC}"
    echo ""
    echo -e "${YELLOW}1. Install Supabase CLI manually:${NC}"
    echo "   curl -o- https://raw.githubusercontent.com/supabase/cli/main/install.sh | bash"
    echo "   # OR using a package manager like brew, apt, etc."
    echo ""
    echo -e "${YELLOW}2. Login to Supabase:${NC}"
    echo "   supabase login"
    echo ""
    echo -e "${YELLOW}3. Link your project:${NC}"
    echo "   supabase link --project-ref $PROJECT_ID"
    echo ""
    echo -e "${YELLOW}4. Deploy the database migrations:${NC}"
    echo "   supabase db push"
    echo ""
    echo -e "${YELLOW}5. Deploy the edge functions:${NC}"
    echo "   supabase functions deploy trading-engine"
    echo "   supabase functions deploy risk-management"
    echo ""
    echo -e "${YELLOW}6. Set environment variables for functions:${NC}"
    echo "   supabase secrets set ALLOWED_ORIGINS='http://localhost:8080,https://yourdomain.com'"
    echo "   supabase secrets set RATE_LIMIT_REQUESTS='100'"
    echo "   supabase secrets set RATE_LIMIT_WINDOW='1'"
    echo ""
    echo -e "${GREEN}🔧 Alternative: Deploy via Supabase Dashboard${NC}"
    echo -e "${BLUE}=============================================${NC}"
    echo "1. Go to: https://supabase.com/dashboard/project/$PROJECT_ID"
    echo "2. Navigate to 'Database' > 'SQL Editor'"
    echo "3. Run the migration SQL files manually"
    echo "4. Navigate to 'Edge Functions'"
    echo "5. Create new functions and copy the code from:"
    echo "   - supabase/functions/trading-engine/index.ts"
    echo "   - supabase/functions/risk-management/index.ts"
    echo ""
    echo -e "${GREEN}✅ Deployment preparation complete!${NC}"
}

# Run main function
main

echo ""
echo -e "${BLUE}📚 For detailed deployment documentation, see:${NC}"
echo -e "${BLUE}   TRADING_ENGINE_README.md${NC}"
echo ""
echo -e "${GREEN}🎯 Next steps after deployment:${NC}"
echo -e "${GREEN}1. Test the trading engine functions${NC}"
echo -e "${GREEN}2. Verify database schema is applied${NC}"
echo -e "${GREEN}3. Configure client environment variables${NC}"
echo -e "${GREEN}4. Run the comprehensive trading dashboard${NC}"

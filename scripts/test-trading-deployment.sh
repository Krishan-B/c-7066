#!/bin/bash

# Trading Engine Post-Deployment Testing Script
# Validate that the Trading Engine is working correctly
# Date: June 19, 2025

set -e

echo "🧪 Trading Engine Deployment Testing"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ROOT="/workspaces/Trade-Pro"
cd "$PROJECT_ROOT"

# Load environment variables
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo -e "${GREEN}✅ Environment variables loaded${NC}"
else
    echo -e "${RED}❌ .env file not found${NC}"
    exit 1
fi

# Check required environment variables
check_required_env() {
    local var_name=$1
    local var_value=$(eval echo \$$var_name)
    
    if [ -z "$var_value" ] || [[ "$var_value" == *"_here"* ]]; then
        echo -e "${RED}❌ $var_name is not configured${NC}"
        return 1
    else
        echo -e "${GREEN}✅ $var_name is configured${NC}"
        return 0
    fi
}

echo -e "${BLUE}🔍 Environment Variables Check:${NC}"
echo "==============================="

ENV_CHECK_PASSED=true

if ! check_required_env "SUPABASE_URL"; then ENV_CHECK_PASSED=false; fi
if ! check_required_env "SUPABASE_ANON_KEY"; then ENV_CHECK_PASSED=false; fi

if [ "$ENV_CHECK_PASSED" = false ]; then
    echo -e "${RED}❌ Environment check failed. Please configure your .env file.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🌐 Testing Supabase Connection:${NC}"
echo "==============================="

# Test Supabase connection
SUPABASE_HEALTH_URL="${SUPABASE_URL}/rest/v1/"
echo -e "${YELLOW}Testing connection to: $SUPABASE_HEALTH_URL${NC}"

if curl -s -f -H "apikey: $SUPABASE_ANON_KEY" "$SUPABASE_HEALTH_URL" > /dev/null; then
    echo -e "${GREEN}✅ Supabase connection successful${NC}"
else
    echo -e "${RED}❌ Supabase connection failed${NC}"
    echo -e "${YELLOW}Please check your SUPABASE_URL and SUPABASE_ANON_KEY${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔧 Testing Edge Functions:${NC}"
echo "=========================="

# Function to test edge function
test_edge_function() {
    local function_name=$1
    local endpoint="${SUPABASE_URL}/functions/v1/${function_name}"
    
    echo -e "${YELLOW}Testing $function_name function...${NC}"
    
    # Test with a simple health check or options request
    response=$(curl -s -w "%{http_code}" -o /dev/null \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        -H "Content-Type: application/json" \
        -X OPTIONS \
        "$endpoint" 2>/dev/null || echo "000")
    
    if [ "$response" = "200" ] || [ "$response" = "204" ]; then
        echo -e "${GREEN}✅ $function_name function is accessible${NC}"
        return 0
    else
        echo -e "${RED}❌ $function_name function not accessible (HTTP $response)${NC}"
        echo -e "${YELLOW}   This is normal if the function hasn't been deployed yet${NC}"
        return 1
    fi
}

# Test both functions
FUNCTIONS_DEPLOYED=true

if ! test_edge_function "trading-engine"; then FUNCTIONS_DEPLOYED=false; fi
if ! test_edge_function "risk-management"; then FUNCTIONS_DEPLOYED=false; fi

echo ""
echo -e "${BLUE}🗄️  Testing Database Schema:${NC}"
echo "============================"

# Test if our custom tables exist by querying the information schema
DB_QUERY_URL="${SUPABASE_URL}/rest/v1/rpc/check_table_exists"

check_table() {
    local table_name=$1
    
    echo -e "${YELLOW}Checking if table '$table_name' exists...${NC}"
    
    # This is a simple check - in practice, you might want to create an RPC function
    # for this purpose or use the information_schema
    response=$(curl -s -w "%{http_code}" -o /dev/null \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        -H "Content-Type: application/json" \
        -H "apikey: $SUPABASE_ANON_KEY" \
        "${SUPABASE_URL}/rest/v1/$table_name?limit=1" 2>/dev/null || echo "000")
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ Table '$table_name' exists and is accessible${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Table '$table_name' may not exist yet (HTTP $response)${NC}"
        return 1
    fi
}

# Check for our trading engine tables
TABLES_EXIST=true

if ! check_table "orders"; then TABLES_EXIST=false; fi
if ! check_table "positions"; then TABLES_EXIST=false; fi
if ! check_table "user_trades"; then TABLES_EXIST=false; fi

echo ""
echo -e "${BLUE}📊 Test Results Summary:${NC}"
echo "======================="

echo -e "${GREEN}✅ Environment Configuration: PASSED${NC}"

if [ "$FUNCTIONS_DEPLOYED" = true ]; then
    echo -e "${GREEN}✅ Edge Functions: ACCESSIBLE${NC}"
else
    echo -e "${YELLOW}⚠️  Edge Functions: NOT YET DEPLOYED${NC}"
fi

if [ "$TABLES_EXIST" = true ]; then
    echo -e "${GREEN}✅ Database Schema: APPLIED${NC}"
else
    echo -e "${YELLOW}⚠️  Database Schema: NOT YET APPLIED${NC}"
fi

echo ""
echo -e "${BLUE}🎯 Next Steps Based on Test Results:${NC}"
echo "===================================="

if [ "$FUNCTIONS_DEPLOYED" = false ]; then
    echo -e "${YELLOW}📦 Deploy Edge Functions:${NC}"
    echo "   supabase functions deploy trading-engine"
    echo "   supabase functions deploy risk-management"
    echo ""
fi

if [ "$TABLES_EXIST" = false ]; then
    echo -e "${YELLOW}🗄️  Apply Database Migrations:${NC}"
    echo "   supabase db push"
    echo ""
fi

echo -e "${YELLOW}🔐 Set Edge Function Environment Variables:${NC}"
echo "   1. Go to Supabase Dashboard > Project Settings > Edge Functions"
echo "   2. Add environment variables from your .env file"
echo ""

echo -e "${YELLOW}🧪 Run Client-Side Tests:${NC}"
echo "   npm test"
echo "   npm run test:security"
echo ""

echo -e "${GREEN}🎉 Testing complete!${NC}"
echo ""
echo -e "${BLUE}📚 For detailed troubleshooting, see:${NC}"
echo -e "${BLUE}   docs/TROUBLESHOOTING.md${NC}"
echo -e "${BLUE}   TRADING_ENGINE_README.md${NC}"

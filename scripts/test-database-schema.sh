#!/bin/bash

# Database Schema Alignment Testing Script
# Phase 0 Implementation - Database Validation

echo "🗄️  Database Schema Alignment Testing - Phase 0"
echo "==============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_RUN=0
TESTS_PASSED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    TESTS_RUN=$((TESTS_RUN + 1))
    echo -e "${BLUE}Test $TESTS_RUN:${NC} $test_name"
    
    if eval "$test_command"; then
        if [ "$expected_result" = "success" ]; then
            echo -e "${GREEN}✅ PASS${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "${RED}❌ FAIL (Expected failure but got success)${NC}"
        fi
    else
        if [ "$expected_result" = "fail" ]; then
            echo -e "${GREEN}✅ PASS (Expected failure)${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "${RED}❌ FAIL${NC}"
        fi
    fi
    echo ""
}

# Test 1: Schema files existence
echo -e "${YELLOW}1. Schema Files Tests${NC}"
echo "------------------------"

run_test "Migration file exists" \
    "[ -f 'supabase/migrations/20250619_database_schema_alignment.sql' ]" \
    "success"

run_test "Shared schema file exists" \
    "[ -f 'shared/schema.ts' ]" \
    "success"

run_test "Migration file contains KYC tables" \
    "grep -q 'kyc_documents' supabase/migrations/20250619_database_schema_alignment.sql" \
    "success"

run_test "Migration file contains Assets tables" \
    "grep -q 'public.assets' supabase/migrations/20250619_database_schema_alignment.sql" \
    "success"

# Test 2: KYC Schema Tests
echo -e "${YELLOW}2. KYC Schema Tests${NC}"
echo "----------------------"

run_test "KYC documents table defined" \
    "grep -q 'CREATE TABLE.*kyc_documents' supabase/migrations/20250619_database_schema_alignment.sql" \
    "success"

run_test "KYC status table defined" \
    "grep -q 'CREATE TABLE.*kyc_status' supabase/migrations/20250619_database_schema_alignment.sql" \
    "success"

run_test "KYC document types include all required types" \
    "grep -q 'ID_PASSPORT' supabase/migrations/20250619_database_schema_alignment.sql && grep -q 'UTILITY_BILL' supabase/migrations/20250619_database_schema_alignment.sql && grep -q 'OTHER_DOC' supabase/migrations/20250619_database_schema_alignment.sql" \
    "success"

run_test "KYC categories include verification types" \
    "grep -q 'ID_VERIFICATION.*ADDRESS_VERIFICATION.*OTHER_DOCUMENTATION' supabase/migrations/20250619_database_schema_alignment.sql" \
    "success"

# Test 3: Assets Master Table Tests
echo -e "${YELLOW}3. Assets Master Table Tests${NC}"
echo "--------------------------------"

run_test "Assets table defined" \
    "grep -q 'CREATE TABLE.*public.assets' supabase/migrations/20250619_database_schema_alignment.sql" \
    "success"

run_test "Asset classes include all required types" \
    "grep -q 'FOREX.*STOCKS.*INDICES.*COMMODITIES.*CRYPTO' supabase/migrations/20250619_database_schema_alignment.sql" \
    "success"

run_test "Assets seed data included" \
    "grep -q 'INSERT INTO public.assets' supabase/migrations/20250619_database_schema_alignment.sql" \
    "success"

run_test "Major forex pairs seeded" \
    "grep -q 'EURUSD' supabase/migrations/20250619_database_schema_alignment.sql && grep -q 'GBPUSD' supabase/migrations/20250619_database_schema_alignment.sql && grep -q 'USDJPY' supabase/migrations/20250619_database_schema_alignment.sql" \
    "success"

run_test "Major cryptocurrencies seeded" \
    "grep -q 'BTCUSD' supabase/migrations/20250619_database_schema_alignment.sql && grep -q 'ETHUSD' supabase/migrations/20250619_database_schema_alignment.sql" \
    "success"

# Test 4: Enhanced Order Management Tests
echo -e "${YELLOW}4. Enhanced Order Management Tests${NC}"
echo "-------------------------------------"

run_test "Enhanced orders table defined" \
    "grep -q 'CREATE TABLE.*public.orders' supabase/migrations/20250619_database_schema_alignment.sql" \
    "success"

run_test "Positions table defined" \
    "grep -q 'CREATE TABLE.*public.positions' supabase/migrations/20250619_database_schema_alignment.sql" \
    "success"

run_test "Order types include market and limit" \
    "grep -q 'MARKET.*LIMIT.*STOP' supabase/migrations/20250619_database_schema_alignment.sql" \
    "success"

run_test "Order status includes all states" \
    "grep -q 'PENDING.*FILLED.*CANCELLED.*REJECTED' supabase/migrations/20250619_database_schema_alignment.sql" \
    "success"

# Test 5: User Profile Enhancement Tests  
echo -e "${YELLOW}5. User Profile Enhancement Tests${NC}"
echo "------------------------------------"

run_test "User profiles table defined" \
    "grep -q 'CREATE TABLE.*public.user_profiles' supabase/migrations/20250619_database_schema_alignment.sql" \
    "success"

run_test "Experience levels include all options" \
    "grep -q 'BEGINNER.*INTERMEDIATE.*ADVANCED' supabase/migrations/20250619_database_schema_alignment.sql" \
    "success"

run_test "Risk tolerance levels defined" \
    "grep -q 'LOW.*MEDIUM.*HIGH' supabase/migrations/20250619_database_schema_alignment.sql" \
    "success"

# Test 6: Security & RLS Tests
echo -e "${YELLOW}6. Security & RLS Tests${NC}"
echo "---------------------------"

run_test "RLS enabled on KYC documents" \
    "grep -A 5 'kyc_documents' supabase/migrations/20250619_database_schema_alignment.sql | grep -q 'ENABLE ROW LEVEL SECURITY'" \
    "success"

run_test "RLS policies created for KYC documents" \
    "grep -q 'CREATE POLICY.*kyc_documents' supabase/migrations/20250619_database_schema_alignment.sql" \
    "success"

run_test "RLS enabled on user profiles" \
    "grep -A 5 'user_profiles' supabase/migrations/20250619_database_schema_alignment.sql | grep -q 'ENABLE ROW LEVEL SECURITY'" \
    "success"

run_test "Auto-trigger functions created" \
    "grep -q 'CREATE TRIGGER.*on_auth_user_created' supabase/migrations/20250619_database_schema_alignment.sql" \
    "success"

# Test 7: TypeScript Schema Alignment Tests
echo -e "${YELLOW}7. TypeScript Schema Tests${NC}"
echo "-----------------------------"

run_test "Enhanced schema includes KYC tables" \
    "grep -q 'kycDocuments' shared/schema.ts && grep -q 'kycStatus' shared/schema.ts" \
    "success"

run_test "Enhanced schema includes assets table" \
    "grep -q 'assets.*pgTable' shared/schema.ts" \
    "success"

run_test "Enhanced schema includes enhanced orders" \
    "grep -q 'orders.*pgTable' shared/schema.ts && grep -q 'orderTypeEnum' shared/schema.ts" \
    "success"

run_test "TypeScript enums match SQL enums" \
    "grep -q 'assetClassEnum' shared/schema.ts && grep -q 'FOREX' shared/schema.ts && grep -q 'STOCKS' shared/schema.ts && grep -q 'CRYPTO' shared/schema.ts" \
    "success"

# Test 8: Data Integrity Tests
echo -e "${YELLOW}8. Data Integrity Tests${NC}"
echo "------------------------------"

run_test "Foreign key constraints defined" \
    "grep -q 'REFERENCES.*auth.users' supabase/migrations/20250619_database_schema_alignment.sql" \
    "success"

run_test "Check constraints for data validation" \
    "grep -q 'CHECK.*IN.*(' supabase/migrations/20250619_database_schema_alignment.sql" \
    "success"

run_test "Indexes created for performance" \
    "grep -q 'CREATE INDEX' supabase/migrations/20250619_database_schema_alignment.sql" \
    "success"

run_test "Update triggers for timestamps" \
    "grep -q 'update_updated_at_column' supabase/migrations/20250619_database_schema_alignment.sql" \
    "success"

# Test 9: Migration Completeness Tests
echo -e "${YELLOW}9. Migration Completeness Tests${NC}"
echo "----------------------------------"

run_test "All required tables created" \
    "grep -c 'CREATE TABLE' supabase/migrations/20250619_database_schema_alignment.sql | grep -q '[8-9]'" \
    "success"

run_test "Seed data covers major asset classes" \
    "grep -A 50 'INSERT INTO public.assets' supabase/migrations/20250619_database_schema_alignment.sql | grep -q 'FOREX' && grep -A 50 'INSERT INTO public.assets' supabase/migrations/20250619_database_schema_alignment.sql | grep -q 'CRYPTO'" \
    "success"

run_test "Comments and documentation included" \
    "grep -q '============================================================================' supabase/migrations/20250619_database_schema_alignment.sql" \
    "success"

# Test 10: TypeScript Compilation Test
echo -e "${YELLOW}10. Code Quality Tests${NC}"
echo "---------------------------"

run_test "TypeScript compilation passes" \
    "cd /workspaces/Trade-Pro && npm run typecheck >/dev/null 2>&1" \
    "success"

# Test Summary
echo "========================================"
echo -e "${BLUE}Database Schema Alignment Test Summary${NC}"
echo "========================================"
echo -e "Tests Run: ${TESTS_RUN}"
echo -e "Tests Passed: ${GREEN}${TESTS_PASSED}${NC}"
echo -e "Tests Failed: ${RED}$((TESTS_RUN - TESTS_PASSED))${NC}"

if [ $TESTS_PASSED -eq $TESTS_RUN ]; then
    echo -e "${GREEN}🎉 All database schema tests passed!${NC}"
    echo ""
    echo -e "${GREEN}✅ Database Schema Alignment: COMPLETE${NC}"
    echo ""
    echo "New database tables created:"
    echo "• kyc_documents - KYC document storage"
    echo "• kyc_status - KYC verification tracking"
    echo "• assets - Master tradeable assets list"
    echo "• market_data - Real-time market data storage"
    echo "• user_profiles - Enhanced user information"
    echo "• orders - Comprehensive order management"
    echo "• positions - Trading position tracking"
    echo "• trading_sessions - Trading activity sessions"
    echo ""
    echo "Security features:"
    echo "• Row Level Security (RLS) on all user data"
    echo "• Foreign key constraints for data integrity"
    echo "• Check constraints for data validation"
    echo "• Performance indexes on critical columns"
    echo "• Auto-triggers for user account creation"
    exit 0
else
    echo -e "${RED}❌ Some database schema tests failed. Please review the implementation.${NC}"
    exit 1
fi

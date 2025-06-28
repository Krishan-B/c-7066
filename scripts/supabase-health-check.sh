#!/bin/bash
# Quick Supabase health check
echo "🏥 Supabase Health Check $(date)"
echo "Local Status: $(supabase status | grep -q 'running' && echo '✅ Running' || echo '❌ Stopped')"
echo "Authentication: $(supabase projects list >/dev/null 2>&1 && echo '✅ Valid' || echo '❌ Failed')"
echo "Migrations: $(supabase migration list 2>/dev/null | tail -1 | grep -q '|' && echo '✅ Synced' || echo '⚠️ Check needed')"

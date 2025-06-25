# Codespaces Setup Automation

# Export Supabase DB password if set in environment
if [ -n "$SUPABASE_DB_PASSWORD" ]; then
  export PGPASSWORD="$SUPABASE_DB_PASSWORD"
fi

# 1. Run Supabase migrations automatically on Codespaces start
/bin/bash scripts/db-migrate-seed.sh

# 2. Start the frontend (React/Vite)
npm run dev &

# 3. Start the backend API (Express, to be scaffolded)
cd backend-api && npm install && npm run dev &

# 4. Health check
npm run health:check

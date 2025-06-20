#!/bin/bash

# Check if access token is provided
if [ -z "$1" ]; then
  echo "Please provide your Supabase access token as an argument"
  echo "Usage: ./scripts/generate-supabase-types.sh your-access-token"
  exit 1
fi

ACCESS_TOKEN=$1
PROJECT_ID="hntsrkacolpseqnyidis"
OUTPUT_PATH="src/integrations/supabase/types.ts"

echo "Generating Supabase types..."
echo "Project ID: $PROJECT_ID"
echo "Output: $OUTPUT_PATH"

# Export the token for the npx command
export SUPABASE_ACCESS_TOKEN=$ACCESS_TOKEN

# Generate types
npx supabase gen types typescript \
  --project-id $PROJECT_ID \
  --schema public \
  > $OUTPUT_PATH

# Check if successful
if [ $? -eq 0 ]; then
  echo "✅ Types successfully generated at $OUTPUT_PATH"
else
  echo "❌ Failed to generate types"
  exit 1
fi

# Supabase Setup Guide for Trade-Pro in Codespaces

Since we're working in GitHub Codespaces, the most reliable way to work with Supabase is through:

1. The Supabase client library (`@supabase/supabase-js`)
2. The Supabase VS Code extension

## Using the Client Library

The client is already set up in `/src/integrations/supabase/client.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = "https://hntsrkacolpseqnyidis.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudHNya2Fjb2xwc2VxbnlpZGlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1ODA2NTMsImV4cCI6MjA2MDE1NjY1M30.zvEATQdgXB0hsX2PkDmcx8p55vcT4q-DQVQkfYLJ4C0";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
```

## Using the VS Code Extension

1. Click the Supabase icon in the sidebar
2. Add a new connection with these details:
   - Connection Name: Trade-Pro
   - Connection URL:
     `postgresql://postgres.hntsrkacolpseqnyidis:b0QZjfQhZ1WgKubX@aws-0-ap-southeast-1.pooler.supabase.co:6543/postgres`

## Working with Migrations

When working with migrations in Codespaces, consider:

1. Writing migration files in SQL directly
2. Using the Supabase dashboard for complex changes
3. Applying changes through SQL queries in the VS Code extension

## Edge Functions

To deploy Edge Functions directly from Codespaces:

```bash
export SUPABASE_ACCESS_TOKEN="your-access-token-here"
npx supabase functions deploy hello-world --project-ref hntsrkacolpseqnyidis
```

## Environment Variables

Your `.env` file is correctly set up with:

```
VITE_SUPABASE_URL=https://hntsrkacolpseqnyidis.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Types Generation

Generate types without linking to the project:

```bash
npx supabase gen types typescript \
  --project-id hntsrkacolpseqnyidis \
  --schema public \
  > src/integrations/supabase/types.ts
```

Remember to add your personal access token:

```bash
export SUPABASE_ACCESS_TOKEN="your-access-token-here"
```

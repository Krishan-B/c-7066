# Supabase Setup for Trade-Pro CFD Trading Platform

## Getting Started

1. Ensure you have the Supabase CLI installed:

   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:

   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref hntsrkacolpseqnyidis
   ```

## Working with the Database

### Generate Types

```bash
npm run generate:types
```

### Run Migrations

```bash
npm run supabase:migrate
```

## Working with Edge Functions

Deploy a function:

```bash
supabase functions deploy hello-world
```

### Local Development

Start local Supabase:

```bash
npm run supabase:start
```

Stop local Supabase:

```bash
npm run supabase:stop
```

## Environment Variables

Make sure to set up your `.env` file with the following:

```
VITE_SUPABASE_URL=https://hntsrkacolpseqnyidis.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
```

## Project Structure

```
supabase/
├── config.toml         # Configuration file for Supabase CLI
├── functions/          # Edge Functions
│   └── hello-world/    # Example function
│       └── index.ts
├── migrations/         # Database migrations
└── seed/               # Seed data for development
```

## Working with the Supabase VS Code Extension

1. Open the Supabase sidebar in VS Code
2. Connect to your project
3. Browse database tables, run SQL queries, and manage Edge Functions

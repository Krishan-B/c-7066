# Onboarding Guide

Welcome to the Trade-Pro development team! This guide will walk you through setting up your local
development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker](https://www.docker.com/)
- [VS Code](https://code.visualstudio.com/)

## Getting Started

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-repo/trade-pro.git
   cd trade-pro
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up local Supabase environment:**

   This project uses a local Supabase instance for development. The following command will start the
   Supabase stack using Docker:

   ```bash
   npx supabase start
   ```

   This command will:

   - Start the Supabase Docker containers (database, GoTrue, etc.).
   - Apply all database migrations located in `supabase/migrations`.
   - Seed the database with initial data from `supabase/seed.sql`.

4. **Verify the local environment:**

   To ensure everything is set up correctly, run the health check script:

   ```bash
   ./scripts/assert-local-db-health.sh
   ```

   You should see a success message indicating that the database is healthy.

5. **Run the application:**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`.

## Supabase Credentials

When you run `npx supabase start`, the local Supabase credentials will be displayed in the terminal.
These include:

- **API URL**
- **anon key**
- **service_role key**
- **Database URL**

These are also available in the `.env` file, which is created automatically.

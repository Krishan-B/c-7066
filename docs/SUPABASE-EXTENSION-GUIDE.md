# Supabase Extension Setup Guide

## Accessing the Extension

1. Click the Supabase icon in the VS Code sidebar (looks like an "S")
2. If you don't see it, press `Ctrl+Shift+X`, search for "Supabase", and ensure it's installed

## Connecting to Your Project

### Method 1: Using the UI

1. Click the Supabase icon in the sidebar
2. Click "Add New Connection" button
3. Enter the following details:
   - **Connection Name**: Trade-Pro
   - **Connection String**:
     `postgresql://postgres.hntsrkacolpseqnyidis:b0QZjfQhZ1WgKubX@aws-0-ap-southeast-1.pooler.supabase.co:6543/postgres`
4. Click "Connect"

### Method 2: Using Command Palette

1. Press `Ctrl+Shift+P` to open the command palette
2. Type "Supabase: Connect" and select it
3. Choose "New Connection"
4. Follow the same steps as Method 1

## Using the Extension

### Database Management

- Browse tables, views, and functions
- Run SQL queries
- Import/export data
- Manage indexes and constraints

### API Documentation

- View auto-generated API documentation
- Test endpoints
- Copy code snippets for JavaScript, Python, etc.

### Edge Functions

- Create new functions
- Deploy functions
- Test and monitor execution

## Troubleshooting

### Connection Issues

If you encounter connection problems:

1. Verify your database password is correct
2. Check if your IP address is allowed in the Supabase dashboard
3. Try reconnecting with the full connection string:
   ```
   postgresql://postgres.hntsrkacolpseqnyidis:b0QZjfQhZ1WgKubX@aws-0-ap-southeast-1.pooler.supabase.co:6543/postgres
   ```

### Extension Not Responding

If the extension becomes unresponsive:

1. Press `Ctrl+Shift+P`
2. Type "Developer: Reload Window" and select it
3. Try reconnecting

## Resources

- [Supabase VS Code Extension Documentation](https://marketplace.visualstudio.com/items?itemName=supabase.vscode-supabase-extension)
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

# Run Development Servers Manually

If you're having issues with the `pnpm dev` command, you can run the client and server separately:

## In one terminal:

```bash
cd client
vite --host 0.0.0.0 --port 8080
```

## In another terminal:

```bash
cd server
tsx --watch index.ts
```

Make sure to install all the required dependencies first:

```bash
pnpm add -D concurrently tsx drizzle-orm pg @types/pg express cors dotenv @types/express @types/cors
```

## Common Issues & Solutions

### Missing files

If you see errors about missing files, check the folder structure to ensure all necessary files were created.

### Port already in use

If port 8080 is already in use, you can modify the port in client/vite.config.ts.

### Database connection

Add a .env file with your DATABASE_URL if connecting to a PostgreSQL database.

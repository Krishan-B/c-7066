# Fixed Issues in Client/Server Architecture

## 1. Fixed Circular References in tsconfig.json

Both `client/tsconfig.json` and `server/tsconfig.json` had circular references:

- Changed to extend from root `../tsconfig.json` instead of themselves
- Updated paths and include/exclude patterns to match new structure

## 2. Fixed Dependency Cycle in Server

- Created a new `config.ts` file to handle environment variables
- Fixed imports in `db.ts` and `storage.ts` to use config.ts instead of index.ts
- Cleaned up index.ts to remove duplicated environment configuration
- Updated console.log to console.warn to satisfy linting rules

## How to Run

Now you should be able to run the development setup with:

```bash
pnpm dev
```

Or run client and server separately:

```bash
# In one terminal:
pnpm dev:client

# In another terminal:
pnpm dev:server
```

## Port Usage

If you encounter port conflicts, the services will automatically use alternative ports:

- Client typically runs on 8080, 8082, or 8083
- Server runs on port 3000 by default

You can change these in:

- `package.json` scripts
- `client/vite.config.ts`
- `server/config.ts`

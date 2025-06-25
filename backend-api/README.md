# Backend API Quickstart

This is the REST API server for the Trade-Pro platform. It will provide endpoints for authentication, user management, trading, KYC, and more.

## Local Development

```
cd backend-api
npm install
npm run dev
```

## Endpoints (to be implemented)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/accounts/profile`
- `POST /api/kyc/upload`
- ...

## Environment Variables
- `PORT` (default: 4000)
- `SUPABASE_URL`
- `SUPABASE_KEY`

## Next Steps
- Implement endpoints as per PRD
- Integrate with Supabase for user, KYC, and trading data
- Add authentication middleware

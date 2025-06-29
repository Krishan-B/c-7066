// backend-api/src/auth/index.ts
// Placeholder for backend auth proxy logic (if SSR or custom endpoints needed)
// For now, Supabase handles most auth client-side, but this is ready for future expansion.

export default function handler(req, res) {
  res
    .status(501)
    .json({ message: "Not implemented. Use Supabase client SDK for auth." });
}

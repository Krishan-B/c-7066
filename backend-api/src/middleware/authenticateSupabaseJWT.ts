import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

export function authenticateSupabaseJWT(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    if (!SUPABASE_JWT_SECRET) throw new Error("Missing SUPABASE_JWT_SECRET");
    const payload = jwt.verify(token, SUPABASE_JWT_SECRET) as JwtPayload;
    (req as Request & { user?: JwtPayload }).user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

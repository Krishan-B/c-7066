import { Router, Request } from "express";
import multer from "multer";
import { requireAuth } from "./requireAuth";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import type { User } from "@supabase/supabase-js";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
}); // 10MB limit

// POST /api/kyc/upload - Upload KYC document
router.post(
  "/upload",
  requireAuth,
  upload.single("document"),
  async (req: Request & { user?: User }, res) => {
    const user = req.user;
    const file = req.file;
    const { docType, docCategory } = req.body;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    // Upload to Supabase Storage (bucket: kyc-documents)
    const filePath = `${user.id}/${Date.now()}_${file.originalname}`;
    const { error: uploadError } = await supabase.storage
      .from("kyc-documents")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });
    if (uploadError) {
      return res.status(500).json({ error: uploadError.message });
    }
    // Store metadata (simulate DB insert)
    // In production, insert a record into a KYC table with userId, filePath, docType, docCategory, status, etc.
    res.status(201).json({ message: "KYC document uploaded", filePath });
  }
);

// GET /api/kyc/status - Get user's KYC status (stub)
router.get("/status", requireAuth, async (req, res) => {
  // In production, fetch KYC status and docs from DB
  res.json({ status: "pending", documents: [] });
});

export default router;

import { Router, Request } from "express";
import multer from "multer";
import { requireAuth } from "./requireAuth";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import type { User } from "@supabase/supabase-js";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Type definitions
interface KYCDocument {
  id: string;
  user_id: string;
  document_type: string;
  category: string;
  file_url: string;
  file_name: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  comments: string | null;
  uploaded_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // Allow only PDF, JPG, PNG files
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only PDF, JPG, and PNG files are allowed."
        )
      );
    }
  },
}); // 10MB limit

// GET /api/kyc/status - Get user's KYC status
router.get(
  "/status",
  requireAuth,
  async (req: Request & { user?: User }, res) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { data: documents, error } = await supabase
        .from("kyc_documents")
        .select("*")
        .eq("user_id", user.id)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;

      // Determine overall KYC status
      let overallStatus = "PENDING";
      if (documents && documents.length > 0) {
        const hasApproved = documents.some(
          (doc: KYCDocument) => doc.status === "APPROVED"
        );
        const hasRejected = documents.some(
          (doc: KYCDocument) => doc.status === "REJECTED"
        );
        const hasPending = documents.some(
          (doc: KYCDocument) => doc.status === "PENDING"
        );

        if (hasApproved && !hasRejected && !hasPending) {
          overallStatus = "APPROVED";
        } else if (hasRejected) {
          overallStatus = "REJECTED";
        } else {
          overallStatus = "PENDING";
        }
      }

      res.json({
        status: overallStatus,
        documents: documents || [],
        documentsCount: documents?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching KYC status:", error);
      res.status(500).json({ error: "Failed to fetch KYC status" });
    }
  }
);

// POST /api/kyc/upload - Upload KYC document
router.post(
  "/upload",
  requireAuth,
  upload.single("document"),
  async (req: Request & { user?: User }, res) => {
    const user = req.user;
    const file = req.file;
    const { documentType, category, comments } = req.body;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    if (!documentType || !category) {
      return res
        .status(400)
        .json({ error: "Document type and category are required" });
    }

    try {
      // Upload to Supabase Storage (bucket: kyc-documents)
      const fileExt = file.originalname.split(".").pop();
      const fileName = `${Date.now()}_${documentType}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("kyc-documents")
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL for the uploaded file
      const {
        data: { publicUrl },
      } = supabase.storage.from("kyc-documents").getPublicUrl(filePath);

      // Store metadata in database
      const { data, error: dbError } = await supabase
        .from("kyc_documents")
        .insert({
          user_id: user.id,
          document_type: documentType,
          category: category,
          file_url: publicUrl,
          file_name: file.originalname,
          status: "PENDING",
          comments: comments || null,
          uploaded_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (dbError) {
        // If DB insert fails, clean up the uploaded file
        await supabase.storage.from("kyc-documents").remove([filePath]);
        throw dbError;
      }

      res.status(201).json({
        message: "KYC document uploaded successfully",
        document: data,
      });
    } catch (error) {
      console.error("Error uploading KYC document:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  }
);

// GET /api/kyc/documents - Get user's KYC documents
router.get(
  "/documents",
  requireAuth,
  async (req: Request & { user?: User }, res) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { data: documents, error } = await supabase
        .from("kyc_documents")
        .select("*")
        .eq("user_id", user.id)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;

      res.json({ documents: documents || [] });
    } catch (error) {
      console.error("Error fetching KYC documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  }
);

// DELETE /api/kyc/documents/:id - Delete a KYC document
router.delete(
  "/documents/:id",
  requireAuth,
  async (req: Request & { user?: User }, res) => {
    const user = req.user;
    const { id } = req.params;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      // First, get the document to ensure it belongs to the user and get file path
      const { data: document, error: fetchError } = await supabase
        .from("kyc_documents")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (fetchError || !document) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Extract file path from URL
      const url = new URL(document.file_url);
      const filePath = url.pathname.split(
        "/storage/v1/object/public/kyc-documents/"
      )[1];

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("kyc-documents")
        .remove([filePath]);

      if (storageError) {
        console.error("Error deleting file from storage:", storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("kyc_documents")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (dbError) throw dbError;

      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting KYC document:", error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  }
);

// PUT /api/kyc/documents/:id - Update a KYC document
router.put(
  "/documents/:id",
  requireAuth,
  async (req: Request & { user?: User }, res) => {
    const user = req.user;
    const { id } = req.params;
    const { comments } = req.body;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { data, error } = await supabase
        .from("kyc_documents")
        .update({
          comments: comments,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        return res.status(404).json({ error: "Document not found" });
      }

      res.json({
        message: "Document updated successfully",
        document: data,
      });
    } catch (error) {
      console.error("Error updating KYC document:", error);
      res.status(500).json({ error: "Failed to update document" });
    }
  }
);

// Note: KYC document review and approval is handled by the external Plexop internal management tool
// Plexop staff will access the kyc_documents table directly through their system to:
// - View pending documents in a dedicated queue
// - Review documents with zoom functionality
// - Approve/reject documents with comment fields
// - Update document status and reviewed_by fields
// - Perform bulk processing operations
// - Track review history and staff performance metrics
//
// This backend provides user-facing endpoints only:
// - Users can upload documents
// - Users can view their document status
// - Users can delete/update their own documents
// - No admin/review functionality is exposed here

export default router;

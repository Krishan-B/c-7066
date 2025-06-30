import express from "express";
import { checkSupabaseHealth } from "../../integrations/supabase/healthCheck";
import { healthMonitor } from "../../integrations/supabase/healthMonitor";

const router = express.Router();

// GET /api/health - Overall system health including Supabase
import type { Request, Response, NextFunction } from "express";
router.get(
  "/",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentHealth = await checkSupabaseHealth();
      const monitorHistory = healthMonitor.getLastHealth();

      res.json({
        status: "success",
        timestamp: new Date().toISOString(),
        services: {
          supabase: currentHealth,
          monitoring: {
            isActive: true,
            lastCheck: monitorHistory,
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        timestamp: new Date().toISOString(),
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
      next(error);
    }
  }
);

export default router;

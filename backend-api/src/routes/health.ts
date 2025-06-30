import express from "express";
import { checkSupabaseHealth } from "../../integrations/supabase/healthCheck";
import { healthMonitor } from "../../integrations/supabase/healthMonitor";

const router = express.Router();

// GET /api/health - Overall system health including Supabase
router.get("/", async (req, res) => {
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
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

export default router;

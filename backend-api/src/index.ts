import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import cors from "cors";
import ordersRouter from "./routes/orders";
import positionsRouter from "./routes/positions";
import accountRouter from "./routes/account";
import authRouter from "./routes/auth";
import kycRouter from "./routes/kyc";
import healthRouter from "./routes/health"; // Add health routes
import { createServer } from "http";
import { initWebSocket } from "./websocket";
import { createClient } from "@supabase/supabase-js";

// Log environment variables for debugging
console.log("Starting server with configuration:");
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log(
  "SUPABASE_KEY (anon):",
  process.env.SUPABASE_KEY?.substring(0, 10) + "..."
);
console.log(
  "SUPABASE_SERVICE_ROLE_KEY:",
  process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10) + "..."
);

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const app = express();
app.locals.supabase = supabase;
app.use(cors());
app.use(express.json());

// Add health check route
app.use("/api/health", healthRouter);

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mount routers
app.use("/api/auth", authRouter);
app.use("/api/account", accountRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/positions", positionsRouter);
app.use("/api/kyc", kycRouter);

const PORT = process.env.PORT || 3001;
const server = createServer(app);

// Initialize WebSocket
initWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

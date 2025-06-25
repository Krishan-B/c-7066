import express, { Request, Response } from "express";
// @ts-expect-error: No type declarations for 'cors' module, safe to ignore for runtime usage
import cors from "cors";
import dotenv from "dotenv";
import ordersRouter from "./routes/orders";
import positionsRouter from "./routes/positions";
import accountRouter from "./routes/account";
import { createServer } from "http";
import { initWebSocket } from "./websocket";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// TODO: Add endpoints for auth, accounts, trading, KYC, etc.
app.use("/api/orders", ordersRouter);
app.use("/api/positions", positionsRouter);
app.use("/api/account", accountRouter);

const PORT = process.env.PORT || 4000;

const server = createServer(app);

initWebSocket(server);

server.listen(PORT, () => {
  console.log(`Backend API and WebSocket server running on port ${PORT}`);
});

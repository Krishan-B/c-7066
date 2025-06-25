import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";

let wss: WebSocketServer;

export const clients = new Set<WebSocket>();

export function initWebSocket(server: Server) {
  wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WebSocket) => {
    console.log("Client connected");
    clients.add(ws);

    ws.on("message", (message: string) => {
      console.log("received: %s", message);
      // Echo message back to client
      ws.send(`Echo: ${message}`);
    });

    ws.on("close", () => {
      console.log("Client disconnected");
      clients.delete(ws);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      clients.delete(ws);
    });
  });

  console.log("WebSocket server initialized");
}

export function broadcast(data: Record<string, unknown>) {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

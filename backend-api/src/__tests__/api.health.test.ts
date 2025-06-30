import request from "supertest";
import express from "express";
import healthRouter from "../routes/health";

describe("GET /api/health", () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use("/api/health", healthRouter);
  });

  it("should return status success and service health info", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "success");
    expect(res.body).toHaveProperty("timestamp");
    expect(res.body).toHaveProperty("services");
    expect(res.body.services).toHaveProperty("supabase");
    expect(res.body.services).toHaveProperty("monitoring");
  });
});

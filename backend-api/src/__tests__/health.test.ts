import request from "supertest";
import express from "express";

describe("Health Check Endpoint", () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.get("/health", function (_req, res) {
      res.status(200).json({ status: "ok" });
    });
  });

  it("should return 200 OK and status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

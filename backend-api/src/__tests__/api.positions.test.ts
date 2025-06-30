import request from "supertest";
import express from "express";
import positionsRouter from "../routes/positions";

// Mock requireAuth middleware to always allow
jest.mock("../routes/requireAuth", () => ({
  requireAuth: (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => next(),
}));

describe("GET /api/positions", () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use("/api/positions", positionsRouter);
  });

  it("should return an array (positions list)", async () => {
    const res = await request(app).get("/api/positions");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

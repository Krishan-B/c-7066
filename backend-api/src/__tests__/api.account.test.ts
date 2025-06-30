import request from "supertest";
import express from "express";
import accountRouter from "../routes/account";

describe("GET /api/account/metrics", () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use("/api/account", accountRouter);
  });

  it("should return account metrics object", async () => {
    const res = await request(app).get("/api/account/metrics");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("balance");
    expect(res.body).toHaveProperty("equity");
    expect(res.body).toHaveProperty("exposure");
    expect(res.body).toHaveProperty("marginLevel");
  });
});

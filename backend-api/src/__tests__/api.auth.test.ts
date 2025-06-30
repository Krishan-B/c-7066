import request from "supertest";
import express from "express";
import authRouter from "../routes/auth";

describe("POST /api/auth/register", () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/auth", authRouter);
  });

  it("should fail to register with missing fields", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com" });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body).toHaveProperty("error");
  });

  // To test successful registration, you would need a test Supabase project and cleanup logic.
  // it('should register a new user', async () => {
  //   const res = await request(app)
  //     .post('/api/auth/register')
  //     .send({
  //       email: 'newuser@example.com',
  //       password: 'TestPassword123!',
  //       first_name: 'Test',
  //       last_name: 'User',
  //       experience_level: 'BEGINNER',
  //     });
  //   expect(res.status).toBe(201);
  //   expect(res.body).toHaveProperty('user');
  // });
});

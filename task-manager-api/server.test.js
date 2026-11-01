const request = require("supertest");
const app = require("./server");

describe("Task Manager API Test Suite (Practical 12 - CI/CD)", () => {
  describe("Health & Root Endpoint", () => {
    test("GET / should return 200 and online status", async () => {
      const res = await request(app).get("/");
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("online");
    });
  });

  describe("Authentication & Authorization Middleware (Practical 7)", () => {
    test("GET /tasks without token returns 401 Unauthorized", async () => {
      const res = await request(app).get("/tasks");
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error", "Access token required");
    });

    test("GET /tasks with invalid token returns 401 Unauthorized", async () => {
      const res = await request(app)
        .get("/tasks")
        .set("Authorization", "Bearer invalid_secret_token_123");
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error", "Invalid or expired token");
    });

    test("POST /api/ai/generate-description without token returns 401", async () => {
      const res = await request(app)
        .post("/api/ai/generate-description")
        .send({ title: "Write unit tests" });
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error", "Access token required");
    });
  });

  describe("User Registration Validation (Practical 7)", () => {
    test("POST /register with empty body returns 400", async () => {
      const res = await request(app).post("/register").send({});
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Email and password are required");
    });

    test("POST /register with invalid email returns 400", async () => {
      const res = await request(app).post("/register").send({
        email: "not-an-email",
        password: "ValidPassword123!"
      });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Please enter a valid email address");
    });

    test("POST /register with short password (< 8 chars) returns 400", async () => {
      const res = await request(app).post("/register").send({
        email: "student@example.com",
        password: "123"
      });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Password must contain at least 8 characters");
    });
  });
});

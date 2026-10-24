import request from "supertest";
import { makeTestApp } from "./helpers";

describe("auth", () => {
  const { app, cleanup } = makeTestApp();
  afterAll(cleanup);

  describe("POST /api/auth/register", () => {
    it("creates a user and does not return the password", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "a@test.com", password: "secret123" });
      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe("a@test.com");
      expect(res.body.user.role).toBe("user");
      expect(res.body.user.password_hash).toBeUndefined();
    });

    it("rejects a duplicate email", async () => {
      await request(app).post("/api/auth/register").send({ email: "dup@test.com", password: "secret123" });
      const res = await request(app).post("/api/auth/register").send({ email: "dup@test.com", password: "secret123" });
      expect(res.status).toBe(409);
    });

    it("rejects an invalid email", async () => {
      const res = await request(app).post("/api/auth/register").send({ email: "nope", password: "secret123" });
      expect(res.status).toBe(400);
    });

    it("rejects a short password", async () => {
      const res = await request(app).post("/api/auth/register").send({ email: "b@test.com", password: "123" });
      expect(res.status).toBe(400);
    });

    it("ignores a role sent by the client", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "sneaky@test.com", password: "secret123", role: "admin" });
      expect(res.body.user.role).toBe("user");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeAll(async () => {
      await request(app).post("/api/auth/register").send({ email: "login@test.com", password: "secret123" });
    });

    it("returns a token for correct credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({ email: "login@test.com", password: "secret123" });
      expect(res.status).toBe(200);
      expect(typeof res.body.token).toBe("string");
      expect(res.body.user.email).toBe("login@test.com");
    });

    it("rejects a wrong password", async () => {
      const res = await request(app).post("/api/auth/login").send({ email: "login@test.com", password: "wrongpass" });
      expect(res.status).toBe(401);
    });

    it("rejects an unknown email", async () => {
      const res = await request(app).post("/api/auth/login").send({ email: "ghost@test.com", password: "secret123" });
      expect(res.status).toBe(401);
    });
  });

  describe("protected routes", () => {
    it("returns 401 without a token", async () => {
      const res = await request(app).get("/api/vehicles");
      expect(res.status).toBe(401);
    });

    it("returns 401 with a garbage token", async () => {
      const res = await request(app).get("/api/vehicles").set("Authorization", "Bearer abc.def.ghi");
      expect(res.status).toBe(401);
    });
  });
});

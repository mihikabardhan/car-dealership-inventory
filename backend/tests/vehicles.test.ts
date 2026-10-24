import request from "supertest";
import { makeAdminToken, makeTestApp, registerAndLogin } from "./helpers";

describe("vehicles CRUD", () => {
  const { app, db, cleanup } = makeTestApp();
  let userToken: string;
  let adminToken: string;

  const civic = { make: "Honda", model: "Civic", category: "Sedan", price: 22000, quantity: 5 };

  beforeAll(async () => {
    userToken = await registerAndLogin(app);
    adminToken = await makeAdminToken(app, db);
  });
  afterAll(cleanup);

  describe("POST /api/vehicles", () => {
    it("adds a vehicle and gives it an id", async () => {
      const res = await request(app).post("/api/vehicles").set("Authorization", `Bearer ${userToken}`).send(civic);
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.make).toBe("Honda");
      expect(res.body.quantity).toBe(5);
    });

    it("rejects a missing field", async () => {
      const res = await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ make: "Honda" });
      expect(res.status).toBe(400);
    });

    it("rejects a negative price", async () => {
      const res = await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ ...civic, price: -5 });
      expect(res.status).toBe(400);
    });

    it("rejects a negative or decimal quantity", async () => {
      const neg = await request(app).post("/api/vehicles").set("Authorization", `Bearer ${userToken}`).send({ ...civic, quantity: -1 });
      const dec = await request(app).post("/api/vehicles").set("Authorization", `Bearer ${userToken}`).send({ ...civic, quantity: 1.5 });
      expect(neg.status).toBe(400);
      expect(dec.status).toBe(400);
    });
  });

  describe("GET /api/vehicles", () => {
    it("lists vehicles", async () => {
      const res = await request(app).get("/api/vehicles").set("Authorization", `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("PUT /api/vehicles/:id", () => {
    it("updates the price", async () => {
      const created = await request(app).post("/api/vehicles").set("Authorization", `Bearer ${userToken}`).send(civic);
      const res = await request(app)
        .put(`/api/vehicles/${created.body.id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ price: 20500 });
      expect(res.status).toBe(200);
      expect(res.body.price).toBe(20500);
      // fields we didn't send should stay the same
      expect(res.body.model).toBe("Civic");
    });

    it("returns 404 for an unknown id", async () => {
      const res = await request(app).put("/api/vehicles/9999").set("Authorization", `Bearer ${userToken}`).send({ price: 1 });
      expect(res.status).toBe(404);
    });

    it("rejects invalid data", async () => {
      const created = await request(app).post("/api/vehicles").set("Authorization", `Bearer ${userToken}`).send(civic);
      const res = await request(app)
        .put(`/api/vehicles/${created.body.id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ price: "cheap" });
      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/vehicles/:id", () => {
    it("is forbidden for normal users", async () => {
      const created = await request(app).post("/api/vehicles").set("Authorization", `Bearer ${userToken}`).send(civic);
      const res = await request(app).delete(`/api/vehicles/${created.body.id}`).set("Authorization", `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    it("works for admins", async () => {
      const created = await request(app).post("/api/vehicles").set("Authorization", `Bearer ${userToken}`).send(civic);
      const res = await request(app).delete(`/api/vehicles/${created.body.id}`).set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(204);

      const again = await request(app).delete(`/api/vehicles/${created.body.id}`).set("Authorization", `Bearer ${adminToken}`);
      expect(again.status).toBe(404);
    });
  });
});

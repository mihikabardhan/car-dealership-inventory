import request from "supertest";
import { makeAdminToken, makeTestApp, registerAndLogin } from "./helpers";

describe("inventory (purchase / restock)", () => {
  const { app, db, cleanup } = makeTestApp();
  let userToken: string;
  let adminToken: string;
  let vehicleId: number;

  beforeAll(async () => {
    userToken = await registerAndLogin(app);
    adminToken = await makeAdminToken(app, db);
  });

  afterAll(cleanup);

  beforeEach(async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        make: "Mazda",
        model: "3",
        category: "Hatchback",
        price: 21000,
        quantity: 2,
      });

    vehicleId = res.body.id;
  });

  const purchase = (id: number, body: object = {}) =>
    request(app)
      .post(`/api/vehicles/${id}/purchase`)
      .set("Authorization", `Bearer ${userToken}`)
      .send(body);

  const restock = (id: number, quantity: number) =>
    request(app)
      .post(`/api/vehicles/${id}/restock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ quantity });

  const getVehicle = async (id: number) => {
    const res = await request(app)
      .get("/api/vehicles")
      .set("Authorization", `Bearer ${userToken}`);

    return res.body.find((vehicle: { id: number }) => vehicle.id === id);
  };

  describe("purchase", () => {
    it("reduces stock by 1 by default", async () => {
      const res = await purchase(vehicleId);

      expect(res.status).toBe(200);
      expect(res.body.quantity).toBe(1);
    });

    it("allows buying several vehicles at once", async () => {
      const res = await purchase(vehicleId, { quantity: 2 });

      expect(res.status).toBe(200);
      expect(res.body.quantity).toBe(0);
    });

    it("returns 400 when purchasing more than the available stock", async () => {
      const res = await purchase(vehicleId, { quantity: 3 });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/stock/i);
    });

    it("leaves stock unchanged after a failed purchase", async () => {
      await purchase(vehicleId, { quantity: 3 });

      const vehicle = await getVehicle(vehicleId);

      expect(vehicle.quantity).toBe(2);
    });

    it("returns 400 when the vehicle is sold out", async () => {
      await purchase(vehicleId, { quantity: 2 });

      const res = await purchase(vehicleId);

      expect(res.status).toBe(400);
    });

    it.each([0, -1, 1.5])(
      "rejects invalid purchase quantity %s",
      async (quantity) => {
        const res = await purchase(vehicleId, { quantity });

        expect(res.status).toBe(400);
      }
    );

    it("returns 404 for an unknown vehicle id", async () => {
      const res = await purchase(999999);

      expect(res.status).toBe(404);
    });
  });

  describe("restock", () => {
    it("returns 403 when a normal user tries to restock", async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/restock`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ quantity: 5 });

      expect(res.status).toBe(403);
    });

    it("allows an admin to increase stock", async () => {
      const res = await restock(vehicleId, 5);

      expect(res.status).toBe(200);
      expect(res.body.quantity).toBe(7);
    });

    it.each([0, -1, 1.5])(
      "rejects invalid restock quantity %s",
      async (quantity) => {
        const res = await restock(vehicleId, quantity);

        expect(res.status).toBe(400);
      }
    );

    it("returns 404 for an unknown vehicle id", async () => {
      const res = await restock(999999, 5);

      expect(res.status).toBe(404);
    });
  });
});

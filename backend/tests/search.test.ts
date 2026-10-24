import request from "supertest";
import { makeTestApp, registerAndLogin } from "./helpers";

describe("GET /api/vehicles/search", () => {
  const { app, cleanup } = makeTestApp();
  let token: string;

  beforeAll(async () => {
    token = await registerAndLogin(app);
    const cars = [
      { make: "Honda", model: "Civic", category: "Sedan", price: 22000, quantity: 3 },
      { make: "Honda", model: "CR-V", category: "SUV", price: 32000, quantity: 2 },
      { make: "Toyota", model: "Camry", category: "Sedan", price: 28000, quantity: 0 },
      { make: "Ford", model: "Mustang", category: "Coupe", price: 45000, quantity: 1 },
    ];
    for (const car of cars) {
      await request(app).post("/api/vehicles").set("Authorization", `Bearer ${token}`).send(car);
    }
  });
  afterAll(cleanup);

  const search = (query: string) =>
    request(app).get(`/api/vehicles/search?${query}`).set("Authorization", `Bearer ${token}`);

  it("filters by make", async () => {
    const res = await search("make=Honda");
    expect(res.body).toHaveLength(2);
  });

  it("make search is case-insensitive and partial", async () => {
    const res = await search("make=hon");
    expect(res.body).toHaveLength(2);
  });

  it("filters by model", async () => {
    const res = await search("model=camry");
    expect(res.body).toHaveLength(1);
    expect(res.body[0].make).toBe("Toyota");
  });

  it("filters by category", async () => {
    const res = await search("category=Sedan");
    expect(res.body).toHaveLength(2);
  });

  it("filters by min price", async () => {
    const res = await search("minPrice=30000");
    expect(res.body.map((v: any) => v.model).sort()).toEqual(["CR-V", "Mustang"]);
  });

  it("filters by max price", async () => {
    const res = await search("maxPrice=25000");
    expect(res.body).toHaveLength(1);
    expect(res.body[0].model).toBe("Civic");
  });

  it("combines filters", async () => {
    const res = await search("make=Honda&minPrice=25000&maxPrice=35000");
    expect(res.body).toHaveLength(1);
    expect(res.body[0].model).toBe("CR-V");
  });

  it("returns everything when there are no filters", async () => {
    const res = await search("");
    expect(res.body).toHaveLength(4);
  });

  it("returns an empty array when nothing matches", async () => {
    const res = await search("make=Tesla");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("rejects a price that is not a number", async () => {
    const res = await search("minPrice=abc");
    expect(res.status).toBe(400);
  });
});

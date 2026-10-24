import { DB } from "../db";
import { HttpError, Vehicle } from "../types";

const isWholeNumber = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n);

export class VehicleService {
  constructor(private db: DB) {}

  getAll(): Vehicle[] {
    return this.db.prepare("SELECT * FROM vehicles ORDER BY id DESC").all() as Vehicle[];
  }

  getById(id: number): Vehicle {
    const vehicle = this.db.prepare("SELECT * FROM vehicles WHERE id = ?").get(id) as Vehicle | undefined;
    if (!vehicle) {
      throw new HttpError(404, "Vehicle not found");
    }
    return vehicle;
  }

  create(data: any): Vehicle {
    const { make, model, category, price, quantity } = data;

    if (!make || !model || !category || typeof make !== "string" || typeof model !== "string" || typeof category !== "string") {
      throw new HttpError(400, "make, model and category are required");
    }
    if (typeof price !== "number" || price < 0) {
      throw new HttpError(400, "price must be a number that is 0 or more");
    }
    if (!isWholeNumber(quantity) || quantity < 0) {
      throw new HttpError(400, "quantity must be a whole number that is 0 or more");
    }

    const result = this.db
      .prepare("INSERT INTO vehicles (make, model, category, price, quantity) VALUES (?, ?, ?, ?, ?)")
      .run(make.trim(), model.trim(), category.trim(), price, quantity);

    return this.getById(Number(result.lastInsertRowid));
  }

  // only the fields that are sent get changed
  update(id: number, data: any): Vehicle {
    const current = this.getById(id);

    const next = {
      make: data.make ?? current.make,
      model: data.model ?? current.model,
      category: data.category ?? current.category,
      price: data.price ?? current.price,
      quantity: data.quantity ?? current.quantity,
    };

    for (const field of ["make", "model", "category"] as const) {
      if (typeof next[field] !== "string" || next[field].trim() === "") {
        throw new HttpError(400, `${field} must be a non-empty string`);
      }
    }
    if (typeof next.price !== "number" || next.price < 0) {
      throw new HttpError(400, "price must be a number that is 0 or more");
    }
    if (!isWholeNumber(next.quantity) || next.quantity < 0) {
      throw new HttpError(400, "quantity must be a whole number that is 0 or more");
    }

    this.db
      .prepare("UPDATE vehicles SET make = ?, model = ?, category = ?, price = ?, quantity = ? WHERE id = ?")
      .run(next.make.trim(), next.model.trim(), next.category.trim(), next.price, next.quantity, id);

    return this.getById(id);
  }

  delete(id: number): void {
    const result = this.db.prepare("DELETE FROM vehicles WHERE id = ?").run(id);
    if (result.changes === 0) {
      throw new HttpError(404, "Vehicle not found");
    }
  }
}

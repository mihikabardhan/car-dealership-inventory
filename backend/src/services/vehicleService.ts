import { DB } from "../db";
import { HttpError, Vehicle } from "../types";

const isWholeNumber = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n);

export interface SearchFilters {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
}

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

  search(filters: SearchFilters): Vehicle[] {
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    // LIKE gives us case-insensitive partial matching for text fields
    if (filters.make) {
      conditions.push("make LIKE ?");
      params.push(`%${filters.make}%`);
    }
    if (filters.model) {
      conditions.push("model LIKE ?");
      params.push(`%${filters.model}%`);
    }
    if (filters.category) {
      conditions.push("category LIKE ?");
      params.push(`%${filters.category}%`);
    }
    if (filters.minPrice) {
      const min = Number(filters.minPrice);
      if (Number.isNaN(min)) throw new HttpError(400, "minPrice must be a number");
      conditions.push("price >= ?");
      params.push(min);
    }
    if (filters.maxPrice) {
      const max = Number(filters.maxPrice);
      if (Number.isNaN(max)) throw new HttpError(400, "maxPrice must be a number");
      conditions.push("price <= ?");
      params.push(max);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    // values go in as ? params so nobody can do sql injection through the query string
    return this.db.prepare(`SELECT * FROM vehicles ${where} ORDER BY id DESC`).all(...params) as Vehicle[];
  }

  purchase(id: number, quantity: unknown = 1): Vehicle {
    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      throw new HttpError(400, "Purchase quantity must be a positive whole number");
    }

    this.getById(id);

    const result = this.db
      .prepare(
        "UPDATE vehicles SET quantity = quantity - ? WHERE id = ? AND quantity >= ?"
      )
      .run(quantity, id, quantity);

    if (result.changes === 0) {
      throw new HttpError(400, "Not enough stock available");
    }

    return this.getById(id);
  }

  restock(id: number, quantity: unknown): Vehicle {
    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      throw new HttpError(400, "Restock quantity must be a positive whole number");
    }

    this.getById(id);

    this.db
      .prepare("UPDATE vehicles SET quantity = quantity + ? WHERE id = ?")
      .run(quantity, id);

    return this.getById(id);
  }

}

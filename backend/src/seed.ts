// Run with: npm run seed
// Creates an admin account and some sample cars so the app isn't empty.
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { openDatabase } from "./db";

dotenv.config();

const db = openDatabase(process.env.DB_PATH || "./dealership.db");

const adminEmail = "admin@dealership.com";
const adminPassword = "admin123";

const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(adminEmail);
if (!exists) {
  db.prepare("INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'admin')").run(
    adminEmail,
    bcrypt.hashSync(adminPassword, 10)
  );
  console.log(`Admin created -> ${adminEmail} / ${adminPassword}`);
} else {
  console.log("Admin already exists, skipping");
}

const count = (db.prepare("SELECT COUNT(*) AS c FROM vehicles").get() as { c: number }).c;
if (count === 0) {
  const insert = db.prepare("INSERT INTO vehicles (make, model, category, price, quantity) VALUES (?, ?, ?, ?, ?)");
  const cars: [string, string, string, number, number][] = [
    ["Toyota", "Camry", "Sedan", 28000, 6],
    ["Honda", "Civic", "Sedan", 22500, 4],
    ["Honda", "CR-V", "SUV", 32000, 3],
    ["Ford", "Mustang", "Coupe", 45000, 2],
    ["Tesla", "Model 3", "Electric", 42000, 5],
    ["Hyundai", "Creta", "SUV", 19000, 0],
    ["Mazda", "3", "Hatchback", 21000, 7],
    ["BMW", "X5", "SUV", 62000, 1],
  ];
  cars.forEach((c) => insert.run(...c));
  console.log(`Inserted ${cars.length} sample vehicles`);
}
db.close();

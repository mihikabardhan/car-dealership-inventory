import dotenv from "dotenv";
import { createApp } from "./app";
import { openDatabase } from "./db";

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing. Copy .env.example to .env and set it.");
  process.exit(1);
}

const db = openDatabase(process.env.DB_PATH || "./dealership.db");
const app = createApp(db);
const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});

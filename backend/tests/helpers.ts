import fs from "fs";
import os from "os";
import path from "path";
import request from "supertest";
import { createApp } from "../src/app";
import { openDatabase } from "../src/db";

process.env.JWT_SECRET = "test-secret";

// every test file gets its own sqlite file so tests don't affect each other
export function makeTestApp() {
  const file = path.join(os.tmpdir(), `dealer-${Date.now()}-${Math.random()}.db`);
  const db = openDatabase(file);
  const app = createApp(db);
  const cleanup = () => {
    db.close();
    fs.rmSync(file, { force: true });
  };
  return { app, db, cleanup };
}

export async function registerAndLogin(app: any, email = "user@test.com") {
  await request(app).post("/api/auth/register").send({ email, password: "secret123" });
  const res = await request(app).post("/api/auth/login").send({ email, password: "secret123" });
  return res.body.token as string;
}

// admins can't be created through the API, so we flip the role in the db directly
export async function makeAdminToken(app: any, db: any, email = "admin@test.com") {
  await request(app).post("/api/auth/register").send({ email, password: "secret123" });
  db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run(email);
  const res = await request(app).post("/api/auth/login").send({ email, password: "secret123" });
  return res.body.token as string;
}

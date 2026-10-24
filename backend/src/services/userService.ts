import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { DB } from "../db";
import { HttpError, TokenPayload, User } from "../types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class UserService {
  constructor(private db: DB) {}

  register(email: unknown, password: unknown) {
    if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
      throw new HttpError(400, "A valid email is required");
    }
    if (typeof password !== "string" || password.length < 6) {
      throw new HttpError(400, "Password must be at least 6 characters");
    }

    const existing = this.db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
    if (existing) {
      throw new HttpError(409, "Email is already registered");
    }

    const hash = bcrypt.hashSync(password, 10);
    // role is always 'user' here, admins are created with the seed script
    const result = this.db
      .prepare("INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'user')")
      .run(email.toLowerCase(), hash);

    return { id: Number(result.lastInsertRowid), email: email.toLowerCase(), role: "user" };
  }

  login(email: unknown, password: unknown) {
    if (typeof email !== "string" || typeof password !== "string") {
      throw new HttpError(400, "Email and password are required");
    }

    const user = this.db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase()) as User | undefined;

    // same message for both cases so we don't leak which emails exist
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      throw new HttpError(401, "Invalid email or password");
    }

    const payload: TokenPayload = { id: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "8h" });

    return { token, user: { id: user.id, email: user.email, role: user.role } };
  }
}

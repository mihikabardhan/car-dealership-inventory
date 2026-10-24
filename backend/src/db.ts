import Database from "better-sqlite3";

export type DB = Database.Database;

// Opens (or creates) the sqlite file and makes sure the tables exist.
export function openDatabase(filePath: string): DB {
  const db = new Database(filePath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'user'
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      make      TEXT NOT NULL,
      model     TEXT NOT NULL,
      category  TEXT NOT NULL,
      price     REAL NOT NULL CHECK (price >= 0),
      quantity  INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0)
    );
  `);

  return db;
}

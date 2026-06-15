import { DatabaseSync } from "node:sqlite";
import { existsSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const dbPath = path.join(root, "prisma", "dev.db");
const migrationName = "20260614173500_init";
const migrationPath = path.join(root, "prisma", "migrations", migrationName, "migration.sql");
const sql = readFileSync(migrationPath, "utf8");

if (existsSync(dbPath)) {
  rmSync(dbPath);
}

const db = new DatabaseSync(dbPath);
db.exec("PRAGMA foreign_keys = ON;");
db.exec(sql);
db.exec(`
  CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "checksum" TEXT NOT NULL,
    "finished_at" DATETIME,
    "migration_name" TEXT NOT NULL,
    "logs" TEXT,
    "rolled_back_at" DATETIME,
    "started_at" DATETIME NOT NULL DEFAULT current_timestamp,
    "applied_steps_count" INTEGER UNSIGNED NOT NULL DEFAULT 0
  );
`);
db.prepare(
  'INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, applied_steps_count) VALUES (?, ?, current_timestamp, ?, 1)',
).run(`${migrationName}_manual`, "manual", migrationName);
db.close();

console.log(`SQLite database initialized at ${dbPath}`);

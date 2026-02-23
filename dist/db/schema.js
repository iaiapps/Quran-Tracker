"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = initializeDatabase;
const connection_js_1 = require("./connection.js");
function initializeDatabase() {
    connection_js_1.db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name          TEXT NOT NULL,
      email         TEXT,
      google_id     TEXT,
      avatar_url    TEXT,
      role          TEXT NOT NULL DEFAULT 'pending',
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id          TEXT PRIMARY KEY,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at  TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

    CREATE TABLE IF NOT EXISTS progress_entries (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      surah_number INTEGER NOT NULL,
      last_ayah    INTEGER NOT NULL,
      completed    INTEGER NOT NULL DEFAULT 0,
      created_at   TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, surah_number)
    );

    CREATE INDEX IF NOT EXISTS idx_progress_user ON progress_entries(user_id);

    CREATE TABLE IF NOT EXISTS progress_log (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      surah_number INTEGER NOT NULL,
      ayah_from    INTEGER NOT NULL,
      ayah_to      INTEGER NOT NULL,
      logged_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_progress_log_user ON progress_log(user_id);
    CREATE INDEX IF NOT EXISTS idx_progress_log_time ON progress_log(logged_at);

    CREATE TABLE IF NOT EXISTS settings (
      key         TEXT PRIMARY KEY,
      value       TEXT NOT NULL,
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS history (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      year         INTEGER NOT NULL,
      total_ayat   INTEGER NOT NULL,
      total_cycles FLOAT NOT NULL,
      completed_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
    // Insert default settings if not exists
    const existingTarget = connection_js_1.db.prepare("SELECT value FROM settings WHERE key = 'target_khatam'").get();
    if (!existingTarget) {
        connection_js_1.db.prepare("INSERT INTO settings (key, value) VALUES ('target_khatam', '1')").run();
    }
    const existingYear = connection_js_1.db.prepare("SELECT value FROM settings WHERE key = 'ramadan_year'").get();
    if (!existingYear) {
        // Calculate approximate Hijri year: Gregorian year - 622 + (difference / 33)
        // More accurate: use known conversion
        // 2025 = 1446, 2026 = 1447
        const gregorian = new Date().getFullYear();
        const hijri = gregorian - 622 + Math.floor((gregorian - 622) / 33);
        connection_js_1.db.prepare("INSERT INTO settings (key, value) VALUES ('ramadan_year', ?)").run(hijri.toString());
    }
}

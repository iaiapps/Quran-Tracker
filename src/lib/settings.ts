import { db } from "../db/connection.js";
import { getHighestPage } from "./progress-calc.js";
import { TOTAL_PAGES } from "../data/quran-meta.js";
import type { ProgressEntry } from "../types.js";

export function getSetting(key: string): string | null {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | null;
  return row?.value || null;
}

export function setSetting(key: string, value: string): void {
  db.prepare(
    "INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now')"
  ).run(key, value, value);
}

export function getTargetKhatam(): number {
  const val = getSetting("target_khatam");
  return val ? parseInt(val, 10) : 1;
}

export function getRamadanYear(): number {
  const val = getSetting("ramadan_year");
  return val ? parseInt(val, 10) : 1446;
}

export function archiveAndResetAllUsers(): void {
  const year = getRamadanYear();
  const users = db.prepare("SELECT id FROM users WHERE role IN ('member', 'admin')").all() as { id: number }[];

  for (const user of users) {
    const entries = db.prepare("SELECT * FROM progress_entries WHERE user_id = ?").all(user.id) as ProgressEntry[];
    
    const highestPage = getHighestPage(entries);
    const totalCycles = highestPage / TOTAL_PAGES;

    if (highestPage > 0) {
      db.prepare(
        "INSERT INTO history (user_id, year, total_pages, total_cycles) VALUES (?, ?, ?, ?)"
      ).run(user.id, year, highestPage, totalCycles);
    }

    db.prepare("DELETE FROM progress_entries WHERE user_id = ?").run(user.id);
    db.prepare("DELETE FROM progress_log WHERE user_id = ?").run(user.id);
  }
}

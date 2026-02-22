import { db } from "../db/connection.js";
import { getSurah } from "../data/quran-meta.js";

function calculateTotalAyah(surahNumber: number, ayah: number): number {
  if (surahNumber === 0) return 0;
  let total = 0;
  for (let i = 1; i < surahNumber; i++) {
    const surah = getSurah(i);
    if (surah) total += surah.totalAyahs;
  }
  total += ayah;
  return total;
}

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
    const entries = db.prepare("SELECT surah_number, last_ayah FROM progress_entries WHERE user_id = ?").all(user.id) as { surah_number: number; last_ayah: number }[];
    
    // Find highest position
    let highest = { surah_number: 0, last_ayah: 0 };
    for (const e of entries) {
      if (e.surah_number > highest.surah_number || 
          (e.surah_number === highest.surah_number && e.last_ayah > highest.last_ayah)) {
        highest = e;
      }
    }
    
    const totalAyah = calculateTotalAyah(highest.surah_number, highest.last_ayah);
    const totalCycles = totalAyah / 6236;

    if (totalAyah > 0) {
      db.prepare(
        "INSERT INTO history (user_id, year, total_ayat, total_cycles) VALUES (?, ?, ?, ?)"
      ).run(user.id, year, totalAyah, totalCycles);
    }

    db.prepare("DELETE FROM progress_entries WHERE user_id = ?").run(user.id);
    db.prepare("DELETE FROM progress_log WHERE user_id = ?").run(user.id);
  }
}

import { db } from "../db/connection.js";
import {
  TOTAL_AYAHS,
  getSurah,
} from "../data/quran-meta.js";
import { getTargetKhatam } from "./settings.js";
import type { ProgressEntry, RankedUser } from "../types.js";

export function getHighestPosition(entries: ProgressEntry[]): { surahNumber: number; ayah: number } {
  if (entries.length === 0) {
    return { surahNumber: 0, ayah: 0 };
  }

  let highest = entries[0]!;
  for (const e of entries) {
    if (e.surah_number > highest.surah_number) {
      highest = e;
    } else if (e.surah_number === highest.surah_number && e.last_ayah > highest.last_ayah) {
      highest = e;
    }
  }
  return { surahNumber: highest.surah_number, ayah: highest.last_ayah };
}

export function calculateTotalAyahFromPosition(surahNumber: number, ayah: number): number {
  if (surahNumber === 0) return 0;

  let total = 0;
  for (let i = 1; i < surahNumber; i++) {
    const surah = getSurah(i);
    if (surah) {
      total += surah.totalAyahs;
    }
  }
  total += ayah;
  return total;
}

export function currentCycle(totalAyahs: number): number {
  return totalAyahs / TOTAL_AYAHS;
}

export function cycleProgressPercent(currentCycleVal: number, target: number = 1): number {
  return Math.min(100, Math.round((currentCycleVal / target) * 100));
}

export function getRemainingCycles(currentCycleVal: number, target: number = 1): number {
  return Math.max(0, target - currentCycleVal);
}

function getJoinedLabel(createdAt: string): string {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Joined today";
  if (diffDays === 1) return "Joined yesterday";
  if (diffDays < 7) return `Joined ${diffDays} days ago`;
  if (diffDays < 30) return `Joined ${Math.floor(diffDays / 7)} weeks ago`;
  return `Joined ${Math.floor(diffDays / 30)} months ago`;
}

function calculateTrend(userId: number): number {
  const result = db
    .prepare(
      `SELECT COALESCE(SUM(ayah_to - ayah_from), 0) as delta
       FROM progress_log
       WHERE user_id = ? AND logged_at >= datetime('now', '-7 days')`
    )
    .get(userId) as { delta: number };

  return result.delta;
}

export function getRankedMembers(params: {
  search?: string;
  sort?: string;
  page?: number;
  perPage?: number;
}): { members: RankedUser[]; total: number } {
  const { search, sort = "cycle", page = 1, perPage = 20 } = params;

  // Get all approved members
  let whereClause = "WHERE u.role IN ('member', 'admin')";
  const queryParams: (string | number)[] = [];

  if (search) {
    whereClause += " AND u.name LIKE ?";
    queryParams.push(`%${search}%`);
  }

  // Count total
  const countRow = db
    .prepare(`SELECT COUNT(*) as c FROM users u ${whereClause}`)
    .get(...queryParams) as { c: number };
  const total = countRow.c;

  // Get users with their progress (we'll calculate total based on highest position)
  const users = db
    .prepare(
      `SELECT u.id, u.name, u.avatar_url, u.created_at
       FROM users u
       ${whereClause}
       ORDER BY u.created_at ASC
       LIMIT ? OFFSET ?`
    )
    .all(...queryParams, perPage, (page - 1) * perPage) as Array<{
    id: number;
    name: string;
    avatar_url: string | null;
    created_at: string;
  }>;

  // Build ranked users with full details
  const members: RankedUser[] = [];

  // For ranking, we need to calculate based on highest position
  const allUserEntries = db
    .prepare(`
      SELECT u.id, pe.surah_number, pe.last_ayah
      FROM users u
      LEFT JOIN progress_entries pe ON pe.user_id = u.id
      WHERE u.role IN ('member', 'admin')
    `)
    .all() as Array<{ id: number; surah_number: number | null; last_ayah: number | null }>;

  const userTotals = new Map<number, number>();
  for (const row of allUserEntries) {
    if (row.surah_number && row.last_ayah) {
      const current = userTotals.get(row.id) || 0;
      const pos = { surahNumber: row.surah_number, ayah: row.last_ayah };
      const total = calculateTotalAyahFromPosition(pos.surahNumber, pos.ayah);
      if (total > current) {
        userTotals.set(row.id, total);
      }
    }
  }

  const sortedUsers = [...userTotals.entries()].sort((a, b) => b[1] - a[1]);
  const rankMap = new Map<number, number>();
  sortedUsers.forEach(([userId], i) => rankMap.set(userId, i + 1));

  for (const u of users) {
    const entries = db
      .prepare("SELECT * FROM progress_entries WHERE user_id = ?")
      .all(u.id) as ProgressEntry[];

    const position = getHighestPosition(entries);
    const totalAyah = calculateTotalAyahFromPosition(position.surahNumber, position.ayah);
    const trend = calculateTrend(u.id);
    const cycle = currentCycle(totalAyah);
    const target = getTargetKhatam();
    const surah = getSurah(position.surahNumber);

    members.push({
      id: u.id,
      name: u.name,
      avatar_url: u.avatar_url,
      rank: rankMap.get(u.id) || 0,
      total_memorized: totalAyah,
      cycle,
      target,
      progress_percent: cycleProgressPercent(cycle, target),
      current_surah: surah?.name || "Belum mulai",
      current_surah_number: position.surahNumber,
      current_ayah: position.ayah,
      trend,
      joined_label: getJoinedLabel(u.created_at),
    });
  }

  // Sort members based on sort param
  if (sort === "name") {
    members.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    members.sort((a, b) => b.cycle - a.cycle);
  }

  return { members, total };
}

export function getUserProgress(userId: number): {
  entries: ProgressEntry[];
  totalMemorized: number;
  cycle: number;
  target: number;
  progressPercent: number;
  currentPosition: { surahNumber: number; ayah: number; surahName: string };
} {
  const entries = db
    .prepare(
      "SELECT * FROM progress_entries WHERE user_id = ? ORDER BY surah_number ASC, last_ayah DESC"
    )
    .all(userId) as ProgressEntry[];

  const position = getHighestPosition(entries);
  const total = calculateTotalAyahFromPosition(position.surahNumber, position.ayah);
  const cycleVal = currentCycle(total);
  const target = getTargetKhatam();

  const surah = getSurah(position.surahNumber);

  return {
    entries,
    totalMemorized: total,
    cycle: cycleVal,
    target,
    progressPercent: cycleProgressPercent(cycleVal, target),
    currentPosition: {
      surahNumber: position.surahNumber,
      ayah: position.ayah,
      surahName: surah?.name || "Belum mulai",
    },
  };
}

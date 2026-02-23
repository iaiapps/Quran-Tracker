import { db } from "../db/connection.js";
import {
  TOTAL_PAGES,
  getSurah,
  getPositionForPage,
  getJuzForPosition,
} from "../data/quran-meta.js";
import { getTargetKhatam } from "./settings.js";
import type { ProgressEntry, RankedUser } from "../types.js";

export interface ProgressHistoryItem {
  id: number;
  pageFrom: number;
  pageTo: number;
  loggedAt: string;
}

export function getHighestPage(entries: ProgressEntry[]): number {
  if (entries.length === 0) {
    return 0;
  }

  let highest = entries[0]!;
  for (const e of entries) {
    if (e.last_page > highest.last_page) {
      highest = e;
    }
  }
  return highest.last_page;
}

export function calculateTotalPagesFromPosition(page: number): number {
  if (page === 0) return 0;
  return page;
}

export function currentCycle(totalPages: number): number {
  return totalPages / TOTAL_PAGES;
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
      `SELECT COALESCE(SUM(page_to - page_from), 0) as delta
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

  let whereClause = "WHERE u.role IN ('member', 'admin')";
  const queryParams: (string | number)[] = [];

  if (search) {
    whereClause += " AND u.name LIKE ?";
    queryParams.push(`%${search}%`);
  }

  const countRow = db
    .prepare(`SELECT COUNT(*) as c FROM users u ${whereClause}`)
    .get(...queryParams) as { c: number };
  const total = countRow.c;

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

  const members: RankedUser[] = [];

  const allUserEntries = db
    .prepare(`
      SELECT u.id, pe.last_page
      FROM users u
      LEFT JOIN progress_entries pe ON pe.user_id = u.id
      WHERE u.role IN ('member', 'admin')
    `)
    .all() as Array<{ id: number; last_page: number | null }>;

  const userTotals = new Map<number, number>();
  for (const row of allUserEntries) {
    if (row.last_page) {
      const current = userTotals.get(row.id) || 0;
      if (row.last_page > current) {
        userTotals.set(row.id, row.last_page);
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

    const highestPage = getHighestPage(entries);
    const trend = calculateTrend(u.id);
    const cycle = currentCycle(highestPage);
    const target = getTargetKhatam();

    const pos = getPositionForPage(highestPage);
    const surah = pos ? getSurah(pos.surah) : undefined;
    const juz = pos ? getJuzForPosition(pos.surah, pos.ayah) : 1;

    members.push({
      id: u.id,
      name: u.name,
      avatar_url: u.avatar_url,
      rank: rankMap.get(u.id) || 0,
      total_memorized: highestPage,
      cycle,
      target,
      progress_percent: cycleProgressPercent(cycle, target),
      current_surah: surah?.name || "Belum mulai",
      current_surah_number: pos?.surah || 0,
      current_ayah: pos?.ayah || 0,
      current_juz: juz,
      trend,
      joined_label: getJoinedLabel(u.created_at),
    });
  }

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
  currentPosition: { page: number; surahNumber: number; ayah: number; surahName: string; juz: number };
} {
  const entries = db
    .prepare(
      "SELECT * FROM progress_entries WHERE user_id = ? ORDER BY last_page DESC"
    )
    .all(userId) as ProgressEntry[];

  const highestPage = getHighestPage(entries);
  const cycleVal = currentCycle(highestPage);
  const target = getTargetKhatam();

  const pos = getPositionForPage(highestPage);
  const surah = pos ? getSurah(pos.surah) : undefined;
  const juz = pos ? getJuzForPosition(pos.surah, pos.ayah) : 1;

  return {
    entries,
    totalMemorized: highestPage,
    cycle: cycleVal,
    target,
    progressPercent: cycleProgressPercent(cycleVal, target),
    currentPosition: {
      page: highestPage,
      surahNumber: pos?.surah || 0,
      ayah: pos?.ayah || 0,
      surahName: surah?.name || "Belum mulai",
      juz: juz,
    },
  };
}

export function getUserProgressHistory(userId: number, limit = 20): ProgressHistoryItem[] {
  return db
    .prepare(
      `SELECT id, page_from as pageFrom, page_to as pageTo, logged_at as loggedAt
       FROM progress_log
       WHERE user_id = ?
       ORDER BY logged_at DESC
       LIMIT ?`
    )
    .all(userId, limit) as ProgressHistoryItem[];
}

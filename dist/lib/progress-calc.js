"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHighestPage = getHighestPage;
exports.currentCycle = currentCycle;
exports.cycleProgressPercent = cycleProgressPercent;
exports.getRankedMembers = getRankedMembers;
exports.getUserProgress = getUserProgress;
exports.getUserProgressHistory = getUserProgressHistory;
const connection_js_1 = require("../db/connection.js");
const quran_meta_js_1 = require("../data/quran-meta.js");
const settings_js_1 = require("./settings.js");
function getHighestPage(entries) {
    if (entries.length === 0) {
        return 0;
    }
    let highest = entries[0];
    for (const e of entries) {
        if (e.last_page > highest.last_page) {
            highest = e;
        }
    }
    return highest.last_page;
}
function currentCycle(totalPages) {
    return totalPages / quran_meta_js_1.TOTAL_PAGES;
}
function cycleProgressPercent(currentCycleVal, target = 1) {
    return Math.min(100, Math.round((currentCycleVal / target) * 100));
}
function getJoinedLabel(createdAt) {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0)
        return "Joined today";
    if (diffDays === 1)
        return "Joined yesterday";
    if (diffDays < 7)
        return `Joined ${diffDays} days ago`;
    if (diffDays < 30)
        return `Joined ${Math.floor(diffDays / 7)} weeks ago`;
    return `Joined ${Math.floor(diffDays / 30)} months ago`;
}
function calculateTrend(userId) {
    const result = connection_js_1.db
        .prepare(`SELECT COALESCE(SUM(page_to - page_from), 0) as delta
       FROM progress_log
       WHERE user_id = ? AND logged_at >= datetime('now', '-7 days')`)
        .get(userId);
    return result.delta;
}
function getTotalPagesRead(userId) {
    const result = connection_js_1.db
        .prepare(`SELECT COALESCE(SUM(page_to - page_from), 0) as total
       FROM progress_log
       WHERE user_id = ?`)
        .get(userId);
    return result.total;
}
function getRankedMembers(params) {
    const { search, sort = "cycle", page = 1, perPage = 20 } = params;
    let whereClause = "WHERE u.role IN ('member', 'admin')";
    const queryParams = [];
    if (search) {
        whereClause += " AND u.name LIKE ?";
        queryParams.push(`%${search}%`);
    }
    const countRow = connection_js_1.db
        .prepare(`SELECT COUNT(*) as c FROM users u ${whereClause}`)
        .get(...queryParams);
    const total = countRow.c;
    // First get all users with their total pages read, then sort and paginate
    const allUsers = connection_js_1.db
        .prepare(`SELECT u.id, u.name, u.avatar_url, u.created_at
       FROM users u
       ${whereClause}`)
        .all(...queryParams);
    // Get all totals from progress_log
    const allUserTotalRead = connection_js_1.db
        .prepare(`
      SELECT user_id as id, COALESCE(SUM(page_to - page_from), 0) as total
      FROM progress_log
      GROUP BY user_id
    `)
        .all();
    const totalReadMap = new Map();
    for (const row of allUserTotalRead) {
        totalReadMap.set(row.id, row.total);
    }
    // Also check progress_entries for users without log
    for (const u of allUsers) {
        if (!totalReadMap.has(u.id)) {
            const entry = connection_js_1.db.prepare("SELECT last_page FROM progress_entries WHERE user_id = ?").get(u.id);
            if (entry) {
                totalReadMap.set(u.id, entry.last_page);
            }
        }
    }
    // Sort all users by total pages read
    allUsers.sort((a, b) => {
        const totalA = totalReadMap.get(a.id) || 0;
        const totalB = totalReadMap.get(b.id) || 0;
        if (sort === "name") {
            return a.name.localeCompare(b.name);
        }
        return totalB - totalA;
    });
    // Create rank map
    const rankMap = new Map();
    allUsers.forEach((u, i) => rankMap.set(u.id, i + 1));
    // Paginate
    const paginatedUsers = allUsers.slice((page - 1) * perPage, page * perPage);
    const members = [];
    for (const u of paginatedUsers) {
        const entries = connection_js_1.db
            .prepare("SELECT * FROM progress_entries WHERE user_id = ?")
            .all(u.id);
        const highestPage = getHighestPage(entries);
        const totalForCycle = totalReadMap.get(u.id) || 0;
        const trend = calculateTrend(u.id);
        const cycle = currentCycle(totalForCycle > 0 ? totalForCycle : highestPage);
        const target = (0, settings_js_1.getTargetKhatam)();
        const pos = (0, quran_meta_js_1.getPositionForPage)(highestPage);
        const surah = pos ? (0, quran_meta_js_1.getSurah)(pos.surah) : undefined;
        const juz = pos ? (0, quran_meta_js_1.getJuzForPosition)(pos.surah, pos.ayah) : 1;
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
    return { members, total };
}
function getUserProgress(userId) {
    const entries = connection_js_1.db
        .prepare("SELECT * FROM progress_entries WHERE user_id = ? ORDER BY last_page DESC")
        .all(userId);
    const highestPage = getHighestPage(entries);
    const totalPagesRead = getTotalPagesRead(userId);
    const totalForCycle = totalPagesRead > 0 ? totalPagesRead : highestPage;
    const cycleVal = currentCycle(totalForCycle);
    const target = (0, settings_js_1.getTargetKhatam)();
    const pos = (0, quran_meta_js_1.getPositionForPage)(highestPage);
    const surah = pos ? (0, quran_meta_js_1.getSurah)(pos.surah) : undefined;
    const juz = pos ? (0, quran_meta_js_1.getJuzForPosition)(pos.surah, pos.ayah) : 1;
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
function getUserProgressHistory(userId, limit = 20) {
    return connection_js_1.db
        .prepare(`SELECT id, page_from as pageFrom, page_to as pageTo, logged_at as loggedAt
       FROM progress_log
       WHERE user_id = ?
       ORDER BY logged_at DESC
       LIMIT ?`)
        .all(userId, limit);
}

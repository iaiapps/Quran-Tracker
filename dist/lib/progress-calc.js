"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHighestPage = getHighestPage;
exports.calculateTotalPagesFromPosition = calculateTotalPagesFromPosition;
exports.currentCycle = currentCycle;
exports.cycleProgressPercent = cycleProgressPercent;
exports.getRemainingCycles = getRemainingCycles;
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
function calculateTotalPagesFromPosition(page) {
    if (page === 0)
        return 0;
    return page;
}
function currentCycle(totalPages) {
    return totalPages / quran_meta_js_1.TOTAL_PAGES;
}
function cycleProgressPercent(currentCycleVal, target = 1) {
    return Math.min(100, Math.round((currentCycleVal / target) * 100));
}
function getRemainingCycles(currentCycleVal, target = 1) {
    return Math.max(0, target - currentCycleVal);
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
    const users = connection_js_1.db
        .prepare(`SELECT u.id, u.name, u.avatar_url, u.created_at
       FROM users u
       ${whereClause}
       ORDER BY u.created_at ASC
       LIMIT ? OFFSET ?`)
        .all(...queryParams, perPage, (page - 1) * perPage);
    const members = [];
    const allUserEntries = connection_js_1.db
        .prepare(`
      SELECT u.id, pe.last_page
      FROM users u
      LEFT JOIN progress_entries pe ON pe.user_id = u.id
      WHERE u.role IN ('member', 'admin')
    `)
        .all();
    const userTotals = new Map();
    for (const row of allUserEntries) {
        if (row.last_page) {
            const current = userTotals.get(row.id) || 0;
            if (row.last_page > current) {
                userTotals.set(row.id, row.last_page);
            }
        }
    }
    const sortedUsers = [...userTotals.entries()].sort((a, b) => b[1] - a[1]);
    const rankMap = new Map();
    sortedUsers.forEach(([userId], i) => rankMap.set(userId, i + 1));
    for (const u of users) {
        const entries = connection_js_1.db
            .prepare("SELECT * FROM progress_entries WHERE user_id = ?")
            .all(u.id);
        const highestPage = getHighestPage(entries);
        const trend = calculateTrend(u.id);
        const cycle = currentCycle(highestPage);
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
    if (sort === "name") {
        members.sort((a, b) => a.name.localeCompare(b.name));
    }
    else {
        members.sort((a, b) => b.cycle - a.cycle);
    }
    return { members, total };
}
function getUserProgress(userId) {
    const entries = connection_js_1.db
        .prepare("SELECT * FROM progress_entries WHERE user_id = ? ORDER BY last_page DESC")
        .all(userId);
    const highestPage = getHighestPage(entries);
    const cycleVal = currentCycle(highestPage);
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

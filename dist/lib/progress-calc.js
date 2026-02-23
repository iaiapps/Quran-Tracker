"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHighestPosition = getHighestPosition;
exports.calculateTotalAyahFromPosition = calculateTotalAyahFromPosition;
exports.currentCycle = currentCycle;
exports.cycleProgressPercent = cycleProgressPercent;
exports.getRemainingCycles = getRemainingCycles;
exports.getRankedMembers = getRankedMembers;
exports.getUserProgress = getUserProgress;
const connection_js_1 = require("../db/connection.js");
const quran_meta_js_1 = require("../data/quran-meta.js");
const settings_js_1 = require("./settings.js");
function getHighestPosition(entries) {
    if (entries.length === 0) {
        return { surahNumber: 0, ayah: 0 };
    }
    let highest = entries[0];
    for (const e of entries) {
        if (e.surah_number > highest.surah_number) {
            highest = e;
        }
        else if (e.surah_number === highest.surah_number && e.last_ayah > highest.last_ayah) {
            highest = e;
        }
    }
    return { surahNumber: highest.surah_number, ayah: highest.last_ayah };
}
function calculateTotalAyahFromPosition(surahNumber, ayah) {
    if (surahNumber === 0)
        return 0;
    let total = 0;
    for (let i = 1; i < surahNumber; i++) {
        const surah = (0, quran_meta_js_1.getSurah)(i);
        if (surah) {
            total += surah.totalAyahs;
        }
    }
    total += ayah;
    return total;
}
function currentCycle(totalAyahs) {
    return totalAyahs / quran_meta_js_1.TOTAL_AYAHS;
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
        .prepare(`SELECT COALESCE(SUM(ayah_to - ayah_from), 0) as delta
       FROM progress_log
       WHERE user_id = ? AND logged_at >= datetime('now', '-7 days')`)
        .get(userId);
    return result.delta;
}
function getRankedMembers(params) {
    const { search, sort = "cycle", page = 1, perPage = 20 } = params;
    // Get all approved members
    let whereClause = "WHERE u.role IN ('member', 'admin')";
    const queryParams = [];
    if (search) {
        whereClause += " AND u.name LIKE ?";
        queryParams.push(`%${search}%`);
    }
    // Count total
    const countRow = connection_js_1.db
        .prepare(`SELECT COUNT(*) as c FROM users u ${whereClause}`)
        .get(...queryParams);
    const total = countRow.c;
    // Get users with their progress (we'll calculate total based on highest position)
    const users = connection_js_1.db
        .prepare(`SELECT u.id, u.name, u.avatar_url, u.created_at
       FROM users u
       ${whereClause}
       ORDER BY u.created_at ASC
       LIMIT ? OFFSET ?`)
        .all(...queryParams, perPage, (page - 1) * perPage);
    // Build ranked users with full details
    const members = [];
    // For ranking, we need to calculate based on highest position
    const allUserEntries = connection_js_1.db
        .prepare(`
      SELECT u.id, pe.surah_number, pe.last_ayah
      FROM users u
      LEFT JOIN progress_entries pe ON pe.user_id = u.id
      WHERE u.role IN ('member', 'admin')
    `)
        .all();
    const userTotals = new Map();
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
    const rankMap = new Map();
    sortedUsers.forEach(([userId], i) => rankMap.set(userId, i + 1));
    for (const u of users) {
        const entries = connection_js_1.db
            .prepare("SELECT * FROM progress_entries WHERE user_id = ?")
            .all(u.id);
        const position = getHighestPosition(entries);
        const totalAyah = calculateTotalAyahFromPosition(position.surahNumber, position.ayah);
        const trend = calculateTrend(u.id);
        const cycle = currentCycle(totalAyah);
        const target = (0, settings_js_1.getTargetKhatam)();
        const surah = (0, quran_meta_js_1.getSurah)(position.surahNumber);
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
    }
    else {
        members.sort((a, b) => b.cycle - a.cycle);
    }
    return { members, total };
}
function getUserProgress(userId) {
    const entries = connection_js_1.db
        .prepare("SELECT * FROM progress_entries WHERE user_id = ? ORDER BY surah_number ASC, last_ayah DESC")
        .all(userId);
    const position = getHighestPosition(entries);
    const total = calculateTotalAyahFromPosition(position.surahNumber, position.ayah);
    const cycleVal = currentCycle(total);
    const target = (0, settings_js_1.getTargetKhatam)();
    const surah = (0, quran_meta_js_1.getSurah)(position.surahNumber);
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

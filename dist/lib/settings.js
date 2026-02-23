"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSetting = getSetting;
exports.setSetting = setSetting;
exports.getTargetKhatam = getTargetKhatam;
exports.getRamadanYear = getRamadanYear;
exports.archiveAndResetAllUsers = archiveAndResetAllUsers;
const connection_js_1 = require("../db/connection.js");
const progress_calc_js_1 = require("./progress-calc.js");
const quran_meta_js_1 = require("../data/quran-meta.js");
function getSetting(key) {
    const row = connection_js_1.db.prepare("SELECT value FROM settings WHERE key = ?").get(key);
    return row?.value || null;
}
function setSetting(key, value) {
    connection_js_1.db.prepare("INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now')").run(key, value, value);
}
function getTargetKhatam() {
    const val = getSetting("target_khatam");
    return val ? parseInt(val, 10) : 1;
}
function getRamadanYear() {
    const val = getSetting("ramadan_year");
    return val ? parseInt(val, 10) : 1446;
}
function archiveAndResetAllUsers() {
    const year = getRamadanYear();
    const users = connection_js_1.db.prepare("SELECT id FROM users WHERE role IN ('member', 'admin')").all();
    for (const user of users) {
        const entries = connection_js_1.db.prepare("SELECT * FROM progress_entries WHERE user_id = ?").all(user.id);
        const highestPage = (0, progress_calc_js_1.getHighestPage)(entries);
        const totalCycles = highestPage / quran_meta_js_1.TOTAL_PAGES;
        if (highestPage > 0) {
            connection_js_1.db.prepare("INSERT INTO history (user_id, year, total_pages, total_cycles) VALUES (?, ?, ?, ?)").run(user.id, year, highestPage, totalCycles);
        }
        connection_js_1.db.prepare("DELETE FROM progress_entries WHERE user_id = ?").run(user.id);
        connection_js_1.db.prepare("DELETE FROM progress_log WHERE user_id = ?").run(user.id);
    }
}

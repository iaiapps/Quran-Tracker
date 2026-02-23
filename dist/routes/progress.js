"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.progressRoutes = void 0;
const jsx_runtime_1 = require("hono/jsx/jsx-runtime");
const hono_1 = require("hono");
const auth_js_1 = require("../middleware/auth.js");
const progress_calc_js_1 = require("../lib/progress-calc.js");
const quran_meta_js_1 = require("../data/quran-meta.js");
const settings_js_1 = require("../lib/settings.js");
const connection_js_1 = require("../db/connection.js");
const ProgressPage_js_1 = require("../views/pages/ProgressPage.js");
const progress = new hono_1.Hono();
exports.progressRoutes = progress;
progress.use("*", auth_js_1.authMiddleware, auth_js_1.memberMiddleware);
progress.get("/", (c) => {
    const user = c.get("user");
    const success = c.req.query("success");
    const error = c.req.query("error");
    const userProgress = (0, progress_calc_js_1.getUserProgress)(user.id);
    const ramadanYear = (0, settings_js_1.getRamadanYear)();
    return c.html((0, jsx_runtime_1.jsx)(ProgressPage_js_1.ProgressPage, { user: user, entries: userProgress.entries, cycle: userProgress.cycle, target: userProgress.target, progressPercent: userProgress.progressPercent, currentPosition: userProgress.currentPosition, ramadanYear: ramadanYear, success: success, error: error }));
});
progress.post("/", async (c) => {
    const user = c.get("user");
    const body = await c.req.parseBody();
    const surahNumber = parseInt(body.surah_number, 10);
    const lastAyah = parseInt(body.last_ayah, 10);
    if (isNaN(surahNumber) || isNaN(lastAyah)) {
        return c.redirect("/progress?error=Invalid+input");
    }
    const surah = (0, quran_meta_js_1.getSurah)(surahNumber);
    if (!surah) {
        return c.redirect("/progress?error=Invalid+Surah");
    }
    if (lastAyah < 1 || lastAyah > surah.totalAyahs) {
        return c.redirect(`/progress?error=Ayah+must+be+between+1+and+${surah.totalAyahs}`);
    }
    const completed = lastAyah === surah.totalAyahs ? 1 : 0;
    const existing = connection_js_1.db
        .prepare("SELECT last_ayah FROM progress_entries WHERE user_id = ? AND surah_number = ?")
        .get(user.id, surahNumber);
    const previousAyah = existing?.last_ayah || 0;
    connection_js_1.db.prepare(`INSERT INTO progress_entries (user_id, surah_number, last_ayah, completed)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id, surah_number)
     DO UPDATE SET last_ayah = ?, completed = ?, updated_at = datetime('now')`).run(user.id, surahNumber, lastAyah, completed, lastAyah, completed);
    if (lastAyah !== previousAyah) {
        connection_js_1.db.prepare("INSERT INTO progress_log (user_id, surah_number, ayah_from, ayah_to) VALUES (?, ?, ?, ?)").run(user.id, surahNumber, previousAyah, lastAyah);
    }
    const msg = completed
        ? `MashaAllah!+${surah.name}+selesai+(${lastAyah}/${surah.totalAyahs}+ayat)`
        : `${surah.name}+-${lastAyah}/${surah.totalAyahs}`;
    return c.redirect(`/progress?success=${msg}`);
});

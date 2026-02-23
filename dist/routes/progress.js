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
    const history = (0, progress_calc_js_1.getUserProgressHistory)(user.id, 50);
    const ramadanYear = (0, settings_js_1.getRamadanYear)();
    return c.html((0, jsx_runtime_1.jsx)(ProgressPage_js_1.ProgressPage, { user: user, history: history, cycle: userProgress.cycle, target: userProgress.target, progressPercent: userProgress.progressPercent, currentPosition: userProgress.currentPosition, ramadanYear: ramadanYear, success: success, error: error }));
});
progress.post("/", async (c) => {
    const user = c.get("user");
    const body = await c.req.parseBody();
    const lastPage = parseInt(body.last_page, 10);
    if (isNaN(lastPage) || lastPage < 1 || lastPage > quran_meta_js_1.TOTAL_PAGES) {
        return c.redirect(`/progress?error=Page+must+be+between+1+and+${quran_meta_js_1.TOTAL_PAGES}`);
    }
    const existing = connection_js_1.db
        .prepare("SELECT last_page FROM progress_entries WHERE user_id = ?")
        .get(user.id);
    const previousPage = existing?.last_page || 0;
    connection_js_1.db.prepare(`INSERT INTO progress_entries (user_id, last_page, completed)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id)
     DO UPDATE SET last_page = ?, completed = ?, updated_at = datetime('now')`).run(user.id, lastPage, lastPage >= quran_meta_js_1.TOTAL_PAGES ? 1 : 0, lastPage, lastPage >= quran_meta_js_1.TOTAL_PAGES ? 1 : 0);
    if (lastPage > previousPage) {
        connection_js_1.db.prepare("INSERT INTO progress_log (user_id, page_from, page_to) VALUES (?, ?, ?)").run(user.id, previousPage, lastPage);
    }
    const pos = (0, quran_meta_js_1.getPositionForPage)(lastPage);
    const surah = pos ? (0, quran_meta_js_1.getSurah)(pos.surah) : undefined;
    const msg = lastPage >= quran_meta_js_1.TOTAL_PAGES
        ? `MashaAllah!+Khatam+Quran+(halaman+${lastPage})`
        : `Halaman+${lastPage}+(${surah?.name || 'Unknown'})`;
    return c.redirect(`/progress?success=${msg}`);
});

import { Hono } from "hono";
import { authMiddleware, memberMiddleware } from "../middleware/auth.js";
import { getUserProgress, getUserProgressHistory } from "../lib/progress-calc.js";
import { getPositionForPage, getSurah, TOTAL_PAGES } from "../data/quran-meta.js";
import { getRamadanYear } from "../lib/settings.js";
import { db } from "../db/connection.js";
import { ProgressPage } from "../views/pages/ProgressPage.js";
import type { Env } from "../types.js";

const progress = new Hono<Env>();

progress.use("*", authMiddleware, memberMiddleware);

progress.get("/", (c) => {
  const user = c.get("user");
  const success = c.req.query("success");
  const error = c.req.query("error");
  const userProgress = getUserProgress(user.id);
  const history = getUserProgressHistory(user.id, 50);
  const ramadanYear = getRamadanYear();

  return c.html(
    <ProgressPage
      user={user}
      history={history}
      cycle={userProgress.cycle}
      target={userProgress.target}
      progressPercent={userProgress.progressPercent}
      currentPosition={userProgress.currentPosition}
      ramadanYear={ramadanYear}
      success={success}
      error={error}
    />
  );
});

progress.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.parseBody();

  const lastPage = parseInt(body.last_page as string, 10);

  if (isNaN(lastPage) || lastPage < 1 || lastPage > TOTAL_PAGES) {
    return c.redirect(`/progress?error=Page+must+be+between+1+and+${TOTAL_PAGES}`);
  }

  const existing = db
    .prepare("SELECT last_page FROM progress_entries WHERE user_id = ?")
    .get(user.id) as { last_page: number } | null;

  const previousPage = existing?.last_page || 0;

  db.prepare(
    `INSERT INTO progress_entries (user_id, last_page, completed)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id)
     DO UPDATE SET last_page = ?, completed = ?, updated_at = datetime('now')`
  ).run(user.id, lastPage, lastPage >= TOTAL_PAGES ? 1 : 0, lastPage, lastPage >= TOTAL_PAGES ? 1 : 0);

  if (lastPage > previousPage) {
    db.prepare(
      "INSERT INTO progress_log (user_id, page_from, page_to) VALUES (?, ?, ?)"
    ).run(user.id, previousPage, lastPage);
  }

  const pos = getPositionForPage(lastPage);
  const surah = pos ? getSurah(pos.surah) : undefined;

  const msg = lastPage >= TOTAL_PAGES 
    ? `MashaAllah!+Khatam+Quran+(halaman+${lastPage})`
    : `Halaman+${lastPage}+(${surah?.name || 'Unknown'})`;

  return c.redirect(`/progress?success=${msg}`);
});

export { progress as progressRoutes };

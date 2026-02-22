import { Hono } from "hono";
import { authMiddleware, memberMiddleware } from "../middleware/auth.js";
import { getUserProgress } from "../lib/progress-calc.js";
import { getSurah } from "../data/quran-meta.js";
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
  const ramadanYear = getRamadanYear();

  return c.html(
    <ProgressPage
      user={user}
      entries={userProgress.entries}
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

  const surahNumber = parseInt(body.surah_number as string, 10);
  const lastAyah = parseInt(body.last_ayah as string, 10);

  if (isNaN(surahNumber) || isNaN(lastAyah)) {
    return c.redirect("/progress?error=Invalid+input");
  }

  const surah = getSurah(surahNumber);
  if (!surah) {
    return c.redirect("/progress?error=Invalid+Surah");
  }

  if (lastAyah < 1 || lastAyah > surah.totalAyahs) {
    return c.redirect(
      `/progress?error=Ayah+must+be+between+1+and+${surah.totalAyahs}`
    );
  }

  const completed = lastAyah === surah.totalAyahs ? 1 : 0;

  const existing = db
    .prepare("SELECT last_ayah FROM progress_entries WHERE user_id = ? AND surah_number = ?")
    .get(user.id, surahNumber) as { last_ayah: number } | null;

  const previousAyah = existing?.last_ayah || 0;

  db.prepare(
    `INSERT INTO progress_entries (user_id, surah_number, last_ayah, completed)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id, surah_number)
     DO UPDATE SET last_ayah = ?, completed = ?, updated_at = datetime('now')`
  ).run(user.id, surahNumber, lastAyah, completed, lastAyah, completed);

  if (lastAyah !== previousAyah) {
    db.prepare(
      "INSERT INTO progress_log (user_id, surah_number, ayah_from, ayah_to) VALUES (?, ?, ?, ?)"
    ).run(user.id, surahNumber, previousAyah, lastAyah);
  }

  const msg = completed 
    ? `MashaAllah!+${surah.name}+selesai+(${lastAyah}/${surah.totalAyahs}+ayat)`
    : `${surah.name}+-${lastAyah}/${surah.totalAyahs}`;

  return c.redirect(`/progress?success=${msg}`);
});

export { progress as progressRoutes };

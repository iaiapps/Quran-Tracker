import { Hono } from "hono";
import { authMiddleware, memberMiddleware } from "../middleware/auth.js";
import { getUserProgress, getRankedMembers } from "../lib/progress-calc.js";
import { getRamadanYear } from "../lib/settings.js";
import { DashboardPage } from "../views/pages/DashboardPage.js";
import type { Env } from "../types.js";

const dashboard = new Hono<Env>();

dashboard.use("*", authMiddleware, memberMiddleware);

dashboard.get("/", (c) => {
  const user = c.get("user");
  const userProgress = getUserProgress(user.id);
  const ramadanYear = getRamadanYear();

  const { members } = getRankedMembers({ perPage: 999 });
  const rank = members.find((m) => m.id === user.id) || null;

  return c.html(
    <DashboardPage
      user={user}
      cycle={userProgress.cycle}
      target={userProgress.target}
      progressPercent={userProgress.progressPercent}
      totalMemorized={userProgress.totalMemorized}
      rank={rank}
      currentPosition={userProgress.currentPosition}
      ramadanYear={ramadanYear}
    />
  );
});

export { dashboard as dashboardRoutes };

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaderboardRoutes = void 0;
const jsx_runtime_1 = require("hono/jsx/jsx-runtime");
const hono_1 = require("hono");
const auth_js_1 = require("../middleware/auth.js");
const progress_calc_js_1 = require("../lib/progress-calc.js");
const LeaderboardPage_js_1 = require("../views/pages/LeaderboardPage.js");
const leaderboard = new hono_1.Hono();
exports.leaderboardRoutes = leaderboard;
leaderboard.use("*", auth_js_1.authMiddleware, auth_js_1.memberMiddleware);
leaderboard.get("/", (c) => {
    const user = c.get("user");
    const search = c.req.query("search") || undefined;
    const sort = c.req.query("sort") || "cycle";
    const page = parseInt(c.req.query("page") || "1", 10);
    const perPage = 20;
    // Get top 3 for the podium cards
    const { members: allTop } = (0, progress_calc_js_1.getRankedMembers)({ sort: "juz", perPage: 3 });
    // Get paginated members (skip top 3 on page 1)
    const { members, total } = (0, progress_calc_js_1.getRankedMembers)({ search, sort, page, perPage });
    // Get current user's rank info
    const { members: userRankList } = (0, progress_calc_js_1.getRankedMembers)({ perPage: 999 });
    const currentUserRank = userRankList.find((m) => m.id === user.id) || null;
    return c.html((0, jsx_runtime_1.jsx)(LeaderboardPage_js_1.LeaderboardPage, { user: user, topThree: allTop, members: members, currentUserRank: currentUserRank, page: page, totalMembers: total, perPage: perPage, search: search, sort: sort }));
});

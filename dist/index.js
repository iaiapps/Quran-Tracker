import { jsx as _jsx, jsxs as _jsxs } from "hono/jsx/jsx-runtime";
import 'dotenv/config';
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { initializeDatabase } from "./db/schema.js";
import { getSessionUser, cleanExpiredSessions } from "./lib/session.js";
import { authRoutes } from "./routes/auth.js";
import { leaderboardRoutes } from "./routes/leaderboard.js";
import { progressRoutes } from "./routes/progress.js";
import { adminRoutes } from "./routes/admin.js";
import { dashboardRoutes } from "./routes/dashboard.js";
import { LoginPage } from "./views/pages/LoginPage.js";
import { PendingPage } from "./views/pages/PendingPage.js";
import { Layout } from "./views/Layout.js";
import { authMiddleware } from "./middleware/auth.js";
import { APP_NAME } from "./config.js";
console.log(`[${new Date().toISOString()}] Starting ${APP_NAME}...`);
try {
    initializeDatabase();
    console.log("[OK] Database initialized");
}
catch (err) {
    console.error("[ERROR] Failed to initialize database:", err);
    process.exit(1);
}
try {
    cleanExpiredSessions();
    console.log("[OK] Expired sessions cleaned");
}
catch (err) {
    console.error("[WARNING] Failed to clean sessions:", err);
}
const app = new Hono();
app.get("/", (c) => {
    const sessionId = getCookie(c, "session");
    if (sessionId) {
        const user = getSessionUser(sessionId);
        if (user) {
            if (user.role === "pending")
                return c.redirect("/pending");
            return c.redirect("/leaderboard");
        }
    }
    return c.redirect("/login");
});
app.get("/login", (c) => {
    const sessionId = getCookie(c, "session");
    if (sessionId) {
        const user = getSessionUser(sessionId);
        if (user && user.role !== "pending")
            return c.redirect("/leaderboard");
    }
    const error = c.req.query("error");
    const mode = c.req.query("mode");
    const message = c.req.query("message");
    return c.html(_jsx(LoginPage, { error: error, mode: mode, message: message }));
});
app.get("/pending", authMiddleware, (c) => {
    const user = c.get("user");
    if (user.role !== "pending")
        return c.redirect("/leaderboard");
    return c.html(_jsx(PendingPage, { user: user }));
});
app.route("/auth", authRoutes);
app.route("/leaderboard", leaderboardRoutes);
app.route("/progress", progressRoutes);
app.route("/admin", adminRoutes);
app.route("/dashboard", dashboardRoutes);
app.notFound((c) => {
    return c.html(_jsx(Layout, { title: `Not Found - ${APP_NAME}`, children: _jsx("div", { class: "flex-1 flex items-center justify-center", children: _jsxs("div", { class: "text-center", children: [_jsx("h1", { class: "text-6xl font-black text-text-secondary mb-4", children: "404" }), _jsx("p", { class: "text-text-secondary mb-6", children: "Page not found" }), _jsx("a", { href: "/", class: "text-primary font-bold hover:underline", children: "Go Home" })] }) }) }), 404);
});
const port = parseInt(process.env.PORT || process.env.NODE_PORT || "3000", 10);
serve({
    fetch: app.fetch,
    port,
});
console.log(`${APP_NAME} running at http://localhost:${port}`);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("hono/jsx/jsx-runtime");
require("dotenv/config");
const node_server_1 = require("@hono/node-server");
const hono_1 = require("hono");
const cookie_1 = require("hono/cookie");
const connection_js_1 = require("./db/connection.js");
const schema_js_1 = require("./db/schema.js");
const session_js_1 = require("./lib/session.js");
const auth_js_1 = require("./routes/auth.js");
const leaderboard_js_1 = require("./routes/leaderboard.js");
const progress_js_1 = require("./routes/progress.js");
const admin_js_1 = require("./routes/admin.js");
const dashboard_js_1 = require("./routes/dashboard.js");
const LoginPage_js_1 = require("./views/pages/LoginPage.js");
const PendingPage_js_1 = require("./views/pages/PendingPage.js");
const Layout_js_1 = require("./views/Layout.js");
const auth_js_2 = require("./middleware/auth.js");
const config_js_1 = require("./config.js");
async function start() {
    console.log(`[${new Date().toISOString()}] Starting ${config_js_1.APP_NAME}...`);
    try {
        await (0, connection_js_1.initDb)();
        (0, schema_js_1.initializeDatabase)();
        console.log("[OK] Database initialized");
    }
    catch (err) {
        console.error("[ERROR] Failed to initialize database:", err);
        process.exit(1);
    }
    try {
        (0, session_js_1.cleanExpiredSessions)();
        console.log("[OK] Expired sessions cleaned");
    }
    catch (err) {
        console.error("[WARNING] Failed to clean sessions:", err);
    }
    const app = new hono_1.Hono();
    app.get("/", (c) => {
        const sessionId = (0, cookie_1.getCookie)(c, "session");
        if (sessionId) {
            const user = (0, session_js_1.getSessionUser)(sessionId);
            if (user) {
                if (user.role === "pending")
                    return c.redirect("/pending");
                return c.redirect("/leaderboard");
            }
        }
        return c.redirect("/login");
    });
    app.get("/login", (c) => {
        const sessionId = (0, cookie_1.getCookie)(c, "session");
        if (sessionId) {
            const user = (0, session_js_1.getSessionUser)(sessionId);
            if (user && user.role !== "pending")
                return c.redirect("/leaderboard");
        }
        const error = c.req.query("error");
        const mode = c.req.query("mode");
        const message = c.req.query("message");
        return c.html((0, jsx_runtime_1.jsx)(LoginPage_js_1.LoginPage, { error: error, mode: mode, message: message }));
    });
    app.get("/pending", auth_js_2.authMiddleware, (c) => {
        const user = c.get("user");
        if (user.role !== "pending")
            return c.redirect("/leaderboard");
        return c.html((0, jsx_runtime_1.jsx)(PendingPage_js_1.PendingPage, { user: user }));
    });
    app.route("/auth", auth_js_1.authRoutes);
    app.route("/leaderboard", leaderboard_js_1.leaderboardRoutes);
    app.route("/progress", progress_js_1.progressRoutes);
    app.route("/admin", admin_js_1.adminRoutes);
    app.route("/dashboard", dashboard_js_1.dashboardRoutes);
    app.notFound((c) => {
        return c.html((0, jsx_runtime_1.jsx)(Layout_js_1.Layout, { title: `Not Found - ${config_js_1.APP_NAME}`, children: (0, jsx_runtime_1.jsx)("div", { class: "flex-1 flex items-center justify-center", children: (0, jsx_runtime_1.jsxs)("div", { class: "text-center", children: [(0, jsx_runtime_1.jsx)("h1", { class: "text-6xl font-black text-text-secondary mb-4", children: "404" }), (0, jsx_runtime_1.jsx)("p", { class: "text-text-secondary mb-6", children: "Page not found" }), (0, jsx_runtime_1.jsx)("a", { href: "/", class: "text-primary font-bold hover:underline", children: "Go Home" })] }) }) }), 404);
    });
    const port = parseInt(process.env.PORT || process.env.NODE_PORT || "3000", 10);
    (0, node_server_1.serve)({
        fetch: app.fetch,
        port,
    });
    console.log(`${config_js_1.APP_NAME} running at http://localhost:${port}`);
}
start();

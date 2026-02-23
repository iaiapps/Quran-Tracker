"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = exports.memberMiddleware = exports.authMiddleware = void 0;
const factory_1 = require("hono/factory");
const cookie_1 = require("hono/cookie");
const session_js_1 = require("../lib/session.js");
exports.authMiddleware = (0, factory_1.createMiddleware)(async (c, next) => {
    const sessionId = (0, cookie_1.getCookie)(c, "session");
    if (!sessionId) {
        return c.redirect("/login");
    }
    const user = (0, session_js_1.getSessionUser)(sessionId);
    if (!user) {
        return c.redirect("/login");
    }
    c.set("user", user);
    await next();
});
exports.memberMiddleware = (0, factory_1.createMiddleware)(async (c, next) => {
    const user = c.get("user");
    if (user.role === "pending") {
        return c.redirect("/pending");
    }
    await next();
});
exports.adminMiddleware = (0, factory_1.createMiddleware)(async (c, next) => {
    const user = c.get("user");
    if (user.role !== "admin") {
        return c.redirect("/leaderboard");
    }
    await next();
});

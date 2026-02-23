"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileRoutes = void 0;
const jsx_runtime_1 = require("hono/jsx/jsx-runtime");
const hono_1 = require("hono");
const cookie_1 = require("hono/cookie");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const connection_js_1 = require("../db/connection.js");
const session_js_1 = require("../lib/session.js");
const ProfilePage_js_1 = require("../views/pages/ProfilePage.js");
const auth_js_1 = require("../middleware/auth.js");
const cookie_2 = require("hono/cookie");
const profile = new hono_1.Hono();
exports.profileRoutes = profile;
profile.get("/", auth_js_1.authMiddleware, (c) => {
    const user = c.get("user");
    return c.html((0, jsx_runtime_1.jsx)(ProfilePage_js_1.ProfilePage, { user: user }));
});
profile.post("/", auth_js_1.authMiddleware, async (c) => {
    const sessionId = (0, cookie_1.getCookie)(c, "session");
    const currentUser = c.get("user");
    const body = await c.req.parseBody();
    const name = body.name?.trim();
    const username = body.username?.trim().toLowerCase();
    const currentPassword = body.current_password;
    const newPassword = body.new_password;
    if (!name || !username) {
        return c.html((0, jsx_runtime_1.jsx)(ProfilePage_js_1.ProfilePage, { user: currentUser, error: "Name and username are required" }));
    }
    const existingUser = connection_js_1.db
        .prepare("SELECT id, username FROM users WHERE username = ? AND id != ?")
        .get(username, currentUser.id);
    if (existingUser) {
        return c.html((0, jsx_runtime_1.jsx)(ProfilePage_js_1.ProfilePage, { user: currentUser, error: "Username already taken" }));
    }
    const user = connection_js_1.db.prepare("SELECT password_hash FROM users WHERE id = ?").get(currentUser.id);
    if (newPassword && newPassword.length > 0) {
        if (!currentPassword) {
            return c.html((0, jsx_runtime_1.jsx)(ProfilePage_js_1.ProfilePage, { user: currentUser, error: "Current password required to set new password" }));
        }
        if (newPassword.length < 6) {
            return c.html((0, jsx_runtime_1.jsx)(ProfilePage_js_1.ProfilePage, { user: currentUser, error: "New password must be at least 6 characters" }));
        }
        if (!user || !(await bcryptjs_1.default.compare(currentPassword, user.password_hash))) {
            return c.html((0, jsx_runtime_1.jsx)(ProfilePage_js_1.ProfilePage, { user: currentUser, error: "Current password is incorrect" }));
        }
        const newHash = await bcryptjs_1.default.hash(newPassword, 10);
        connection_js_1.db.prepare("UPDATE users SET name = ?, username = ?, password_hash = ? WHERE id = ?").run(name, username, newHash, currentUser.id);
        if (sessionId) {
            (0, session_js_1.deleteSession)(sessionId);
        }
        const newSessionId = (0, session_js_1.createSession)(currentUser.id);
        (0, cookie_2.setCookie)(c, "session", newSessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });
    }
    else {
        connection_js_1.db.prepare("UPDATE users SET name = ?, username = ? WHERE id = ?").run(name, username, currentUser.id);
    }
    const updatedUser = connection_js_1.db.prepare("SELECT * FROM users WHERE id = ?").get(currentUser.id);
    return c.html((0, jsx_runtime_1.jsx)(ProfilePage_js_1.ProfilePage, { user: updatedUser, success: "Profile updated successfully" }));
});

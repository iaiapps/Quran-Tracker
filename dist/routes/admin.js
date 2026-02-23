"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = void 0;
const jsx_runtime_1 = require("hono/jsx/jsx-runtime");
const hono_1 = require("hono");
const auth_js_1 = require("../middleware/auth.js");
const connection_js_1 = require("../db/connection.js");
const settings_js_1 = require("../lib/settings.js");
const AdminPage_js_1 = require("../views/pages/AdminPage.js");
const admin = new hono_1.Hono();
exports.adminRoutes = admin;
admin.use("*", auth_js_1.authMiddleware, auth_js_1.adminMiddleware);
admin.get("/", (c) => {
    const user = c.get("user");
    const success = c.req.query("success");
    const error = c.req.query("error");
    const pendingUsers = connection_js_1.db
        .prepare("SELECT * FROM users WHERE role = 'pending' ORDER BY created_at DESC")
        .all();
    const allUsers = connection_js_1.db
        .prepare("SELECT * FROM users WHERE role != 'pending' ORDER BY role DESC, name ASC")
        .all();
    const targetKhatam = (0, settings_js_1.getTargetKhatam)();
    const ramadanYear = (0, settings_js_1.getRamadanYear)();
    return c.html((0, jsx_runtime_1.jsx)(AdminPage_js_1.AdminPage, { user: user, pendingUsers: pendingUsers, allUsers: allUsers, targetKhatam: targetKhatam, ramadanYear: ramadanYear, success: success, error: error }));
});
admin.post("/settings/target", async (c) => {
    const body = await c.req.parseBody();
    const target = body.target;
    if (!target || isNaN(parseInt(target, 10))) {
        return c.redirect("/admin?error=Invalid-target");
    }
    (0, settings_js_1.setSetting)("target_khatam", target);
    return c.redirect("/admin?success=Target-khatam-updated");
});
admin.post("/settings/year", async (c) => {
    const body = await c.req.parseBody();
    const year = body.year;
    if (!year || isNaN(parseInt(year, 10))) {
        return c.redirect("/admin?error=Invalid-year");
    }
    (0, settings_js_1.setSetting)("ramadan_year", year);
    return c.redirect("/admin?success=Ramadan-year-updated");
});
admin.post("/reset/all", async (c) => {
    const body = await c.req.parseBody();
    const confirm = body.confirm;
    if (confirm !== "RESET") {
        return c.redirect("/admin?error=Ketik-RESET-untuk-konfirmasi");
    }
    (0, settings_js_1.archiveAndResetAllUsers)();
    return c.redirect("/admin?success=Semua-progress-telah-diarsipkan-dan-direset");
});
admin.post("/users/:id/approve", (c) => {
    const userId = c.req.param("id");
    connection_js_1.db.prepare("UPDATE users SET role = 'member', updated_at = datetime('now') WHERE id = ? AND role = 'pending'").run(userId);
    return c.redirect("/admin?success=User-approved");
});
admin.post("/users/:id/reject", (c) => {
    const userId = c.req.param("id");
    connection_js_1.db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
    connection_js_1.db.prepare("DELETE FROM users WHERE id = ? AND role = 'pending'").run(userId);
    return c.redirect("/admin?success=User-rejected");
});
admin.post("/users/:id/role", async (c) => {
    const userId = c.req.param("id");
    const body = await c.req.parseBody();
    const role = body.role;
    if (!["member", "admin"].includes(role)) {
        return c.redirect("/admin");
    }
    connection_js_1.db.prepare("UPDATE users SET role = ?, updated_at = datetime('now') WHERE id = ?").run(role, userId);
    return c.redirect("/admin?success=User-role-updated");
});
admin.post("/users/:id/delete", (c) => {
    const currentUser = c.get("user");
    const userId = parseInt(c.req.param("id"), 10);
    if (userId === currentUser.id) {
        return c.redirect("/admin?error=Cannot-delete-your-own-account");
    }
    const target = connection_js_1.db.prepare("SELECT role FROM users WHERE id = ?").get(userId);
    if (!target)
        return c.redirect("/admin?error=User-not-found");
    if (target.role === "admin") {
        return c.redirect("/admin?error=Cannot-delete-another-admin");
    }
    connection_js_1.db.prepare("DELETE FROM users WHERE id = ?").run(userId);
    return c.redirect("/admin?success=Member-removed");
});

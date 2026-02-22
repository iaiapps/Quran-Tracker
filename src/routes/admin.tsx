import { Hono } from "hono";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import { db } from "../db/connection.js";
import { getTargetKhatam, getRamadanYear, setSetting, archiveAndResetAllUsers } from "../lib/settings.js";
import { AdminPage } from "../views/pages/AdminPage.js";
import type { Env, User } from "../types.js";

const admin = new Hono<Env>();

admin.use("*", authMiddleware, adminMiddleware);

admin.get("/", (c) => {
  const user = c.get("user");
  const success = c.req.query("success");
  const error = c.req.query("error");

  const pendingUsers = db
    .prepare("SELECT * FROM users WHERE role = 'pending' ORDER BY created_at DESC")
    .all() as User[];

  const allUsers = db
    .prepare("SELECT * FROM users WHERE role != 'pending' ORDER BY role DESC, name ASC")
    .all() as User[];

  const targetKhatam = getTargetKhatam();
  const ramadanYear = getRamadanYear();

  return c.html(
    <AdminPage 
      user={user} 
      pendingUsers={pendingUsers} 
      allUsers={allUsers}
      targetKhatam={targetKhatam}
      ramadanYear={ramadanYear}
      success={success}
      error={error}
    />
  );
});

admin.post("/settings/target", async (c) => {
  const body = await c.req.parseBody();
  const target = body.target as string;
  
  if (!target || isNaN(parseInt(target, 10))) {
    return c.redirect("/admin?error=Invalid-target");
  }
  
  setSetting("target_khatam", target);
  return c.redirect("/admin?success=Target-khatam-updated");
});

admin.post("/settings/year", async (c) => {
  const body = await c.req.parseBody();
  const year = body.year as string;
  
  if (!year || isNaN(parseInt(year, 10))) {
    return c.redirect("/admin?error=Invalid-year");
  }
  
  setSetting("ramadan_year", year);
  return c.redirect("/admin?success=Ramadan-year-updated");
});

admin.post("/reset/all", async (c) => {
  const body = await c.req.parseBody();
  const confirm = body.confirm as string;
  
  if (confirm !== "RESET") {
    return c.redirect("/admin?error=Ketik-RESET-untuk-konfirmasi");
  }
  
  archiveAndResetAllUsers();
  return c.redirect("/admin?success=Semua-progress-telah-diarsipkan-dan-direset");
});

admin.post("/users/:id/approve", (c) => {
  const userId = c.req.param("id");
  db.prepare("UPDATE users SET role = 'member', updated_at = datetime('now') WHERE id = ? AND role = 'pending'").run(userId);
  return c.redirect("/admin?success=User-approved");
});

admin.post("/users/:id/reject", (c) => {
  const userId = c.req.param("id");
  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
  db.prepare("DELETE FROM users WHERE id = ? AND role = 'pending'").run(userId);
  return c.redirect("/admin?success=User-rejected");
});

admin.post("/users/:id/role", async (c) => {
  const userId = c.req.param("id");
  const body = await c.req.parseBody();
  const role = body.role as string;

  if (!["member", "admin"].includes(role)) {
    return c.redirect("/admin");
  }

  db.prepare("UPDATE users SET role = ?, updated_at = datetime('now') WHERE id = ?").run(role, userId);
  return c.redirect("/admin?success=User-role-updated");
});

admin.post("/users/:id/delete", (c) => {
  const currentUser = c.get("user");
  const userId = parseInt(c.req.param("id"), 10);

  if (userId === currentUser.id) {
    return c.redirect("/admin?error=Cannot-delete-your-own-account");
  }

  const target = db.prepare("SELECT role FROM users WHERE id = ?").get(userId) as { role: string } | null;
  if (!target) return c.redirect("/admin?error=User-not-found");
  if (target.role === "admin") {
    return c.redirect("/admin?error=Cannot-delete-another-admin");
  }

  db.prepare("DELETE FROM users WHERE id = ?").run(userId);
  return c.redirect("/admin?success=Member-removed");
});

export { admin as adminRoutes };

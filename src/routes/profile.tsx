import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import bcrypt from "bcryptjs";
import { db } from "../db/connection.js";
import { getSessionUser, deleteSession, createSession } from "../lib/session.js";
import { ProfilePage } from "../views/pages/ProfilePage.js";
import { authMiddleware } from "../middleware/auth.js";
import { setCookie } from "hono/cookie";
import type { User } from "../types.js";

const profile = new Hono();

profile.get("/", authMiddleware, (c) => {
  const user = c.get("user");
  return c.html(<ProfilePage user={user} />);
});

profile.post("/", authMiddleware, async (c) => {
  const sessionId = getCookie(c, "session");
  const currentUser = c.get("user");
  const body = await c.req.parseBody();

  const name = (body.name as string)?.trim();
  const username = (body.username as string)?.trim().toLowerCase();
  const currentPassword = body.current_password as string;
  const newPassword = body.new_password as string;

  if (!name || !username) {
    return c.html(
      <ProfilePage
        user={currentUser}
        error="Name and username are required"
      />
    );
  }

  const existingUser = db
    .prepare("SELECT id, username FROM users WHERE username = ? AND id != ?")
    .get(username, currentUser.id) as { id: number } | undefined;

  if (existingUser) {
    return c.html(
      <ProfilePage
        user={currentUser}
        error="Username already taken"
      />
    );
  }

  const user = db.prepare("SELECT password_hash FROM users WHERE id = ?").get(currentUser.id) as { password_hash: string } | undefined;

  if (newPassword && newPassword.length > 0) {
    if (!currentPassword) {
      return c.html(
        <ProfilePage
          user={currentUser}
          error="Current password required to set new password"
        />
      );
    }

    if (newPassword.length < 6) {
      return c.html(
        <ProfilePage
          user={currentUser}
          error="New password must be at least 6 characters"
        />
      );
    }

    if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
      return c.html(
        <ProfilePage
          user={currentUser}
          error="Current password is incorrect"
        />
      );
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    db.prepare("UPDATE users SET name = ?, username = ?, password_hash = ? WHERE id = ?").run(
      name,
      username,
      newHash,
      currentUser.id
    );

    if (sessionId) {
      deleteSession(sessionId);
    }
    const newSessionId = createSession(currentUser.id);
    setCookie(c, "session", newSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  } else {
    db.prepare("UPDATE users SET name = ?, username = ? WHERE id = ?").run(name, username, currentUser.id);
  }

  const updatedUser = db.prepare("SELECT * FROM users WHERE id = ?").get(currentUser.id) as User;

  return c.html(
    <ProfilePage
      user={updatedUser}
      success="Profile updated successfully"
    />
  );
});

export { profile as profileRoutes };

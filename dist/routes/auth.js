"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const hono_1 = require("hono");
const cookie_1 = require("hono/cookie");
const session_js_1 = require("../lib/session.js");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const connection_js_1 = require("../db/connection.js");
const auth = new hono_1.Hono();
exports.authRoutes = auth;
const registerErrorRedirect = (message) => `/login?mode=register&error=register_failed&message=${encodeURIComponent(message)}`;
auth.post("/register", async (c) => {
    const body = await c.req.parseBody();
    const name = body.name?.trim();
    const username = body.username?.trim().toLowerCase();
    const password = body.password;
    if (!name || !username || !password) {
        return c.redirect(registerErrorRedirect("Name, username and password are required"));
    }
    if (password.length < 6) {
        return c.redirect(registerErrorRedirect("Password must be at least 6 characters"));
    }
    const existingUser = connection_js_1.db.prepare("SELECT id FROM users WHERE username = ?").get(username);
    if (existingUser) {
        return c.redirect(registerErrorRedirect("Username already taken"));
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const count = connection_js_1.db.prepare("SELECT COUNT(*) as c FROM users").get();
    const role = count.c === 0 ? "admin" : "pending";
    const result = connection_js_1.db.prepare("INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)").run(username, passwordHash, name, role);
    const userId = Number(result.lastInsertRowid);
    const user = connection_js_1.db
        .prepare("SELECT id, role, password_hash FROM users WHERE id = ?")
        .get(userId);
    if (!user) {
        return c.redirect(registerErrorRedirect("Failed to create session"));
    }
    const sessionId = (0, session_js_1.createSession)(user.id);
    (0, cookie_1.setCookie)(c, "session", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
    });
    return c.redirect("/leaderboard");
});
auth.post("/login", async (c) => {
    const body = await c.req.parseBody();
    const username = body.username?.trim().toLowerCase();
    const password = body.password;
    if (!username || !password) {
        return c.redirect("/login?error=invalid_credentials");
    }
    const user = connection_js_1.db
        .prepare("SELECT id, role, password_hash FROM users WHERE username = ?")
        .get(username);
    if (!user) {
        return c.redirect("/login?error=invalid_credentials");
    }
    const validPassword = await bcryptjs_1.default.compare(password, user.password_hash);
    if (!validPassword) {
        return c.redirect("/login?error=invalid_credentials");
    }
    const sessionId = (0, session_js_1.createSession)(user.id);
    (0, cookie_1.setCookie)(c, "session", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
    });
    if (user.role === "pending")
        return c.redirect("/pending");
    return c.redirect("/leaderboard");
});
/*
// ============================================
// GOOGLE OAUTH - Disabled for now
// Uncomment if you want to enable Google Login
// ============================================

auth.get("/google", (c) => {
  const state = crypto.randomUUID();
  setCookie(c, "oauth_state", state, {
    httpOnly: true,
    maxAge: 300,
    sameSite: "Lax",
    path: "/",
  });

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
  });

  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

auth.get("/google/callback", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");
  const savedState = getCookie(c, "oauth_state");
  deleteCookie(c, "oauth_state", { path: "/" });

  if (!code || state !== savedState) {
    return c.redirect("/login?error=invalid_state");
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return c.redirect("/login?error=token_exchange_failed");
  }

  const tokens = (await tokenRes.json()) as { access_token: string };

  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userRes.ok) {
    return c.redirect("/login?error=user_info_failed");
  }

  const googleUser = (await userRes.json()) as {
    id: string;
    email: string;
    name: string;
    picture: string;
  };

  const user = upsertUser({
    googleId: googleUser.id,
    email: googleUser.email,
    name: googleUser.name,
    avatarUrl: googleUser.picture,
  });

  const sessionId = createSession(user.id);

  setCookie(c, "session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  if (user.role === "pending") return c.redirect("/pending");
  return c.redirect("/leaderboard");
});
*/
auth.post("/logout", (c) => {
    const sessionId = (0, cookie_1.getCookie)(c, "session");
    if (sessionId)
        (0, session_js_1.deleteSession)(sessionId);
    (0, cookie_1.deleteCookie)(c, "session", { path: "/" });
    return c.redirect("/login");
});

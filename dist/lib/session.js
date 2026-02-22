import { db } from "../db/connection.js";
export function createSession(userId) {
    const id = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)").run(id, userId, expiresAt);
    return id;
}
export function getSessionUser(sessionId) {
    const row = db
        .prepare(`SELECT u.* FROM users u
       JOIN sessions s ON s.user_id = u.id
       WHERE s.id = ? AND s.expires_at > datetime('now')`)
        .get(sessionId);
    return row;
}
export function deleteSession(sessionId) {
    db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
}
export function cleanExpiredSessions() {
    db.prepare("DELETE FROM sessions WHERE expires_at < datetime('now')").run();
}
export function upsertUser(params) {
    // Check if any users exist - first user becomes admin
    const count = db.prepare("SELECT COUNT(*) as c FROM users").get();
    const isFirstUser = count.c === 0;
    const existing = db
        .prepare("SELECT * FROM users WHERE google_id = ?")
        .get(params.googleId);
    if (existing) {
        db.prepare("UPDATE users SET name = ?, avatar_url = ?, updated_at = datetime('now') WHERE id = ?").run(params.name, params.avatarUrl, existing.id);
        return { ...existing, name: params.name, avatar_url: params.avatarUrl };
    }
    const role = isFirstUser ? "admin" : "pending";
    const result = db
        .prepare("INSERT INTO users (google_id, email, name, avatar_url, role) VALUES (?, ?, ?, ?, ?)")
        .run(params.googleId, params.email, params.name, params.avatarUrl, role);
    return db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
}

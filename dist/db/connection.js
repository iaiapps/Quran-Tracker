import initSqlJs, {} from "sql.js";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataDir = join(__dirname, "../../data");
const dbPath = join(dataDir, "ngaji.db");
if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
}
class Statement {
    stmt;
    dbWrapper;
    constructor(dbWrapper, sql) {
        this.dbWrapper = dbWrapper;
        this.stmt = dbWrapper.getDb().prepare(sql);
    }
    get(...params) {
        this.stmt.bind(params);
        if (this.stmt.step()) {
            const row = this.stmt.getAsObject();
            this.stmt.free();
            return row;
        }
        this.stmt.free();
        return undefined;
    }
    all(...params) {
        const results = [];
        this.stmt.bind(params);
        while (this.stmt.step()) {
            results.push(this.stmt.getAsObject());
        }
        this.stmt.free();
        return results;
    }
    run(...params) {
        const sql = this.stmt.getSQL();
        if (params.length > 0) {
            this.dbWrapper.getDb().run(sql, params);
        }
        else {
            this.dbWrapper.getDb().run(sql);
        }
        const result = {
            changes: this.dbWrapper.getDb().getRowsModified(),
            lastInsertRowid: this.dbWrapper.getDb().exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0] || 0
        };
        this.dbWrapper.markDirty();
        return result;
    }
}
class Database {
    db = null;
    dbPath;
    dirty = false;
    constructor(dbPath) {
        this.dbPath = dbPath;
    }
    async init() {
        const SQL = await initSqlJs();
        if (existsSync(this.dbPath)) {
            const buffer = readFileSync(this.dbPath);
            this.db = new SQL.Database(buffer);
        }
        else {
            this.db = new SQL.Database();
        }
        return this;
    }
    getDb() {
        if (!this.db)
            throw new Error("Database not initialized");
        return this.db;
    }
    prepare(sql) {
        if (!this.db)
            throw new Error("Database not initialized");
        return new Statement(this, sql);
    }
    exec(sql) {
        if (!this.db)
            throw new Error("Database not initialized");
        this.db.exec(sql);
        this.dirty = true;
        this.save();
    }
    markDirty() {
        this.dirty = true;
    }
    save() {
        if (!this.db)
            throw new Error("Database not initialized");
        if (this.dirty) {
            const data = this.db.export();
            const buffer = Buffer.from(data);
            writeFileSync(this.dbPath, buffer);
            this.dirty = false;
        }
    }
    getRowsModified() {
        return this.db?.getRowsModified() || 0;
    }
    close() {
        if (this.db) {
            this.save();
            this.db.close();
            this.db = null;
        }
    }
}
export const db = new Database(dbPath);
export async function initDb() {
    await db.init();
}

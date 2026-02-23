"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.initDb = initDb;
const sql_js_1 = __importDefault(require("sql.js"));
const fs_1 = require("fs");
const path_1 = require("path");
const dataDir = (0, path_1.join)(process.cwd(), "data");
const dbPath = (0, path_1.join)(dataDir, "ngaji.db");
if (!(0, fs_1.existsSync)(dataDir)) {
    (0, fs_1.mkdirSync)(dataDir, { recursive: true });
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
        this.dbWrapper.save(true); // Force save
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
        const SQL = await (0, sql_js_1.default)();
        if ((0, fs_1.existsSync)(this.dbPath)) {
            const buffer = (0, fs_1.readFileSync)(this.dbPath);
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
    save(force = false) {
        if (!this.db)
            throw new Error("Database not initialized");
        if (force || this.dirty) {
            const data = this.db.export();
            const buffer = Buffer.from(data);
            (0, fs_1.writeFileSync)(this.dbPath, buffer);
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
exports.db = new Database(dbPath);
async function initDb() {
    await exports.db.init();
}

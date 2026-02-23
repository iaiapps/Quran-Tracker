"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GOOGLE_REDIRECT_URI = exports.APP_NAME = void 0;
exports.APP_NAME = process.env.APP_NAME || "Tilawah Tracker";
exports.GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI ||
    `${process.env.APP_URL || "http://localhost:3000"}/auth/google/callback`;

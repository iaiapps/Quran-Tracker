"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobileBottomBar = void 0;
const jsx_runtime_1 = require("hono/jsx/jsx-runtime");
const MobileBottomBar = ({ userRank }) => {
    if (!userRank)
        return null;
    return ((0, jsx_runtime_1.jsx)("div", { class: "fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-border-light p-4 md:hidden shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-40", children: (0, jsx_runtime_1.jsxs)("div", { class: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { class: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("span", { class: "bg-primary text-white w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold shadow-sm", children: userRank.rank }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { class: "text-text-main text-sm font-bold", children: "You" }), (0, jsx_runtime_1.jsxs)("p", { class: "text-text-secondary text-xs", children: ["Juz ", userRank.current_juz || 1, " \u2022 ", userRank.progress_percent, "%"] })] })] }), (0, jsx_runtime_1.jsx)("a", { href: "/dashboard", class: "text-primary-dark text-sm font-bold hover:text-primary transition-colors", children: "View Details" })] }) }));
};
exports.MobileBottomBar = MobileBottomBar;

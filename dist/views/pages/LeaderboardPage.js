"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderboardPage = void 0;
const jsx_runtime_1 = require("hono/jsx/jsx-runtime");
const Layout_js_1 = require("../Layout.js");
const Header_js_1 = require("../components/Header.js");
const TopThreeCards_js_1 = require("../components/TopThreeCards.js");
const SearchFilter_js_1 = require("../components/SearchFilter.js");
const LeaderboardTable_js_1 = require("../components/LeaderboardTable.js");
const MobileBottomBar_js_1 = require("../components/MobileBottomBar.js");
const config_js_1 = require("../../config.js");
const LeaderboardPage = ({ user, topThree, members, currentUserRank, page, totalMembers, perPage, search, sort }) => {
    return ((0, jsx_runtime_1.jsxs)(Layout_js_1.Layout, { title: `Leaderboard - ${config_js_1.APP_NAME}`, children: [(0, jsx_runtime_1.jsx)(Header_js_1.Header, { user: user, currentPath: "/leaderboard" }), (0, jsx_runtime_1.jsxs)("main", { class: "flex-1 flex flex-col items-center w-full px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto", children: [(0, jsx_runtime_1.jsx)("div", { class: "w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8", children: (0, jsx_runtime_1.jsxs)("div", { class: "flex flex-col gap-2", children: [(0, jsx_runtime_1.jsx)("h1", { class: "text-text-main text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]", children: "Leaderboard Tilawah" }), (0, jsx_runtime_1.jsx)("p", { class: "text-text-secondary text-base font-normal leading-normal pb-4", children: "Semangatnya membaca Al-Quran selama Ramadan. Siapa yang paling banyak membaca?" })] }) }), (0, jsx_runtime_1.jsx)(TopThreeCards_js_1.TopThreeCards, { topThree: topThree }), (0, jsx_runtime_1.jsx)(SearchFilter_js_1.SearchFilter, { search: search, sort: sort }), (0, jsx_runtime_1.jsx)(LeaderboardTable_js_1.LeaderboardTable, { members: members, currentUserId: user.id, page: page, totalMembers: totalMembers, perPage: perPage, search: search, sort: sort }), (0, jsx_runtime_1.jsx)(MobileBottomBar_js_1.MobileBottomBar, { userRank: currentUserRank })] })] }));
};
exports.LeaderboardPage = LeaderboardPage;

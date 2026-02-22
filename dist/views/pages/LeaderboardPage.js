import { jsx as _jsx, jsxs as _jsxs } from "hono/jsx/jsx-runtime";
import { Layout } from "../Layout.js";
import { Header } from "../components/Header.js";
import { TopThreeCards } from "../components/TopThreeCards.js";
import { SearchFilter } from "../components/SearchFilter.js";
import { LeaderboardTable } from "../components/LeaderboardTable.js";
import { MobileBottomBar } from "../components/MobileBottomBar.js";
import { APP_NAME } from "../../config.js";
export const LeaderboardPage = ({ user, topThree, members, currentUserRank, page, totalMembers, perPage, search, sort }) => {
    return (_jsxs(Layout, { title: `Leaderboard - ${APP_NAME}`, children: [_jsx(Header, { user: user, currentPath: "/leaderboard" }), _jsxs("main", { class: "flex-1 flex flex-col items-center w-full px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto", children: [_jsx("div", { class: "w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8", children: _jsxs("div", { class: "flex flex-col gap-2", children: [_jsx("h1", { class: "text-text-main text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]", children: "Leaderboard Tilawah" }), _jsx("p", { class: "text-text-secondary text-base font-normal leading-normal pb-4", children: "Semangatnya membaca Al-Quran selama Ramadan. Siapa yang paling banyak membaca?" })] }) }), _jsx(TopThreeCards, { topThree: topThree }), _jsx(SearchFilter, { search: search, sort: sort }), _jsx(LeaderboardTable, { members: members, currentUserId: user.id, page: page, totalMembers: totalMembers, perPage: perPage, search: search, sort: sort }), _jsx(MobileBottomBar, { userRank: currentUserRank })] })] }));
};

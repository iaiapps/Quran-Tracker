import { jsx as _jsx, jsxs as _jsxs } from "hono/jsx/jsx-runtime";
import { getJuzForPosition } from "../../data/quran-meta.js";
export const MobileBottomBar = ({ userRank }) => {
    if (!userRank)
        return null;
    const currentJuz = getJuzForPosition(userRank.current_surah_number, userRank.current_ayah);
    return (_jsx("div", { class: "fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-border-light p-4 md:hidden shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-40", children: _jsxs("div", { class: "flex items-center justify-between", children: [_jsxs("div", { class: "flex items-center gap-3", children: [_jsx("span", { class: "bg-primary text-white w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold shadow-sm", children: userRank.rank }), _jsxs("div", { children: [_jsx("p", { class: "text-text-main text-sm font-bold", children: "You" }), _jsxs("p", { class: "text-text-secondary text-xs", children: ["Juz ", currentJuz, " \u2022 ", userRank.progress_percent, "%"] })] })] }), _jsx("a", { href: "/dashboard", class: "text-primary-dark text-sm font-bold hover:text-primary transition-colors", children: "View Details" })] }) }));
};

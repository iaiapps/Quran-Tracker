"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Header = void 0;
const jsx_runtime_1 = require("hono/jsx/jsx-runtime");
const config_js_1 = require("../../config.js");
const Logo = () => ((0, jsx_runtime_1.jsx)("svg", { class: "w-full h-full", fill: "none", viewBox: "0 0 48 48", xmlns: "http://www.w3.org/2000/svg", children: (0, jsx_runtime_1.jsx)("path", { d: "M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z", fill: "currentColor" }) }));
const Header = ({ user, currentPath, }) => {
    const navItems = [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/leaderboard", label: "Leaderboard" },
        { href: "/progress", label: "Submit Progress" },
    ];
    const menuScript = `
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileIcon = document.getElementById('mobile-menu-icon');
    const body = document.body;

    // Mobile menu toggle
    if (mobileBtn && mobileMenu && mobileIcon) {
      mobileBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        if (mobileMenu.classList.contains('hidden')) {
           mobileIcon.textContent = 'menu';
           body.style.overflow = '';
        } else {
           mobileIcon.textContent = 'close';
           body.style.overflow = 'hidden';
        }
      });
    }

    // Desktop profile dropdown toggle
    const desktopProfileBtn = document.getElementById('desktop-profile-btn');
    const desktopProfileDropdown = document.getElementById('desktop-profile-dropdown');
    
    if (desktopProfileBtn && desktopProfileDropdown) {
        desktopProfileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            desktopProfileDropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!desktopProfileBtn.contains(e.target) && !desktopProfileDropdown.contains(e.target)) {
                desktopProfileDropdown.classList.add('hidden');
            }
        });
    }
  `;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("header", { class: "sticky top-0 z-50 flex flex-col border-b border-solid border-border-light bg-white/80 backdrop-blur-md", children: [(0, jsx_runtime_1.jsxs)("div", { class: "flex items-center justify-between px-4 sm:px-10 w-full h-16", children: [(0, jsx_runtime_1.jsxs)("div", { class: "flex items-center gap-4", children: [(0, jsx_runtime_1.jsx)("div", { class: "size-8 text-primary", children: (0, jsx_runtime_1.jsx)(Logo, {}) }), (0, jsx_runtime_1.jsx)("h2", { class: "text-text-main text-xl font-bold leading-tight tracking-[-0.015em]", children: config_js_1.APP_NAME })] }), (0, jsx_runtime_1.jsxs)("div", { class: "hidden md:flex flex-1 justify-end gap-8 items-center", children: [(0, jsx_runtime_1.jsxs)("nav", { class: "flex items-center gap-9", children: [navItems.map((item) => ((0, jsx_runtime_1.jsx)("a", { class: currentPath === item.href
                                                    ? "text-primary text-sm font-semibold leading-normal border-b-2 border-primary pb-0.5"
                                                    : "text-text-secondary hover:text-primary transition-colors text-sm font-medium leading-normal", href: item.href, children: item.label }))), user?.role === "admin" && ((0, jsx_runtime_1.jsx)("a", { class: currentPath === "/admin"
                                                    ? "text-primary text-sm font-semibold leading-normal border-b-2 border-primary pb-0.5"
                                                    : "text-text-secondary hover:text-primary transition-colors text-sm font-medium leading-normal", href: "/admin", children: "Admin" }))] }), user && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { class: "h-8 w-px bg-border-light" }), (0, jsx_runtime_1.jsxs)("div", { class: "relative", children: [(0, jsx_runtime_1.jsxs)("button", { id: "desktop-profile-btn", class: "flex items-center gap-3 hover:bg-slate-50 p-1 pr-2 rounded-full transition-colors border border-transparent hover:border-slate-100 group", children: [(0, jsx_runtime_1.jsx)("div", { class: "hidden lg:block text-right", children: (0, jsx_runtime_1.jsx)("p", { class: "text-text-main text-sm font-semibold group-hover:text-primary transition-colors", children: user.name }) }), user.avatar_url ? ((0, jsx_runtime_1.jsx)("div", { class: "bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 ring-2 ring-border-light group-hover:ring-primary/50 transition-all", style: `background-image: url("${user.avatar_url}");` })) : ((0, jsx_runtime_1.jsx)("div", { class: "size-9 rounded-full bg-slate-100 flex items-center justify-center text-text-secondary text-xs font-bold border border-slate-200 group-hover:border-primary/50 transition-all", children: user.name
                                                                    .split(" ")
                                                                    .map((n) => n[0])
                                                                    .join("")
                                                                    .toUpperCase()
                                                                    .slice(0, 2) })), (0, jsx_runtime_1.jsx)("span", { class: "material-symbols-outlined text-text-secondary text-xl group-hover:text-primary transition-colors", children: "arrow_drop_down" })] }), (0, jsx_runtime_1.jsxs)("div", { id: "desktop-profile-dropdown", class: "hidden absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-border-light z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right overflow-hidden flex flex-col", children: [(0, jsx_runtime_1.jsxs)("div", { class: "px-4 py-3 border-b border-border-light lg:hidden", children: [(0, jsx_runtime_1.jsx)("p", { class: "text-sm font-semibold text-text-main truncate", children: user.name }), (0, jsx_runtime_1.jsx)("p", { class: "text-xs text-text-secondary", children: "Signed in" })] }), (0, jsx_runtime_1.jsx)("form", { method: "post", action: "/auth/logout", class: "my-0 py-0", children: (0, jsx_runtime_1.jsxs)("button", { type: "submit", class: "w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors", children: [(0, jsx_runtime_1.jsx)("span", { class: "material-symbols-outlined text-lg", children: "logout" }), "Logout"] }) })] })] })] }))] }), user && ((0, jsx_runtime_1.jsxs)("div", { class: "flex md:hidden items-center gap-3", children: [user.avatar_url ? ((0, jsx_runtime_1.jsx)("div", { class: "bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 ring-2 ring-border-light", style: `background-image: url("${user.avatar_url}");` })) : ((0, jsx_runtime_1.jsx)("div", { class: "size-8 rounded-full bg-slate-100 flex items-center justify-center text-text-secondary text-xs font-bold border border-slate-200", children: user.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()
                                            .slice(0, 2) })), (0, jsx_runtime_1.jsx)("button", { id: "mobile-menu-btn", class: "text-text-main hover:text-primary transition-colors ml-1 p-1", children: (0, jsx_runtime_1.jsx)("span", { id: "mobile-menu-icon", class: "material-symbols-outlined text-3xl", children: "menu" }) })] }))] }), user && ((0, jsx_runtime_1.jsxs)("div", { id: "mobile-menu", class: "hidden md:hidden absolute top-16 left-0 right-0 h-[calc(100vh-64px)] bg-white z-50 flex flex-col shadow-xl overflow-y-auto", children: [(0, jsx_runtime_1.jsxs)("nav", { class: "flex flex-col gap-2 p-4", children: [navItems.map((item) => ((0, jsx_runtime_1.jsx)("a", { class: currentPath === item.href
                                            ? "text-primary text-base font-semibold bg-primary-light/50 px-4 py-3 rounded-xl border border-primary/10"
                                            : "text-text-secondary hover:text-primary hover:bg-slate-50 transition-colors text-base font-medium px-4 py-3 rounded-xl border border-transparent", href: item.href, children: item.label }))), user?.role === "admin" && ((0, jsx_runtime_1.jsx)("a", { class: currentPath === "/admin"
                                            ? "text-primary text-base font-semibold bg-primary-light/50 px-4 py-3 rounded-xl border border-primary/10"
                                            : "text-text-secondary hover:text-primary hover:bg-slate-50 transition-colors text-base font-medium px-4 py-3 rounded-xl border border-transparent", href: "/admin", children: "Admin" }))] }), (0, jsx_runtime_1.jsx)("div", { class: "mt-auto border-t border-border-light bg-slate-50/50 p-6 pb-20", children: (0, jsx_runtime_1.jsxs)("div", { class: "flex flex-col gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { class: "flex items-center gap-3", children: [user.avatar_url ? ((0, jsx_runtime_1.jsx)("div", { class: "bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 ring-2 ring-border-light", style: `background-image: url("${user.avatar_url}");` })) : ((0, jsx_runtime_1.jsx)("div", { class: "size-12 rounded-full bg-white flex items-center justify-center text-text-secondary text-base font-bold border border-slate-200 shadow-sm", children: user.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .toUpperCase()
                                                        .slice(0, 2) })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { class: "text-text-main font-bold text-base", children: user.name }), (0, jsx_runtime_1.jsx)("p", { class: "text-text-secondary text-xs", children: "Signed in" })] })] }), (0, jsx_runtime_1.jsx)("form", { method: "post", action: "/auth/logout", class: "w-full", children: (0, jsx_runtime_1.jsxs)("button", { type: "submit", class: "w-full flex items-center justify-center gap-2 text-red-600 bg-white hover:bg-red-50 transition-colors text-sm font-bold px-4 py-2 rounded-lg border border-border-light hover:border-red-100 shadow-sm", children: [(0, jsx_runtime_1.jsx)("span", { children: "Logout" }), (0, jsx_runtime_1.jsx)("span", { class: "material-symbols-outlined text-xl", children: "logout" })] }) })] }) })] }))] }), (0, jsx_runtime_1.jsx)("script", { dangerouslySetInnerHTML: { __html: menuScript } })] }));
};
exports.Header = Header;

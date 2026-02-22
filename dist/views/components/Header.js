import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "hono/jsx/jsx-runtime";
import { APP_NAME } from "../../config.js";
const Logo = () => (_jsx("svg", { class: "w-full h-full", fill: "none", viewBox: "0 0 48 48", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { d: "M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z", fill: "currentColor" }) }));
export const Header = ({ user, currentPath, }) => {
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
    return (_jsxs(_Fragment, { children: [_jsxs("header", { class: "sticky top-0 z-50 flex flex-col border-b border-solid border-border-light bg-white/80 backdrop-blur-md", children: [_jsxs("div", { class: "flex items-center justify-between px-4 sm:px-10 w-full h-16", children: [_jsxs("div", { class: "flex items-center gap-4", children: [_jsx("div", { class: "size-8 text-primary", children: _jsx(Logo, {}) }), _jsx("h2", { class: "text-text-main text-xl font-bold leading-tight tracking-[-0.015em]", children: APP_NAME })] }), _jsxs("div", { class: "hidden md:flex flex-1 justify-end gap-8 items-center", children: [_jsxs("nav", { class: "flex items-center gap-9", children: [navItems.map((item) => (_jsx("a", { class: currentPath === item.href
                                                    ? "text-primary text-sm font-semibold leading-normal border-b-2 border-primary pb-0.5"
                                                    : "text-text-secondary hover:text-primary transition-colors text-sm font-medium leading-normal", href: item.href, children: item.label }))), user?.role === "admin" && (_jsx("a", { class: currentPath === "/admin"
                                                    ? "text-primary text-sm font-semibold leading-normal border-b-2 border-primary pb-0.5"
                                                    : "text-text-secondary hover:text-primary transition-colors text-sm font-medium leading-normal", href: "/admin", children: "Admin" }))] }), user && (_jsxs(_Fragment, { children: [_jsx("div", { class: "h-8 w-px bg-border-light" }), _jsxs("div", { class: "relative", children: [_jsxs("button", { id: "desktop-profile-btn", class: "flex items-center gap-3 hover:bg-slate-50 p-1 pr-2 rounded-full transition-colors border border-transparent hover:border-slate-100 group", children: [_jsx("div", { class: "hidden lg:block text-right", children: _jsx("p", { class: "text-text-main text-sm font-semibold group-hover:text-primary transition-colors", children: user.name }) }), user.avatar_url ? (_jsx("div", { class: "bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 ring-2 ring-border-light group-hover:ring-primary/50 transition-all", style: `background-image: url("${user.avatar_url}");` })) : (_jsx("div", { class: "size-9 rounded-full bg-slate-100 flex items-center justify-center text-text-secondary text-xs font-bold border border-slate-200 group-hover:border-primary/50 transition-all", children: user.name
                                                                    .split(" ")
                                                                    .map((n) => n[0])
                                                                    .join("")
                                                                    .toUpperCase()
                                                                    .slice(0, 2) })), _jsx("span", { class: "material-symbols-outlined text-text-secondary text-xl group-hover:text-primary transition-colors", children: "arrow_drop_down" })] }), _jsxs("div", { id: "desktop-profile-dropdown", class: "hidden absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-border-light z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right overflow-hidden flex flex-col", children: [_jsxs("div", { class: "px-4 py-3 border-b border-border-light lg:hidden", children: [_jsx("p", { class: "text-sm font-semibold text-text-main truncate", children: user.name }), _jsx("p", { class: "text-xs text-text-secondary", children: "Signed in" })] }), _jsx("form", { method: "post", action: "/auth/logout", class: "my-0 py-0", children: _jsxs("button", { type: "submit", class: "w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors", children: [_jsx("span", { class: "material-symbols-outlined text-lg", children: "logout" }), "Logout"] }) })] })] })] }))] }), user && (_jsxs("div", { class: "flex md:hidden items-center gap-3", children: [user.avatar_url ? (_jsx("div", { class: "bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 ring-2 ring-border-light", style: `background-image: url("${user.avatar_url}");` })) : (_jsx("div", { class: "size-8 rounded-full bg-slate-100 flex items-center justify-center text-text-secondary text-xs font-bold border border-slate-200", children: user.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()
                                            .slice(0, 2) })), _jsx("button", { id: "mobile-menu-btn", class: "text-text-main hover:text-primary transition-colors ml-1 p-1", children: _jsx("span", { id: "mobile-menu-icon", class: "material-symbols-outlined text-3xl", children: "menu" }) })] }))] }), user && (_jsxs("div", { id: "mobile-menu", class: "hidden md:hidden absolute top-16 left-0 right-0 h-[calc(100vh-64px)] bg-white z-50 flex flex-col shadow-xl overflow-y-auto", children: [_jsxs("nav", { class: "flex flex-col gap-2 p-4", children: [navItems.map((item) => (_jsx("a", { class: currentPath === item.href
                                            ? "text-primary text-base font-semibold bg-primary-light/50 px-4 py-3 rounded-xl border border-primary/10"
                                            : "text-text-secondary hover:text-primary hover:bg-slate-50 transition-colors text-base font-medium px-4 py-3 rounded-xl border border-transparent", href: item.href, children: item.label }))), user?.role === "admin" && (_jsx("a", { class: currentPath === "/admin"
                                            ? "text-primary text-base font-semibold bg-primary-light/50 px-4 py-3 rounded-xl border border-primary/10"
                                            : "text-text-secondary hover:text-primary hover:bg-slate-50 transition-colors text-base font-medium px-4 py-3 rounded-xl border border-transparent", href: "/admin", children: "Admin" }))] }), _jsx("div", { class: "mt-auto border-t border-border-light bg-slate-50/50 p-6 pb-20", children: _jsxs("div", { class: "flex flex-col gap-4", children: [_jsxs("div", { class: "flex items-center gap-3", children: [user.avatar_url ? (_jsx("div", { class: "bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 ring-2 ring-border-light", style: `background-image: url("${user.avatar_url}");` })) : (_jsx("div", { class: "size-12 rounded-full bg-white flex items-center justify-center text-text-secondary text-base font-bold border border-slate-200 shadow-sm", children: user.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .toUpperCase()
                                                        .slice(0, 2) })), _jsxs("div", { children: [_jsx("p", { class: "text-text-main font-bold text-base", children: user.name }), _jsx("p", { class: "text-text-secondary text-xs", children: "Signed in" })] })] }), _jsx("form", { method: "post", action: "/auth/logout", class: "w-full", children: _jsxs("button", { type: "submit", class: "w-full flex items-center justify-center gap-2 text-red-600 bg-white hover:bg-red-50 transition-colors text-sm font-bold px-4 py-2 rounded-lg border border-border-light hover:border-red-100 shadow-sm", children: [_jsx("span", { children: "Logout" }), _jsx("span", { class: "material-symbols-outlined text-xl", children: "logout" })] }) })] }) })] }))] }), _jsx("script", { dangerouslySetInnerHTML: { __html: menuScript } })] }));
};

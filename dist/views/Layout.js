"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Layout = void 0;
const jsx_runtime_1 = require("hono/jsx/jsx-runtime");
const config_js_1 = require("../config.js");
const Layout = ({ title, children }) => {
    return ((0, jsx_runtime_1.jsxs)("html", { lang: "en", children: [(0, jsx_runtime_1.jsxs)("head", { children: [(0, jsx_runtime_1.jsx)("meta", { charset: "utf-8" }), (0, jsx_runtime_1.jsx)("meta", { content: "width=device-width, initial-scale=1.0", name: "viewport" }), (0, jsx_runtime_1.jsx)("title", { children: title || config_js_1.APP_NAME }), (0, jsx_runtime_1.jsx)("link", { href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap", rel: "stylesheet" }), (0, jsx_runtime_1.jsx)("link", { href: "https://fonts.googleapis.com", rel: "preconnect" }), (0, jsx_runtime_1.jsx)("link", { crossorigin: "", href: "https://fonts.gstatic.com", rel: "preconnect" }), (0, jsx_runtime_1.jsx)("link", { href: "https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800&display=swap", rel: "stylesheet" }), (0, jsx_runtime_1.jsx)("script", { src: "https://cdn.tailwindcss.com?plugins=forms,container-queries" }), (0, jsx_runtime_1.jsx)("script", { dangerouslySetInnerHTML: {
                            __html: `
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  "primary": "#10b981",
                  "primary-dark": "#065f46",
                  "primary-light": "#ecfdf5",
                  "background": "#f8faf9",
                  "surface": "#ffffff",
                  "border-light": "#e2e8f0",
                  "text-main": "#1e293b",
                  "text-secondary": "#64748b",
                },
                fontFamily: {
                  "display": ["Lexend", "sans-serif"]
                },
                borderRadius: {
                  "DEFAULT": "0.25rem",
                  "lg": "0.5rem",
                  "xl": "0.75rem",
                  "2xl": "1rem",
                  "full": "9999px"
                },
              },
            },
          }
        `,
                        } })] }), (0, jsx_runtime_1.jsx)("body", { class: "min-h-screen flex flex-col bg-background text-text-main font-display", children: children })] }));
};
exports.Layout = Layout;

import { jsx as _jsx, jsxs as _jsxs } from "hono/jsx/jsx-runtime";
import { APP_NAME } from "../config.js";
export const Layout = ({ title, children }) => {
    return (_jsxs("html", { lang: "en", children: [_jsxs("head", { children: [_jsx("meta", { charset: "utf-8" }), _jsx("meta", { content: "width=device-width, initial-scale=1.0", name: "viewport" }), _jsx("title", { children: title || APP_NAME }), _jsx("link", { href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap", rel: "stylesheet" }), _jsx("link", { href: "https://fonts.googleapis.com", rel: "preconnect" }), _jsx("link", { crossorigin: "", href: "https://fonts.gstatic.com", rel: "preconnect" }), _jsx("link", { href: "https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800&display=swap", rel: "stylesheet" }), _jsx("script", { src: "https://cdn.tailwindcss.com?plugins=forms,container-queries" }), _jsx("script", { dangerouslySetInnerHTML: {
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
                        } })] }), _jsx("body", { class: "min-h-screen flex flex-col bg-background text-text-main font-display", children: children })] }));
};

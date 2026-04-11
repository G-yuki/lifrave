// src/components/BottomNav.tsx
import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  {
    path: "/home",
    label: "List",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="10" width="8" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <rect x="12" y="4" width="8" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
  },
  {
    path: "/suggest",
    label: "Ask AI",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M10 2L11.4 8.6L18 10L11.4 11.4L10 18L8.6 11.4L2 10L8.6 8.6Z" fill="currentColor" />
        <path d="M17.5 1L18.3 3.7L21 4.5L18.3 5.3L17.5 8L16.7 5.3L14 4.5L16.7 3.7Z" fill="currentColor" />
        <path d="M4.5 15L5 16.5L6.5 17L5 17.5L4.5 19L4 17.5L2.5 17L4 16.5Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    path: "/memory",
    label: "Memory",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 15V8a7 7 0 0114 0v7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <rect x="2" y="14" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.3" />
        <rect x="16" y="14" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
  },
  {
    path: "/setting",
    label: "Setting",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M4 19c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
];

export const BottomNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (path: string) =>
    path === "/home"
      ? pathname === "/home"
      : pathname === path || pathname.startsWith(path + "/");

  return (
    <nav style={{ flexShrink: 0, background: "var(--color-bg)",
                  borderTop: "1px solid rgba(0,0,0,0.08)" }}>
      <div style={{ display: "flex", padding: "10px 0 18px" }}>
        {NAV_ITEMS.map(({ path, label, icon }) => {
          const active = isActive(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: active ? "var(--color-primary)" : "var(--color-text-soft)",
                transition: "color 0.15s",
              }}
            >
              {icon}
              <span
                style={{
                  fontSize: 9,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: active ? 700 : 500,
                  fontFamily: "var(--font-sans)",
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

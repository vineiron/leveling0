"use client";

import { type ReactNode, useEffect, useState } from "react";
import { type Theme, useTheme } from "@/lib/theme/ThemeProvider";

const iconClass = "h-4 w-4";

const SunIcon = (
  <svg className={iconClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M10 3a.75.75 0 01.75.75v1a.75.75 0 01-1.5 0v-1A.75.75 0 0110 3zm0 11a4 4 0 100-8 4 4 0 000 8zm6.36-9.36a.75.75 0 010 1.06l-.7.7a.75.75 0 11-1.07-1.06l.71-.7a.75.75 0 011.06 0zM17 9.25a.75.75 0 010 1.5h-1a.75.75 0 010-1.5h1zM4.34 4.34a.75.75 0 011.06 0l.7.7a.75.75 0 11-1.06 1.07l-.7-.71a.75.75 0 010-1.06zM4 9.25a.75.75 0 010 1.5H3a.75.75 0 010-1.5h1zm1.4 5.3a.75.75 0 011.06 1.06l-.7.7a.75.75 0 11-1.07-1.06l.71-.7zm9.2 0l.7.7a.75.75 0 11-1.06 1.07l-.7-.71a.75.75 0 011.06-1.06zM10 15.25a.75.75 0 01.75.75v1a.75.75 0 01-1.5 0v-1a.75.75 0 01.75-.75z" />
  </svg>
);

const MonitorIcon = (
  <svg className={iconClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M3 4.75A1.75 1.75 0 014.75 3h10.5A1.75 1.75 0 0117 4.75v7.5A1.75 1.75 0 0115.25 14h-3.5v1.5h2a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h2V14h-3.5A1.75 1.75 0 013 12.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h10.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25H4.75z"
      clipRule="evenodd"
    />
  </svg>
);

const MoonIcon = (
  <svg className={iconClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M9.353 2.939a.75.75 0 01.157.808 6 6 0 007.743 7.743.75.75 0 01.965.965A7.5 7.5 0 119.353 2.94z" />
  </svg>
);

const OPTIONS: { value: Theme; label: string; icon: ReactNode }[] = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "system", label: "System", icon: MonitorIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // Gate the active highlight until mounted: SSR doesn't know the stored
  // preference, so reflecting it pre-hydration would mismatch. Colors are
  // already correct via the inline script; only this highlight settles.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <div
      role="group"
      aria-label="Theme"
      className="flex gap-0.5 rounded-md bg-zinc-100 p-0.5 dark:bg-zinc-800"
    >
      {OPTIONS.map((o) => {
        const active = mounted && theme === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => setTheme(o.value)}
            aria-pressed={active}
            aria-label={o.label}
            title={`${o.label} theme`}
            className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
              active
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            {o.icon}
          </button>
        );
      })}
    </div>
  );
}

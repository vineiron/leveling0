"use client";

import { type ReactNode, useEffect, useState } from "react";
import { type ResolvedTheme, useTheme } from "@/lib/theme/ThemeProvider";
import { segment } from "./ui";

const iconClass = "h-4 w-4";

const SunIcon = (
  <svg
    className={iconClass}
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M10 3a.75.75 0 01.75.75v1a.75.75 0 01-1.5 0v-1A.75.75 0 0110 3zm0 11a4 4 0 100-8 4 4 0 000 8zm6.36-9.36a.75.75 0 010 1.06l-.7.7a.75.75 0 11-1.07-1.06l.71-.7a.75.75 0 011.06 0zM17 9.25a.75.75 0 010 1.5h-1a.75.75 0 010-1.5h1zM4.34 4.34a.75.75 0 011.06 0l.7.7a.75.75 0 11-1.06 1.07l-.7-.71a.75.75 0 010-1.06zM4 9.25a.75.75 0 010 1.5H3a.75.75 0 010-1.5h1zm1.4 5.3a.75.75 0 011.06 1.06l-.7.7a.75.75 0 11-1.07-1.06l.71-.7zm9.2 0l.7.7a.75.75 0 11-1.06 1.07l-.7-.71a.75.75 0 011.06-1.06zM10 15.25a.75.75 0 01.75.75v1a.75.75 0 01-1.5 0v-1a.75.75 0 01.75-.75z" />
  </svg>
);

const MoonIcon = (
  <svg
    className={iconClass}
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M9.353 2.939a.75.75 0 01.157.808 6 6 0 007.743 7.743.75.75 0 01.965.965A7.5 7.5 0 119.353 2.94z" />
  </svg>
);

const OPTIONS: { value: ResolvedTheme; label: string; icon: ReactNode }[] = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
];

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // Gate the active highlight until mounted: SSR doesn't know the stored
  // preference, so reflecting it pre-hydration would mismatch. Colors are
  // already correct via the inline script; only this highlight settles.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    // biome-ignore lint/a11y/useSemanticElements: a labelled 3-button theme switch is a valid ARIA group; <fieldset> is for form field groups
    <div role="group" aria-label="Theme" className={segment.wrap}>
      {OPTIONS.map((o) => {
        const active = mounted && resolvedTheme === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => setTheme(o.value)}
            aria-pressed={active}
            aria-label={o.label}
            title={`${o.label} theme`}
            className={segment.iconItem(active)}
          >
            {o.icon}
          </button>
        );
      })}
    </div>
  );
}

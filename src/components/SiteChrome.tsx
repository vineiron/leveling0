import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { LandingAuthAction } from "@/components/LandingAuthAction";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SITE_REPO_URL } from "@/lib/site";

const FOOTER_LINKS = [
  { href: "/privacy", label: "privacy" },
  { href: "https://vineiron.vercel.app/", label: "vineiron" },
  { href: SITE_REPO_URL, label: "github" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/50 bg-elevated/55 shadow-[0_1px_0_rgb(255_255_255/0.28)_inset,0_8px_24px_rgb(20_16_12/0.04)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/5 dark:bg-elevated/45 dark:shadow-[0_1px_0_rgb(255_255_255/0.04)_inset,0_8px_26px_rgb(0_0_0/0.24)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-[linear-gradient(180deg,rgb(255_255_255/0.42),rgb(255_255_255/0.10)_58%,rgb(255_255_255/0))] dark:bg-[linear-gradient(180deg,rgb(255_255_255/0.08),rgb(255_255_255/0.03)_54%,rgb(255_255_255/0))]" />
      <div className="relative mx-auto flex h-14 w-full max-w-[1180px] items-center justify-between gap-4 px-4 sm:px-6">
        <BrandMark />
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <LandingAuthAction />
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 dark:border-white/5">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col items-center gap-3 px-4 py-6 text-center text-xs text-faint sm:flex-row sm:justify-between sm:px-6">
        <p>© 2026 vineiron. MIT licensed.</p>
        <nav aria-label="Footer links" className="flex items-center gap-4">
          {FOOTER_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="font-medium text-muted transition-colors hover:text-accent-text"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

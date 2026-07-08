import type { Metadata } from "next";
import Link from "next/link";
import { BoardPreview } from "@/components/BoardPreview";
import { BrandMark } from "@/components/BrandMark";
import { ThemeToggle } from "@/components/ThemeToggle";
import { btn } from "@/components/ui";

export const metadata: Metadata = {
  title: "leveling0 - less messy leveling",
};

function ArrowIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 0 1 .75-.75h10.69l-3.22-3.22a.75.75 0 1 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06l3.22-3.22H3.75A.75.75 0 0 1 3 10Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-canvas text-fg">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-elevated/55 shadow-[0_1px_0_rgb(255_255_255/0.28)_inset,0_8px_24px_rgb(20_16_12/0.04)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/5 dark:bg-elevated/45 dark:shadow-[0_1px_0_rgb(255_255_255/0.04)_inset,0_8px_26px_rgb(0_0_0/0.24)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-[linear-gradient(180deg,rgb(255_255_255/0.42),rgb(255_255_255/0.10)_58%,rgb(255_255_255/0))] dark:bg-[linear-gradient(180deg,rgb(255_255_255/0.08),rgb(255_255_255/0.03)_54%,rgb(255_255_255/0))]" />
        <div className="relative mx-auto flex h-14 w-full max-w-[1180px] items-center justify-between gap-4 px-4 sm:px-6">
          <BrandMark />
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-[980px] flex-1 content-start gap-9 px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-8 md:content-center">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <h1 className="text-5xl font-semibold tracking-normal text-fg sm:text-6xl lg:text-7xl">
            <span>Simply,</span>{" "}
            <span className="block sm:inline">a todo app</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
            Tags help sort the vineiron's mess. Sync is there because vineiron
            has one brain, but apparently many screens.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link href="/quests" className={btn.primary}>
              Conquer quests
              <ArrowIcon />
            </Link>
          </div>
        </div>

        <BoardPreview />
      </section>

      <footer className="border-t border-border/60 dark:border-white/5">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-3 px-4 py-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2026 vineiron. All rights reserved.</p>
          <nav aria-label="Footer links" className="flex items-center gap-4">
            <Link
              href="https://vineiron.vercel.app/"
              className="font-medium text-muted transition-colors hover:text-accent-text"
            >
              vineiron
            </Link>
            <Link
              href="https://github.com/vineiron/leveling0"
              className="font-medium text-muted transition-colors hover:text-accent-text"
            >
              github
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}

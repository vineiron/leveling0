import Link from "next/link";
import { BoardPreview } from "@/components/BoardPreview";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { btn } from "@/components/ui";

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
      <SiteHeader />

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

      <SiteFooter />
    </main>
  );
}

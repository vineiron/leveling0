import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { SITE_CONTACT_EMAIL, SITE_NAME, SITE_REPO_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "privacy",
  description: `What ${SITE_NAME} keeps, where it lives, and how to delete it.`,
};

const UPDATED = "1 November 2026";

const LINK =
  "font-medium text-accent-text underline underline-offset-4 hover:text-fg";

function Email() {
  return (
    <a href={`mailto:${SITE_CONTACT_EMAIL}`} className={LINK}>
      {SITE_CONTACT_EMAIL}
    </a>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-9">
      <h2 className="text-lg font-semibold text-fg">{title}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="flex min-h-screen flex-col bg-canvas text-fg">
      <SiteHeader />

      <article className="mx-auto w-full max-w-2xl flex-1 px-4 pb-20 pt-10 text-[15px] leading-7 text-muted sm:px-6 sm:pt-14">
        <h1 className="text-4xl font-semibold tracking-tight text-fg">
          Privacy
        </h1>
        <p className="mt-2 text-sm text-faint">Last updated {UPDATED}</p>

        <div className="mt-6 rounded-xl bg-surface px-5 py-4 text-fg">
          <p className="text-sm font-semibold">The short version</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>
              No account needed. Without one, your quests never leave this
              browser.
            </li>
            <li>
              Signing in with Google shares your email, name and picture, and
              stores your quests so they sync.
            </li>
            <li>
              Anonymous page views and error reports go to PostHog. No
              recordings, no ads, nothing sold.
            </li>
            <li>
              Want it all gone? Email <Email />.
            </li>
          </ul>
        </div>

        <Section title="Not signed in">
          <p>
            Quests, drafts and your theme live in this browser&apos;s storage.{" "}
            {SITE_NAME}&apos;s server never sees them. Clear this site&apos;s
            data and they&apos;re gone.
          </p>
        </Section>

        <Section title="Signed in">
          <p>
            Google gives {SITE_NAME} your{" "}
            <strong className="font-semibold text-fg">
              email, name and profile picture
            </strong>
            , so you can sign in and see who&apos;s signed in. Your quests go to
            a Postgres database run by Supabase in Singapore, and only your
            account can read or change them.
          </p>
        </Section>

        <Section title="Behind the scenes">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="font-semibold text-fg">Vercel</strong> hosts
              the app in Singapore and keeps short-lived request logs, including
              IP addresses, to run it and stop abuse.
            </li>
            <li>
              <strong className="font-semibold text-fg">PostHog</strong> (US)
              counts page views and collects error reports, using a random ID in
              browser storage. It isn&apos;t linked to your account.
            </li>
            <li>
              The only cookie is the sign-in session, and only while you&apos;re
              signed in.
            </li>
          </ul>
        </Section>

        <Section title="Deleting your stuff">
          <p>
            Delete quests any time in the app, and export them first if you want
            a copy. To delete your account and every quest in it, email{" "}
            <Email /> from the address you sign in with. It&apos;s done within
            30 days.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            If anything here changes, so does the date at the top. The code is
            public on{" "}
            <a href={SITE_REPO_URL} className={LINK}>
              GitHub
            </a>
            , if you&apos;d rather check than trust.
          </p>
        </Section>
      </article>

      <SiteFooter />
    </main>
  );
}

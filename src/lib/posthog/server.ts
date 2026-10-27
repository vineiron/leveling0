import { PostHog } from "posthog-node";

let client: PostHog | null | undefined;

export function getPostHogServer(): PostHog | null {
  if (client !== undefined) return client;
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  client =
    token && host
      ? new PostHog(token, { host, flushAt: 1, flushInterval: 0 })
      : null;
  return client;
}

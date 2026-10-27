import type { Instrumentation } from "next";

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context,
) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { getPostHogServer } = await import("@/lib/posthog/server");
  const posthog = getPostHogServer();
  if (!posthog) return;

  const digest =
    typeof err === "object" && err !== null && "digest" in err
      ? String(err.digest)
      : undefined;

  await posthog.captureExceptionImmediate(err, "leveling0-server", {
    $process_person_profile: false,
    path: request.path,
    method: request.method,
    routerKind: context.routerKind,
    routePath: context.routePath,
    routeType: context.routeType,
    digest,
  });
};

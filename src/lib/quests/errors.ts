type ZodIssue = {
  code?: string;
  origin?: string;
  path?: (string | number)[];
  message?: string;
  maximum?: number;
  minimum?: number;
};

const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  status: "Status",
  position: "Position",
  dueAt: "Due date",
  tags: "Tags",
  detail: "Detail",
  note: "Note",
};

export class ApiError extends Error {
  messages: string[];
  status: number;

  constructor(messages: string[], status: number) {
    super(messages[0] ?? `Request failed (${status}).`);
    this.name = "ApiError";
    this.messages = messages.length > 0 ? messages : [this.message];
    this.status = status;
  }
}

function labelFor(path: (string | number)[] | undefined): string {
  if (!path || path.length === 0) return "This field";
  const [field, idx] = path;
  if (field === "tags" && typeof idx === "number") return `Tag #${idx + 1}`;
  return FIELD_LABELS[String(field)] ?? String(field);
}

function describeIssue(issue: ZodIssue): string {
  const where = labelFor(issue.path);
  switch (issue.code) {
    case "too_big":
      if (issue.origin === "array") {
        return `Too many ${where.toLowerCase()} (max ${issue.maximum}).`;
      }
      if (issue.origin === "number") {
        return `${where} is too large (max ${issue.maximum}).`;
      }
      return `${where} is too long (max ${issue.maximum} characters).`;
    case "too_small":
      if (issue.origin === "array") {
        return `Add at least ${issue.minimum} ${where.toLowerCase()}.`;
      }
      return issue.minimum === 1
        ? `${where} is required.`
        : `${where} is too short (min ${issue.minimum} characters).`;
    case "invalid_type":
      return `${where} is missing or the wrong type.`;
    case "custom":
      return issue.message ?? `${where} is invalid.`;
    default:
      return issue.message
        ? `${where}: ${issue.message}`
        : `${where} is invalid.`;
  }
}

// Turns an API error body ({ error, issues } from the Zod-validated routes)
// into human-readable, per-field messages for display.
export function toFriendlyMessages(body: unknown, status: number): string[] {
  if (body && typeof body === "object") {
    const b = body as { issues?: unknown; error?: unknown };
    if (Array.isArray(b.issues) && b.issues.length > 0) {
      return (b.issues as ZodIssue[]).map(describeIssue);
    }
    if (typeof b.error === "string" && b.error.length > 0) {
      return [b.error];
    }
  }
  return [`Request failed (${status}).`];
}

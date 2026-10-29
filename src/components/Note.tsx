type Props = {
  tone: "warn" | "danger";
  title: string;
  children: React.ReactNode;
};

export function Note({ tone, title, children }: Props) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={`rounded-lg border px-3 py-2.5 text-sm ${
        tone === "danger"
          ? "border-danger-border bg-danger-subtle text-danger-text"
          : "border-warning-border bg-warning-subtle text-muted"
      }`}
    >
      <span className={`font-medium ${tone === "warn" ? "text-fg" : ""}`}>
        {title}
      </span>{" "}
      {children}
    </div>
  );
}

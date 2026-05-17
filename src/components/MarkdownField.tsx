"use client";

import { type ReactNode, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { field, segment } from "./ui";

const MD_COMPONENTS: Components = {
  h1: ({ children }) => (
    <h1 className="mb-2 mt-3 text-2xl font-bold text-fg">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-3 text-xl font-bold text-fg">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1.5 mt-2 text-lg font-semibold text-fg">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-1.5 mt-2 text-base font-semibold text-fg">{children}</h4>
  ),
  h5: ({ children }) => (
    <h5 className="mb-1 mt-2 text-sm font-semibold uppercase tracking-wide text-fg">{children}</h5>
  ),
  h6: ({ children }) => (
    <h6 className="mb-1 mt-2 text-xs font-semibold uppercase tracking-wide text-muted">{children}</h6>
  ),
  p: ({ children }) => <p className="my-2 leading-relaxed text-fg">{children}</p>,
  ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-6 text-fg">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-6 text-fg">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-medium text-accent-text underline underline-offset-2 hover:opacity-80"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-accent-border pl-3 italic text-muted">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-border" />,
  strong: ({ children }) => <strong className="font-bold text-fg">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => <del className="line-through">{children}</del>,
  code: ({ className, children }) => {
    const isBlock = className?.startsWith("language-");
    if (isBlock) return <code className={className}>{children}</code>;
    return (
      <code className="rounded-md border border-border bg-surface px-1 py-0.5 font-mono text-[0.85em] text-fg">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-3 font-mono text-xs text-fg">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-surface">{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-border px-2.5 py-1.5 text-left font-semibold text-fg">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-border px-2.5 py-1.5 text-fg">{children}</td>
  ),
  img: ({ src, alt }) => (
    // Plain <img>: user-supplied URLs aren't whitelisted in next.config.ts.
    <img
      src={typeof src === "string" ? src : undefined}
      alt={alt ?? ""}
      className="my-2 max-w-full rounded-lg border border-border"
    />
  ),
};

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  fillHeight?: boolean;
  required?: boolean;
  /** Show an expand affordance that calls back (host opens a focus view). */
  onExpand?: () => void;
  /** Hide the inline label (e.g. when a host header already names it). */
  hideLabel?: boolean;
  /** Custom node placed at the left of the toolbar row (e.g. a Back button). */
  headerLeft?: ReactNode;
};

type EditorProps = Props & {
  large?: boolean;
};

function Editor({
  label,
  value,
  onChange,
  rows = 4,
  large,
  onExpand,
  required,
  hideLabel,
  headerLeft,
}: EditorProps) {
  const [preview, setPreview] = useState(false);
  const showLeft = headerLeft != null || !hideLabel;

  return (
    <div className={`flex flex-col gap-1.5 ${large ? "min-h-0 flex-1" : ""}`}>
      <div
        className={`flex items-center gap-2 ${
          showLeft ? "justify-between" : "justify-end"
        }`}
      >
        {headerLeft != null ? (
          headerLeft
        ) : !hideLabel ? (
          <span className="text-sm font-medium text-muted">{label}</span>
        ) : null}
        <div className="flex items-center gap-1">
          <div role="tablist" aria-label={`${label} mode`} className={segment.wrap}>
            <button
              type="button"
              role="tab"
              aria-selected={!preview}
              onClick={() => setPreview(false)}
              className={segment.item(!preview)}
            >
              Edit
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={preview}
              onClick={() => setPreview(true)}
              className={segment.item(preview)}
            >
              Preview
            </button>
          </div>
          {onExpand && (
            <button
              type="button"
              onClick={onExpand}
              aria-label={`Expand ${label}`}
              title="Expand"
              className="flex h-6 w-6 items-center justify-center rounded-md text-faint transition-colors hover:bg-surface hover:text-fg"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M3 3.75A.75.75 0 013.75 3h4a.75.75 0 010 1.5H5.56l3.22 3.22a.75.75 0 11-1.06 1.06L4.5 5.56V7.75a.75.75 0 01-1.5 0v-4zm14 12.5a.75.75 0 01-.75.75h-4a.75.75 0 010-1.5h2.19l-3.22-3.22a.75.75 0 111.06-1.06l3.22 3.22V12.25a.75.75 0 011.5 0v4zm-13.25.75a.75.75 0 01-.75-.75v-4a.75.75 0 011.5 0v2.19l3.22-3.22a.75.75 0 111.06 1.06L5.56 15.5h2.19a.75.75 0 010 1.5h-4zM16.25 3a.75.75 0 01.75.75v4a.75.75 0 01-1.5 0V5.56l-3.22 3.22a.75.75 0 11-1.06-1.06L14.44 4.5H12.25a.75.75 0 010-1.5h4z" />
              </svg>
            </button>
          )}
        </div>
      </div>
      {preview ? (
        <div
          className={`rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg ${
            large ? "min-h-0 flex-1 overflow-auto" : "min-h-[6rem]"
          }`}
        >
          {value.trim() ? (
            <article className="text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
                {value}
              </ReactMarkdown>
            </article>
          ) : (
            <span className="text-faint">Nothing to preview</span>
          )}
        </div>
      ) : (
        <textarea
          rows={large ? undefined : rows}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write in Markdown…"
          className={`${field} ${large ? "min-h-0 flex-1 resize-none" : ""}`}
        />
      )}
    </div>
  );
}

export function MarkdownField(props: Props) {
  return (
    <Editor
      {...props}
      large={props.fillHeight}
      onExpand={props.onExpand}
      hideLabel={props.hideLabel}
    />
  );
}

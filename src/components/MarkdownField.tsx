"use client";

import { useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Modal } from "./Modal";

const MD_COMPONENTS: Components = {
  h1: ({ children }) => (
    <h1 className="mb-2 mt-3 text-2xl font-bold text-zinc-900 dark:text-zinc-100">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-3 text-xl font-bold text-zinc-900 dark:text-zinc-100">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1.5 mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-1.5 mt-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">{children}</h4>
  ),
  h5: ({ children }) => (
    <h5 className="mb-1 mt-2 text-sm font-semibold uppercase tracking-wide text-zinc-900 dark:text-zinc-100">{children}</h5>
  ),
  h6: ({ children }) => (
    <h6 className="mb-1 mt-2 text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">{children}</h6>
  ),
  p: ({ children }) => <p className="my-2 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-6">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-4 border-zinc-300 pl-3 italic text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-zinc-200 dark:border-zinc-800" />,
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => <del className="line-through">{children}</del>,
  code: ({ className, children }) => {
    const isBlock = className?.startsWith("language-");
    if (isBlock) return <code className={className}>{children}</code>;
    return (
      <code className="rounded bg-zinc-200/60 px-1 py-0.5 font-mono text-[0.85em] text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto rounded-md bg-zinc-100 p-3 font-mono text-xs text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-zinc-100 dark:bg-zinc-800">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="border border-zinc-300 px-2 py-1 text-left font-semibold dark:border-zinc-700">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-zinc-300 px-2 py-1 dark:border-zinc-700">{children}</td>
  ),
  img: ({ src, alt }) => (
    // Plain <img>: user-supplied URLs aren't whitelisted in next.config.ts.
    <img
      src={typeof src === "string" ? src : undefined}
      alt={alt ?? ""}
      className="my-2 max-w-full rounded-md"
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
};

type EditorProps = Props & {
  large?: boolean;
  onExpand?: () => void;
};

function Editor({ label, value, onChange, rows = 4, large, onExpand, required }: EditorProps) {
  const [preview, setPreview] = useState(false);

  return (
    <div className={`flex flex-col gap-1 ${large ? "min-h-0 flex-1" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-zinc-700 dark:text-zinc-300">{label}</span>
        <div className="flex items-center gap-1">
          <div
            role="tablist"
            aria-label={`${label} mode`}
            className="flex gap-0.5 rounded-md bg-zinc-100 p-0.5 dark:bg-zinc-800"
          >
            <button
              type="button"
              role="tab"
              aria-selected={!preview}
              onClick={() => setPreview(false)}
              className={`rounded px-2 py-0.5 text-xs transition-colors ${
                !preview
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-100"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              Edit
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={preview}
              onClick={() => setPreview(true)}
              className={`rounded px-2 py-0.5 text-xs transition-colors ${
                preview
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-100"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
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
              className="rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
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
          className={`rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 ${
            large ? "flex-1 min-h-0 overflow-auto" : "min-h-[6rem]"
          }`}
        >
          {value.trim() ? (
            <article className="text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
                {value}
              </ReactMarkdown>
            </article>
          ) : (
            <span className="text-zinc-400">Nothing to preview</span>
          )}
        </div>
      ) : (
        <textarea
          rows={large ? undefined : rows}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 ${
            large ? "flex-1 min-h-0 resize-none" : ""
          }`}
        />
      )}
    </div>
  );
}

export function MarkdownField(props: Props) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <Editor {...props} large={props.fillHeight} onExpand={() => setExpanded(true)} />
      <Modal
        open={expanded}
        onClose={() => setExpanded(false)}
        title={props.label}
        widthClass="max-w-4xl"
      >
        <div className="flex h-[70vh] flex-col">
          <Editor {...props} large />
        </div>
      </Modal>
    </>
  );
}

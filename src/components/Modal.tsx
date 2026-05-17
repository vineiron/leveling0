"use client";

import { useEffect, useId, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  widthClass?: string;
  /** Fixed panel height so the dialog doesn't resize as content swaps. */
  heightClass?: string;
  hideHeaderBorder?: boolean;
  hideFooterBorder?: boolean;
  /** Hide the header close (X) — use when another control already exits. */
  hideClose?: boolean;
  /** Optional pinned footer — stays put while the body scrolls. */
  footer?: React.ReactNode;
};

// Shared open-modal stack so nested modals coordinate: the body scroll
// lock is ref-counted (only released when the last modal closes) and
// Escape only closes the top-most modal.
const modalStack: string[] = [];
let scrollLockCount = 0;

function lockScroll() {
  if (scrollLockCount === 0) document.body.style.overflow = "hidden";
  scrollLockCount += 1;
}

function unlockScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) document.body.style.overflow = "";
}

const FADE_BASE =
  "pointer-events-none absolute inset-x-0 z-20 flex h-9 items-center justify-center transition-opacity duration-150";

function ScrollHint({ dir }: { dir: "up" | "down" }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-elevated px-2 py-0.5 text-[10px] font-medium text-muted shadow-sm">
      <svg
        className={`h-3 w-3 ${dir === "up" ? "animate-hint-up" : "animate-hint-down"}`}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        {dir === "up" ? (
          <path
            fillRule="evenodd"
            d="M5.22 12.28a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0l4.25 4.25a.75.75 0 11-1.06 1.06L10 8.56l-3.72 3.72a.75.75 0 01-1.06 0z"
            clipRule="evenodd"
          />
        ) : (
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z"
            clipRule="evenodd"
          />
        )}
      </svg>
      More
    </span>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  widthClass = "max-w-lg",
  heightClass = "",
  hideHeaderBorder = false,
  hideFooterBorder = false,
  hideClose = false,
  footer,
}: Props) {
  const id = useId();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(false);
  // True when another modal is already open beneath this one.
  const [isNested, setIsNested] = useState(false);

  useEffect(() => {
    if (!open) return;
    setIsNested(modalStack.length > 0);
    modalStack.push(id);
    lockScroll();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Only the top-most modal reacts to Escape.
      if (modalStack[modalStack.length - 1] === id) onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      const i = modalStack.lastIndexOf(id);
      if (i !== -1) modalStack.splice(i, 1);
      unlockScroll();
    };
  }, [open, id]);

  // Track whether the body can scroll further up/down so the hint only
  // shows in the direction there's hidden content.
  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const scrollable = scrollHeight - clientHeight > 1;
      setShowTop(scrollable && scrollTop > 1);
      setShowBottom(scrollable && scrollTop + clientHeight < scrollHeight - 1);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (contentRef.current) ro.observe(contentRef.current);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className={`absolute inset-0 animate-overlay-in ${
          isNested ? "bg-scrim/40" : "bg-scrim backdrop-blur-[2px]"
        }`}
      />
      <div
        className={`relative flex max-h-[90vh] w-full ${widthClass} ${heightClass} animate-panel-in flex-col overflow-hidden rounded-xl border border-border bg-elevated shadow-xl`}
      >
        <div
          className={`relative z-10 flex shrink-0 items-center justify-between px-5 py-3.5 ${
            hideHeaderBorder ? "" : "border-b border-border"
          }`}
        >
          <h2 className="text-[15px] font-semibold tracking-tight text-fg">{title}</h2>
          {!hideClose && (
            <button
              type="button"
              onClick={onClose}
              className="-mr-1 flex h-7 w-7 items-center justify-center rounded-md text-faint transition-colors hover:bg-surface hover:text-fg"
              aria-label="Close"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          )}
          {/* Hangs just below the header, over the top of the scroll area. */}
          <div
            aria-hidden="true"
            className={`${FADE_BASE} top-full bg-gradient-to-b from-elevated to-transparent ${
              showTop ? "opacity-100" : "opacity-0"
            }`}
          >
            <ScrollHint dir="up" />
          </div>
        </div>

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
          <div ref={contentRef} className="p-5">
            {children}
          </div>
        </div>

        {footer ? (
          <div
            className={`relative z-10 shrink-0 px-5 py-4 ${
              hideFooterBorder ? "" : "border-t border-border"
            }`}
          >
            <div
              aria-hidden="true"
              className={`${FADE_BASE} bottom-full bg-gradient-to-t from-elevated to-transparent ${
                showBottom ? "opacity-100" : "opacity-0"
              }`}
            >
              <ScrollHint dir="down" />
            </div>
            {footer}
          </div>
        ) : (
          <div className="relative z-10 shrink-0">
            <div
              aria-hidden="true"
              className={`${FADE_BASE} bottom-0 bg-gradient-to-t from-elevated to-transparent ${
                showBottom ? "opacity-100" : "opacity-0"
              }`}
            >
              <ScrollHint dir="down" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type Props = {
  className?: string;
};

// Decorative: the spinner is always paired with adjacent status text
// ("Saving…", "Syncing…", …), so it's hidden from assistive tech and the
// surrounding text/live region carries the meaning.
export function Spinner({ className = "h-4 w-4" }: Props) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}

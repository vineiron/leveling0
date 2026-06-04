import Image from "next/image";

type IconProps = { className?: string };

/** The ember glyph — leveling0's identity mark. Inherits `currentColor`. */
export function FlameIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.177A7.547 7.547 0 0 1 6.648 6.61a.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.547 3.75 3.75 0 0 1 3.255 3.719Z"
      />
    </svg>
  );
}

type BrandMarkProps = {
  className?: string;
  /** Show the "leveling0" wordmark next to the glyph. */
  withWordmark?: boolean;
};

export function BrandMark({
  className = "",
  withWordmark = true,
}: BrandMarkProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/brand/leveling0-mark-128.png"
        alt={withWordmark ? "" : "leveling0"}
        width={20}
        height={20}
        priority
        className="h-5 w-5 shrink-0"
      />
      {withWordmark && (
        <span className="text-[15px] font-semibold tracking-tight text-fg">
          leveling0
        </span>
      )}
    </div>
  );
}

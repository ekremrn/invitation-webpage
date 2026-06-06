type MonogramProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "h-14 w-14 text-lg",
  md: "h-20 w-20 text-2xl",
  lg: "h-28 w-28 text-4xl",
} as const;

export function Monogram({ className = "", size = "md" }: MonogramProps) {
  return (
    <div
      className={[
        "relative inline-flex shrink-0 items-center justify-center rounded-full border border-champagne/48 bg-warm-white/72 font-display font-[300] italic text-charcoal shadow-[inset_0_1px_0_rgb(255_255_255_/_0.82),0_8px_24px_rgb(47_42_38_/_0.06)]",
        sizeClass[size],
        className,
      ].join(" ")}
      aria-hidden="true"
    >
      <span className="relative z-10">İ&E</span>
      <span className="absolute inset-2 rounded-full border border-nude/40" />
      <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_25%,rgb(255_255_255_/_0.75),transparent_46%)]" />
    </div>
  );
}

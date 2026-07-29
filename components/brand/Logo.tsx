import { cn } from "@/lib/cn";

/**
 * The Shisho mark: 志 inside a seal-outlined circle — a registrar's stamp on a
 * court filing. This is the one place outside CTAs and annotations where seal
 * appears, and it appears as a hairline outline only.
 *
 * The glyph is rendered as text (not a path) so it inherits the CJK font the
 * OS already ships; the stack below covers Windows, macOS, Android and Linux.
 */

const CJK_STACK =
  '"Noto Sans JP", "Hiragino Sans", "Yu Gothic UI", "Yu Gothic", "Microsoft YaHei", "Noto Sans CJK JP", sans-serif';

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-grid size-8 shrink-0 place-items-center rounded-full",
        "border border-seal/70 text-ink",
        "text-[15px] leading-none",
        className,
      )}
      style={{ fontFamily: CJK_STACK }}
    >
      志
    </span>
  );
}

export function Logo({
  className,
  wordmarkClassName,
}: {
  className?: string;
  wordmarkClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span
        className={cn(
          "font-display text-[19px] leading-none font-semibold tracking-[-0.015em] text-ink",
          wordmarkClassName,
        )}
      >
        Shisho{" "}
        <span className="font-sans text-[13px] font-medium tracking-[0.02em] text-ink-soft">
          AI
        </span>
      </span>
    </span>
  );
}

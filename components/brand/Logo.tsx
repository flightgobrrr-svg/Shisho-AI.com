import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * The Shisho logo.
 *
 * `public/shisho-logo.png` is a 500×500 lockup: emblem on top, "SHISHO ai"
 * wordmark beneath it, and the WISDOM · GUIDANCE · INTELLIGENCE tagline under
 * that. It is a genuine transparent PNG — 81% of its pixels are fully
 * transparent and the edges are anti-aliased — so it sits on `paper` without
 * a white box behind it.
 *
 * That square lockup cannot go in the nav as-is: at the 32px the 4rem bar
 * allows, the tagline would be an illegible smudge. So <Logo> shows only the
 * EMBLEM, framed out of the square by <LogoMark>, and pairs it with the
 * wordmark set in the site's own type. <LogoLockup> uses the whole artwork,
 * and belongs only where there is room to read it — the footer.
 */

/**
 * The emblem alone.
 *
 * `shisho-emblem.png` is the emblem cut out of the square lockup (x 90–390,
 * y 28–328 of the 500×500 source). It used to be framed out of the full
 * artwork with percentage offsets, which worked but meant every consumer had
 * to reproduce the same magic numbers — and Satori, which renders the social
 * card, ignores object-fit entirely, so that approach could not be shared with
 * app/opengraph-image.tsx. One cropped file serves the nav, the favicon, and
 * the social card alike.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/shisho-emblem.png"
      alt=""
      aria-hidden="true"
      width={512}
      height={512}
      priority
      className={cn("block size-8 shrink-0", className)}
    />
  );
}

/**
 * Emblem plus wordmark. The nav's brand, and the compact form generally.
 *
 * The wordmark is set in the site's display face rather than taken from the
 * artwork: the artwork's own wordmark only reads at size, and the nav needs
 * this to hold at 19px against everything else in the bar.
 */
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

/**
 * The full artwork — emblem, wordmark and tagline. Needs room: below about
 * 160px wide the tagline stops being legible, which is the whole reason to
 * reach for this form rather than <Logo>.
 */
export function LogoLockup({ className }: { className?: string }) {
  return (
    <Image
      src="/shisho-logo.png"
      alt="Shisho AI — wisdom, guidance, intelligence"
      width={500}
      height={500}
      className={cn("logo-plate h-auto w-44", className)}
    />
  );
}

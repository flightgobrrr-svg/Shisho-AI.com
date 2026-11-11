import Image from "next/image";
import { ParallaxLayer } from "@/components/motion/ParallaxLayer";
import { cn } from "@/lib/cn";

/**
 * A photograph sunk into a section's ground.
 *
 * Three rules govern every use of this and none of them are negotiable:
 *
 *   1. It must never touch text contrast. `mask` has to fall to transparent
 *      before it reaches the type column, so headings sit on essentially
 *      undiluted paper. A single gradient does the work — no `mask-composite`,
 *      which is the part with ragged engine support.
 *   2. It never moves on its own. It is ground, not an event. `parallax` is
 *      the one exception and it is scroll-driven, so it spends none of the
 *      one-perpetual-animation budget the ambient drift holds: nothing moves
 *      unless the reader is already moving the page. Keep the value small
 *      enough that it reads as depth rather than as an effect.
 *   3. It is `aria-hidden` and carries an empty alt. It is atmosphere; the
 *      section's own copy already says what the page is about, and a screen
 *      reader being told about a decorative photograph mid-form is noise.
 *
 * Everything variable is passed as an inline style rather than a Tailwind
 * class. Tailwind v4 extracts classes statically, so an interpolated
 * `opacity-${n}` would simply never be generated.
 *
 * The parent must be `relative overflow-hidden`.
 */
export function PhotoBackdrop({
  src,
  focus,
  mask,
  opacity = 0.2,
  frameClassName,
  priority = true,
  parallax,
  sizes = "100vw",
}: {
  src: string;
  /** CSS `object-position` — which part of the photo to keep in frame. */
  focus: string;
  /** CSS `mask-image` — where the photo is allowed to be visible. */
  mask: string;
  opacity?: number;
  /**
   * Positions and sizes the framing box. Replaces the default outright rather
   * than merging with it — a caller that needs a fixed-height band has to be
   * able to drop `inset-y-0`, and relying on class-merge order to resolve
   * `inset-y` against `top`/`h` is exactly the kind of thing that silently
   * stops working.
   */
  frameClassName?: string;
  priority?: boolean;
  /**
   * Scroll-drift, signed and small — see rule 2. Omit for a fixed ground; the
   * frame then renders with no scroll listener attached at all.
   *
   * A parallaxed frame must be oversized (e.g. `-inset-y-16` rather than
   * `inset-y-0`) or the drift will pull an edge of the photograph into view.
   */
  parallax?: number;
  /** The image's rendered width, for picking the download size; full width unless the frame is narrower. */
  sizes?: string;
}) {
  const frame = (
    <div className={cn("absolute", frameClassName ?? "inset-y-0 right-0 w-full")}>
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
        style={{ objectPosition: focus, maskImage: mask, opacity }}
      />
    </div>
  );

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-20 overflow-hidden"
    >
      {parallax ? (
        /* The layer is the drifting element, so the frame keeps its own
           absolute positioning against the section untouched. */
        <ParallaxLayer speed={parallax} className="absolute inset-0">
          {frame}
        </ParallaxLayer>
      ) : (
        frame
      )}
    </div>
  );
}

import Image from "next/image";
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
 *   2. It does not move. It is ground, not an event. The brief allows one
 *      perpetual animation and the ambient drift has it.
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
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-20 overflow-hidden"
    >
      <div className={cn("absolute", frameClassName ?? "inset-y-0 right-0 w-full")}>
        <Image
          src={src}
          alt=""
          fill
          sizes="100vw"
          priority={priority}
          className="object-cover"
          style={{ objectPosition: focus, maskImage: mask, opacity }}
        />
      </div>
    </div>
  );
}

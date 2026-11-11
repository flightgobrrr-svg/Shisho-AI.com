import Image from "next/image";
import { PhotoBackdrop } from "@/components/ui/PhotoBackdrop";
import type { Audience } from "@/lib/audiences";

/**
 * An audience's photograph, treated like the homepage hero's: its own picture
 * on the right of the section, sunk into the paper behind a soft oval mask,
 * never framed as a card and never sitting under text.
 *
 * Desktop: the hero's own PhotoBackdrop, as a right-hand panel. The section
 * must be `relative isolate overflow-hidden` (isolate keeps the backdrop above
 * any band background), and its copy column must stay within the left ~56%
 * so the mask has faded out before the type begins (PhotoBackdrop's rule 1).
 *
 * Phone: there is no room beside the copy, so the photo stands on its own
 * above it, fading out at the edges the same way.
 *
 * Most of these photos come from the promo video at 150x228 and are enlarged,
 * so they are kept soft and partly transparent, as the hero is, rather than
 * shown crisp and full strength. Decorative here: the section's copy says who
 * it is for, so the image is hidden from screen readers like the hero's.
 */
export function SidePhoto({
  photo,
  priority = false,
}: {
  photo: NonNullable<Audience["photo"]>;
  priority?: boolean;
}) {
  const focus = photo.focus ?? "50% 35%";
  return (
    <>
      <div aria-hidden="true" className="relative mb-8 h-72 overflow-hidden sm:h-80 lg:hidden">
        <Image
          src={photo.src}
          alt=""
          fill
          sizes="100vw"
          priority={priority}
          className="object-cover"
          style={{
            objectPosition: focus,
            maskImage: "radial-gradient(70% 62% at 50% 46%, #000 38%, transparent 82%)",
            opacity: 0.85,
          }}
        />
      </div>
      <PhotoBackdrop
        src={photo.src}
        focus={focus}
        mask="radial-gradient(58% 54% at 54% 50%, #000 26%, transparent 76%)"
        opacity={0.78}
        priority={priority}
        frameClassName="hidden lg:block right-0 top-1/2 h-[min(100%,32rem)] w-[36%] -translate-y-1/2"
      />
    </>
  );
}

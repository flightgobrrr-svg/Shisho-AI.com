import Image from "next/image";

/**
 * "THE AMENDMENT" — a scroll-film section.
 *
 * One clause of a plaint, fixed dead centre. The scroll does not move a camera;
 * it moves the DRAFT. Red strikes the vague words, the corrected phrasing
 * resolves in their place, the authority writes itself into the margin, and the
 * red drains to ink. The same object throughout, so the change is measurable
 * rather than asserted.
 *
 * Three earlier concepts were sparred against a fresh critic and lost:
 *   - a page that types a plaint out and then pulls the camera back — the type
 *     simulation reads as a wipe in a proportional serif, and scaling live text
 *     at the emotional peak shows an illegible grey rectangle;
 *   - the nine litigation stages descending a rule — that enumerates, it does
 *     not transform, and nine pinned beats is ~900vh of someone else's page;
 *   - a dissolve from the gurukul photograph through palm leaf and court paper
 *     — undeliverable, since the brand owns two photographs of one afternoon.
 *
 * Built with CSS scroll-driven animation rather than GSAP + Lenis, which the
 * skill's Lane A reaches for by default: this is EMBED MODE, and its own
 * contract says the host design system rules. globals.css states "No animation
 * library", and Lenis would replace native scrolling for the whole document.
 *
 * The clause is real. Order XXXIX Rules 1–2 CPC requires all three limbs —
 * prima facie case, balance of convenience, irreparable injury — pleaded
 * distinctly; the same triple test the Proficient syllabus opens on in
 * lib/courses.ts. Nothing here is invented law.
 */
export function AmendmentFilm() {
  return (
    <section className="film" aria-label="A clause, corrected">
      <div className="film__stage">
        {/* Right column only, and only from lg — a photo must never sit behind
            the type column, and below lg there is no column to move it to. */}
        <div className="film__plate" aria-hidden="true">
          <Image
            src="/gurukul-teaching.jpg"
            alt=""
            fill
            className="object-cover"
          />
        </div>

        <div className="film__sheet">
          <p className="film__eyebrow label-mono">In the matter of an injunction</p>

          <p className="film__clause">
            The Plaintiff{" "}
            <span className="film__swap">
              <span className="film__before">
                has a strong case and will suffer loss if the injunction is
                refused.
              </span>
              {/* Kept close in length to the draft above it. Both readings
                  share one inline slot, which takes the height of the longer
                  — a correction three times the length reserved a dead band
                  under the clause for the whole first half of the film. */}
              <span className="film__after">
                has a prima facie case, the balance of convenience, and
                irreparable injury not answerable in damages.
              </span>
            </span>
          </p>

          <p className="film__note">
            <span className="film__note-rule" aria-hidden="true" />
            Order XXXIX Rules 1&ndash;2 CPC &mdash; all three limbs, pleaded
            distinctly.
          </p>
        </div>
      </div>
    </section>
  );
}

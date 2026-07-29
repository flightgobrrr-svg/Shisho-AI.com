/**
 * Three large, heavily-blurred ellipses drifting behind the hero.
 *
 * This is the ONLY perpetual motion on the site. Pure CSS — no JS, no client
 * component. Opacity stays between 6–10% and the ellipses are positioned
 * clear of the text column, so they never reduce contrast on any copy.
 *
 * Under prefers-reduced-motion the backstop in globals.css forces the
 * animation to its final keyframe and stops it: the ellipses remain visible
 * but static, which is the correct resting state.
 */
export function AmbientDrift() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute -top-32 -left-24 size-[34rem] rounded-full bg-paper-raised opacity-[0.09] blur-[90px]"
        style={{ animation: "shisho-drift-a 26s ease-in-out infinite" }}
      />
      <div
        className="absolute top-1/3 -right-32 size-[38rem] rounded-full bg-accent-soft opacity-[0.07] blur-[90px]"
        style={{ animation: "shisho-drift-b 30s ease-in-out infinite" }}
      />
      <div
        className="absolute -bottom-40 left-1/3 size-[30rem] rounded-full bg-accent-soft opacity-[0.06] blur-[90px]"
        style={{ animation: "shisho-drift-c 24s ease-in-out infinite" }}
      />
    </div>
  );
}

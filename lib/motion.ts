/**
 * Every hero timing lives here so the whole sequence can be retuned from one
 * place. All values in milliseconds.
 *
 * Budget (agreed): the fade/rise choreography completes at 1080ms; the
 * typewriter and annotation reveal layer on after it, and everything is at
 * rest by ~3.2s. Ambient drift is the only thing still moving after that.
 *
 * This module deliberately holds no React hooks. It is imported by server
 * components (the hero and the document mockup are both server-rendered, with
 * their motion driven entirely by CSS `animation-delay`), and importing
 * `useState`/`useEffect` here — even without calling them — would taint the
 * module and break those builds.
 *
 * Reduced motion needs no JS: the backstop in globals.css collapses both
 * animation duration and delay, which lands every sequence on its final
 * keyframe — the resting state — at first paint.
 */
export const HERO_TIMING = {
  /* Layer 2 — entrance stagger, 120ms apart, 600ms each. */
  rise: {
    eyebrow: 0,
    headline: 120,
    subhead: 240,
    ctas: 360,
    document: 480,
    duration: 600,
  },

  /* Layer 3 — typewriter. Starts once the headline's own fade has resolved
     (120 + 600 = 720ms). Per-character speed is tuned so both lines finish
     around 2.4s without ever feeling hurried. */
  type: {
    start: 720,
    charMs: 20,
    /* Beat between line one and line two. */
    lineGap: 260,
  },

  /* Annotations reveal after the headline has finished typing, then the
     hanko settles last. */
  annotations: {
    start: 2400,
    stagger: 260,
  },
  stamp: 3000,
} as const;

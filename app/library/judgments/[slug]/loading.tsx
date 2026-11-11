import { LogoMark } from "@/components/brand/Logo";

/**
 * Scoped to this one route, not the root layout — see HANDOFF.md on why
 * app/loading.tsx (root-level) is currently disabled: a Next.js 16 Suspense
 * bug gets every STATIC page stuck on its fallback forever. This page is
 * already dynamic (reads Supabase, sometimes calls a live model), so a
 * leaf-level loading.tsx here doesn't hit that bug — confirmed by /library
 * itself (also dynamic) rendering correctly the whole time that root file
 * was still enabled.
 *
 * The wait this covers is real, not decorative: a cache miss here means
 * fetching the actual judgment from Indian Kanoon and running an 18-field
 * live generation, which genuinely takes minutes — a blank tab that long
 * would read as broken. Once a case's digest is cached, this never shows
 * for it again.
 */
export default function Loading() {
  return (
    <div
      role="status"
      className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center gap-4 px-6 py-24 text-center"
    >
      <LogoMark className="rise size-14" />
      <p className="rise font-display text-[19px] font-semibold text-ink" style={{ animationDelay: "80ms" }}>
        Preparing this judgment&rsquo;s digest…
      </p>
      <p
        className="rise max-w-[46ch] text-[14.5px] leading-relaxed text-ink-soft"
        style={{ animationDelay: "140ms" }}
      >
        Shisho is reading the judgment and preparing a full citation digest —
        this can take a few minutes the first time. It&rsquo;s instant for
        everyone after.
      </p>
    </div>
  );
}

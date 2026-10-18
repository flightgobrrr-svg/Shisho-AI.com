import { LogoMark } from "@/components/brand/Logo";

/**
 * The App Router's route-level Suspense fallback — shown in place of
 * `children` in app/layout.tsx while a segment streams in, so Nav and Footer
 * stay mounted around it. Basic on purpose: the mark, entering once with the
 * same `rise` keyframe every other block on the site uses, and the same
 * "reading" language the workspace already shows mid-request. No spinner, no
 * new perpetual motion — AmbientDrift stays the only one of those.
 */
export default function Loading() {
  return (
    <div
      role="status"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-24"
    >
      <LogoMark className="rise size-14" />
      <p className="label-mono rise text-ink-soft/70" style={{ animationDelay: "80ms" }}>
        Reading…
      </p>
    </div>
  );
}

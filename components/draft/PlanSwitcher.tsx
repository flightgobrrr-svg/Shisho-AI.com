"use client";

import { PLAN_COOKIE, PLANS, PLAN_LABELS, USAGE_COOKIE, type Plan } from "@/lib/entitlements";
import { ASSISTANT_USAGE_COOKIE } from "@/lib/assistantEntitlements";

/**
 * DEVELOPMENT ONLY — rendered by app/draft-bot/page.tsx only when
 * NODE_ENV !== "production", so it never ships to users.
 *
 * It exists so both the unlocked and locked states are demonstrable without
 * an auth system. It writes the same mock cookies the route reads; it grants
 * nothing that editing those cookies by hand would not.
 */
/* Kept at module scope, outside the component: writing document.cookie is an
   external-system side effect, not component state, and the lint rules treat
   an assignment inside a component body as a mutation. */
function writeCookie(name: string, value: string, maxAge: number) {
  globalThis.document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`;
  globalThis.location.reload();
}

export function PlanSwitcher({ plan }: { plan: Plan }) {
  function setPlan(next: Plan) {
    writeCookie(PLAN_COOKIE, next, 60 * 60 * 24 * 30);
  }

  function resetUsage() {
    writeCookie(USAGE_COOKIE, "0", 0);
  }

  function resetAssistantUsage() {
    writeCookie(ASSISTANT_USAGE_COOKIE, "0", 0);
  }

  return (
    <div className="mb-8 rounded-seal border border-dashed border-ink/25 bg-paper-raised p-4">
      <p className="label-mono text-ink-soft/70">
        Dev only · mock plan state
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {PLANS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPlan(p)}
            aria-pressed={plan === p}
            className={
              plan === p
                ? "rounded-seal border border-ink bg-ink px-3 py-1.5 text-[13px] text-paper"
                : "rounded-seal border border-ink/20 px-3 py-1.5 text-[13px] text-ink-soft hover:border-ink/40"
            }
          >
            {PLAN_LABELS[p]}
          </button>
        ))}
        <button
          type="button"
          onClick={resetUsage}
          className="ml-2 text-[13px] text-ink-soft underline underline-offset-4 hover:text-ink"
        >
          Reset review count
        </button>
        <button
          type="button"
          onClick={resetAssistantUsage}
          className="text-[13px] text-ink-soft underline underline-offset-4 hover:text-ink"
        >
          Reset chat count
        </button>
      </div>
    </div>
  );
}

/**
 * Shared chrome for every auth page (login, register, forgot/reset password,
 * account) — a bordered, lightly-elevated card on the plain paper
 * background, same "ruled box" language as everywhere else on the site
 * (EntryGate's audience cards, the nav's dropdown panel) rather than the
 * bare, borderless column these pages started with.
 */
export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-sm flex-col justify-center px-6 py-16">
      <div className="rounded-seal border border-ink/45 bg-paper-raised p-8 shadow-[0_18px_44px_-16px_rgba(34,37,43,0.28)] sm:p-10">
        {children}
      </div>
    </div>
  );
}

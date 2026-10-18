import Link from "next/link";
import { LogoLockup } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Section";
import { FOOTER_COLUMNS } from "@/lib/nav";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-ink/10 bg-paper-raised">
      <Container className="py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(4,1fr)] md:gap-8">
          <div className="max-w-xs">
            {/* The full lockup, which has the room here that the nav bar
                cannot give it. Its artwork already carries the tagline, so the
                typed "Wisdom, guidance, intelligence." line that used to sit
                below is gone — it was saying the same thing twice. */}
            <LogoLockup />
            <p className="mt-5 text-[14px] leading-relaxed text-ink-soft">
              Your AI legal mentor — courses and drafting for Indian law.
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="label-mono font-sans text-ink-soft/70">
                {column.heading}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link, i) => (
                  <li key={`${link.href}-${i}`}>
                    <Link
                      href={link.href}
                      className="underline-draw inline-block text-[14px] text-ink-soft transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 border-t border-ink/10 pt-8">
          <p className="max-w-3xl text-[13px] leading-relaxed text-ink-soft">
            Shisho AI is an educational and drafting tool. It does not provide
            legal advice, and no advocate–client relationship arises from its
            use. Shisho assists a lawyer; it does not replace one, and is not
            a substitute for a licensed, practising advocate.
          </p>
          <p className="label-mono mt-6 text-ink-soft/70">
            © {year} Shisho AI · Made in India
          </p>
        </div>
      </Container>
    </footer>
  );
}

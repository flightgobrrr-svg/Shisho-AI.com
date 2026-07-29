import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Section";
import { FOOTER_COLUMNS } from "@/lib/nav";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-ink/10 bg-paper-raised">
      <Container className="py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(4,1fr)] md:gap-8">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-[14px] leading-relaxed text-ink-soft">
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
            legal advice and is not a substitute for an advocate enrolled with a
            State Bar Council.
          </p>
          <p className="label-mono mt-6 text-ink-soft/70">
            © {year} Shisho AI · Made in India
          </p>
        </div>
      </Container>
    </footer>
  );
}

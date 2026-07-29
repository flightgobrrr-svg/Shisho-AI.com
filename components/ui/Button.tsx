import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Button variants.
 *
 *   primary — seal fill. The 10% in 60-30-10. One per view, ideally one per
 *             screenful. If a page has two primary buttons competing, one of
 *             them is a ghost.
 *   ghost   — hairline ink outline on paper. The default for everything that
 *             is not THE action: secondary CTAs, filters, toolbar actions.
 *   dark    — ink fill. For inverted sections and for a strong action that
 *             must not spend the seal budget.
 */
export type ButtonVariant = "primary" | "ghost" | "dark";
export type ButtonSize = "sm" | "md" | "lg";

/** Accepts a plain string whether or not typedRoutes is enabled. */
type Href = React.ComponentProps<typeof Link>["href"];

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-seal font-sans font-medium " +
  "whitespace-nowrap select-none " +
  "transition-[background-color,border-color,color] duration-[var(--duration-nudge)] " +
  "ease-[var(--ease-precise)] " +
  "disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-seal text-paper-raised hover:bg-seal-dark active:bg-seal-dark " +
    "border border-transparent",
  ghost:
    "bg-transparent text-ink border border-ink/25 " +
    "hover:border-ink/45 hover:bg-ink/[0.04] active:bg-ink/[0.07]",
  dark:
    "bg-ink text-paper-raised border border-transparent " +
    "hover:bg-ink-soft active:bg-ink-soft",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-11 px-5 text-[14.5px]",
  lg: "h-13 px-7 text-[15.5px]",
};

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: never;
  };

type ButtonAsLink = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps | "href"> & {
    href: Href;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], className);

  if (typeof (props as ButtonAsLink).href !== "undefined") {
    const { href, ...rest } = props as ButtonAsLink;
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...rest } = props as ButtonAsButton;
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}

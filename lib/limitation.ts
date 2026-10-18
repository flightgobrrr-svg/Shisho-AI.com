/**
 * Limitation periods for the checker at /limitation.
 *
 * VERIFIED against the Schedule to The Limitation Act, 1963 (Act 36 of 1963)
 * as published at https://indiankanoon.org/doc/1317393/ — each description,
 * period and starting point below is quoted from that text. Per
 * PRODUCT.md, nothing is added here that has not been checked against a real
 * source; to cover another Article, verify it the same way first.
 *
 * What this deliberately does NOT do: apply Sections 4–24 (e.g. s.5, s.12,
 * s.14, s.18), special statutes that set their own periods, or decide which
 * Article applies. It computes the plain period from the date the user
 * supplies and says so.
 */

export type LimitationEntry = {
  id: string;
  article: string;
  /** Short, plain label for the picker. */
  label: string;
  /** The Schedule's own description. */
  description: string;
  years: number;
  /** The Schedule's "time from which period begins to run". */
  runsFrom: string;
  /** What the date the user enters stands for, for this entry. */
  dateLabel: string;
};

export const SCHEDULE_SOURCE = {
  name: "The Limitation Act, 1963, Schedule",
  url: "https://indiankanoon.org/doc/1317393/",
};

export const LIMITATION_ENTRIES: LimitationEntry[] = [
  {
    id: "art-19",
    article: "Article 19",
    label: "Money lent",
    description: "For money payable for money lent.",
    years: 3,
    runsFrom: "When the loan is made.",
    dateLabel: "Date the loan was made",
  },
  {
    id: "art-54",
    article: "Article 54",
    label: "Specific performance of a contract",
    description: "For specific performance of a contract.",
    years: 3,
    runsFrom:
      "The date fixed for the performance, or, if no such date is fixed, when the plaintiff has notice that performance is refused.",
    dateLabel: "Date fixed for performance (or date of notice of refusal)",
  },
  {
    id: "art-55",
    article: "Article 55",
    label: "Compensation for breach of contract",
    description:
      "For compensation for the breach of any contract, express or implied not herein specially provided for.",
    years: 3,
    runsFrom: "When the contract is broken or (where there are successive breaches) when the breach in respect of which the suit is instituted occurs.",
    dateLabel: "Date of the breach",
  },
  {
    id: "art-58",
    article: "Article 58",
    label: "A declaration",
    description: "To obtain any other declaration.",
    years: 3,
    runsFrom: "When the right to sue first accrues.",
    dateLabel: "Date the right to sue first accrued",
  },
  {
    id: "art-65",
    article: "Article 65",
    label: "Possession of immovable property, on title",
    description:
      "For possession of immovable property or any interest therein based on title.",
    years: 12,
    runsFrom: "When the possession of the defendant becomes adverse to the plaintiff.",
    dateLabel: "Date possession became adverse",
  },
  {
    id: "art-113",
    article: "Article 113",
    label: "Any other suit",
    description:
      "Any suit for which no period of limitation is provided elsewhere in this Schedule.",
    years: 3,
    runsFrom: "When the right to sue accrues.",
    dateLabel: "Date the right to sue accrued",
  },
  {
    id: "art-137",
    article: "Article 137",
    label: "Any other application",
    description:
      "Any other application for which no period of limitation is provided elsewhere in this division.",
    years: 3,
    runsFrom: "When the right to apply accrues.",
    dateLabel: "Date the right to apply accrued",
  },
];

/**
 * The last day of the period: the same calendar date `years` later. The day
 * the time begins from is excluded (s.12(1)), so a loan made on 10 Jan 2023
 * has its three years end on 10 Jan 2026. A 29 February start with no
 * 29 February in the target year ends on 28 February.
 */
export function lastDay(start: Date, years: number): Date {
  const y = start.getUTCFullYear() + years;
  const m = start.getUTCMonth();
  const d = start.getUTCDate();
  const daysInTarget = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m, Math.min(d, daysInTarget)));
}

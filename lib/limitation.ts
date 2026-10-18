/**
 * Limitation periods and filing deadlines for the checker at /limitation.
 *
 * VERIFIED. The Articles come from the Schedule to The Limitation Act, 1963
 * (Act 36 of 1963) as published at https://indiankanoon.org/doc/1317393/ —
 * each description, period and starting point is quoted from that text. The
 * written-statement entry restates Order VIII Rule 1 CPC (thirty days from
 * service of summons; later filing allowed for reasons recorded, but not
 * beyond ninety days), checked against two published copies of the rule. Per
 * PRODUCT.md nothing is added here that has not been checked against a real
 * source; to cover another entry, verify it the same way first.
 *
 * What this deliberately does NOT do: apply Sections 4–24 of the Limitation
 * Act (e.g. ss.5, 12, 14, 18), special statutes that set their own periods
 * (commercial suits, for one, have different written-statement rules), or
 * decide which entry applies. It computes the plain period from the date the
 * user supplies and says so.
 */

export type Period = { n: number; unit: "years" | "days" };

export type LimitationEntry = {
  id: string;
  /** "Article 19", "Order VIII Rule 1". */
  article: string;
  /** Short, plain label for the picker. */
  label: string;
  /** The provision's own description. */
  description: string;
  period: Period;
  /** The provision's own "time from which period begins to run". */
  runsFrom: string;
  /** What the date the user enters stands for, for this entry. */
  dateLabel: string;
  /** A later, court-allowed outer limit, where the provision has one. */
  outer?: { period: Period; note: string };
  source: { name: string; url: string };
};

const SCHEDULE = {
  name: "The Limitation Act, 1963, Schedule",
  url: "https://indiankanoon.org/doc/1317393/",
};

export const SCHEDULE_SOURCE = SCHEDULE;

const CPC_O8 = {
  name: "Order VIII Rule 1, Code of Civil Procedure, 1908",
  url: "https://vidhijudicial.com/cpc-order-8-.html",
};

export const LIMITATION_ENTRIES: LimitationEntry[] = [
  {
    id: "art-19",
    article: "Article 19",
    label: "Money lent",
    description: "For money payable for money lent.",
    period: { n: 3, unit: "years" },
    runsFrom: "When the loan is made.",
    dateLabel: "Date the loan was made",
    source: SCHEDULE,
  },
  {
    id: "art-54",
    article: "Article 54",
    label: "Specific performance of a contract",
    description: "For specific performance of a contract.",
    period: { n: 3, unit: "years" },
    runsFrom:
      "The date fixed for the performance, or, if no such date is fixed, when the plaintiff has notice that performance is refused.",
    dateLabel: "Date fixed for performance (or date of notice of refusal)",
    source: SCHEDULE,
  },
  {
    id: "art-55",
    article: "Article 55",
    label: "Compensation for breach of contract",
    description:
      "For compensation for the breach of any contract, express or implied not herein specially provided for.",
    period: { n: 3, unit: "years" },
    runsFrom:
      "When the contract is broken or (where there are successive breaches) when the breach in respect of which the suit is instituted occurs.",
    dateLabel: "Date of the breach",
    source: SCHEDULE,
  },
  {
    id: "art-58",
    article: "Article 58",
    label: "A declaration",
    description: "To obtain any other declaration.",
    period: { n: 3, unit: "years" },
    runsFrom: "When the right to sue first accrues.",
    dateLabel: "Date the right to sue first accrued",
    source: SCHEDULE,
  },
  {
    id: "art-65",
    article: "Article 65",
    label: "Possession of immovable property, on title",
    description:
      "For possession of immovable property or any interest therein based on title.",
    period: { n: 12, unit: "years" },
    runsFrom: "When the possession of the defendant becomes adverse to the plaintiff.",
    dateLabel: "Date possession became adverse",
    source: SCHEDULE,
  },
  {
    id: "art-113",
    article: "Article 113",
    label: "Any other suit",
    description:
      "Any suit for which no period of limitation is provided elsewhere in this Schedule.",
    period: { n: 3, unit: "years" },
    runsFrom: "When the right to sue accrues.",
    dateLabel: "Date the right to sue accrued",
    source: SCHEDULE,
  },
  {
    id: "art-137",
    article: "Article 137",
    label: "Any other application",
    description:
      "Any other application for which no period of limitation is provided elsewhere in this division.",
    period: { n: 3, unit: "years" },
    runsFrom: "When the right to apply accrues.",
    dateLabel: "Date the right to apply accrued",
    source: SCHEDULE,
  },
  {
    id: "art-116a",
    article: "Article 116(a)",
    label: "Civil appeal to a High Court",
    description: "Under the Code of Civil Procedure, 1908: to a High Court from any decree or order.",
    period: { n: 90, unit: "days" },
    runsFrom: "The date of the decree or order.",
    dateLabel: "Date of the decree or order",
    source: SCHEDULE,
  },
  {
    id: "art-116b",
    article: "Article 116(b)",
    label: "Civil appeal to any other court",
    description: "Under the Code of Civil Procedure, 1908: to any other court from any decree or order.",
    period: { n: 30, unit: "days" },
    runsFrom: "The date of the decree or order.",
    dateLabel: "Date of the decree or order",
    source: SCHEDULE,
  },
  {
    id: "art-117",
    article: "Article 117",
    label: "Appeal from a High Court to the same Court",
    description: "From a decree or order of any High Court to the same Court.",
    period: { n: 30, unit: "days" },
    runsFrom: "The date of the decree or order.",
    dateLabel: "Date of the decree or order",
    source: SCHEDULE,
  },
  {
    id: "art-122",
    article: "Article 122",
    label: "Restore a matter dismissed for default",
    description:
      "To restore a suit or appeal or application for review or revision dismissed for default of appearance, or for want of prosecution or for failure to pay costs of service of process or to furnish security for costs.",
    period: { n: 30, unit: "days" },
    runsFrom: "The date of dismissal.",
    dateLabel: "Date of dismissal",
    source: SCHEDULE,
  },
  {
    id: "art-123",
    article: "Article 123",
    label: "Set aside an ex parte decree",
    description:
      "To set aside a decree passed ex parte or to re-hear an appeal decreed or heard ex parte.",
    period: { n: 30, unit: "days" },
    runsFrom:
      "The date of the decree or, where the summons or notice was not duly served, when the applicant had knowledge of the decree.",
    dateLabel: "Date of the decree (or date you learned of it, if not duly served)",
    source: SCHEDULE,
  },
  {
    id: "o8r1",
    article: "Order VIII Rule 1",
    label: "Written statement (civil suit)",
    description: "The defendant shall present a written statement of his defence within thirty days from the date of service of summons.",
    period: { n: 30, unit: "days" },
    runsFrom: "The date of service of summons on the defendant.",
    dateLabel: "Date summons was served",
    outer: {
      period: { n: 90, unit: "days" },
      note: "If the written statement is not filed in thirty days, the court may allow it on another day, for reasons recorded in writing, but not later than ninety days from service of summons.",
    },
    source: CPC_O8,
  },
];

const WORDS: Record<number, string> = {
  3: "Three",
  12: "Twelve",
  30: "Thirty",
  90: "Ninety",
};

export function periodLabel(p: Period): string {
  const n = WORDS[p.n] ?? String(p.n);
  return `${n} ${p.unit}`;
}

/**
 * The last day of the period. The day the time begins from is left out
 * (s.12(1)), so for years the last day is the same calendar date later (a loan
 * made on 10 Jan 2023 has its three years end on 10 Jan 2026) and for days it
 * is that many days after. A 29 February start with no 29 February in the
 * target year ends on 28 February.
 */
export function lastDay(start: Date, period: Period): Date {
  if (period.unit === "days") {
    return new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + period.n),
    );
  }
  const y = start.getUTCFullYear() + period.n;
  const m = start.getUTCMonth();
  const d = start.getUTCDate();
  const daysInTarget = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m, Math.min(d, daysInTarget)));
}

/** Date the entries were last checked against their sources. Update it when re-checked. */
export const VERIFIED_ON = "18 October 2026";

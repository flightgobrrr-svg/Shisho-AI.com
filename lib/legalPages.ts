/**
 * Copy for the footer's company and legal pages. Every statement here is
 * written against what the code actually does today (see supabase/schema.sql,
 * app/api/assistant/route.ts, lib/pricing.ts) — in particular:
 *
 *   • No payment provider is integrated, so nothing is charged; the refund
 *     page says so rather than inventing a policy.
 *   • Draft text and uploaded files are sent to a model provider to produce
 *     a response and are not written to Shisho's own database.
 *
 * These are plain-language pages, not reviewed by counsel. Have an advocate
 * read Terms, Privacy and Refund before paid plans open, and update the
 * statements here whenever the code changes what is stored.
 */

export type LegalSection = { heading: string; body: string[] };

export type LegalDoc = {
  title: string;
  lede: string;
  updated?: string;
  sections: LegalSection[];
};

export const LAST_UPDATED = "18 October 2026";

export const LEGAL: Record<"terms" | "privacy" | "refund" | "about" | "how", LegalDoc> = {
  terms: {
    title: "Terms of use",
    lede: "The short version: Shisho AI helps you learn and draft. It does not replace a lawyer, and you remain responsible for what you file.",
    updated: LAST_UPDATED,
    sections: [
      {
        heading: "What Shisho AI is",
        body: [
          "Shisho AI is an educational and drafting tool for Indian law — courses, a Legal Library, and an assistant that drafts documents and marks them up.",
          "It does not provide legal advice, and no advocate–client relationship arises from using it. It assists a lawyer; it does not replace one.",
        ],
      },
      {
        heading: "Your responsibility for what you file",
        body: [
          "Drafts and notes the assistant produces can be incomplete or wrong. Read every document in full and check each authority against its source before you rely on it or file it.",
          "You are responsible for any document you file or send, and for any decision you take.",
        ],
      },
      {
        heading: "Accounts",
        body: [
          "Give an accurate email address and keep your password to yourself. You are responsible for activity on your account.",
        ],
      },
      {
        heading: "Acceptable use",
        body: [
          "Use the service lawfully. Do not try to disrupt it, scrape it in bulk, or work around plan limits.",
          "Only upload material you are entitled to share. Client-confidential information is your responsibility to protect — see the privacy policy for where your text goes.",
        ],
      },
      {
        heading: "Plans and limits",
        body: [
          "Plans and prices are on the pricing page, in rupees, billed monthly. The Free and Basic plans include five Shisho reviews a month.",
          "Paid plans are not yet charged online; see the refund policy.",
        ],
      },
      {
        heading: "The Legal Library",
        body: [
          "Library judgments are public court records. Digests are written from each judgment's own text. We check every citation we publish, but a digest is a study aid — read the judgment before you cite it.",
          "Shisho AI covers Indian law only.",
        ],
      },
      {
        heading: "Changes",
        body: [
          "We may update these terms as the product changes. The date at the top shows the latest version. These terms are governed by the laws of India.",
        ],
      },
    ],
  },

  privacy: {
    title: "Privacy policy",
    lede: "What Shisho AI keeps, what it sends elsewhere, and what it does not store.",
    updated: LAST_UPDATED,
    sections: [
      {
        heading: "What we keep",
        body: [
          "Account: your email address and your plan. Your password is handled by our authentication provider, not stored by us in readable form.",
          "Usage: a count of how many assistant reviews you have used, so monthly limits work.",
          "Google Drive, only if you connect it: a token that lets Shisho read the folder you choose, the folder's name, and a list of the file names in it.",
          "Notify-me sign-ups, only if you use one: your email address and the audience page you signed up from, so we can write to you once when that tool opens.",
        ],
      },
      {
        heading: "Your drafts and uploads",
        body: [
          "When you ask Shisho to draft or review something, the text you type and any file you attach are sent to an AI model provider to produce the response. Depending on how the service is configured, that provider is Google (Gemini) or Anthropic (Claude).",
          "Shisho does not save the text of your drafts or uploaded files in its own database. The providers handle the data under their own terms.",
          "Do not submit anything you are not authorised to share with a third-party processor — for example, client-confidential facts you have not cleared. Remove names and identifiers where you can.",
        ],
      },
      {
        heading: "In the mobile app",
        body: [
          "On your phone the app keeps what you save (case briefs, your moot rules, digests you opened) and, if you sign in, your sign-in tokens in the phone's secure storage. None of that is sent to us except the sign-in itself.",
          "The app makes up a random device ID the first time it runs. It is sent with Shisho requests only to count the free monthly messages. It is not linked to your name.",
          "You can delete your account inside the app. That removes your account and usage record from Shisho; briefs saved on the phone stay until you clear the app's data.",
        ],
      },
      {
        heading: "Cookies and browser storage",
        body: [
          "A sign-in session cookie when you log in, a cookie that remembers your plan when you are not signed in, and a browser-session flag so the welcome screen shows once.",
          "We use Vercel Web Analytics to count page views.",
        ],
      },
      {
        heading: "Your choices",
        body: [
          "You can ask us to delete your account and the data above. Use the contact page.",
          "Shisho AI is not intended for children under 13.",
        ],
      },
    ],
  },

  refund: {
    title: "Refund policy",
    lede: "Nothing is charged online yet, so there is nothing to refund.",
    updated: LAST_UPDATED,
    sections: [
      {
        heading: "Today",
        body: [
          "The Free plan costs nothing. Paid plans are shown on the pricing page, but online payment is not switched on, so no one is billed.",
        ],
      },
      {
        heading: "When billing opens",
        body: [
          "This page will set out exactly how refunds work before you are asked to pay anything. If you are unsure, ask first through the contact page.",
        ],
      },
    ],
  },

  about: {
    title: "About Shisho AI",
    lede: "Every good lawyer had a teacher. Most juniors now don't. Shisho is built to be that teacher.",
    sections: [
      {
        heading: "What it is",
        body: [
          "An Indian legal-education and drafting product. It teaches how litigation documents are built, holds the authorities they rest on, and marks up a draft the way a senior advocate would — in the margin, clause by clause, with the Indian provision named.",
        ],
      },
      {
        heading: "Who it is for",
        body: [
          "Law students, junior advocates and practising litigators — one continuous arc, from learning to read law to checking a citation before a hearing.",
        ],
      },
      {
        heading: "How we work",
        body: [
          "Indian law only — the CPC, the Bharatiya Sakshya Adhiniyam and the Bar Council of India's rules, across the courts of the country.",
          "Every citation is checked against a real source before it is published.",
          "Where something is planned and not built, we say so, and we do not claim customers or results we do not have. Shisho AI is pre-launch.",
        ],
      },
    ],
  },
  how: {
    title: "How Shisho works",
    lede: "What happens to your words, what is checked against a source, and what is not.",
    updated: LAST_UPDATED,
    sections: [
      {
        heading: "What happens when you ask for a draft or a review",
        body: [
          "Your text, and any file you attach, are sent to an AI model provider — Google (Gemini) or Anthropic (Claude), depending on how the service is set up — which writes the draft or the notes.",
          "If no model is connected, Shisho runs in demo mode and says so on screen. Demo notes come from a small set of sample patterns, not from reading your draft.",
        ],
      },
      {
        heading: "What is saved",
        body: [
          "Your account email and plan, a count of reviews used this month, and, if you connect Google Drive, a token for the folder you chose. The text of your drafts and uploads is not saved in Shisho's own database.",
        ],
      },
      {
        heading: "What is checked against a source",
        body: [
          "Every citation in the Legal Library was checked against a real published copy before it was added. Case digests are written from the judgment's own text, not from memory.",
          "The provisions on the document pages, the limitation periods in the checker and the IPC to BNS mappings were each checked against published text. Each shows its source.",
        ],
      },
      {
        heading: "What is not checked",
        body: [
          "A draft or a note written by the model is not verified automatically. It can be wrong or incomplete. Shisho is told never to invent a case or a section, and to leave a gap rather than guess, but you must still read the draft and check every authority before you file.",
          "A \"Why this matters\" note appears under a review note only when its authority matches one of our document pages exactly. If it does not match, nothing is shown rather than a guess.",
        ],
      },
    ],
  },
};

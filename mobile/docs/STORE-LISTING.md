# Play Store listing — draft

Draft text for Google Play, written from what the app actually does on 21 Oct 2026. Re-check every line against the app before submitting, and check each field's current length limit in the Play Console (the limits noted here were right when written, not guaranteed). Nothing here claims users, reviews, ratings or results: the product is pre-launch (`PRODUCT.md`).

## App name

Shisho AI

## Short description (80 characters at most)

Indian law tools, mock tests and a drafting mentor that marks up your work.

## Full description

Every great lawyer had a shisho — a senior who handed back your draft with the margin full of notes. Shisho AI is that mentor for Indian law, built for law students, junior and senior advocates, and everyone the law touches.

DRAFT AND REVIEW WITH SHISHO
• Describe the facts and get a first draft of a notice, plaint, application or contract.
• Paste a draft and get it back marked up clause by clause, each note naming the Indian provision it rests on.
• Prepare for a hearing: issues, likely questions from the bench, provisions to check.

TOOLS FOR EVERY GROUP
• Contract review for corporate lawyers: must-fix, consider and sound clauses, with what the contract leaves out.
• Case record for judges: parties, issues, facts, a chronology and the authorities relied on, arranged neutrally from the papers.
• Lesson plans for lecturers, with cases drawn only from the verified Library.
• Plain-language answers in English or Hindi: what a notice or summons means, any time limit, and what you can do next.
• Exam revision: key points and self-test questions for each module of your course.

PRACTISE AND REVISE, OFFLINE
• Mock tests for CLAT legal knowledge, judicial services prelims and court staff exams — timed, with every answer explained and its source named.
• Trace a doctrine: the Library's judgments as timelines by subject or by provision, with your own notes.
• Limitation checker, IPC to BNS, the Bare Acts, the documents filed at each stage of a civil case, and the Advocate Clerks' manual — all work with no signal.
• Case-brief practice, a moot kit, spaced revision and next-date reminders.

CITATIONS YOU CAN CHECK
Every judgment in the Library links to its full text. When Shisho names an authority, the app marks whether it is in Shisho's verified list or should be checked before you rely on it.

PLANS
Free to start. Paid plans are bought one month at a time and do not renew by themselves.

Shisho AI is an educational and drafting tool. It does not give legal advice, and using it creates no advocate–client relationship.

## Category

Education (alternative: Books & Reference). Decide one; it can be changed later.

## Contact

Support email: not set yet (`NEXT_PUBLIC_CONTACT_EMAIL` is still empty). Required before submission.

## Data safety — answers from the code (re-check against the current form)

| Data | Collected? | Why | Shared? |
|---|---|---|---|
| Email address | Yes, if the person creates an account | Sign-in, plan | No; stored by Shisho's service (Supabase) |
| Password | Sent at sign-in, never stored by the app | Sign-in | No |
| Text and files sent to Shisho's tools | Yes, when the person runs a tool | Producing the answer | Yes: passed to the AI provider (Google Gemini, or Anthropic if configured) to generate the answer; Shisho does not keep it |
| Random device ID | Yes | Counting the free monthly allowance | No |
| Payment details | Not collected by the app; entered on Razorpay's page | Buying a plan | Razorpay processes the payment; Shisho stores only the plan, amount and payment reference |
| Saved results, notes, test scores, briefs | Stay on the phone only | — | No |

Encryption in transit: yes (HTTPS) for the live service. Account deletion: in the app (Menu → account → Delete my account).

## Screenshots to capture

Home, Shisho (a marked-up draft), a mock test question and its result page, Trace a doctrine, Contract review result, Limitation checker. Capture from a release build at the Play Console's current required sizes.

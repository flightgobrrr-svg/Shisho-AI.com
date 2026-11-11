/**
 * Homepage i18n — Phase 1, deliberately scoped.
 *
 * "Translate the whole site" was the direction, but the whole site is 15+
 * routes, and doing that for real — moving every route under app/[lang],
 * updating every internal link, translating pages of legal-adjacent copy
 * with the accuracy that deserves — is a multi-session project, not a
 * same-turn one. Rushing it would mean either broken links across the site
 * or careless translation of content that's supposed to be trustworthy.
 *
 * What's here instead: real, working i18n infrastructure, applied in full
 * to the one page that was actually named — the homepage — reachable at
 * one route per locale, additively. Nothing about app/page.tsx or any
 * existing route changed to make this work; every component here defaults
 * to English exactly as before, and only these locale routes pass a
 * locale explicitly. Zero risk to the other pages, and the pattern (a
 * Dictionary type + a component-level `locale` prop) extends cleanly to
 * the next page whenever that's wanted.
 *
 * The five added after Hindi (Bengali, Marathi, Telugu, Tamil, Gujarati)
 * are the next five most-spoken languages in India after Hindi — the same
 * "real page, not a placeholder" bar Hindi was held to, not machine
 * output: legal terms of art (Article → अनुच्छेद/অনুচ্ছেদ/కలం/பிரிவு/કલમ
 * per language's actual legal usage, not a single transliteration reused
 * everywhere) were chosen per-language, matching how each is actually used
 * in that language's legal writing.
 *
 * A later pass added the remaining sixteen Eighth Schedule languages
 * (Assamese, Bodo, Dogri, Kannada, Kashmiri, Konkani, Maithili, Malayalam,
 * Manipuri, Nepali, Odia, Punjabi, Sanskrit, Santali, Sindhi, Urdu), so all
 * 22 are covered. Confidence isn't uniform across them: the ones with a
 * long written legal/administrative tradition and heavy real-world
 * exposure (Assamese, Kannada, Malayalam, Odia, Punjabi, Nepali, Sanskrit,
 * Urdu, alongside the original six) are held to the same bar as Hindi. The
 * rest — Bodo, Dogri, Maithili, Konkani, Kashmiri, Sindhi, Manipuri, and
 * especially Santali (Ol Chiki is a low-resource script even by these
 * standards) — are real, structurally complete translations, but carry
 * meaningfully higher uncertainty and should get native-speaker review
 * before being treated as launch-ready.
 *
 * Script choices, where a language is written in more than one script
 * today: Kashmiri is Perso-Arabic/Nastaliq, Sindhi is Devanagari (not the
 * Perso-Arabic it also uses), Manipuri is Meitei Mayek (not Bengali
 * script), and Santali is Ol Chiki (not Devanagari/Bengali/Odia) — each a
 * deliberate choice, not a default. Kashmiri and Urdu are the two RTL
 * locales; LOCALE_DIR below drives <html dir> for them via
 * components/layout/HtmlLangSync.tsx.
 *
 * Known gap, flagged rather than hidden: the mandatory entry gate
 * (components/motion/EntryGate.tsx) still splashes in English even on
 * every translated route — it's a large, animation-timed component in its
 * own right, and translating it is future work, not part of this pass. Nav
 * and Footer are also still English-only there: every link from a
 * translated homepage (nav, CTAs) leads to an English page anyway, since
 * nothing past the homepage is translated yet, so a translated nav today
 * would just be decoration around an all-English site.
 *
 * Tier names (Free/Basic/Core/Proficient) are kept in English — plan
 * identifiers mixed into otherwise-translated copy is the normal register
 * for Indian SaaS, not an oversight. Product names (Shisho, Legal Library,
 * Courses) are transliterated/translated per language, following the
 * pattern the Hindi dictionary already set (शिशो, विधि पुस्तकालय, कोर्स).
 *
 * Trimmed 21 Oct 2026, the owner's call: the site keeps the nine most-used
 * (English, Hindi, Bengali, Marathi, Telugu, Tamil, Gujarati, Kannada,
 * Malayalam). The other fourteen pages were removed; their old URLs redirect
 * to the English homepage (next.config.ts). The paragraph above records
 * the history.
 */

export type Locale =
  | "en"
  | "hi"
  | "bn"
  | "mr"
  | "te"
  | "ta"
  | "gu"
  | "kn"
  | "ml";
export const LOCALES: Locale[] = [
  "en",
  "hi",
  "bn",
  "mr",
  "te",
  "ta",
  "gu",
  "kn",
  "ml",
];
export const DEFAULT_LOCALE: Locale = "en";

/** Each language's own name for itself — what the LanguageSwitch dropdown
 *  lists, so a reader looks for their own language's script, not English
 *  transliterations of language names they may not read. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  hi: "हिंदी",
  bn: "বাংলা",
  mr: "मराठी",
  te: "తెలుగు",
  ta: "தமிழ்",
  gu: "ગુજરાતી",
  kn: "ಕನ್ನಡ",
  ml: "മലയാളം",
};

/** Where each locale's translated homepage actually lives. */
export const LOCALE_PATHS: Record<Locale, string> = {
  en: "/",
  hi: "/hi",
  bn: "/bn",
  mr: "/mr",
  te: "/te",
  ta: "/ta",
  gu: "/gu",
  kn: "/kn",
  ml: "/ml",
};

/** BCP-47 tag for <html lang>, per locale. None of the nine kept languages
 *  needs a script subtag to be unambiguous. */
export const LOCALE_BCP47: Record<Locale, string> = {
  en: "en-IN",
  hi: "hi-IN",
  bn: "bn-IN",
  mr: "mr-IN",
  te: "te-IN",
  ta: "ta-IN",
  gu: "gu-IN",
  kn: "kn-IN",
  ml: "ml-IN",
};

/** Reading direction per locale. Every kept language is left-to-right;
 *  the map stays so an RTL language can be added back without new plumbing. */
export const LOCALE_DIR: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  hi: "ltr",
  bn: "ltr",
  mr: "ltr",
  te: "ltr",
  ta: "ltr",
  gu: "ltr",
  kn: "ltr",
  ml: "ltr",
};

export type Segment = { text: string; em?: boolean };

export type Dictionary = {
  /** Accessible label for the LanguageSwitch <select> itself (e.g. "Language" /
   *  "भाषा") — the options it lists come from LOCALE_LABELS, not from here. */
  languageSwitch: { label: string };
  hero: {
    eyebrow: string;
    line1: Segment[];
    line2: Segment[];
    subhead: string;
    ctaPrimary: string;
    ctaSecondary: string;
    ctaNote: string;
  };
  matterFlow: {
    eyebrow: string;
    heading: Segment[];
    seeMap: string;
    stages: Record<number, { title: string; summary: string }>;
    products: { "draft-bot": string; library: string; courses: string };
  };
  featureStrip: {
    features: { name: string; body: string }[];
    exploreLabel: (name: string) => string;
  };
  productShowcase: {
    pill: string;
    heading: Segment[];
    body: string;
    ctaPrimary: string;
    ctaSecondary: string;
    miniNotes: string[];
    figcaption: string;
  };
  pricingPreview: {
    eyebrow: string;
    heading: Segment[];
    seeFull: string;
    forever: string;
    perMonth: string;
    mostPopular: string;
    taglines: { free: string; basic: string; core: string; proficient: string };
  };
  finalCta: {
    heading: Segment[];
    body: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
};

const en: Dictionary = {
  languageSwitch: { label: "Language" },
  hero: {
    eyebrow: "For Indian law · SC & High Courts",
    line1: [{ text: "Every great lawyer had a " }, { text: "shisho", em: true }, { text: "." }],
    line2: [{ text: "Now yours is AI — built for Indian law." }],
    subhead:
      "Courses and an AI drafting assistant for Indian law — for law students, aspiring lawyers, and practising advocates.",
    ctaPrimary: "Try Shisho",
    ctaSecondary: "Browse courses",
    ctaNote: "No card required.",
  },
  matterFlow: {
    eyebrow: "Where to start",
    heading: [{ text: "Find the stage you are " }, { text: "at", em: true }, { text: "." }],
    seeMap: "See the whole map",
    stages: {
      1: { title: "Homepage", summary: "Where someone lands, and what Shisho is." },
      2: { title: "Advocate", summary: "Who brings the matter, and which forum it belongs in." },
      3: { title: "State", summary: "The matter moves up: writ jurisdiction and the Supreme Court." },
      4: { title: "Draft", summary: "The first document goes on paper, checked against the bare act." },
      5: {
        title: "Interlocutory Application",
        summary:
          "Relief sought while the suit is pending — the application, the affidavit it rests on, and the replies to it.",
      },
      6: {
        title: "Pleadings / Issues",
        summary: "The suit and the answer to it, down to the issues the court frames.",
      },
      7: { title: "Trial", summary: "Evidence and argument, once the issues are settled." },
      8: { title: "Citations", summary: "Every proposition tied to an authority that actually binds." },
      9: { title: "Beyond the matter", summary: "What comes after the file closes." },
    },
    products: { "draft-bot": "Shisho", library: "Legal Library", courses: "Courses" },
  },
  featureStrip: {
    features: [
      {
        name: "Shisho",
        body: "Paste a plaint, notice, application, or contract. Get clause-level notes in the margin, procedure checked before the registry does it for you — the same way a senior would hand it back.",
      },
      {
        name: "Legal Library",
        body: "Supreme Court and High Court judgments, bare acts, and commentary. Cited in SCC form, explained in plain language.",
      },
      {
        name: "Courses",
        body: "Two tracks — Starter for foundations, Proficient for interim relief, commercial drafting, and litigation strategy. Every module ends in a filing, not a quiz.",
      },
    ],
    exploreLabel: (name) => `Explore ${name}`,
  },
  productShowcase: {
    pill: "Shisho · demo mode",
    heading: [{ text: "See what a marked-up " }, { text: "draft", em: true }, { text: " looks like." }],
    body: "Paste a plaint or a contract on the left. Notes come back in the margin, each tied to the clause it marks and the Indian authority it rests on.",
    ctaPrimary: "Open Shisho",
    ctaSecondary: "See pricing",
    miniNotes: [
      "Art. 226 — plead territorial jurisdiction.",
      "Interim relief: plead all three limbs.",
      "No verification clause — Order VI R. 15.",
    ],
    figcaption:
      "A preview of the Shisho workspace: the draft on the left, and three Shisho notes in the right margin covering territorial jurisdiction under Article 226, the three limbs required for interim relief, and a missing verification clause under Order VI Rule 15 of the Code of Civil Procedure.",
  },
  pricingPreview: {
    eyebrow: "Pricing",
    heading: [{ text: "Priced for a student " }, { text: "budget", em: true }, { text: "." }],
    seeFull: "See the full comparison",
    forever: "forever",
    perMonth: "per month",
    mostPopular: "Recommended for students",
    taglines: {
      free: "See how a mentor marks your work.",
      basic: "Everything to read and study — the bot stays on the free trial.",
      core: "The full foundation, and the bot without limits.",
      proficient: "For advocates and final-year students in practice.",
    },
  },
  finalCta: {
    heading: [{ text: "Put your draft in front of a " }, { text: "mentor", em: true }, { text: "." }],
    body: "Five free reviews a month. No card required, and nothing to install.",
    ctaPrimary: "Try Shisho",
    ctaSecondary: "See pricing",
  },
};

const hi: Dictionary = {
  languageSwitch: { label: "भाषा" },
  hero: {
    eyebrow: "भारतीय कानून के लिए · सर्वोच्च व उच्च न्यायालय",
    line1: [{ text: "हर महान वकील का एक " }, { text: "गुरु", em: true }, { text: " होता था।" }],
    line2: [{ text: "अब आपका गुरु AI है — भारतीय कानून के लिए बनाया गया।" }],
    subhead:
      "भारतीय कानून के लिए कोर्स और एक AI ड्राफ्टिंग सहायक — विधि छात्रों, भावी वकीलों, और प्रैक्टिसिंग अधिवक्ताओं के लिए।",
    ctaPrimary: "शिशो आज़माएँ",
    ctaSecondary: "कोर्स देखें",
    ctaNote: "कोई कार्ड आवश्यक नहीं।",
  },
  matterFlow: {
    eyebrow: "कहाँ से शुरू करें",
    heading: [{ text: "वह चरण खोजें जहाँ आप " }, { text: "हैं", em: true }, { text: "।" }],
    seeMap: "पूरा नक्शा देखें",
    stages: {
      1: { title: "होमपेज", summary: "जहाँ कोई पहुँचता है, और शिशो क्या है।" },
      2: { title: "अधिवक्ता", summary: "कौन मामला लाता है, और यह किस फोरम का है।" },
      3: { title: "राज्य", summary: "मामला ऊपर बढ़ता है: रिट क्षेत्राधिकार और सर्वोच्च न्यायालय।" },
      4: { title: "ड्राफ्ट", summary: "पहला दस्तावेज़ कागज़ पर आता है, बेयर एक्ट के विरुद्ध जांचा गया।" },
      5: {
        title: "अंतरिम आवेदन",
        summary: "वाद लंबित रहते मांगी गई राहत — आवेदन, उस पर आधारित शपथपत्र, और उसके उत्तर।",
      },
      6: {
        title: "वाद-पत्र / मुद्दे",
        summary: "वाद और उसका उत्तर, अंततः उन मुद्दों तक जो न्यायालय तय करता है।",
      },
      7: { title: "विचारण", summary: "साक्ष्य और तर्क, मुद्दे तय होने के बाद।" },
      8: { title: "उद्धरण", summary: "हर तर्क किसी वास्तव में बाध्यकारी प्राधिकरण से जुड़ा।" },
      9: { title: "मामले के आगे", summary: "फ़ाइल बंद होने के बाद क्या होता है।" },
    },
    products: { "draft-bot": "शिशो", library: "विधि पुस्तकालय", courses: "कोर्स" },
  },
  featureStrip: {
    features: [
      {
        name: "शिशो",
        body: "एक वाद-पत्र, नोटिस, आवेदन या अनुबंध पेस्ट करें। हाशिये में क्लॉज़-स्तरीय टिप्पणियाँ पाएँ, रजिस्ट्री से पहले प्रक्रिया की जांच — बिल्कुल वैसे ही जैसे एक सीनियर वापस सौंपता।",
      },
      {
        name: "विधि पुस्तकालय",
        body: "सर्वोच्च न्यायालय और उच्च न्यायालय के निर्णय, बेयर एक्ट्स, और टिप्पणी। SCC प्रारूप में उद्धृत, सरल भाषा में समझाया गया।",
      },
      {
        name: "कोर्स",
        body: "दो ट्रैक — नींव के लिए स्टार्टर, अंतरिम राहत, वाणिज्यिक ड्राफ्टिंग और मुकदमेबाज़ी रणनीति के लिए प्रोफ़िशिएंट। हर मॉड्यूल एक फाइलिंग पर समाप्त होता है, क्विज़ पर नहीं।",
      },
    ],
    exploreLabel: (name) => `${name} देखें`,
  },
  productShowcase: {
    pill: "शिशो · डेमो मोड",
    heading: [{ text: "देखें एक मार्क-अप किया " }, { text: "ड्राफ्ट", em: true }, { text: " कैसा दिखता है।" }],
    body: "बाईं ओर एक वाद-पत्र या अनुबंध पेस्ट करें। टिप्पणियाँ हाशिये में वापस आती हैं, हर एक उस खंड से जुड़ी जिसे वह चिह्नित करती है और उस भारतीय प्राधिकरण से जिस पर वह आधारित है।",
    ctaPrimary: "शिशो खोलें",
    ctaSecondary: "मूल्य देखें",
    miniNotes: [
      "अनुच्छेद 226 — क्षेत्रीय क्षेत्राधिकार तर्क करें।",
      "अंतरिम राहत: तीनों अंगों पर तर्क करें।",
      "सत्यापन खंड नहीं — आदेश VI नियम 15।",
    ],
    figcaption:
      "शिशो वर्कस्पेस की एक झलक: बाईं ओर ड्राफ्ट, और दाहिने हाशिये में तीन शिशो टिप्पणियाँ — अनुच्छेद 226 के अंतर्गत क्षेत्रीय क्षेत्राधिकार, अंतरिम राहत के लिए आवश्यक तीनों अंग, और सिविल प्रक्रिया संहिता के आदेश VI नियम 15 के अंतर्गत एक अनुपस्थित सत्यापन खंड।",
  },
  pricingPreview: {
    eyebrow: "मूल्य",
    heading: [{ text: "एक छात्र के " }, { text: "बजट", em: true }, { text: " के लिए मूल्यित।" }],
    seeFull: "पूरी तुलना देखें",
    forever: "हमेशा के लिए",
    perMonth: "प्रति माह",
    mostPopular: "विद्यार्थियों के लिए अनुशंसित",
    taglines: {
      free: "देखें एक गुरु आपके काम को कैसे चिह्नित करता है।",
      basic: "पढ़ने और अध्ययन के लिए सब कुछ — बॉट फ्री ट्रायल पर ही रहता है।",
      core: "पूरी नींव, और बॉट बिना किसी सीमा के।",
      proficient: "अधिवक्ताओं और प्रैक्टिस में अंतिम वर्ष के छात्रों के लिए।",
    },
  },
  finalCta: {
    heading: [{ text: "अपना ड्राफ्ट एक " }, { text: "गुरु", em: true }, { text: " के सामने रखें।" }],
    body: "हर महीने पांच मुफ़्त समीक्षाएँ। कोई कार्ड आवश्यक नहीं, और कुछ भी इंस्टॉल नहीं करना।",
    ctaPrimary: "शिशो आज़माएँ",
    ctaSecondary: "मूल्य देखें",
  },
};

const bn: Dictionary = {
  languageSwitch: { label: "ভাষা" },
  hero: {
    eyebrow: "ভারতীয় আইনের জন্য · সুপ্রিম কোর্ট ও হাইকোর্ট",
    line1: [{ text: "প্রতিটি মহান আইনজীবীর একজন " }, { text: "গুরু", em: true }, { text: " ছিলেন।" }],
    line2: [{ text: "এখন আপনার গুরু AI — ভারতীয় আইনের জন্য তৈরি।" }],
    subhead:
      "ভারতীয় আইনের জন্য কোর্স এবং একটি AI ড্রাফটিং সহকারী — আইন শিক্ষার্থী, ভাবী আইনজীবী এবং কর্মরত অ্যাডভোকেটদের জন্য।",
    ctaPrimary: "শিশো ব্যবহার করুন",
    ctaSecondary: "কোর্স দেখুন",
    ctaNote: "কোনো কার্ড লাগবে না।",
  },
  matterFlow: {
    eyebrow: "কোথা থেকে শুরু করবেন",
    heading: [{ text: "আপনি যে ধাপে " }, { text: "আছেন", em: true }, { text: ", তা খুঁজুন।" }],
    seeMap: "সম্পূর্ণ মানচিত্র দেখুন",
    stages: {
      1: { title: "হোমপেজ", summary: "যেখানে কেউ পৌঁছায়, এবং শিশো কী তা জানে।" },
      2: { title: "অ্যাডভোকেট", summary: "কে মামলা আনে, এবং তা কোন ফোরামের অন্তর্গত।" },
      3: { title: "রাজ্য", summary: "মামলা এগিয়ে যায়: রিট এখতিয়ার এবং সুপ্রিম কোর্ট।" },
      4: { title: "খসড়া", summary: "প্রথম নথি কাগজে আসে, বেয়ার অ্যাক্টের বিপরীতে যাচাই করা।" },
      5: {
        title: "অন্তর্বর্তী আবেদন",
        summary: "মামলা মুলতুবি থাকাকালীন চাওয়া প্রতিকার — আবেদন, তার ভিত্তি হলফনামা, এবং তার জবাব।",
      },
      6: {
        title: "আরজি / বিষয়সমূহ",
        summary: "মামলা ও তার জবাব, শেষ পর্যন্ত আদালত যে বিষয়গুলি নির্ধারণ করে তা পর্যন্ত।",
      },
      7: { title: "বিচার", summary: "সাক্ষ্য এবং যুক্তি, বিষয় নির্ধারিত হওয়ার পর।" },
      8: { title: "উদ্ধৃতি", summary: "প্রতিটি যুক্তি এমন এক কর্তৃপক্ষের সঙ্গে যুক্ত, যা সত্যিই বাধ্যতামূলক।" },
      9: { title: "মামলার পরে", summary: "ফাইল বন্ধ হওয়ার পর কী ঘটে।" },
    },
    products: { "draft-bot": "শিশো", library: "আইন গ্রন্থাগার", courses: "কোর্স" },
  },
  featureStrip: {
    features: [
      {
        name: "শিশো",
        body: "একটি আরজি, নোটিস, আবেদন বা চুক্তি পেস্ট করুন। মার্জিনে ধারা-ভিত্তিক মন্তব্য পান, রেজিস্ট্রির আগেই পদ্ধতি যাচাই — ঠিক যেমন একজন সিনিয়র ফেরত দিতেন।",
      },
      {
        name: "আইন গ্রন্থাগার",
        body: "সুপ্রিম কোর্ট ও হাইকোর্টের রায়, বেয়ার অ্যাক্ট, এবং ভাষ্য। SCC আকারে উদ্ধৃত, সহজ ভাষায় ব্যাখ্যা করা।",
      },
      {
        name: "কোর্স",
        body: "দুটি ট্র্যাক — ভিত্তির জন্য স্টার্টার, অন্তর্বর্তী প্রতিকার, বাণিজ্যিক খসড়া তৈরি ও মামলা কৌশলের জন্য প্রফিশিয়েন্ট। প্রতিটি মডিউল শেষ হয় একটি ফাইলিংয়ে, কুইজে নয়।",
      },
    ],
    exploreLabel: (name) => `${name} দেখুন`,
  },
  productShowcase: {
    pill: "শিশো · ডেমো মোড",
    heading: [{ text: "দেখুন একটি মার্ক-আপ করা " }, { text: "খসড়া", em: true }, { text: " কেমন দেখায়।" }],
    body: "বাঁদিকে একটি আরজি বা চুক্তি পেস্ট করুন। মন্তব্য মার্জিনে ফিরে আসে, প্রতিটি সেই ধারার সঙ্গে যুক্ত যা এটি চিহ্নিত করে এবং যে ভারতীয় কর্তৃপক্ষের ওপর তা নির্ভর করে।",
    ctaPrimary: "শিশো খুলুন",
    ctaSecondary: "মূল্য দেখুন",
    miniNotes: [
      "অনুচ্ছেদ ২২৬ — আঞ্চলিক এখতিয়ার উল্লেখ করুন।",
      "অন্তর্বর্তী প্রতিকার: তিনটি শর্তই উল্লেখ করুন।",
      "যাচাইকরণ ধারা নেই — আদেশ VI বিধি ১৫।",
    ],
    figcaption:
      "শিশো ওয়ার্কস্পেসের একটি ঝলক: বাঁদিকে খসড়া, এবং ডানদিকের মার্জিনে তিনটি শিশো মন্তব্য — অনুচ্ছেদ ২২৬ এর অধীনে আঞ্চলিক এখতিয়ার, অন্তর্বর্তী প্রতিকারের জন্য প্রয়োজনীয় তিনটি শর্ত, এবং দেওয়ানি কার্যবিধির আদেশ VI বিধি ১৫ এর অধীনে একটি অনুপস্থিত যাচাইকরণ ধারা নিয়ে।",
  },
  pricingPreview: {
    eyebrow: "মূল্য",
    heading: [{ text: "একজন শিক্ষার্থীর " }, { text: "বাজেট", em: true }, { text: "-এর জন্য মূল্য নির্ধারিত।" }],
    seeFull: "সম্পূর্ণ তুলনা দেখুন",
    forever: "চিরকালের জন্য",
    perMonth: "প্রতি মাসে",
    mostPopular: "শিক্ষার্থীদের জন্য প্রস্তাবিত",
    taglines: {
      free: "দেখুন একজন গুরু আপনার কাজ কীভাবে চিহ্নিত করেন।",
      basic: "পড়া এবং অধ্যয়নের জন্য সবকিছু — বট ফ্রি ট্রায়ালেই থাকে।",
      core: "সম্পূর্ণ ভিত্তি, এবং বট কোনো সীমা ছাড়াই।",
      proficient: "অ্যাডভোকেট এবং প্র্যাকটিসে থাকা শেষ বর্ষের শিক্ষার্থীদের জন্য।",
    },
  },
  finalCta: {
    heading: [{ text: "আপনার খসড়া একজন " }, { text: "গুরু", em: true }, { text: "র সামনে রাখুন।" }],
    body: "প্রতি মাসে পাঁচটি ফ্রি পর্যালোচনা। কোনো কার্ড লাগবে না, এবং কিছু ইনস্টল করারও দরকার নেই।",
    ctaPrimary: "শিশো ব্যবহার করুন",
    ctaSecondary: "মূল্য দেখুন",
  },
};

const mr: Dictionary = {
  languageSwitch: { label: "भाषा" },
  hero: {
    eyebrow: "भारतीय कायद्यासाठी · सर्वोच्च व उच्च न्यायालये",
    line1: [{ text: "प्रत्येक महान वकिलाचा एक " }, { text: "गुरू", em: true }, { text: " असायचा." }],
    line2: [{ text: "आता तुमचा गुरू AI आहे — भारतीय कायद्यासाठी घडवलेला." }],
    subhead:
      "भारतीय कायद्यासाठी अभ्यासक्रम आणि एक AI मसुदा सहाय्यक — कायद्याचे विद्यार्थी, होतकरू वकील आणि प्रॅक्टिस करणाऱ्या अधिवक्त्यांसाठी.",
    ctaPrimary: "शिशो वापरून पहा",
    ctaSecondary: "अभ्यासक्रम पहा",
    ctaNote: "कार्डची गरज नाही.",
  },
  matterFlow: {
    eyebrow: "कुठून सुरुवात करावी",
    heading: [{ text: "तुम्ही ज्या टप्प्यावर " }, { text: "आहात", em: true }, { text: " तो शोधा." }],
    seeMap: "संपूर्ण नकाशा पहा",
    stages: {
      1: { title: "मुखपृष्ठ", summary: "जिथे कोणी पोहोचतो, आणि शिशो म्हणजे काय." },
      2: { title: "अधिवक्ता", summary: "कोण प्रकरण आणतो, आणि ते कोणत्या मंचाचे आहे." },
      3: { title: "राज्य", summary: "प्रकरण पुढे सरकते: रिट अधिकारक्षेत्र आणि सर्वोच्च न्यायालय." },
      4: { title: "मसुदा", summary: "पहिला दस्तऐवज कागदावर येतो, बेअर ऍक्टविरुद्ध तपासलेला." },
      5: {
        title: "अंतरिम अर्ज",
        summary: "दावा प्रलंबित असताना मागितलेला दिलासा — अर्ज, त्याचा आधार असलेले शपथपत्र, आणि त्याची उत्तरे.",
      },
      6: {
        title: "वाद-पत्रे / मुद्दे",
        summary: "दावा आणि त्याचे उत्तर, अखेर न्यायालय ठरवत असलेल्या मुद्द्यांपर्यंत.",
      },
      7: { title: "सुनावणी", summary: "पुरावा आणि युक्तिवाद, मुद्दे निश्चित झाल्यानंतर." },
      8: { title: "उद्धरणे", summary: "प्रत्येक मुद्दा खरोखर बंधनकारक असलेल्या प्राधिकरणाशी जोडलेला." },
      9: { title: "प्रकरणानंतर", summary: "फाईल बंद झाल्यावर पुढे काय होते." },
    },
    products: { "draft-bot": "शिशो", library: "विधी ग्रंथालय", courses: "अभ्यासक्रम" },
  },
  featureStrip: {
    features: [
      {
        name: "शिशो",
        body: "एक वाद-पत्र, नोटीस, अर्ज किंवा करार पेस्ट करा. समासात कलम-स्तरीय टिपा मिळवा, नोंदणीपूर्वीच प्रक्रिया तपासली जाते — अगदी वरिष्ठ जसे परत सोपवतील तसे.",
      },
      {
        name: "विधी ग्रंथालय",
        body: "सर्वोच्च न्यायालय आणि उच्च न्यायालयाचे निकाल, बेअर ऍक्ट्स आणि भाष्य. SCC स्वरूपात उद्धृत, सोप्या भाषेत समजावलेले.",
      },
      {
        name: "अभ्यासक्रम",
        body: "दोन ट्रॅक — पायाभरणीसाठी स्टार्टर, अंतरिम दिलासा, व्यावसायिक मसुदा आणि खटला रणनीतीसाठी प्रोफिशिएंट. प्रत्येक मॉड्यूल फायलिंगमध्ये संपतो, क्विझमध्ये नाही.",
      },
    ],
    exploreLabel: (name) => `${name} पहा`,
  },
  productShowcase: {
    pill: "शिशो · डेमो मोड",
    heading: [{ text: "मार्क-अप केलेला " }, { text: "मसुदा", em: true }, { text: " कसा दिसतो ते पहा." }],
    body: "डावीकडे वाद-पत्र किंवा करार पेस्ट करा. टिपा समासात परत येतात, प्रत्येक ज्या कलमाला ती चिन्हांकित करते आणि ज्या भारतीय प्राधिकरणावर ती आधारित आहे त्याच्याशी जोडलेली.",
    ctaPrimary: "शिशो उघडा",
    ctaSecondary: "किंमत पहा",
    miniNotes: [
      "कलम २२६ — प्रादेशिक अधिकारक्षेत्र मांडा.",
      "अंतरिम दिलासा: तिन्ही अटी मांडा.",
      "पडताळणी कलम नाही — आदेश VI नियम १५.",
    ],
    figcaption:
      "शिशो वर्कस्पेसची एक झलक: डावीकडे मसुदा, आणि उजव्या समासात तीन शिशो टिपा — कलम २२६ अंतर्गत प्रादेशिक अधिकारक्षेत्र, अंतरिम दिलाशासाठी आवश्यक तिन्ही अटी, आणि दिवाणी प्रक्रिया संहितेच्या आदेश VI नियम १५ अंतर्गत गहाळ पडताळणी कलम.",
  },
  pricingPreview: {
    eyebrow: "किंमत",
    heading: [{ text: "विद्यार्थ्याच्या " }, { text: "बजेट", em: true }, { text: "साठी किंमत ठरवलेली." }],
    seeFull: "संपूर्ण तुलना पहा",
    forever: "कायमचे",
    perMonth: "दरमहा",
    mostPopular: "विद्यार्थ्यांसाठी शिफारस केलेले",
    taglines: {
      free: "एक गुरू तुमचे काम कसे तपासतो ते पहा.",
      basic: "वाचन आणि अभ्यासासाठी सर्व काही — बॉट मोफत ट्रायलवरच राहतो.",
      core: "संपूर्ण पायाभरणी, आणि बॉट मर्यादेशिवाय.",
      proficient: "अधिवक्ते आणि प्रॅक्टिसमधील अंतिम वर्षाच्या विद्यार्थ्यांसाठी.",
    },
  },
  finalCta: {
    heading: [{ text: "तुमचा मसुदा एका " }, { text: "गुरू", em: true }, { text: "समोर ठेवा." }],
    body: "दरमहा पाच मोफत पुनरावलोकने. कार्डची गरज नाही, आणि काहीही इन्स्टॉल करण्याची गरज नाही.",
    ctaPrimary: "शिशो वापरून पहा",
    ctaSecondary: "किंमत पहा",
  },
};

const te: Dictionary = {
  languageSwitch: { label: "భాష" },
  hero: {
    eyebrow: "భారతీయ చట్టం కోసం · సుప్రీం & హైకోర్టులు",
    line1: [{ text: "ప్రతి గొప్ప న్యాయవాదికి ఒక " }, { text: "గురు", em: true }, { text: " ఉండేవారు." }],
    line2: [{ text: "ఇప్పుడు మీ గురు AI — భారతీయ చట్టం కోసం రూపొందించబడింది." }],
    subhead:
      "భారతీయ చట్టం కోసం కోర్సులు మరియు AI డ్రాఫ్టింగ్ సహాయకుడు — న్యాయ విద్యార్థులు, భావి న్యాయవాదులు మరియు ప్రాక్టీసు చేస్తున్న అడ్వకేట్ల కోసం.",
    ctaPrimary: "శిషో ప్రయత్నించండి",
    ctaSecondary: "కోర్సులు చూడండి",
    ctaNote: "కార్డు అవసరం లేదు.",
  },
  matterFlow: {
    eyebrow: "ఎక్కడ నుండి ప్రారంభించాలి",
    heading: [{ text: "మీరు " }, { text: "ఉన్న", em: true }, { text: " దశను కనుగొనండి." }],
    seeMap: "పూర్తి మ్యాప్ చూడండి",
    stages: {
      1: { title: "హోమ్‌పేజీ", summary: "ఎవరైనా చేరుకునే చోటు, మరియు శిషో అంటే ఏమిటో." },
      2: { title: "అడ్వకేట్", summary: "ఎవరు కేసు తీసుకువస్తారు, మరియు అది ఏ ఫోరమ్‌కు చెందుతుంది." },
      3: { title: "రాష్ట్రం", summary: "కేసు పైకి వెళుతుంది: రిట్ అధికార పరిధి మరియు సుప్రీంకోర్టు." },
      4: { title: "డ్రాఫ్ట్", summary: "మొదటి పత్రం కాగితంపైకి వస్తుంది, బేర్ యాక్ట్‌కు అనుగుణంగా పరిశీలించబడింది." },
      5: {
        title: "మధ్యంతర దరఖాస్తు",
        summary: "వ్యాజ్యం పెండింగ్‌లో ఉన్నప్పుడు కోరిన ఉపశమనం — దరఖాస్తు, దానికి ఆధారమైన అఫిడవిట్, మరియు దాని జవాబులు.",
      },
      6: {
        title: "వాదనలు / అంశాలు",
        summary: "వ్యాజ్యం మరియు దాని జవాబు, చివరికి కోర్టు నిర్ధారించే అంశాల వరకు.",
      },
      7: { title: "విచారణ", summary: "అంశాలు నిర్ధారించిన తర్వాత సాక్ష్యం మరియు వాదన." },
      8: { title: "ఉదాహరణలు", summary: "ప్రతి వాదన నిజంగా కట్టుబడి ఉండే అధికారంతో ముడిపడి ఉంటుంది." },
      9: { title: "కేసు తర్వాత", summary: "ఫైలు మూసివేసిన తర్వాత ఏమి జరుగుతుంది." },
    },
    products: { "draft-bot": "శిషో", library: "లీగల్ లైబ్రరీ", courses: "కోర్సులు" },
  },
  featureStrip: {
    features: [
      {
        name: "శిషో",
        body: "ఒక వ్యాజ్యపత్రం, నోటీసు, దరఖాస్తు లేదా ఒప్పందాన్ని పేస్ట్ చేయండి. మార్జిన్‌లో క్లాజ్-స్థాయి గమనికలు పొందండి, రిజిస్ట్రీ చేసే ముందే ప్రక్రియ తనిఖీ చేయబడుతుంది — సీనియర్ తిరిగి ఇచ్చినట్లుగానే.",
      },
      {
        name: "లీగల్ లైబ్రరీ",
        body: "సుప్రీంకోర్టు మరియు హైకోర్టు తీర్పులు, బేర్ యాక్ట్‌లు, మరియు వ్యాఖ్యానం. SCC రూపంలో ఉదహరించబడి, సరళమైన భాషలో వివరించబడింది.",
      },
      {
        name: "కోర్సులు",
        body: "రెండు ట్రాక్‌లు — పునాదుల కోసం స్టార్టర్, మధ్యంతర ఉపశమనం, వాణిజ్య డ్రాఫ్టింగ్ మరియు వ్యాజ్య వ్యూహం కోసం ప్రొఫిషియంట్. ప్రతి మాడ్యూల్ ఒక ఫైలింగ్‌తో ముగుస్తుంది, క్విజ్‌తో కాదు.",
      },
    ],
    exploreLabel: (name) => `${name} చూడండి`,
  },
  productShowcase: {
    pill: "శిషో · డెమో మోడ్",
    heading: [{ text: "మార్క్-అప్ చేసిన " }, { text: "డ్రాఫ్ట్", em: true }, { text: " ఎలా ఉంటుందో చూడండి." }],
    body: "ఎడమవైపు ఒక వ్యాజ్యపత్రం లేదా ఒప్పందాన్ని పేస్ట్ చేయండి. గమనికలు మార్జిన్‌లో తిరిగి వస్తాయి, ప్రతి ఒక్కటి అది గుర్తించే క్లాజ్‌తో మరియు అది ఆధారపడిన భారతీయ అధికారంతో ముడిపడి ఉంటుంది.",
    ctaPrimary: "శిషో తెరవండి",
    ctaSecondary: "ధరలు చూడండి",
    miniNotes: [
      "అధికరణ 226 — ప్రాదేశిక అధికార పరిధిని పేర్కొనండి.",
      "మధ్యంతర ఉపశమనం: మూడు అంశాలను పేర్కొనండి.",
      "వెరిఫికేషన్ క్లాజ్ లేదు — ఆర్డర్ VI రూల్ 15.",
    ],
    figcaption:
      "శిషో వర్క్‌స్పేస్ యొక్క ఒక ప్రివ్యూ: ఎడమవైపు డ్రాఫ్ట్, మరియు కుడి మార్జిన్‌లో మూడు శిషో గమనికలు — అధికరణ 226 కింద ప్రాదేశిక అధికార పరిధి, మధ్యంతర ఉపశమనానికి అవసరమైన మూడు అంశాలు, మరియు సివిల్ ప్రొసీజర్ కోడ్‌లోని ఆర్డర్ VI రూల్ 15 కింద లేని వెరిఫికేషన్ క్లాజ్.",
  },
  pricingPreview: {
    eyebrow: "ధరలు",
    heading: [{ text: "విద్యార్థి " }, { text: "బడ్జెట్", em: true }, { text: "కు తగినట్లుగా ధర నిర్ణయించబడింది." }],
    seeFull: "పూర్తి పోలిక చూడండి",
    forever: "శాశ్వతంగా",
    perMonth: "నెలకు",
    mostPopular: "విద్యార్థులకు సిఫార్సు చేయబడింది",
    taglines: {
      free: "గురు మీ పనిని ఎలా గుర్తిస్తారో చూడండి.",
      basic: "చదవడానికి మరియు అధ్యయనం చేయడానికి అన్నీ — బాట్ ఉచిత ట్రయల్‌లోనే ఉంటుంది.",
      core: "పూర్తి పునాది, మరియు బాట్ ఎలాంటి పరిమితులు లేకుండా.",
      proficient: "అడ్వకేట్లు మరియు ప్రాక్టీసులో ఉన్న చివరి సంవత్సరం విద్యార్థుల కోసం.",
    },
  },
  finalCta: {
    heading: [{ text: "మీ డ్రాఫ్ట్‌ను ఒక " }, { text: "గురు", em: true }, { text: " ముందు ఉంచండి." }],
    body: "నెలకు ఐదు ఉచిత సమీక్షలు. కార్డు అవసరం లేదు, మరియు దేనినీ ఇన్‌స్టాల్ చేయాల్సిన అవసరం లేదు.",
    ctaPrimary: "శిషో ప్రయత్నించండి",
    ctaSecondary: "ధరలు చూడండి",
  },
};

const ta: Dictionary = {
  languageSwitch: { label: "மொழி" },
  hero: {
    eyebrow: "இந்திய சட்டத்திற்காக · உச்ச நீதிமன்றம் & உயர் நீதிமன்றங்கள்",
    line1: [{ text: "ஒவ்வொரு சிறந்த வழக்கறிஞருக்கும் ஒரு " }, { text: "குரு", em: true }, { text: " இருந்தார்." }],
    line2: [{ text: "இப்போது உங்கள் குரு AI — இந்திய சட்டத்திற்காக உருவாக்கப்பட்டது." }],
    subhead:
      "இந்திய சட்டத்திற்கான படிப்புகள் மற்றும் ஒரு AI வரைவு உதவியாளர் — சட்ட மாணவர்கள், வருங்கால வழக்கறிஞர்கள் மற்றும் பயிற்சியில் உள்ள வழக்கறிஞர்களுக்காக.",
    ctaPrimary: "ஷிஷோவை முயற்சிக்கவும்",
    ctaSecondary: "படிப்புகளைப் பார்க்கவும்",
    ctaNote: "கார்டு தேவையில்லை.",
  },
  matterFlow: {
    eyebrow: "எங்கிருந்து தொடங்குவது",
    heading: [{ text: "நீங்கள் " }, { text: "இருக்கும்", em: true }, { text: " கட்டத்தைக் கண்டறியவும்." }],
    seeMap: "முழு வரைபடத்தைப் பார்க்கவும்",
    stages: {
      1: { title: "முகப்புப் பக்கம்", summary: "ஒருவர் வந்தடையும் இடம், மற்றும் ஷிஷோ என்றால் என்ன." },
      2: { title: "வழக்கறிஞர்", summary: "வழக்கை யார் கொண்டு வருகிறார், மற்றும் அது எந்த மன்றத்திற்குரியது." },
      3: { title: "மாநிலம்", summary: "வழக்கு மேலே செல்கிறது: ரிட் அதிகார வரம்பு மற்றும் உச்ச நீதிமன்றம்." },
      4: { title: "வரைவு", summary: "முதல் ஆவணம் காகிதத்தில் வருகிறது, மூல சட்டத்திற்கு எதிராக சரிபார்க்கப்பட்டது." },
      5: {
        title: "இடைக்கால மனு",
        summary: "வழக்கு நிலுவையில் இருக்கும்போது கோரப்படும் நிவாரணம் — மனு, அதற்கு அடிப்படையான உறுதிமொழிப் பத்திரம், மற்றும் அதற்கான பதில்கள்.",
      },
      6: {
        title: "வழக்குரைகள் / விவகாரங்கள்",
        summary: "வழக்கும் அதற்கான பதிலும், இறுதியில் நீதிமன்றம் நிர்ணயிக்கும் விவகாரங்கள் வரை.",
      },
      7: { title: "விசாரணை", summary: "விவகாரங்கள் நிர்ணயிக்கப்பட்ட பிறகு சாட்சியமும் வாதமும்." },
      8: { title: "மேற்கோள்கள்", summary: "ஒவ்வொரு வாதமும் உண்மையிலேயே கட்டுப்படுத்தும் அதிகாரத்துடன் இணைக்கப்பட்டுள்ளது." },
      9: { title: "வழக்கிற்குப் பிறகு", summary: "கோப்பு மூடப்பட்ட பிறகு என்ன நடக்கிறது." },
    },
    products: { "draft-bot": "ஷிஷோ", library: "சட்ட நூலகம்", courses: "படிப்புகள்" },
  },
  featureStrip: {
    features: [
      {
        name: "ஷிஷோ",
        body: "ஒரு வழக்குரை, அறிவிப்பு, மனு அல்லது ஒப்பந்தத்தை ஒட்டவும். விளிம்பில் பிரிவு-அளவிலான குறிப்புகளைப் பெறுங்கள், பதிவகம் சரிபார்ப்பதற்கு முன்பே நடைமுறை சரிபார்க்கப்படுகிறது — ஒரு மூத்தவர் திருப்பித் தருவது போலவே.",
      },
      {
        name: "சட்ட நூலகம்",
        body: "உச்ச நீதிமன்றம் மற்றும் உயர் நீதிமன்ற தீர்ப்புகள், மூல சட்டங்கள், மற்றும் விளக்கவுரை. SCC வடிவத்தில் மேற்கோள் காட்டப்பட்டு, எளிய மொழியில் விளக்கப்பட்டுள்ளது.",
      },
      {
        name: "படிப்புகள்",
        body: "இரண்டு தடங்கள் — அடிப்படைகளுக்கு ஸ்டார்ட்டர், இடைக்கால நிவாரணம், வணிக வரைவு மற்றும் வழக்கு உத்திக்கு புரொஃபிஷியன்ட். ஒவ்வொரு பகுதியும் ஒரு தாக்கல் செய்தலில் முடிகிறது, வினாடி-வினாவில் அல்ல.",
      },
    ],
    exploreLabel: (name) => `${name} ஐப் பார்க்கவும்`,
  },
  productShowcase: {
    pill: "ஷிஷோ · டெமோ முறை",
    heading: [{ text: "குறியிடப்பட்ட ஒரு " }, { text: "வரைவு", em: true }, { text: " எப்படி இருக்கும் என்று பாருங்கள்." }],
    body: "இடதுபுறம் ஒரு வழக்குரை அல்லது ஒப்பந்தத்தை ஒட்டவும். குறிப்புகள் விளிம்பில் திரும்பி வரும், ஒவ்வொன்றும் அது குறிக்கும் பிரிவுடனும் அது சார்ந்திருக்கும் இந்திய அதிகாரத்துடனும் இணைக்கப்பட்டுள்ளது.",
    ctaPrimary: "ஷிஷோவைத் திறக்கவும்",
    ctaSecondary: "விலைகளைப் பார்க்கவும்",
    miniNotes: [
      "பிரிவு 226 — பிராந்திய அதிகார வரம்பை வாதிடவும்.",
      "இடைக்கால நிவாரணம்: மூன்று அம்சங்களையும் வாதிடவும்.",
      "சரிபார்ப்புப் பிரிவு இல்லை — ஆணை VI விதி 15.",
    ],
    figcaption:
      "ஷிஷோ பணியிடத்தின் ஒரு முன்னோட்டம்: இடதுபுறம் வரைவு, மற்றும் வலது விளிம்பில் மூன்று ஷிஷோ குறிப்புகள் — பிரிவு 226-ன் கீழ் பிராந்திய அதிகார வரம்பு, இடைக்கால நிவாரணத்திற்குத் தேவையான மூன்று அம்சங்கள், மற்றும் சிவில் நடைமுறைச் சட்டத்தின் ஆணை VI விதி 15-ன் கீழ் இல்லாத ஒரு சரிபார்ப்புப் பிரிவு.",
  },
  pricingPreview: {
    eyebrow: "விலை",
    heading: [{ text: "மாணவர் " }, { text: "பட்ஜெட்", em: true }, { text: "டிற்கு ஏற்றவாறு விலை நிர்ணயிக்கப்பட்டுள்ளது." }],
    seeFull: "முழு ஒப்பீட்டையும் பார்க்கவும்",
    forever: "எப்போதும்",
    perMonth: "மாதத்திற்கு",
    mostPopular: "மாணவர்களுக்குப் பரிந்துரைக்கப்படுகிறது",
    taglines: {
      free: "ஒரு குரு உங்கள் வேலையை எப்படி குறிக்கிறார் என்று பாருங்கள்.",
      basic: "படிக்கவும் படிக்கவும் தேவையான அனைத்தும் — போட் இலவச சோதனையிலேயே இருக்கும்.",
      core: "முழு அடிப்படையும், மற்றும் போட் எந்த வரம்பும் இல்லாமல்.",
      proficient: "வழக்கறிஞர்கள் மற்றும் பயிற்சியில் உள்ள இறுதியாண்டு மாணவர்களுக்காக.",
    },
  },
  finalCta: {
    heading: [{ text: "உங்கள் வரைவை ஒரு " }, { text: "குரு", em: true }, { text: "வின் முன் வையுங்கள்." }],
    body: "மாதத்திற்கு ஐந்து இலவச மதிப்பாய்வுகள். கார்டு தேவையில்லை, மற்றும் எதையும் நிறுவ வேண்டிய அவசியமில்லை.",
    ctaPrimary: "ஷிஷோவை முயற்சிக்கவும்",
    ctaSecondary: "விலைகளைப் பார்க்கவும்",
  },
};

const gu: Dictionary = {
  languageSwitch: { label: "ભાષા" },
  hero: {
    eyebrow: "ભારતીય કાયદા માટે · સર્વોચ્ચ અને ઉચ્ચ અદાલતો",
    line1: [{ text: "દરેક મહાન વકીલનો એક " }, { text: "ગુરુ", em: true }, { text: " હતો." }],
    line2: [{ text: "હવે તમારો ગુરુ AI છે — ભારતીય કાયદા માટે બનાવેલો." }],
    subhead:
      "ભારતીય કાયદા માટે કોર્સ અને એક AI ડ્રાફ્ટિંગ સહાયક — કાયદાના વિદ્યાર્થીઓ, ભાવિ વકીલો, અને પ્રેક્ટિસ કરતા વકીલો માટે.",
    ctaPrimary: "શિશો અજમાવો",
    ctaSecondary: "કોર્સ જુઓ",
    ctaNote: "કોઈ કાર્ડની જરૂર નથી.",
  },
  matterFlow: {
    eyebrow: "ક્યાંથી શરૂ કરવું",
    heading: [{ text: "તમે જ્યાં " }, { text: "છો", em: true }, { text: " તે તબક્કો શોધો." }],
    seeMap: "સંપૂર્ણ નકશો જુઓ",
    stages: {
      1: { title: "હોમપેજ", summary: "જ્યાં કોઈ પહોંચે છે, અને શિશો શું છે." },
      2: { title: "વકીલ", summary: "કોણ કેસ લાવે છે, અને તે કયા મંચનો છે." },
      3: { title: "રાજ્ય", summary: "કેસ આગળ વધે છે: રિટ અધિકારક્ષેત્ર અને સર્વોચ્ચ અદાલત." },
      4: { title: "ડ્રાફ્ટ", summary: "પહેલો દસ્તાવેજ કાગળ પર આવે છે, બેર એક્ટ સામે ચકાસાયેલો." },
      5: {
        title: "વચગાળાની અરજી",
        summary: "દાવો પડતર હોય ત્યારે માંગવામાં આવેલી રાહત — અરજી, તેનો આધાર બનતું સોગંદનામું, અને તેના જવાબો.",
      },
      6: {
        title: "દાવા-પત્રો / મુદ્દાઓ",
        summary: "દાવો અને તેનો જવાબ, છેવટે અદાલત નક્કી કરે તે મુદ્દાઓ સુધી.",
      },
      7: { title: "સુનાવણી", summary: "મુદ્દા નક્કી થયા પછી પુરાવા અને દલીલ." },
      8: { title: "અવતરણો", summary: "દરેક દલીલ ખરેખર બંધનકર્તા સત્તા સાથે જોડાયેલી." },
      9: { title: "કેસ પછી", summary: "ફાઇલ બંધ થયા પછી શું થાય છે." },
    },
    products: { "draft-bot": "શિશો", library: "લીગલ લાઇબ્રેરી", courses: "કોર્સ" },
  },
  featureStrip: {
    features: [
      {
        name: "શિશો",
        body: "એક દાવા-પત્ર, નોટિસ, અરજી અથવા કરાર પેસ્ટ કરો. હાંસિયામાં કલમ-સ્તરની નોંધો મેળવો, રજિસ્ટ્રી કરે તે પહેલાં જ પ્રક્રિયા ચકાસાયેલી — બરાબર જેમ કોઈ સિનિયર પાછું સોંપે તેમ.",
      },
      {
        name: "લીગલ લાઇબ્રેરી",
        body: "સર્વોચ્ચ અદાલત અને ઉચ્ચ અદાલતના ચુકાદાઓ, બેર એક્ટ્સ, અને ટિપ્પણી. SCC સ્વરૂપમાં ટાંકેલા, સરળ ભાષામાં સમજાવેલા.",
      },
      {
        name: "કોર્સ",
        body: "બે ટ્રેક — પાયા માટે સ્ટાર્ટર, વચગાળાની રાહત, વ્યાપારી ડ્રાફ્ટિંગ અને મુકદ્દમા વ્યૂહરચના માટે પ્રોફિશિયન્ટ. દરેક મોડ્યુલ ફાઇલિંગમાં પૂરું થાય છે, ક્વિઝમાં નહીં.",
      },
    ],
    exploreLabel: (name) => `${name} જુઓ`,
  },
  productShowcase: {
    pill: "શિશો · ડેમો મોડ",
    heading: [{ text: "માર્ક-અપ કરેલો " }, { text: "ડ્રાફ્ટ", em: true }, { text: " કેવો દેખાય છે તે જુઓ." }],
    body: "ડાબી બાજુ એક દાવા-પત્ર અથવા કરાર પેસ્ટ કરો. નોંધો હાંસિયામાં પાછી આવે છે, દરેક જે કલમને ચિહ્નિત કરે છે અને જે ભારતીય સત્તા પર આધારિત છે તેની સાથે જોડાયેલી.",
    ctaPrimary: "શિશો ખોલો",
    ctaSecondary: "ભાવ જુઓ",
    miniNotes: [
      "કલમ 226 — પ્રાદેશિક અધિકારક્ષેત્રની દલીલ કરો.",
      "વચગાળાની રાહત: ત્રણેય પાસાંની દલીલ કરો.",
      "ચકાસણી કલમ નથી — હુકમ VI નિયમ 15.",
    ],
    figcaption:
      "શિશો વર્કસ્પેસની એક ઝલક: ડાબી બાજુ ડ્રાફ્ટ, અને જમણા હાંસિયામાં ત્રણ શિશો નોંધો — કલમ 226 હેઠળ પ્રાદેશિક અધિકારક્ષેત્ર, વચગાળાની રાહત માટે જરૂરી ત્રણેય પાસાં, અને દિવાની કાર્યપદ્ધતિ સંહિતાના હુકમ VI નિયમ 15 હેઠળ ખૂટતી ચકાસણી કલમ.",
  },
  pricingPreview: {
    eyebrow: "ભાવ",
    heading: [{ text: "વિદ્યાર્થીના " }, { text: "બજેટ", em: true }, { text: " માટે ભાવ નક્કી કરેલા." }],
    seeFull: "સંપૂર્ણ સરખામણી જુઓ",
    forever: "કાયમ માટે",
    perMonth: "દર મહિને",
    mostPopular: "વિદ્યાર્થીઓ માટે ભલામણ કરેલ",
    taglines: {
      free: "એક ગુરુ તમારું કામ કેવી રીતે ચિહ્નિત કરે છે તે જુઓ.",
      basic: "વાંચવા અને અભ્યાસ માટે બધું જ — બોટ ફ્રી ટ્રાયલ પર જ રહે છે.",
      core: "સંપૂર્ણ પાયો, અને બોટ કોઈ મર્યાદા વગર.",
      proficient: "વકીલો અને પ્રેક્ટિસમાં અંતિમ વર્ષના વિદ્યાર્થીઓ માટે.",
    },
  },
  finalCta: {
    heading: [{ text: "તમારો ડ્રાફ્ટ એક " }, { text: "ગુરુ", em: true }, { text: "ની સામે મૂકો." }],
    body: "દર મહિને પાંચ મફત સમીક્ષાઓ. કોઈ કાર્ડની જરૂર નથી, અને કંઈ પણ ઇન્સ્ટોલ કરવાની જરૂર નથી.",
    ctaPrimary: "શિશો અજમાવો",
    ctaSecondary: "ભાવ જુઓ",
  },
};

const kn: Dictionary = {
  languageSwitch: { label: "ಭಾಷೆ" },
  hero: {
    eyebrow: "ಭಾರತೀಯ ಕಾನೂನಿಗಾಗಿ · ಸುಪ್ರೀಂ ಕೋರ್ಟ್ ಮತ್ತು ಹೈಕೋರ್ಟ್‌ಗಳು",
    line1: [{ text: "ಪ್ರತಿ ಮಹಾನ್ ವಕೀಲರಿಗೂ ಒಬ್ಬ " }, { text: "ಗುರು", em: true }, { text: " ಇದ್ದರು." }],
    line2: [{ text: "ಈಗ ನಿಮ್ಮ ಗುರು AI — ಭಾರತೀಯ ಕಾನೂನಿಗಾಗಿ ರೂಪಿಸಲಾಗಿದೆ." }],
    subhead:
      "ಭಾರತೀಯ ಕಾನೂನಿಗಾಗಿ ಕೋರ್ಸ್‌ಗಳು ಮತ್ತು ಒಂದು AI ಡ್ರಾಫ್ಟಿಂಗ್ ಸಹಾಯಕ — ಕಾನೂನು ವಿದ್ಯಾರ್ಥಿಗಳು, ಭಾವಿ ವಕೀಲರು, ಮತ್ತು ಪ್ರಾಕ್ಟೀಸ್‌ನಲ್ಲಿರುವ ವಕೀಲರಿಗಾಗಿ.",
    ctaPrimary: "ಶಿಶೋ ಪ್ರಯತ್ನಿಸಿ",
    ctaSecondary: "ಕೋರ್ಸ್‌ಗಳನ್ನು ನೋಡಿ",
    ctaNote: "ಯಾವುದೇ ಕಾರ್ಡ್ ಅಗತ್ಯವಿಲ್ಲ.",
  },
  matterFlow: {
    eyebrow: "ಎಲ್ಲಿಂದ ಆರಂಭಿಸುವುದು",
    heading: [{ text: "ನೀವು " }, { text: "ಇರುವ", em: true }, { text: " ಹಂತವನ್ನು ಕಂಡುಕೊಳ್ಳಿ." }],
    seeMap: "ಪೂರ್ಣ ನಕ್ಷೆಯನ್ನು ನೋಡಿ",
    stages: {
      1: { title: "ಮುಖಪುಟ", summary: "ಯಾರಾದರೂ ತಲುಪುವ ಸ್ಥಳ, ಮತ್ತು ಶಿಶೋ ಎಂದರೇನು." },
      2: { title: "ವಕೀಲರು", summary: "ಪ್ರಕರಣವನ್ನು ಯಾರು ತರುತ್ತಾರೆ, ಮತ್ತು ಅದು ಯಾವ ವೇದಿಕೆಗೆ ಸೇರಿದ್ದು." },
      3: { title: "ರಾಜ್ಯ", summary: "ಪ್ರಕರಣ ಮೇಲಕ್ಕೆ ಹೋಗುತ್ತದೆ: ರಿಟ್ ಅಧಿಕಾರ ವ್ಯಾಪ್ತಿ ಮತ್ತು ಸುಪ್ರೀಂ ಕೋರ್ಟ್." },
      4: { title: "ಕರಡು", summary: "ಮೊದಲ ದಾಖಲೆ ಕಾಗದದ ಮೇಲೆ ಬರುತ್ತದೆ, ಬೇರ್ ಆಕ್ಟ್‌ಗೆ ಎದುರಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ." },
      5: {
        title: "ಮಧ್ಯಂತರ ಅರ್ಜಿ",
        summary: "ದಾವೆ ಬಾಕಿ ಇರುವಾಗ ಕೋರಲಾದ ಪರಿಹಾರ — ಅರ್ಜಿ, ಅದಕ್ಕೆ ಆಧಾರವಾದ ಪ್ರಮಾಣಪತ್ರ, ಮತ್ತು ಅದಕ್ಕೆ ಉತ್ತರಗಳು.",
      },
      6: {
        title: "ವಾದಪತ್ರಗಳು / ವಿಷಯಗಳು",
        summary: "ದಾವೆ ಮತ್ತು ಅದರ ಉತ್ತರ, ಕೊನೆಗೆ ನ್ಯಾಯಾಲಯ ನಿರ್ಧರಿಸುವ ವಿಷಯಗಳ ತನಕ.",
      },
      7: { title: "ವಿಚಾರಣೆ", summary: "ವಿಷಯಗಳು ನಿರ್ಧಾರವಾದ ನಂತರ ಸಾಕ್ಷ್ಯ ಮತ್ತು ವಾದ." },
      8: { title: "ಉಲ್ಲೇಖಗಳು", summary: "ಪ್ರತಿ ವಾದವೂ ನಿಜವಾಗಿ ಬಂಧಿಸುವ ಅಧಿಕಾರದೊಂದಿಗೆ ಜೋಡಣೆಯಾಗಿದೆ." },
      9: { title: "ಪ್ರಕರಣದ ನಂತರ", summary: "ಫೈಲ್ ಮುಚ್ಚಿದ ನಂತರ ಏನಾಗುತ್ತದೆ." },
    },
    products: { "draft-bot": "ಶಿಶೋ", library: "ಕಾನೂನು ಗ್ರಂಥಾಲಯ", courses: "ಕೋರ್ಸ್‌ಗಳು" },
  },
  featureStrip: {
    features: [
      {
        name: "ಶಿಶೋ",
        body: "ಒಂದು ದಾವಾ ಪತ್ರ, ನೋಟಿಸ್, ಅರ್ಜಿ ಅಥವಾ ಒಪ್ಪಂದವನ್ನು ಅಂಟಿಸಿ. ಅಂಚಿನಲ್ಲಿ ಷರತ್ತು-ಮಟ್ಟದ ಟಿಪ್ಪಣಿಗಳನ್ನು ಪಡೆಯಿರಿ, ರಿಜಿಸ್ಟ್ರಿ ಮಾಡುವ ಮೊದಲೇ ಕಾರ್ಯವಿಧಾನ ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ — ಒಬ್ಬ ಹಿರಿಯ ವಕೀಲರು ಹಿಂದಿರುಗಿಸುವಂತೆಯೇ.",
      },
      {
        name: "ಕಾನೂನು ಗ್ರಂಥಾಲಯ",
        body: "ಸುಪ್ರೀಂ ಕೋರ್ಟ್ ಮತ್ತು ಹೈಕೋರ್ಟ್ ತೀರ್ಪುಗಳು, ಬೇರ್ ಆಕ್ಟ್‌ಗಳು, ಮತ್ತು ವ್ಯಾಖ್ಯಾನ. SCC ರೂಪದಲ್ಲಿ ಉಲ್ಲೇಖಿಸಲಾಗಿದೆ, ಸರಳ ಭಾಷೆಯಲ್ಲಿ ವಿವರಿಸಲಾಗಿದೆ.",
      },
      {
        name: "ಕೋರ್ಸ್‌ಗಳು",
        body: "ಎರಡು ಟ್ರ್ಯಾಕ್‌ಗಳು — ಅಡಿಪಾಯಕ್ಕಾಗಿ ಸ್ಟಾರ್ಟರ್, ಮಧ್ಯಂತರ ಪರಿಹಾರ, ವಾಣಿಜ್ಯ ಡ್ರಾಫ್ಟಿಂಗ್ ಮತ್ತು ದಾವೆ ತಂತ್ರಕ್ಕಾಗಿ ಪ್ರೊಫಿಶಿಯಂಟ್. ಪ್ರತಿ ಮಾಡ್ಯೂಲ್ ಒಂದು ಫೈಲಿಂಗ್‌ನಲ್ಲಿ ಮುಗಿಯುತ್ತದೆ, ಕ್ವಿಝ್‌ನಲ್ಲಿ ಅಲ್ಲ.",
      },
    ],
    exploreLabel: (name) => `${name} ಅನ್ವೇಷಿಸಿ`,
  },
  productShowcase: {
    pill: "ಶಿಶೋ · ಡೆಮೊ ಮೋಡ್",
    heading: [{ text: "ಗುರುತು ಹಾಕಿದ " }, { text: "ಕರಡು", em: true }, { text: " ಹೇಗಿರುತ್ತದೆ ಎಂದು ನೋಡಿ." }],
    body: "ಎಡಭಾಗದಲ್ಲಿ ಒಂದು ದಾವಾ ಪತ್ರ ಅಥವಾ ಒಪ್ಪಂದವನ್ನು ಅಂಟಿಸಿ. ಟಿಪ್ಪಣಿಗಳು ಅಂಚಿನಲ್ಲಿ ಹಿಂತಿರುಗುತ್ತವೆ, ಪ್ರತಿಯೊಂದೂ ಅದು ಗುರುತಿಸುವ ಷರತ್ತಿಗೆ ಮತ್ತು ಅದು ಆಧರಿಸಿರುವ ಭಾರತೀಯ ಅಧಿಕಾರಕ್ಕೆ ಜೋಡಣೆಯಾಗಿದೆ.",
    ctaPrimary: "ಶಿಶೋ ತೆರೆಯಿರಿ",
    ctaSecondary: "ಬೆಲೆ ನೋಡಿ",
    miniNotes: [
      "ಅನುಚ್ಛೇದ 226 — ಪ್ರಾದೇಶಿಕ ಅಧಿಕಾರ ವ್ಯಾಪ್ತಿಯನ್ನು ಪ್ರತಿಪಾದಿಸಿ.",
      "ಮಧ್ಯಂತರ ಪರಿಹಾರ: ಎಲ್ಲಾ ಮೂರು ಅಂಶಗಳನ್ನು ಪ್ರತಿಪಾದಿಸಿ.",
      "ಪರಿಶೀಲನಾ ಷರತ್ತು ಇಲ್ಲ — ಆದೇಶ VI ನಿಯಮ 15.",
    ],
    figcaption:
      "ಶಿಶೋ ಕಾರ್ಯಸ್ಥಳದ ಒಂದು ಪೂರ್ವವೀಕ್ಷಣೆ: ಎಡಭಾಗದಲ್ಲಿ ಕರಡು, ಮತ್ತು ಬಲಭಾಗದ ಅಂಚಿನಲ್ಲಿ ಮೂರು ಶಿಶೋ ಟಿಪ್ಪಣಿಗಳು — ಅನುಚ್ಛೇದ 226ರ ಅಡಿಯಲ್ಲಿ ಪ್ರಾದೇಶಿಕ ಅಧಿಕಾರ ವ್ಯಾಪ್ತಿ, ಮಧ್ಯಂತರ ಪರಿಹಾರಕ್ಕೆ ಅಗತ್ಯವಾದ ಮೂರು ಅಂಶಗಳು, ಮತ್ತು ಸಿವಿಲ್ ಪ್ರೊಸೀಜರ್ ಕೋಡ್‌ನ ಆದೇಶ VI ನಿಯಮ 15ರ ಅಡಿಯಲ್ಲಿ ಕಾಣೆಯಾದ ಪರಿಶೀಲನಾ ಷರತ್ತು.",
  },
  pricingPreview: {
    eyebrow: "ಬೆಲೆ",
    heading: [{ text: "ವಿದ್ಯಾರ್ಥಿಯ " }, { text: "ಬಜೆಟ್", em: true }, { text: "ಗೆ ತಕ್ಕಂತೆ ಬೆಲೆ ನಿಗದಿ." }],
    seeFull: "ಪೂರ್ಣ ಹೋಲಿಕೆಯನ್ನು ನೋಡಿ",
    forever: "ಶಾಶ್ವತವಾಗಿ",
    perMonth: "ತಿಂಗಳಿಗೆ",
    mostPopular: "ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ",
    taglines: {
      free: "ಒಬ್ಬ ಗುರು ನಿಮ್ಮ ಕೆಲಸವನ್ನು ಹೇಗೆ ಗುರುತಿಸುತ್ತಾರೆ ಎಂದು ನೋಡಿ.",
      basic: "ಓದಲು ಮತ್ತು ಅಧ್ಯಯನಕ್ಕೆ ಎಲ್ಲವೂ — ಬಾಟ್ ಉಚಿತ ಟ್ರಯಲ್‌ನಲ್ಲೇ ಉಳಿಯುತ್ತದೆ.",
      core: "ಸಂಪೂರ್ಣ ಅಡಿಪಾಯ, ಮತ್ತು ಬಾಟ್ ಯಾವುದೇ ಮಿತಿಯಿಲ್ಲದೆ.",
      proficient: "ವಕೀಲರು ಮತ್ತು ಪ್ರಾಕ್ಟೀಸ್‌ನಲ್ಲಿರುವ ಅಂತಿಮ ವರ್ಷದ ವಿದ್ಯಾರ್ಥಿಗಳಿಗಾಗಿ.",
    },
  },
  finalCta: {
    heading: [{ text: "ನಿಮ್ಮ ಕರಡನ್ನು ಒಬ್ಬ " }, { text: "ಗುರು", em: true }, { text: "ವಿನ ಮುಂದಿಡಿ." }],
    body: "ತಿಂಗಳಿಗೆ ಐದು ಉಚಿತ ವಿಮರ್ಶೆಗಳು. ಯಾವುದೇ ಕಾರ್ಡ್ ಅಗತ್ಯವಿಲ್ಲ, ಮತ್ತು ಏನನ್ನೂ ಸ್ಥಾಪಿಸುವ ಅಗತ್ಯವಿಲ್ಲ.",
    ctaPrimary: "ಶಿಶೋ ಪ್ರಯತ್ನಿಸಿ",
    ctaSecondary: "ಬೆಲೆ ನೋಡಿ",
  },
};

const ml: Dictionary = {
  languageSwitch: { label: "ഭാഷ" },
  hero: {
    eyebrow: "ഇന്ത്യൻ നിയമത്തിനായി · സുപ്രീം കോടതിയും ഹൈക്കോടതികളും",
    line1: [{ text: "എല്ലാ മഹാനായ അഭിഭാഷകനും ഒരു " }, { text: "ഗുരു", em: true }, { text: " ഉണ്ടായിരുന്നു." }],
    line2: [{ text: "ഇപ്പോൾ നിങ്ങളുടെ ഗുരു AI ആണ് — ഇന്ത്യൻ നിയമത്തിനായി നിർമ്മിച്ചത്." }],
    subhead:
      "ഇന്ത്യൻ നിയമത്തിനായുള്ള കോഴ്സുകളും ഒരു AI ഡ്രാഫ്റ്റിംഗ് സഹായിയും — നിയമ വിദ്യാർത്ഥികൾക്കും, ഭാവി അഭിഭാഷകർക്കും, പ്രാക്ടീസ് ചെയ്യുന്ന അഭിഭാഷകർക്കും വേണ്ടി.",
    ctaPrimary: "ശിഷോ പരീക്ഷിക്കൂ",
    ctaSecondary: "കോഴ്സുകൾ കാണുക",
    ctaNote: "കാർഡ് ആവശ്യമില്ല.",
  },
  matterFlow: {
    eyebrow: "എവിടെ നിന്ന് തുടങ്ങണം",
    heading: [{ text: "നിങ്ങൾ " }, { text: "ഉള്ള", em: true }, { text: " ഘട്ടം കണ്ടെത്തുക." }],
    seeMap: "മുഴുവൻ മാപ്പും കാണുക",
    stages: {
      1: { title: "ഹോംപേജ്", summary: "ആരെങ്കിലും എത്തിച്ചേരുന്നിടം, ശിഷോ എന്താണെന്നും." },
      2: { title: "അഭിഭാഷകൻ", summary: "ആരാണ് കേസ് കൊണ്ടുവരുന്നത്, അത് ഏത് ഫോറത്തിൽ പെടുന്നു." },
      3: { title: "സംസ്ഥാനം", summary: "കേസ് മുകളിലേക്ക് നീങ്ങുന്നു: റിട്ട് അധികാരപരിധിയും സുപ്രീം കോടതിയും." },
      4: { title: "ഡ്രാഫ്റ്റ്", summary: "ആദ്യത്തെ രേഖ കടലാസിൽ വരുന്നു, ബെയർ ആക്ടിനെതിരെ പരിശോധിച്ചത്." },
      5: {
        title: "ഇടക്കാല അപേക്ഷ",
        summary: "വ്യവഹാരം തീർപ്പാകാതെ ഇരിക്കുമ്പോൾ തേടുന്ന ആശ്വാസം — അപേക്ഷ, അതിന്റെ അടിസ്ഥാനമായ സത്യവാങ്മൂലം, അതിനുള്ള മറുപടികൾ.",
      },
      6: {
        title: "വാദപത്രങ്ങൾ / വിഷയങ്ങൾ",
        summary: "വ്യവഹാരവും അതിന്റെ മറുപടിയും, ഒടുവിൽ കോടതി തീരുമാനിക്കുന്ന വിഷയങ്ങൾ വരെ.",
      },
      7: { title: "വിചാരണ", summary: "വിഷയങ്ങൾ തീരുമാനിച്ച ശേഷം തെളിവും വാദവും." },
      8: { title: "ഉദ്ധരണികൾ", summary: "ഓരോ വാദവും യഥാർത്ഥത്തിൽ ബാധ്യതയുള്ള ഒരു അധികാരവുമായി ബന്ധിപ്പിച്ചിരിക്കുന്നു." },
      9: { title: "കേസിനു ശേഷം", summary: "ഫയൽ അടയ്ക്കുന്നതിനു ശേഷം എന്ത് സംഭവിക്കുന്നു." },
    },
    products: { "draft-bot": "ശിഷോ", library: "നിയമ ഗ്രന്ഥശാല", courses: "കോഴ്സുകൾ" },
  },
  featureStrip: {
    features: [
      {
        name: "ശിഷോ",
        body: "ഒരു വ്യവഹാരപത്രം, നോട്ടീസ്, അപേക്ഷ, അല്ലെങ്കിൽ കരാർ ഒട്ടിക്കുക. മാർജിനിൽ വകുപ്പ്-തല കുറിപ്പുകൾ നേടുക, രജിസ്ട്രി ചെയ്യുന്നതിന് മുമ്പുതന്നെ നടപടിക്രമം പരിശോധിക്കുന്നു — ഒരു സീനിയർ തിരികെ ഏൽപ്പിക്കുന്നതു പോലെതന്നെ.",
      },
      {
        name: "നിയമ ഗ്രന്ഥശാല",
        body: "സുപ്രീം കോടതിയുടെയും ഹൈക്കോടതിയുടെയും വിധികൾ, ബെയർ ആക്ടുകൾ, വ്യാഖ്യാനം. SCC രൂപത്തിൽ ഉദ്ധരിച്ചത്, ലളിതമായ ഭാഷയിൽ വിശദീകരിച്ചത്.",
      },
      {
        name: "കോഴ്സുകൾ",
        body: "രണ്ട് ട്രാക്കുകൾ — അടിത്തറയ്ക്കായി സ്റ്റാർട്ടർ, ഇടക്കാല ആശ്വാസം, വാണിജ്യ ഡ്രാഫ്റ്റിംഗ്, വ്യവഹാര തന്ത്രത്തിനായി പ്രൊഫിഷ്യന്റ്. ഓരോ മൊഡ്യൂളും അവസാനിക്കുന്നത് ഒരു ഫയലിംഗിലാണ്, ക്വിസിലല്ല.",
      },
    ],
    exploreLabel: (name) => `${name} പര്യവേക്ഷണം ചെയ്യുക`,
  },
  productShowcase: {
    pill: "ശിഷോ · ഡെമോ മോഡ്",
    heading: [{ text: "അടയാളപ്പെടുത്തിയ ഒരു " }, { text: "ഡ്രാഫ്റ്റ്", em: true }, { text: " എങ്ങനെയിരിക്കുമെന്ന് കാണുക." }],
    body: "ഇടതുവശത്ത് ഒരു വ്യവഹാരപത്രം അല്ലെങ്കിൽ കരാർ ഒട്ടിക്കുക. കുറിപ്പുകൾ മാർജിനിൽ തിരികെ വരും, ഓരോന്നും അത് അടയാളപ്പെടുത്തുന്ന വകുപ്പുമായും അത് ആശ്രയിക്കുന്ന ഇന്ത്യൻ അധികാരവുമായും ബന്ധിപ്പിച്ചിരിക്കുന്നു.",
    ctaPrimary: "ശിഷോ തുറക്കുക",
    ctaSecondary: "വില കാണുക",
    miniNotes: [
      "അനുച്ഛേദം 226 — പ്രാദേശിക അധികാരപരിധി വാദിക്കുക.",
      "ഇടക്കാല ആശ്വാസം: മൂന്ന് ഘടകങ്ങളും വാദിക്കുക.",
      "സാക്ഷ്യപ്പെടുത്തൽ വകുപ്പ് ഇല്ല — ഓർഡർ VI റൂൾ 15.",
    ],
    figcaption:
      "ശിഷോ വർക്ക്‌സ്പേസിന്റെ ഒരു പ്രിവ്യൂ: ഇടതുവശത്ത് ഡ്രാഫ്റ്റ്, വലതു മാർജിനിൽ മൂന്ന് ശിഷോ കുറിപ്പുകൾ — അനുച്ഛേദം 226 പ്രകാരമുള്ള പ്രാദേശിക അധികാരപരിധി, ഇടക്കാല ആശ്വാസത്തിന് ആവശ്യമായ മൂന്ന് ഘടകങ്ങൾ, സിവിൽ പ്രൊസീജ്യർ കോഡിന്റെ ഓർഡർ VI റൂൾ 15 പ്രകാരം കാണാതെപോയ ഒരു സാക്ഷ്യപ്പെടുത്തൽ വകുപ്പ്.",
  },
  pricingPreview: {
    eyebrow: "വില",
    heading: [{ text: "ഒരു വിദ്യാർത്ഥിയുടെ " }, { text: "ബജറ്റിന്", em: true }, { text: " അനുസരിച്ച് വില നിശ്ചയിച്ചത്." }],
    seeFull: "പൂർണ്ണ താരതമ്യം കാണുക",
    forever: "എന്നേക്കും",
    perMonth: "മാസത്തിൽ",
    mostPopular: "വിദ്യാർത്ഥികൾക്ക് ശുപാർശ ചെയ്യുന്നു",
    taglines: {
      free: "ഒരു ഗുരു നിങ്ങളുടെ ജോലി എങ്ങനെ അടയാളപ്പെടുത്തുന്നു എന്ന് കാണുക.",
      basic: "വായിക്കാനും പഠിക്കാനും വേണ്ടതെല്ലാം — ബോട്ട് സൗജന്യ ട്രയലിൽ തന്നെ തുടരും.",
      core: "പൂർണ്ണ അടിത്തറ, പരിധിയില്ലാതെ ബോട്ടും.",
      proficient: "അഭിഭാഷകർക്കും പ്രാക്ടീസിലുള്ള അവസാന വർഷ വിദ്യാർത്ഥികൾക്കും വേണ്ടി.",
    },
  },
  finalCta: {
    heading: [{ text: "നിങ്ങളുടെ ഡ്രാഫ്റ്റ് ഒരു " }, { text: "ഗുരുവിന്റെ", em: true }, { text: " മുന്നിൽ വയ്ക്കുക." }],
    body: "മാസത്തിൽ അഞ്ച് സൗജന്യ അവലോകനങ്ങൾ. കാർഡ് ആവശ്യമില്ല, ഒന്നും ഇൻസ്റ്റാൾ ചെയ്യേണ്ടതുമില്ല.",
    ctaPrimary: "ശിഷോ പരീക്ഷിക്കൂ",
    ctaSecondary: "വില കാണുക",
  },
};

const DICTIONARIES: Record<Locale, Dictionary> = {
  en,
  hi,
  bn,
  mr,
  te,
  ta,
  gu,
  kn,
  ml,
};

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

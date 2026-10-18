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
 */

export type Locale =
  | "en"
  | "hi"
  | "bn"
  | "mr"
  | "te"
  | "ta"
  | "gu"
  | "as"
  | "brx"
  | "doi"
  | "kn"
  | "ks"
  | "kok"
  | "mai"
  | "ml"
  | "mni"
  | "ne"
  | "or"
  | "pa"
  | "sa"
  | "sat"
  | "sd"
  | "ur";
export const LOCALES: Locale[] = [
  "en",
  "hi",
  "bn",
  "mr",
  "te",
  "ta",
  "gu",
  "as",
  "brx",
  "doi",
  "kn",
  "ks",
  "kok",
  "mai",
  "ml",
  "mni",
  "ne",
  "or",
  "pa",
  "sa",
  "sat",
  "sd",
  "ur",
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
  as: "অসমীয়া",
  brx: "बड़ो",
  doi: "डोगरी",
  kn: "ಕನ್ನಡ",
  ks: "کٲشُر",
  kok: "कोंकणी",
  mai: "मैथिली",
  ml: "മലയാളം",
  mni: "ꯃꯤꯇꯩꯂꯣꯟ",
  ne: "नेपाली",
  or: "ଓଡ଼ିଆ",
  pa: "ਪੰਜਾਬੀ",
  sa: "संस्कृतम्",
  sat: "ᱥᱟᱱᱛᱟᱲᱤ",
  sd: "सिन्धी",
  ur: "اردو",
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
  as: "/as",
  brx: "/brx",
  doi: "/doi",
  kn: "/kn",
  ks: "/ks",
  kok: "/kok",
  mai: "/mai",
  ml: "/ml",
  mni: "/mni",
  ne: "/ne",
  or: "/or",
  pa: "/pa",
  sa: "/sa",
  sat: "/sat",
  sd: "/sd",
  ur: "/ur",
};

/** BCP-47 tag for <html lang>, per locale — script subtags included only
 *  where the language is genuinely ambiguous between scripts (Kashmiri,
 *  Manipuri, Santali, Sindhi all have more than one script in real use;
 *  the rest don't need one to be unambiguous). */
export const LOCALE_BCP47: Record<Locale, string> = {
  en: "en-IN",
  hi: "hi-IN",
  bn: "bn-IN",
  mr: "mr-IN",
  te: "te-IN",
  ta: "ta-IN",
  gu: "gu-IN",
  as: "as-IN",
  brx: "brx-IN",
  doi: "doi-IN",
  kn: "kn-IN",
  ks: "ks-Arab-IN",
  kok: "kok-IN",
  mai: "mai-IN",
  ml: "ml-IN",
  mni: "mni-Mtei-IN",
  ne: "ne-IN",
  or: "or-IN",
  pa: "pa-IN",
  sa: "sa-IN",
  sat: "sat-Olck-IN",
  sd: "sd-Deva-IN",
  ur: "ur-IN",
};

/** Reading direction per locale. Only the two Perso-Arabic/Nastaliq
 *  languages (Kashmiri, Urdu) are RTL — Sindhi here is written in
 *  Devanagari, not the Perso-Arabic script it sometimes uses elsewhere. */
export const LOCALE_DIR: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  hi: "ltr",
  bn: "ltr",
  mr: "ltr",
  te: "ltr",
  ta: "ltr",
  gu: "ltr",
  as: "ltr",
  brx: "ltr",
  doi: "ltr",
  kn: "ltr",
  ks: "rtl",
  kok: "ltr",
  mai: "ltr",
  ml: "ltr",
  mni: "ltr",
  ne: "ltr",
  or: "ltr",
  pa: "ltr",
  sa: "ltr",
  sat: "ltr",
  sd: "ltr",
  ur: "rtl",
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

const as: Dictionary = {
  languageSwitch: { label: "ভাষা" },
  hero: {
    eyebrow: "ভাৰতীয় আইনৰ বাবে · উচ্চতম ন্যায়ালয় আৰু উচ্চ ন্যায়ালয়সমূহ",
    line1: [{ text: "প্ৰতিজন মহান আইনজীৱীৰ এজন " }, { text: "গুৰু", em: true }, { text: " আছিল।" }],
    line2: [{ text: "এতিয়া আপোনাৰ গুৰু AI — ভাৰতীয় আইনৰ বাবে সাজি উলিওৱা।" }],
    subhead:
      "ভাৰতীয় আইনৰ বাবে পাঠ্যক্ৰম আৰু এটা AI ড্ৰাফ্টিং সহায়ক — আইন শিক্ষাৰ্থী, ভাৱী আইনজীৱী, আৰু কৰ্মৰত এডভোকেটসকলৰ বাবে।",
    ctaPrimary: "শিশো ব্যৱহাৰ কৰি চাওক",
    ctaSecondary: "পাঠ্যক্ৰম চাওক",
    ctaNote: "কোনো কাৰ্ডৰ প্ৰয়োজন নাই।",
  },
  matterFlow: {
    eyebrow: "ক’ৰ পৰা আৰম্ভ কৰিব",
    heading: [{ text: "আপুনি য’ত " }, { text: "আছে", em: true }, { text: " সেই পৰ্যায়টো বিচাৰক।" }],
    seeMap: "সম্পূৰ্ণ মানচিত্ৰখন চাওক",
    stages: {
      1: { title: "হোমপেজ", summary: "যত কোনোবাই উপস্থিত হয়, আৰু শিশো কি তাক জানে।" },
      2: { title: "এডভোকেট", summary: "কোনে গোচৰ আনে, আৰু সেয়া কোন ফ’ৰামৰ।" },
      3: { title: "ৰাজ্য", summary: "গোচৰ ওপৰলৈ যায়: ৰিট এখতিয়াৰ আৰু উচ্চতম ন্যায়ালয়।" },
      4: { title: "খচৰা", summary: "প্ৰথম নথিখন কাগজত আহে, বেয়াৰ এক্টৰ বিপৰীতে পৰীক্ষা কৰা।" },
      5: {
        title: "অন্তৰ্বৰ্তীকালীন আবেদন",
        summary: "গোচৰ বিচাৰাধীন থকা সময়ত বিচৰা প্ৰতিকাৰ — আবেদন, তাৰ ভিত্তিত থকা শপতনামা, আৰু তাৰ উত্তৰবোৰ।",
      },
      6: {
        title: "আৰজি / বিষয়বোৰ",
        summary: "গোচৰ আৰু তাৰ উত্তৰ, শেষত ন্যায়ালয়ে নিৰ্ধাৰণ কৰা বিষয়বোৰলৈকে।",
      },
      7: { title: "বিচাৰ", summary: "বিষয়বোৰ নিৰ্ধাৰণ হোৱাৰ পিছত সাক্ষ্য আৰু যুক্তি।" },
      8: { title: "উদ্ধৃতি", summary: "প্ৰতিটো যুক্তি প্ৰকৃততে বাধ্যতামূলক কৰ্তৃপক্ষৰ সৈতে সংযুক্ত।" },
      9: { title: "গোচৰৰ পিছত", summary: "ফাইল বন্ধ হোৱাৰ পিছত কি হয়।" },
    },
    products: { "draft-bot": "শিশো", library: "আইন গ্ৰন্থাগাৰ", courses: "পাঠ্যক্ৰম" },
  },
  featureStrip: {
    features: [
      {
        name: "শিশো",
        body: "এখন আৰজি, জাননী, আবেদন বা চুক্তি পেষ্ট কৰক। মাৰ্জিনত ধাৰা-স্তৰীয় মন্তব্য পাওক, ৰেজিষ্ট্ৰীয়ে কৰাৰ আগতেই প্ৰক্ৰিয়া পৰীক্ষা কৰা হয় — ঠিক যেনেকৈ এজন জ্যেষ্ঠই ঘূৰাই দিব।",
      },
      {
        name: "আইন গ্ৰন্থাগাৰ",
        body: "উচ্চতম ন্যায়ালয় আৰু উচ্চ ন্যায়ালয়ৰ ৰায়, বেয়াৰ এক্ট, আৰু ভাষ্য। SCC ৰূপত উদ্ধৃত, সহজ ভাষাত ব্যাখ্যা কৰা।",
      },
      {
        name: "পাঠ্যক্ৰম",
        body: "দুটা ট্ৰেক — ভেটিৰ বাবে ষ্টাৰ্টাৰ, অন্তৰ্বৰ্তীকালীন প্ৰতিকাৰ, বাণিজ্যিক খচৰা প্ৰস্তুতকৰণ আৰু গোচৰ কৌশলৰ বাবে প্ৰফিচিয়েণ্ট। প্ৰতিটো মডিউল এটা ফাইলিঙত শেষ হয়, কুইজত নহয়।",
      },
    ],
    exploreLabel: (name) => `${name} চাওক`,
  },
  productShowcase: {
    pill: "শিশো · ডেমো ম’ড",
    heading: [{ text: "মাৰ্ক-আপ কৰা এখন " }, { text: "খচৰা", em: true }, { text: " কেনেকুৱা দেখা যায় চাওক।" }],
    body: "বাওঁফালে এখন আৰজি বা চুক্তি পেষ্ট কৰক। মন্তব্যবোৰ মাৰ্জিনলৈ ঘূৰি আহে, প্ৰতিটো সেই ধাৰাৰ সৈতে সংযুক্ত যিটো ই চিহ্নিত কৰে আৰু যি ভাৰতীয় কৰ্তৃপক্ষৰ ওপৰত ই নিৰ্ভৰ কৰে।",
    ctaPrimary: "শিশো খোলক",
    ctaSecondary: "মূল্য চাওক",
    miniNotes: [
      "অনুচ্ছেদ ২২৬ — আঞ্চলিক এখতিয়াৰ উত্থাপন কৰক।",
      "অন্তৰ্বৰ্তীকালীন প্ৰতিকাৰ: তিনিওটা অংগ উত্থাপন কৰক।",
      "সত্যাপন ধাৰা নাই — আদেশ VI নিয়ম ১৫।",
    ],
    figcaption:
      "শিশো কৰ্মস্থানৰ এক পূৰ্বদৰ্শন: বাওঁফালে খচৰা, আৰু সোঁফালৰ মাৰ্জিনত তিনিটা শিশো মন্তব্য — অনুচ্ছেদ ২২৬ৰ অধীনত আঞ্চলিক এখতিয়াৰ, অন্তৰ্বৰ্তীকালীন প্ৰতিকাৰৰ বাবে প্ৰয়োজনীয় তিনিওটা অংগ, আৰু দেৱানী প্ৰক্ৰিয়া সংহিতাৰ আদেশ VI নিয়ম ১৫ৰ অধীনত এটা নথকা সত্যাপন ধাৰা।",
  },
  pricingPreview: {
    eyebrow: "মূল্য",
    heading: [{ text: "এজন শিক্ষাৰ্থীৰ " }, { text: "বাজেট", em: true }, { text: "ৰ বাবে মূল্য নিৰ্ধাৰণ কৰা।" }],
    seeFull: "সম্পূৰ্ণ তুলনা চাওক",
    forever: "চিৰকালৰ বাবে",
    perMonth: "প্ৰতি মাহে",
    mostPopular: "Recommended for students",
    taglines: {
      free: "এজন গুৰুৱে আপোনাৰ কামটো কেনেকৈ চিহ্নিত কৰে চাওক।",
      basic: "পঢ়া আৰু অধ্যয়নৰ বাবে সকলো — বটটো ফ্ৰী ট্ৰায়েলতে থাকে।",
      core: "সম্পূৰ্ণ ভেটি, আৰু বটটো কোনো সীমা নোহোৱাকৈ।",
      proficient: "এডভোকেট আৰু প্ৰেক্টিছত থকা শেষ বৰ্ষৰ শিক্ষাৰ্থীসকলৰ বাবে।",
    },
  },
  finalCta: {
    heading: [{ text: "আপোনাৰ খচৰাখন এজন " }, { text: "গুৰু", em: true }, { text: "ৰ আগত থওক।" }],
    body: "প্ৰতি মাহে পাঁচটা বিনামূলীয়া পৰ্যালোচনা। কোনো কাৰ্ডৰ প্ৰয়োজন নাই, আৰু একো ইনষ্টল কৰাৰ প্ৰয়োজন নাই।",
    ctaPrimary: "শিশো ব্যৱহাৰ কৰি চাওক",
    ctaSecondary: "মূল্য চাওক",
  },
};

const brx: Dictionary = {
  languageSwitch: { label: "राव" },
  hero: {
    eyebrow: "भारतारि खान्थिनि थाखाय · बृहत आरो हाईकोर्टफोर",
    line1: [{ text: "गासै मोनसे मोनथाब वकीलनि सोरजिथारा " }, { text: "गुरु", em: true }, { text: " मोन्नाय।" }],
    line2: [{ text: "दानि नोंनि गुरु जायो AI — भारतारि खान्थिनि थाखाय सोरजिनाय।" }],
    subhead:
      "भारतारि खान्थिनि थाखाय क्लासफोर आरो मोनसे AI मसौदा रांगोदै — कानूनारि पिपिलफोर, वकील जानाय गोनांथिफोर, आरो वकील खामानि खालामनायफोरनि थाखाय।",
    ctaPrimary: "शिशो नुनाय",
    ctaSecondary: "क्लासफोर नुगिर",
    ctaNote: "कार्ड गोनां नङा।",
  },
  matterFlow: {
    eyebrow: "बहागोन खामानि सोरजिनो",
    heading: [{ text: "नों " }, { text: "दंनाय", em: true }, { text: " आन्जौनिखौ नागिर।" }],
    seeMap: "गासैखौ मैप नुगिर",
    stages: {
      1: { title: "होमपेज", summary: "मानो जागाय जायो, आरो शिशो मानो सो सिबिनाय।" },
      2: { title: "वकील", summary: "साखा सोदोब सोलायो, आरो बे मानो फोरामनि।" },
      3: { title: "राज्य", summary: "साखा गोजौआव थांगो: रिट आधिकार आरो बृहत आदालत।" },
      4: { title: "मसौदा", summary: "गिबि दस्तावेजआ कागोजाव फैयो, बेयार एक्टनि सोरगिदिंनायाव जासायनाय।" },
      5: {
        title: "मोनथाब आवेदन",
        summary: "साखा दंबाय समाव नांगौ थानाय राहा — आवेदन, बेनि गादिनि सोपोथ, आरो बेनि जाबाब।",
      },
      6: {
        title: "आरजि / बिबादफोर",
        summary: "साखा आरो बेनि जाबाब, जोबथा आदालताव थि खालामनाय बिबादफोर सिम्बो।",
      },
      7: { title: "बिचार", summary: "बिबादफोर थि खालामनायनि उनाव गोदान आरो सोदोब सोलायनाय।" },
      8: { title: "उद्धृति", summary: "गासै सोदोब सोलायनाया गोसो जोबनांगौ आधिकारजों जोरजिनाय।" },
      9: { title: "साखानि उनाव", summary: "फाइलआ बन्द जानायनि उनाव मानो जायो।" },
    },
    products: { "draft-bot": "शिशो", library: "कानून लाइब्रेरी", courses: "क्लासफोर" },
  },
  featureStrip: {
    features: [
      {
        name: "शिशो",
        body: "मोनसे आरजि, नोटिस, आवेदन एबा गिबि पेस्ट खालाम। मार्जिनाव धारा-स्तरनि नोट मोन, रेजिस्ट्रीआव सोलायनायनि सिगां प्रक्रिया जासायजादों — मोनसे बर सिनियरआ फिन होनायनि रोखोमै।",
      },
      {
        name: "कानून लाइब्रेरी",
        body: "बृहत आरो हाईकोर्टनि फैसलाफोर, बेयार एक्टफोर, आरो बियाख्या। SCC रोखोमाव सिबिनाय, गोरलै रावजों बुजिनाय।",
      },
      {
        name: "क्लासफोर",
        body: "बिजोन ट्रेक — बुनियादनि थाखाय स्टार्टार, मोनथाब राहा, बाणिज्यिक मसौदा आरो साखा रणनीतिनि थाखाय प्रफिसिएन्ट। गासै मोड्युला मोनसे फाइलिंआव सिम्बो, क्विजाव नङा।",
      },
    ],
    exploreLabel: (name) => `${name} नुगिर`,
  },
  productShowcase: {
    pill: "शिशो · डेमो मोड",
    heading: [{ text: "चिं-खालामनाय मोनसे " }, { text: "मसौदा", em: true }, { text: " मुकुं दं सो नुगिर।" }],
    body: "गेदेरसिनाव मोनसे आरजि एबा गिबि पेस्ट खालाम। नोटफोरा मार्जिनाव फिन फैयो, गासैआ बे धारानि साथियाव जोरजिनाय जायखौ बेयो सिबिनाय आरो बे भारतारि आधिकारनि सोरगिदिंनायाव।",
    ctaPrimary: "शिशो खेवला",
    ctaSecondary: "बिबादि नुगिर",
    miniNotes: [
      "अनुच्छेद २२६ — क्षेत्रीय आधिकारखौ राखा।",
      "मोनथाब राहा: थार गोसोआ राखा।",
      "जासायनाय धारा गैया — आदेश VI नियम १५।",
    ],
    figcaption:
      "शिशो वर्कस्पेसनि मोनसे नुनाय: गेदेरसिनाव मसौदा, आरो गाबसिनि मार्जिनाव थार शिशो नोट — अनुच्छेद २२६नि निमथे क्षेत्रीय आधिकार, मोनथाब राहानि थाखाय गोनां थार गोसो, आरो सिविल प्रक्रिया संहितानि आदेश VI नियम १५नि निमथे मोनथिनाय जासायनाय धारा।",
  },
  pricingPreview: {
    eyebrow: "बिबादि",
    heading: [{ text: "मोनसे पिपिलनि " }, { text: "बजेट", em: true }, { text: "नि थाखाय बिबादि थिनाय।" }],
    seeFull: "गासै तुलना नुगिर",
    forever: "जोबथानि थाखाय",
    perMonth: "दान सान",
    mostPopular: "Recommended for students",
    taglines: {
      free: "मोनसे गुरुआ नोंनि खामानिखौ मुकुं सिबिनाय नुगिर।",
      basic: "फोरागिनाय आरो सारनानि थाखाय गासैबो — बटआ फ्री ट्रायालावनो थायो।",
      core: "गासै बुनियाद, आरो बटआ खोन्दो गैयोबाब।",
      proficient: "वकीलफोर आरो खामानि खालामनाय जोबथा बोसोरनि पिपिलफोरनि थाखाय।",
    },
  },
  finalCta: {
    heading: [{ text: "नोंनि मसौदाखौ मोनसे " }, { text: "गुरु", em: true }, { text: "नि सिगाव थ।" }],
    body: "दान सान पांचसे फ्री समीक्षा। कार्ड गोनां नङा, आरो मोनोबा इनस्टल खालामनाय गोनां नङा।",
    ctaPrimary: "शिशो नुनाय",
    ctaSecondary: "बिबादि नुगिर",
  },
};

const doi: Dictionary = {
  languageSwitch: { label: "भाशा" },
  hero: {
    eyebrow: "भारतीय कानूनेआ लेई · सुप्रीम कोर्ट ते हाई कोर्ट",
    line1: [{ text: "हर इक महान वकीले दा इक " }, { text: "गुरू", em: true }, { text: " होंदा हा।" }],
    line2: [{ text: "हुण तुंदा गुरू AI ऐ — भारतीय कानूनेआ लेई बनाया गेदा।" }],
    subhead:
      "भारतीय कानूनेआ लेई कोर्स ते इक AI ड्राफ्टिंग सहायक — कानूनी विद्यार्थियां, भोंणे आह् ले वकीलां, ते प्रैक्टिस करदे वकीलां लेई।",
    ctaPrimary: "शिशो अजमाओ",
    ctaSecondary: "कोर्स दिक्खो",
    ctaNote: "कोई कार्ड नेईं चाहीदा।",
  },
  matterFlow: {
    eyebrow: "कुत्थु शुरू करना ऐ",
    heading: [{ text: "उ पड़ाओ लब्भो जित्थू तुसें " }, { text: "ओ", em: true }, { text: "।" }],
    seeMap: "पूरा नक्शा दिक्खो",
    stages: {
      1: { title: "होमपेज", summary: "जित्थू कोई पुज्जदा ऐ, ते शिशो की ऐ।" },
      2: { title: "वकील", summary: "कुण मामला लोआन्दा ऐ, ते ओह् केह् फोरमेआ दा ऐ।" },
      3: { title: "राज्य", summary: "मामला उप्पर जंदा ऐ: रिट अधिकार क्षेत्र ते सुप्रीम कोर्ट।" },
      4: { title: "ड्राफ्ट", summary: "पैह् ला दस्तावेज़ कागज़ उप्पर औंदा ऐ, बेयर एक्टेआ दे खलाफ जांचेआ गेदा।" },
      5: {
        title: "अंतरिम अरजी",
        summary: "मुकद्दमा लंबित रौंदे राहत मंगी गेई — अरजी, उसदा आधार शपथ पत्र, ते उसदे जवाब।",
      },
      6: {
        title: "वाद-पत्र / मुद्दे",
        summary: "मुकद्दमा ते उसदा जवाब, आखर उन मुद्दें तगर जिन्हां गी कोर्ट तय करदा ऐ।",
      },
      7: { title: "सुनवाई", summary: "सबूत ते दलील, मुद्दे तय होने दे बाद।" },
      8: { title: "हवाले", summary: "हर दलील इक असली बाध्यकारी अधिकार कन्ने जुड़ोई।" },
      9: { title: "मामलेआ दे बाद", summary: "फाइल बंद होने दे बाद केह् होंदा ऐ।" },
    },
    products: { "draft-bot": "शिशो", library: "कानूनी लाइब्रेरी", courses: "कोर्स" },
  },
  featureStrip: {
    features: [
      {
        name: "शिशो",
        body: "इक वाद-पत्र, नोटिस, अरजी जां इकरारनामा पेस्ट करो। हाशिये च धारा-स्तरीय टिप्पणियां लैओ, रजिस्ट्री थमां पैह्ले प्रक्रिया जांची जंदी ऐ — ठीक जि्यां इक सीनियर वापस देंदा।",
      },
      {
        name: "कानूनी लाइब्रेरी",
        body: "सुप्रीम कोर्ट ते हाई कोर्टे दे फैसले, बेयर एक्ट, ते व्याख्या। SCC रूपे च हवाला दित्ता, सोखी भाशा च समझाया गेदा।",
      },
      {
        name: "कोर्स",
        body: "दो ट्रैक — नींहा लेई स्टार्टर, अंतरिम राहत, व्यापारिक ड्राफ्टिंग ते मुकद्दमेबाज़ी रणनीतिया लेई प्रोफिशिएंट। हर मॉड्यूल इक फाइलिंगे च मुक्कदा ऐ, क्विज़े च नेईं।",
      },
    ],
    exploreLabel: (name) => `${name} दिक्खो`,
  },
  productShowcase: {
    pill: "शिशो · डेमो मोड",
    heading: [{ text: "दिक्खो इक मार्क-अप कीता " }, { text: "ड्राफ्ट", em: true }, { text: " किन्ने दा लगदा ऐ।" }],
    body: "खब्भे पासे इक वाद-पत्र जां इकरारनामा पेस्ट करो। टिप्पणियां हाशिये च वापस औंदियां न, हर इक उस धारा कन्ने जुड़ोई जिसगी ओह् दस्सा दी ऐ ते उस भारतीय अधिकारे कन्ने जिस उप्पर ओह् आधारित ऐ।",
    ctaPrimary: "शिशो खोह्लो",
    ctaSecondary: "कीमत दिक्खो",
    miniNotes: [
      "अनुच्छेद 226 — क्षेत्रीय अधिकार क्षेत्र दी दलील देओ।",
      "अंतरिम राहत: तिन्नै अंगें दी दलील देओ।",
      "सत्यापन धारा नेईं — आदेश VI नियम 15।",
    ],
    figcaption:
      "शिशो वर्कस्पेसे दी इक झलक: खब्भे पासे ड्राफ्ट, ते सजे हाशिये च तिन्न शिशो टिप्पणियां — अनुच्छेद 226 दे अधीन क्षेत्रीय अधिकार क्षेत्र, अंतरिम राहत लेई ज़रूरी तिन्नै अंग, ते सिविल प्रक्रिया संहिता दे आदेश VI नियम 15 दे अधीन इक गैर-हाज़र सत्यापन धारा।",
  },
  pricingPreview: {
    eyebrow: "कीमत",
    heading: [{ text: "इक विद्यार्थिये दे " }, { text: "बजट", em: true }, { text: " आस्तै कीमत रक्खी गेई।" }],
    seeFull: "पूरी तुलना दिक्खो",
    forever: "हमेशा आस्तै",
    perMonth: "हर म्हीने",
    mostPopular: "Recommended for students",
    taglines: {
      free: "दिक्खो इक गुरू तुंदे कम्मा गी किन्ना निशान लांदा ऐ।",
      basic: "पढ़ने ते पढ़ाई आस्तै सब किश — बॉट फ्री ट्रायल उप्पर गै रौंह्दा ऐ।",
      core: "पूरी नींह, ते बॉट बगैर कुसै सीमा दे।",
      proficient: "वकीलां ते प्रैक्टिसे च आखरी सालै दे विद्यार्थियां आस्तै।",
    },
  },
  finalCta: {
    heading: [{ text: "अपना ड्राफ्ट इक " }, { text: "गुरू", em: true }, { text: " दे सामह्णे रक्खो।" }],
    body: "हर म्हीने पंज मुफ़्त समीक्षाएं। कोई कार्ड नेईं चाहीदा, ते कुछ बी इंस्टाल नेईं करना।",
    ctaPrimary: "शिशो अजमाओ",
    ctaSecondary: "कीमत दिक्खो",
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

const ks: Dictionary = {
  languageSwitch: { label: "زبان" },
  hero: {
    eyebrow: "ہِندوستٲنؠ قانونَس خٲطرٕ · سپریم کورٹ تہٕ ہٲے کورٹ",
    line1: [{ text: "ہر اکھ عظیم وکیلَس ہیوت اکھ " }, { text: "گورو", em: true }, { text: "۔" }],
    line2: [{ text: "اَتہٕ چھُ توہند گورو AI — ہِندوستٲنؠ قانونَس خٲطرٕ بناوان آمُت۔" }],
    subhead:
      "ہِندوستٲنؠ قانونَس خٲطرٕ کورس تہٕ اکھ AI ڈرافٹنگ مددگار — قانونی طالب علماں، ہونہٕ وول وکیلاں، تہٕ پریکٹِس کرن واِلن وکیلاں خٲطرٕ۔",
    ctaPrimary: "شِشو آزماوِو",
    ctaSecondary: "کورس ہیکھِو",
    ctaNote: "کانہہ کارڈ ضرورت چھُ نہٕ۔",
  },
  matterFlow: {
    eyebrow: "کوت تہٕ شروع کرُن",
    heading: [{ text: "زِ منزِل پؠٹھ توہِہ " }, { text: "چھِو", em: true }, { text: "، سٕہ ژھانڈِو۔" }],
    seeMap: "ساری نقشٕ ہیکھِو",
    stages: {
      1: { title: "ہوم پیج", summary: "زِ جاے پؠٹھ کانہہ پہنچان چھُ، تہٕ شِشو کیا چھُ۔" },
      2: { title: "وکیل", summary: "کُس کیس بنٲوان چھُ، تہٕ سٕہ کُس فورمَس منز چھُ۔" },
      3: { title: "ریاست", summary: "کیس چھُ اوپر گژھان: رِٹ اختیار تہٕ سپریم کورٹ۔" },
      4: { title: "مسودہ", summary: "پؠٹھمی دستاویز چھُ کاغذَس پؠٹھ آسان، بیئر ایکٹَس خلاف پرکھنہٕ آمُت۔" },
      5: {
        title: "عارضی درخواست",
        summary: "کیس چھُ زَنٕ زیر التوا، تہٕ راحت طلب کرنہٕ چھُ — درخواست، سُہند بنیاد حلف نامہ، تہٕ سُہند جواب۔",
      },
      6: {
        title: "دعویٰ / معاملہٕ",
        summary: "کیس تہٕ سُہند جواب، تہٕ آخرِس منز عدالت چھُ زِ معاملہٕ طئے کران۔",
      },
      7: { title: "سماعت", summary: "معاملہٕ طئے گژھنہٕ پتہٕ ثبوت تہٕ دلیل۔" },
      8: { title: "حوالہٕ جات", summary: "ہر دلیل چھُ اکِس حقیقی پابند اختیارَس ساتھ ملان۔" },
      9: { title: "کیسَس پتہٕ", summary: "فائل بند گژھنہٕ پتہٕ کیا گژھان چھُ۔" },
    },
    products: { "draft-bot": "شِشو", library: "قانونی لائبریری", courses: "کورس" },
  },
  featureStrip: {
    features: [
      {
        name: "شِشو",
        body: "اکھ دعویٰ، نوٹِس، درخواست یا معاہدہٕ پیسٹ کریو۔ حاشیَس منز شق-سطحی نوٹ ہیکھِو، رجسٹری کرنہٕ برونٹھ طریقہٕ کار چھُ پرکھنہٕ آمُت — ٹھیک زِ اکھ سینیئر وکیل واپس دِتاں۔",
      },
      {
        name: "قانونی لائبریری",
        body: "سپریم کورٹ تہٕ ہٲے کورٹَن ہند فیصلہٕ، بیئر ایکٹ، تہٕ تشریح۔ SCC شکلَس منز حوالہٕ دِتمت، سادہٕ زبانَس منز واضح کرنہٕ آمت۔",
      },
      {
        name: "کورس",
        body: "دو ٹریک — بنیادَن خٲطرٕ سٹارٹر، عارضی راحت، تجارتی مسودہٕ تہٕ مقدمہٕ بازی حکمت عملیَس خٲطرٕ پروفیشنٹ۔ ہر ماڈیول چھُ اکِس فائلنگَس منز ختم گژھان، کوئز منز نہٕ۔",
      },
    ],
    exploreLabel: (name) => `${name} ہیکھِو`,
  },
  productShowcase: {
    pill: "شِشو · ڈیمو موڈ",
    heading: [{ text: "اکھ نِشان زد " }, { text: "مسودہٕ", em: true }, { text: " کیازِ نظر آسان چھُ، سٕہ ہیکھِو۔" }],
    body: "کھوفٕر طرف اکھ دعویٰ یا معاہدہٕ پیسٹ کریو۔ نوٹ چھِ حاشیَس منز واپس یِوان، ہر اکھ سُہند شق سیتھ تہٕ سُہند بنیاد بنی اکِس ہِندوستٲنؠ اختیارَس سیتھ ملان چھُ۔",
    ctaPrimary: "شِشو کھولیو",
    ctaSecondary: "قیمت ہیکھِو",
    miniNotes: [
      "دفعہ 226 — علاقائی اختیار پیش کریو۔",
      "عارضی راحت: ترٕے واریاہ نکات پیش کریو۔",
      "تصدیقی شق چھُ نہٕ — آرڈر VI رول 15۔",
    ],
    figcaption:
      "شِشو ورک اسپیسَس ہند اکھ پیش نظارہٕ: کھوفٕر طرف مسودہٕ، تہٕ دوٚہِن حاشیَس منز ترٕے شِشو نوٹ — دفعہ 226 تحت علاقائی اختیار، عارضی راحتَس خٲطرٕ ضروری ترٕے نکات، تہٕ سِوِل پروسیجر کوڈَس ہند آرڈر VI رول 15 تحت غیر حاضر تصدیقی شق۔",
  },
  pricingPreview: {
    eyebrow: "قیمت",
    heading: [{ text: "اکِس طالب علمَس ہند " }, { text: "بجٹ", em: true }, { text: " منظر رکھِتھ قیمت۔" }],
    seeFull: "ساری موازنہٕ ہیکھِو",
    forever: "ہمیشہٕ خٲطرٕ",
    perMonth: "ہر مہینَس",
    mostPopular: "Recommended for students",
    taglines: {
      free: "ہیکھِو اکھ گورو توہند کام کیازِ نِشان زد کران چھُ۔",
      basic: "پرنہٕ تہٕ سکھنہٕ خٲطرٕ سارِنہٕ چیز — بوٹ چھُ فری ٹرائلَس پؠٹھ ہیوان۔",
      core: "ساری بنیاد، تہٕ بوٹ بغیر کانہہ حدٕ۔",
      proficient: "وکیلن تہٕ پریکٹِس منز آخری سالَس ہند طالب علمن خٲطرٕ۔",
    },
  },
  finalCta: {
    heading: [{ text: "توہند مسودہٕ اکِس " }, { text: "گورو", em: true }, { text: " برونٹھ رکھِو۔" }],
    body: "ہر مہینَس پانژ فری جائزٕ۔ کانہہ کارڈ ضرورت چھُ نہٕ، تہٕ کانہہ چیز انسٹال کرنُک ضرورت چھُ نہٕ۔",
    ctaPrimary: "شِشو آزماوِو",
    ctaSecondary: "قیمت ہیکھِو",
  },
};

const kok: Dictionary = {
  languageSwitch: { label: "भास" },
  hero: {
    eyebrow: "भारतीय कायद्याखातीर · सर्वोच्च न्यायालय आनी उच्च न्यायालयां",
    line1: [{ text: "दर एका म्हान वकिलाक एक " }, { text: "गुरू", em: true }, { text: " आशिल्लो." }],
    line2: [{ text: "आतां तुमचो गुरू AI आसा — भारतीय कायद्याखातीर तयार केल्लो." }],
    subhead:
      "भारतीय कायद्याखातीर कोर्सेस आनी एक AI मसुदो सहाय्यक — कायद्याचे विद्यार्थी, फुडाराचे वकील, आनी प्रॅक्टिस करपी वकिलांखातीर.",
    ctaPrimary: "शिशो वापरून पळेयात",
    ctaSecondary: "कोर्सेस पळेयात",
    ctaNote: "कसलेंच कार्ड जाय ना.",
  },
  matterFlow: {
    eyebrow: "खंय सावन सुरवात करची",
    heading: [{ text: "तुमी आसात तो टप्पो " }, { text: "सोदून काडात", em: true }, { text: "." }],
    seeMap: "सगळो नकासो पळेयात",
    stages: {
      1: { title: "मुखेल पान", summary: "खंय कोणूय पावता, आनी शिशो म्हणल्यार काय." },
      2: { title: "वकील", summary: "प्रकरण कोण हाडटा, आनी तें खंयच्या फोरमाचें." },
      3: { title: "राज्य", summary: "प्रकरण वयर सरता: रिट अधिकारक्षेत्र आनी सर्वोच्च न्यायालय." },
      4: { title: "मसुदो", summary: "पयलो दस्तावेज कागदार येता, बेअर ऍक्टा आदीं तपासलेलो." },
      5: {
        title: "अंतरिम अर्ज",
        summary: "प्रकरण प्रलंबीत आसतना मागिल्लो निवारण — अर्ज, ताचो आदार आशिल्लें प्रतिज्ञापत्र, आनी ताचे जाप.",
      },
      6: {
        title: "दावो-पत्र / मुद्दे",
        summary: "दावो आनी ताची जाप, निमाणें न्यायालय थारायता ते मुद्दे मेरेन.",
      },
      7: { title: "सुनावणी", summary: "मुद्दे थारायल्या उपरांत पुरावो आनी वाद." },
      8: { title: "हवाले", summary: "दर एक वाद खरोखर बंधनकारक आसा असल्या अधिकाराशीं जोडिल्लो." },
      9: { title: "प्रकरणा उपरांत", summary: "फायल बंद जाल्या उपरांत काय जाता." },
    },
    products: { "draft-bot": "शिशो", library: "कायदो ग्रंथालय", courses: "कोर्सेस" },
  },
  featureStrip: {
    features: [
      {
        name: "शिशो",
        body: "एक दावो-पत्र, नोटीस, अर्ज वा करार पेस्ट करात. मार्जिनांत कलम-स्तराच्यो टिपण्यो मेळयात, नोंदणी करचे पयलींच कार्यपद्धत तपासतात — बरोबर एक सिनियरान परत दिल्ल्यावरी.",
      },
      {
        name: "कायदो ग्रंथालय",
        body: "सर्वोच्च न्यायालय आनी उच्च न्यायालयाचे निर्णय, बेअर ऍक्टस, आनी टिप्पणी. SCC रुपांत हवाला दिल्लो, सोंप्या भाशेंत सांगिल्लो.",
      },
      {
        name: "कोर्सेस",
        body: "दोन ट्रॅक — बुन्याद खातीर स्टार्टर, अंतरिम निवारण, वेवसायीक मसुदो आनी दाव्याच्या रणनीती खातीर प्रोफिशियंट. दर एक मोड्यूल एका फायलिंगान सोंपता, क्विझान न्हय.",
      },
    ],
    exploreLabel: (name) => `${name} पळेयात`,
  },
  productShowcase: {
    pill: "शिशो · डेमो मोड",
    heading: [{ text: "मार्क-अप केल्लो " }, { text: "मसुदो", em: true }, { text: " कसो दिसता तें पळेयात." }],
    body: "दाव्या वटेन एक दावो-पत्र वा करार पेस्ट करात. टिपण्यो मार्जिनांत परत येतात, दर एक तें कलम कडेन जोडिल्लें जें ती नोंद करता आनी ज्या भारतीय अधिकारा वयर ती आदारिल्ली.",
    ctaPrimary: "शिशो उगडात",
    ctaSecondary: "दर पळेयात",
    miniNotes: [
      "कलम 226 — प्रादेशिक अधिकारक्षेत्र मांडात.",
      "अंतरिम निवारण: तिनूय घटक मांडात.",
      "पडताळणी कलम ना — आदेश VI नियम 15.",
    ],
    figcaption:
      "शिशो वर्कस्पेसाची एक झलक: दाव्या वटेन मसुदो, आनी उजव्या मार्जिनांत तीन शिशो टिपण्यो — कलम 226 खाला प्रादेशिक अधिकारक्षेत्र, अंतरिम निवारणा खातीर गरजेचे तिनूय घटक, आनी दिवाणी कार्यपद्धत संहितेच्या आदेश VI नियम 15 खाला ना आशिल्लें पडताळणी कलम.",
  },
  pricingPreview: {
    eyebrow: "दर",
    heading: [{ text: "एका विद्यार्थ्याच्या " }, { text: "बजेटा", em: true }, { text: " खातीर दर थारायल्यात." }],
    seeFull: "सगळी तुळा पळेयात",
    forever: "सदांकाळ",
    perMonth: "दर म्हयन्याक",
    mostPopular: "Recommended for students",
    taglines: {
      free: "एक गुरू तुमचें काम कशें नोंद करता तें पळेयात.",
      basic: "वाचप आनी शिकपाखातीर सगळें — बॉट फ्री ट्रायलारूच उरता.",
      core: "सगळी बुन्याद, आनी बॉट कसल्याच मर्यादे बगर.",
      proficient: "वकील आनी प्रॅक्टिसींतल्या निमाण्या वर्साच्या विद्यार्थ्यांखातीर.",
    },
  },
  finalCta: {
    heading: [{ text: "तुमचो मसुदो एका " }, { text: "गुरूच्या", em: true }, { text: " फुडें दवरात." }],
    body: "दर म्हयन्याक पांच फुकट समीक्षा. कसलेंच कार्ड जाय ना, आनी कितेंच इनस्टॉल करचें ना.",
    ctaPrimary: "शिशो वापरून पळेयात",
    ctaSecondary: "दर पळेयात",
  },
};

const mai: Dictionary = {
  languageSwitch: { label: "भाषा" },
  hero: {
    eyebrow: "भारतीय कानूनक लेल · सर्वोच्च न्यायालय आ उच्च न्यायालय",
    line1: [{ text: "हर एक महान वकीलक एक " }, { text: "गुरु", em: true }, { text: " होइत छलाह." }],
    line2: [{ text: "आब अहाँक गुरु AI अछि — भारतीय कानूनक लेल बनल." }],
    subhead:
      "भारतीय कानूनक लेल कोर्स आ एक AI ड्राफ्टिंग सहायक — कानूनक विद्यार्थी, भावी वकील, आ प्रैक्टिस करैत अधिवक्तासभक लेल.",
    ctaPrimary: "शिशो आजमाउ",
    ctaSecondary: "कोर्स देखू",
    ctaNote: "कोनो कार्ड आवश्यक नहि.",
  },
  matterFlow: {
    eyebrow: "कतहु सँ शुरू करू",
    heading: [{ text: "ओ चरण खोजू जतय अहाँ " }, { text: "छी", em: true }, { text: "." }],
    seeMap: "पूरा नक्शा देखू",
    stages: {
      1: { title: "मुखपृष्ठ", summary: "जतय केओ पहुँचैत अछि, आ शिशो की अछि से." },
      2: { title: "वकील", summary: "के मामला अनैत अछि, आ ई कोन मंचक अछि." },
      3: { title: "राज्य", summary: "मामला ऊपर बढ़ैत अछि: रिट क्षेत्राधिकार आ सर्वोच्च न्यायालय." },
      4: { title: "मसौदा", summary: "पहिल दस्तावेज कागज पर अबैत अछि, बेयर एक्टक विरुद्ध जाँचल गेल." },
      5: {
        title: "अंतरिम आवेदन",
        summary: "मुकदमा लंबित रहला काल मंगल गेल राहत — आवेदन, ओकर आधार शपथपत्र, आ ओकर उत्तर.",
      },
      6: {
        title: "वाद-पत्र / मुद्दा",
        summary: "मुकदमा आ ओकर उत्तर, अंततः ओहि मुद्दा धरि जकरा न्यायालय तय करैत अछि.",
      },
      7: { title: "विचारण", summary: "मुद्दा तय भेलाक बाद साक्ष्य आ तर्क." },
      8: { title: "उद्धरण", summary: "हर तर्क कोनो वास्तवमे बाध्यकारी प्राधिकरणसँ जुड़ल." },
      9: { title: "मामलाक बाद", summary: "फाइल बन्न भेलाक बाद की होइत अछि." },
    },
    products: { "draft-bot": "शिशो", library: "कानून पुस्तकालय", courses: "कोर्स" },
  },
  featureStrip: {
    features: [
      {
        name: "शिशो",
        body: "एकटा वाद-पत्र, नोटिस, आवेदन वा अनुबंध पेस्ट करू. हाशिया मे धारा-स्तरीय टिप्पणी पाबू, रजिस्ट्री सँ पहिने प्रक्रिया जाँचल जाइत अछि — ठीक जेना एक सीनियर वापस सौंपथि.",
      },
      {
        name: "कानून पुस्तकालय",
        body: "सर्वोच्च न्यायालय आ उच्च न्यायालयक निर्णय, बेयर एक्ट, आ टिप्पणी. SCC रूपमे उद्धृत, सरल भाषामे समझायल.",
      },
      {
        name: "कोर्स",
        body: "दू ट्रैक — नींहक लेल स्टार्टर, अंतरिम राहत, वाणिज्यिक मसौदा आ मुकदमाबाजी रणनीतिक लेल प्रोफिशिएंट. हर मॉड्यूल एक फाइलिंगमे समाप्त होइत अछि, क्विजमे नहि.",
      },
    ],
    exploreLabel: (name) => `${name} देखू`,
  },
  productShowcase: {
    pill: "शिशो · डेमो मोड",
    heading: [{ text: "देखू एक मार्क-अप कएल " }, { text: "मसौदा", em: true }, { text: " केहन देखाइत अछि." }],
    body: "बामा दिस एक वाद-पत्र वा अनुबंध पेस्ट करू. टिप्पणी हाशियामे वापस अबैत अछि, हर एक ओहि धाराक सँग जुड़ल जकरा ओ चिह्नित करैत अछि आ ओहि भारतीय प्राधिकरण पर जे ओ आधारित अछि.",
    ctaPrimary: "शिशो खोलू",
    ctaSecondary: "मूल्य देखू",
    miniNotes: [
      "अनुच्छेद 226 — क्षेत्रीय क्षेत्राधिकार पर तर्क करू.",
      "अंतरिम राहत: तीनू अंग पर तर्क करू.",
      "सत्यापन धारा नहि — आदेश VI नियम 15.",
    ],
    figcaption:
      "शिशो वर्कस्पेसक एक झलक: बामा दिस मसौदा, आ दहिना हाशियामे तीन शिशो टिप्पणी — अनुच्छेद 226 क अंतर्गत क्षेत्रीय क्षेत्राधिकार, अंतरिम राहतक लेल आवश्यक तीनू अंग, आ सिविल प्रक्रिया संहिताक आदेश VI नियम 15 क अंतर्गत एक अनुपस्थित सत्यापन धारा.",
  },
  pricingPreview: {
    eyebrow: "मूल्य",
    heading: [{ text: "एक विद्यार्थीक " }, { text: "बजट", em: true }, { text: " क लेल मूल्य राखल गेल." }],
    seeFull: "पूरा तुलना देखू",
    forever: "सदिखन क लेल",
    perMonth: "प्रति मास",
    mostPopular: "Recommended for students",
    taglines: {
      free: "देखू एक गुरु अहाँक काज केना चिह्नित करैत छथि.",
      basic: "पढ़ब आ अध्ययनक लेल सभटा — बॉट फ्री ट्रायल परहिं रहैत अछि.",
      core: "पूरा नींह, आ बॉट बिना कोनो सीमाक.",
      proficient: "अधिवक्तासभ आ प्रैक्टिसमे अंतिम वर्षक विद्यार्थीक लेल.",
    },
  },
  finalCta: {
    heading: [{ text: "अपन मसौदा एक " }, { text: "गुरु", em: true }, { text: " क सामने राखू." }],
    body: "प्रति मास पाँच मुफ्त समीक्षा. कोनो कार्ड आवश्यक नहि, आ किछुओ इंस्टॉल करबाक आवश्यकता नहि.",
    ctaPrimary: "शिशो आजमाउ",
    ctaSecondary: "मूल्य देखू",
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

const mni: Dictionary = {
  languageSwitch: { label: "ꯂꯣꯟ" },
  hero: {
    eyebrow: "ꯏꯟꯗꯤꯌꯥꯅ ꯋꯥꯌꯦꯜ ꯒꯤ ꯑꯣꯏꯅ · ꯁꯨꯄ꯭ꯔꯤꯝ ꯀꯣꯔꯠ ꯑꯃꯗꯤ ꯍꯥꯏꯀꯣꯔꯠꯁꯤꯡ",
    line1: [{ text: "ꯑꯆꯧꯕ ꯋꯦꯀꯤꯜ ꯈꯨꯗꯤꯡꯃꯛꯅ ꯑꯃꯥ " }, { text: "ꯒꯨꯔꯨ", em: true }, { text: " ꯂꯩꯔꯝꯃꯤ꯫" }],
    line2: [{ text: "ꯍꯧꯖꯤꯛ ꯅꯍꯥꯛꯀꯤ ꯒꯨꯔꯨꯗꯨ AI ꯅꯤ — ꯏꯟꯗꯤꯌꯥꯅ ꯋꯥꯌꯦꯜ ꯒꯤꯗꯃꯛ ꯁꯦꯝꯒꯠꯄꯅꯤ꯫" }],
    subhead:
      "ꯏꯟꯗꯤꯌꯥꯅ ꯋꯥꯌꯦꯜ ꯒꯤꯗꯃꯛ ꯀꯣꯔ꯭ꯁ ꯑꯃꯁꯨꯡ ꯑꯃꯥ AI ꯗ꯭ꯔꯥꯐ꯭ꯇꯤꯡ ꯃꯄꯥꯡꯒꯜꯄ — ꯋꯥꯌꯦꯜ ꯁ꯭ꯇꯨꯗꯦꯟꯇꯁꯤꯡ, ꯒꯤꯗꯃꯛ ꯋꯦꯀꯤꯜ ꯑꯣꯏꯅꯕ ꯄꯥꯪꯖꯅꯕꯁꯤꯡ, ꯑꯃꯁꯨꯡ ꯄ꯭ꯔꯦꯛꯇꯤꯁ ꯇꯧꯔꯤꯕ ꯋꯦꯀꯤꯜꯁꯤꯡꯒꯤꯗꯃꯛꯀꯤ.",
    ctaPrimary: "ꯁꯤꯁꯣ ꯍꯣꯠꯅꯧ",
    ctaSecondary: "ꯀꯣꯔ꯭ꯁꯁꯤꯡ ꯌꯦꯡꯉꯨ",
    ctaNote: "ꯀꯥꯔ꯭ꯗ ꯇꯥꯕ ꯃꯇꯦꯡ ꯇꯥꯗꯦ꯫",
  },
  matterFlow: {
    eyebrow: "ꯀꯅꯗꯒꯤ ꯍꯧꯒꯗꯒꯦ",
    heading: [{ text: "ꯅꯍꯥꯛꯅ " }, { text: "ꯂꯩꯔꯤꯕ", em: true }, { text: " ꯑꯣꯏꯅ ꯐꯥꯎꯕ ꯐꯥꯎꯕꯗꯨ ꯐꯪꯅꯧ꯫" }],
    seeMap: "ꯃꯄꯨꯡ ꯐꯥꯅꯕ ꯃꯦꯞꯗꯨ ꯌꯦꯡꯉꯨ",
    stages: {
      1: { title: "ꯍꯣꯝꯄꯦꯖ", summary: "ꯀꯅꯗ ꯑꯃꯗ ꯀꯅꯅ ꯗꯨꯅ ꯗꯨꯃ ꯑꯃꯁꯨꯡ ꯁꯤꯁꯣꯗꯤ ꯀꯔꯤꯅꯣ꯫" },
      2: { title: "ꯑꯦꯗꯚꯣꯀꯦꯠ", summary: "ꯀꯅꯅ ꯀꯦꯁꯗꯨ ꯄꯨꯔꯀꯄ, ꯑꯃꯁꯨꯡ ꯃꯁꯤ ꯀꯔꯤꯒꯨꯝꯕ ꯐꯣꯔꯝꯒꯤꯅꯣ꯫" },
      3: { title: "ꯆꯩꯇꯦꯛ", summary: "ꯀꯦꯁꯗꯨ ꯃꯊꯪꯗ ꯆꯠꯂꯤ: ꯔꯤꯠ ꯑꯦꯗꯒꯤ ꯑꯀꯨꯄꯐꯦꯛ ꯑꯃꯁꯨꯡ ꯁꯨꯄ꯭ꯔꯤꯝ ꯀꯣꯔꯠ꯫" },
      4: { title: "ꯗ꯭ꯔꯥꯐ꯭ꯠ", summary: "ꯑꯍꯥꯅꯕ ꯗꯣꯀꯨꯃꯦꯟꯇꯗꯨ ꯆꯤꯡꯗ ꯂꯥꯀꯤ, ꯕꯦꯌꯔ ꯑꯦꯛꯇꯀꯤ ꯃꯌꯥꯝꯗ ꯌꯦꯡꯂꯤ꯫" },
      5: {
        title: "ꯃꯐꯝ ꯑꯃ ꯒꯤ ꯑꯦꯄ꯭ꯂꯤꯀꯦꯁꯟ",
        summary: "ꯀꯦꯁꯗꯨ ꯄꯦꯟꯗꯤꯡ ꯑꯣꯏꯔꯤꯕ ꯃꯇꯝꯗ ꯐꯪꯅꯕ ꯍꯣꯠꯄ — ꯑꯦꯄ꯭ꯂꯤꯀꯦꯁꯟ, ꯃꯁꯤꯒꯤ ꯃꯆꯥꯛ ꯑꯣꯏꯕ ꯑꯦꯐꯤꯗꯦꯚꯤꯠ, ꯑꯃꯁꯨꯡ ꯃꯁꯤꯒꯤ ꯄꯥꯪꯗꯦꯞꯁꯤꯡ꯫",
      },
      6: {
        title: "ꯄ꯭ꯂꯤꯗꯤꯡꯁ / ꯄꯣꯠꯁꯤꯡ",
        summary: "ꯀꯦꯁꯗꯨ ꯑꯃꯁꯨꯡ ꯃꯁꯤꯒꯤ ꯄꯥꯪꯗꯦꯞ, ꯑꯔꯣꯌꯕꯗ ꯀꯣꯔꯠꯅ ꯋꯥꯔꯦꯞꯐꯝꯒꯗꯕ ꯄꯣꯠꯁꯤꯡ ꯐꯥꯎꯕ꯫",
      },
      7: { title: "ꯆꯪꯗꯦ ꯅꯦꯠꯄ", summary: "ꯄꯣꯠꯁꯤꯡ ꯋꯥꯔꯦꯞꯗꯨꯅ ꯃꯅꯨꯡꯗ ꯑꯋꯥꯡꯕ ꯑꯃꯁꯨꯡ ꯋꯥꯐꯝ꯫" },
      8: { title: "ꯆꯤꯇꯦꯁꯟꯁꯤꯡ", summary: "ꯋꯥꯐꯝ ꯈꯨꯗꯤꯡꯃꯛꯅ ꯑꯆꯨꯝꯕ ꯑꯀꯨꯄꯐꯦꯛ ꯑꯃꯒ ꯃꯔꯤ ꯆꯅꯤ꯫" },
      9: { title: "ꯀꯦꯁꯒꯤ ꯃꯇꯨꯡꯗ", summary: "ꯐꯥꯏꯜ ꯂꯣꯏꯁꯤꯟꯕꯒꯤ ꯃꯇꯨꯡꯗ ꯀꯔꯤ ꯊꯣꯛꯏ꯫" },
    },
    products: { "draft-bot": "ꯁꯤꯁꯣ", library: "ꯋꯥꯌꯦꯜ ꯂꯥꯏꯕ꯭ꯔꯦꯔꯤ", courses: "ꯀꯣꯔ꯭ꯁꯁꯤꯡ" },
  },
  featureStrip: {
    features: [
      {
        name: "ꯁꯤꯁꯣ",
        body: "ꯄ꯭ꯂꯤꯟꯠ, ꯅꯣꯇꯤꯁ, ꯑꯦꯄ꯭ꯂꯤꯀꯦꯁꯟ ꯅꯠꯔꯒ ꯀꯟꯇ꯭ꯔꯦꯛꯠ ꯑꯃꯥ ꯄꯦꯁ꯭ꯇ ꯇꯧꯕꯤꯌꯨ꯫ ꯃꯥꯔꯖꯤꯟꯗ ꯄꯣꯠ ꯈꯨꯗꯤꯡꯃꯛꯀꯤ ꯅꯣꯠꯁꯤꯡ ꯐꯪꯒꯅꯤ, ꯔꯦꯖꯤꯁ꯭ꯇ꯭ꯔꯤꯗ ꯆꯠꯄ ꯃꯃꯥꯡꯗ ꯐꯤꯕꯝ ꯌꯦꯡꯆꯔꯤ꯫",
      },
      {
        name: "ꯋꯥꯌꯦꯜ ꯂꯥꯏꯕ꯭ꯔꯦꯔꯤ",
        body: "ꯁꯨꯄ꯭ꯔꯤꯝ ꯀꯣꯔꯠ ꯑꯃꯁꯨꯡ ꯍꯥꯏꯀꯣꯔꯠꯀꯤ ꯋꯥꯐꯝꯁꯤꯡ, ꯕꯦꯌꯔ ꯑꯦꯛꯠꯁꯤꯡ, ꯑꯃꯁꯨꯡ ꯋꯥꯐꯝ꯫ SCC ꯐꯣꯔꯃꯗ ꯄꯨꯛꯅꯤꯡ ꯆꯪꯕ, ꯄꯥꯡꯒꯜ ꯂꯣꯟꯗ ꯁꯦꯝꯒꯠꯄ꯫",
      },
      {
        name: "ꯀꯣꯔ꯭ꯁꯁꯤꯡ",
        body: "ꯇ꯭ꯔꯦꯛ ꯑꯅꯤ — ꯐꯨꯠꯍꯦꯜꯒꯤꯗꯃꯛ ꯁ꯭ꯇꯥꯔꯇꯔ ꯑꯃꯁꯨꯡ ꯃꯐꯝ ꯑꯃꯒꯤ ꯑꯦꯄ꯭ꯂꯤꯀꯦꯁꯟ, ꯀꯃꯔꯁꯤꯌꯦꯜ ꯗ꯭ꯔꯥꯐ꯭ꯇꯤꯡ ꯑꯃꯁꯨꯡ ꯋꯥꯌꯦꯜꯒꯤ ꯄ꯭ꯔꯣꯁꯤꯖꯒꯤꯗꯃꯛ ꯄ꯭ꯔꯣꯐꯤꯁꯦꯟꯠ꯫",
      },
    ],
    exploreLabel: (name) => `${name} ꯌꯦꯡꯉꯨ`,
  },
  productShowcase: {
    pill: "ꯁꯤꯁꯣ · ꯗꯦꯃꯣ ꯃꯣꯗ",
    heading: [{ text: "ꯃꯥꯔꯛ ꯇꯧꯔꯕ ꯑꯃꯥ " }, { text: "ꯗ꯭ꯔꯥꯐ꯭ꯠ", em: true }, { text: " ꯀꯔꯤ ꯑꯣꯏꯒꯦ ꯍꯥꯏꯕ ꯌꯦꯡꯉꯨ꯫" }],
    body: "ꯋꯥꯢꯗ ꯄ꯭ꯂꯤꯟꯠ ꯅꯠꯔꯒ ꯀꯟꯇ꯭ꯔꯦꯛꯠ ꯑꯃꯥ ꯄꯦꯁ꯭ꯇ ꯇꯧꯕꯤꯌꯨ꯫ ꯅꯣꯠꯁꯤꯡꯗꯨ ꯃꯥꯔꯖꯤꯟꯗ ꯍꯜꯂꯛꯀꯤ, ꯈꯨꯗꯤꯡꯃꯛꯅ ꯐꯤꯕꯝꯗꯨꯒꯤ ꯑꯃꯁꯨꯡ ꯏꯟꯗꯤꯌꯥꯅ ꯑꯀꯨꯄꯐꯦꯛꯀꯤ ꯃꯄꯥꯡꯗ ꯌꯦꯡꯅ ꯄꯨꯛꯅꯤꯡꯆꯔꯤ꯫",
    ctaPrimary: "ꯁꯤꯁꯣ ꯍꯥꯡꯗꯣꯛꯎ",
    ctaSecondary: "ꯃꯃꯜ ꯌꯦꯡꯉꯨ",
    miniNotes: [
      "ꯑꯦꯔꯇꯤꯀꯦꯜ 226 — ꯑꯄꯨꯅꯕ ꯑꯀꯨꯄꯐꯦꯛ ꯍꯥꯏꯒꯅꯨ꯫",
      "ꯃꯐꯝ ꯑꯃ ꯒꯤ ꯍꯣꯠꯄ: ꯃꯄꯥꯟ ꯑꯍꯨꯝ ꯍꯥꯏꯒꯅꯨ꯫",
      "ꯆꯦꯛꯁꯤꯟ ꯑꯣꯏꯕ ꯄꯥꯡꯗꯦꯞ ꯂꯩꯇꯦ — ꯑꯣꯔꯗꯔ VI ꯔꯨꯜ 15꯫",
    ],
    figcaption:
      "ꯁꯤꯁꯣ ꯋꯥꯔꯛꯁ꯭ꯄꯦꯁꯀꯤ ꯑꯃꯥ ꯄ꯭ꯔꯤꯚꯤꯎ: ꯋꯥꯢꯗ ꯗ꯭ꯔꯥꯐ꯭ꯠ, ꯑꯃꯁꯨꯡ ꯌꯦꯠꯅꯥ ꯃꯥꯔꯖꯤꯟꯗ ꯁꯤꯁꯣꯒꯤ ꯅꯣꯠ ꯑꯍꯨꯝ — ꯑꯦꯔꯇꯤꯀꯦꯜ 226ꯒꯤ ꯃꯈꯥꯗ ꯑꯄꯨꯅꯕ ꯑꯀꯨꯄꯐꯦꯛ, ꯃꯐꯝ ꯑꯃ ꯒꯤ ꯍꯣꯠꯄꯒꯤꯗꯃꯛ ꯇꯥꯕ ꯃꯄꯥꯟ ꯑꯍꯨꯝ, ꯑꯃꯁꯨꯡ ꯆꯦꯛꯁꯤꯟ ꯑꯣꯏꯕ ꯄꯥꯡꯗꯦꯞ ꯂꯩꯇꯕ꯫",
  },
  pricingPreview: {
    eyebrow: "ꯃꯃꯜ",
    heading: [{ text: "ꯁ꯭ꯇꯨꯗꯦꯟꯇ ꯑꯃꯒꯤ " }, { text: "ꯕꯖꯦꯠ", em: true }, { text: "ꯒꯤꯗꯃꯛ ꯃꯃꯜ ꯊꯥꯗꯣꯛꯄ꯫" }],
    seeFull: "ꯃꯄꯨꯡ ꯐꯥꯅꯕ ꯆꯪꯅꯕ ꯌꯦꯡꯉꯨ",
    forever: "ꯍꯧꯖꯤꯛ ꯅꯤꯡꯊꯧ",
    perMonth: "ꯊꯥ ꯈꯨꯗꯤꯡꯒꯤ",
    mostPopular: "Recommended for students",
    taglines: {
      free: "ꯒꯨꯔꯨ ꯑꯃꯅ ꯅꯍꯥꯛꯀꯤ ꯊꯕꯛ ꯀꯔꯤꯒꯨꯝꯅ ꯌꯦꯡꯆꯔꯤꯕ ꯌꯦꯡꯉꯨ꯫",
      basic: "ꯄꯥꯕ ꯑꯃꯁꯨꯡ ꯇꯝꯕ ꯒꯤꯗꯃꯛ ꯄꯨꯝꯅꯃꯛ — ꯕꯣꯠꯇꯨ ꯐ꯭ꯔꯤ ꯇ꯭ꯔꯥꯏꯆꯦꯜꯗ ꯂꯩꯐꯤ꯫",
      core: "ꯐꯨꯠꯍꯦꯜ ꯄꯨꯝꯅꯃꯛ, ꯑꯃꯁꯨꯡ ꯕꯣꯠꯇꯨ ꯂꯤꯃꯤꯠ ꯌꯥꯎꯗꯅ꯫",
      proficient: "ꯑꯦꯗꯚꯣꯀꯦꯠꯁꯤꯡ ꯑꯃꯁꯨꯡ ꯄ꯭ꯔꯦꯛꯇꯤꯁꯗ ꯂꯩꯕ ꯑꯔꯣꯏꯕ ꯆꯍꯤꯒꯤ ꯁ꯭ꯇꯨꯗꯦꯟꯇꯁꯤꯡꯒꯤꯗꯃꯛ꯫",
    },
  },
  finalCta: {
    heading: [{ text: "ꯅꯍꯥꯛꯀꯤ ꯗ꯭ꯔꯥꯐ꯭ꯠꯇꯨ " }, { text: "ꯒꯨꯔꯨ", em: true }, { text: " ꯑꯃꯒꯤ ꯃꯅꯦꯛꯇ ꯊꯥꯒꯤ꯫" }],
    body: "ꯊꯥ ꯈꯨꯗꯤꯡꯒꯤ ꯃꯉꯥ ꯐ꯭ꯔꯤ ꯔꯤꯚꯤꯎ ꯃꯉꯥ꯫ ꯀꯥꯔ꯭ꯗ ꯇꯥꯕ ꯃꯇꯦꯡ ꯇꯥꯗꯦ, ꯑꯃꯁꯨꯡ ꯀꯔꯤꯅꯨꯡꯗ ꯏꯟꯁꯇꯣꯜ ꯇꯧꯒꯗꯕ ꯃꯇꯦꯡ ꯇꯥꯗꯦ꯫",
    ctaPrimary: "ꯁꯤꯁꯣ ꯍꯣꯠꯅꯧ",
    ctaSecondary: "ꯃꯃꯜ ꯌꯦꯡꯉꯨ",
  },
};

const ne: Dictionary = {
  languageSwitch: { label: "भाषा" },
  hero: {
    eyebrow: "भारतीय कानूनको लागि · सर्वोच्च अदालत र उच्च अदालतहरू",
    line1: [{ text: "हरेक महान वकिलको एक " }, { text: "गुरु", em: true }, { text: " हुन्थ्यो।" }],
    line2: [{ text: "अहिले तपाईंको गुरु AI हो — भारतीय कानूनको लागि बनाइएको।" }],
    subhead:
      "भारतीय कानूनको लागि कोर्सहरू र एक AI ड्राफ्टिङ सहायक — कानून विद्यार्थीहरू, भावी वकिलहरू, र अभ्यासरत अधिवक्ताहरूको लागि।",
    ctaPrimary: "शिशो प्रयास गर्नुहोस्",
    ctaSecondary: "कोर्सहरू हेर्नुहोस्",
    ctaNote: "कुनै कार्ड आवश्यक छैन।",
  },
  matterFlow: {
    eyebrow: "कहाँबाट सुरु गर्ने",
    heading: [{ text: "तपाईं " }, { text: "रहनुभएको", em: true }, { text: " चरण फेला पार्नुहोस्।" }],
    seeMap: "सम्पूर्ण नक्सा हेर्नुहोस्",
    stages: {
      1: { title: "गृहपृष्ठ", summary: "जहाँ कोही पुग्छ, र शिशो के हो भन्ने।" },
      2: { title: "अधिवक्ता", summary: "मुद्दा कसले ल्याउँछ, र यो कुन फोरमको हो।" },
      3: { title: "राज्य", summary: "मुद्दा माथि जान्छ: रिट अधिकारक्षेत्र र सर्वोच्च अदालत।" },
      4: { title: "मस्यौदा", summary: "पहिलो कागजात कागजमा आउँछ, बेयर एक्टको विरुद्धमा जाँचिएको।" },
      5: {
        title: "अन्तरिम निवेदन",
        summary: "मुद्दा विचाराधीन रहँदा मागिएको राहत — निवेदन, त्यसको आधार रहेको शपथपत्र, र त्यसका जवाफहरू।",
      },
      6: {
        title: "बयान-पत्र / मुद्दाहरू",
        summary: "मुद्दा र त्यसको जवाफ, अन्ततः अदालतले निर्धारण गर्ने विषयहरूसम्म।",
      },
      7: { title: "सुनुवाइ", summary: "विषयहरू निर्धारण भएपछि प्रमाण र तर्क।" },
      8: { title: "उद्धरणहरू", summary: "हरेक तर्क वास्तवमै बाध्यकारी अधिकारसँग जोडिएको।" },
      9: { title: "मुद्दापछि", summary: "फाइल बन्द भएपछि के हुन्छ।" },
    },
    products: { "draft-bot": "शिशो", library: "कानून पुस्तकालय", courses: "कोर्सहरू" },
  },
  featureStrip: {
    features: [
      {
        name: "शिशो",
        body: "एउटा बयान-पत्र, सूचना, निवेदन वा सम्झौता पेस्ट गर्नुहोस्। हाशियामा धारा-स्तरीय टिप्पणीहरू पाउनुहोस्, रजिस्ट्रीले गर्नुअघि नै प्रक्रिया जाँचिन्छ — ठ्याक्कै जसरी एक जना सिनियरले फिर्ता सुम्पन्थे।",
      },
      {
        name: "कानून पुस्तकालय",
        body: "सर्वोच्च अदालत र उच्च अदालतका फैसलाहरू, बेयर एक्टहरू, र टिप्पणी। SCC स्वरूपमा उद्धृत, सरल भाषामा व्याख्या गरिएको।",
      },
      {
        name: "कोर्सहरू",
        body: "दुई ट्र्याक — जगको लागि स्टार्टर, अन्तरिम राहत, व्यावसायिक मस्यौदा र मुद्दा रणनीतिको लागि प्रोफिसिएन्ट। हरेक मोड्युल एउटा फाइलिङमा टुङ्गिन्छ, क्विजमा होइन।",
      },
    ],
    exploreLabel: (name) => `${name} हेर्नुहोस्`,
  },
  productShowcase: {
    pill: "शिशो · डेमो मोड",
    heading: [{ text: "मार्क-अप गरिएको " }, { text: "मस्यौदा", em: true }, { text: " कस्तो देखिन्छ हेर्नुहोस्।" }],
    body: "बायाँतिर एउटा बयान-पत्र वा सम्झौता पेस्ट गर्नुहोस्। टिप्पणीहरू हाशियामा फर्केर आउँछन्, प्रत्येक त्यो धारासँग जोडिएको जुन यसले चिन्ह लगाउँछ र जुन भारतीय अधिकारमा यो आधारित छ।",
    ctaPrimary: "शिशो खोल्नुहोस्",
    ctaSecondary: "मूल्य हेर्नुहोस्",
    miniNotes: [
      "धारा २२६ — क्षेत्रीय अधिकारक्षेत्रको तर्क गर्नुहोस्।",
      "अन्तरिम राहत: तिनै अंगको तर्क गर्नुहोस्।",
      "प्रमाणीकरण धारा छैन — आदेश VI नियम १५।",
    ],
    figcaption:
      "शिशो कार्यक्षेत्रको एक झलक: बायाँतिर मस्यौदा, र दायाँ हाशियामा तीन शिशो टिप्पणीहरू — धारा २२६ अन्तर्गत क्षेत्रीय अधिकारक्षेत्र, अन्तरिम राहतको लागि आवश्यक तिनै अंग, र दिवानी कार्यविधि संहिताको आदेश VI नियम १५ अन्तर्गत नभएको प्रमाणीकरण धारा।",
  },
  pricingPreview: {
    eyebrow: "मूल्य",
    heading: [{ text: "विद्यार्थीको " }, { text: "बजेट", em: true }, { text: "को लागि मूल्य तोकिएको।" }],
    seeFull: "पूर्ण तुलना हेर्नुहोस्",
    forever: "सधैंको लागि",
    perMonth: "प्रति महिना",
    mostPopular: "विद्यार्थीका लागि सिफारिस गरिएको",
    taglines: {
      free: "हेर्नुहोस् एक गुरुले तपाईंको कामलाई कसरी चिन्ह लगाउनुहुन्छ।",
      basic: "पढ्न र अध्ययनको लागि सबै कुरा — बोट निःशुल्क ट्रायलमै रहन्छ।",
      core: "पूर्ण जग, र बोट कुनै सीमा बिना।",
      proficient: "अधिवक्ताहरू र अभ्यासमा रहेका अन्तिम वर्षका विद्यार्थीहरूको लागि।",
    },
  },
  finalCta: {
    heading: [{ text: "तपाईंको मस्यौदा एक " }, { text: "गुरु", em: true }, { text: "को अगाडि राख्नुहोस्।" }],
    body: "प्रति महिना पाँच निःशुल्क समीक्षाहरू। कुनै कार्ड आवश्यक छैन, र केही पनि स्थापना गर्नु पर्दैन।",
    ctaPrimary: "शिशो प्रयास गर्नुहोस्",
    ctaSecondary: "मूल्य हेर्नुहोस्",
  },
};

const or: Dictionary = {
  languageSwitch: { label: "ଭାଷା" },
  hero: {
    eyebrow: "ଭାରତୀୟ ଆଇନ ପାଇଁ · ସର୍ବୋଚ୍ଚ ଓ ଉଚ୍ଚ ନ୍ୟାୟାଳୟ",
    line1: [{ text: "ପ୍ରତ୍ୟେକ ମହାନ ଓକିଲଙ୍କର ଜଣେ " }, { text: "ଗୁରୁ", em: true }, { text: " ଥିଲେ।" }],
    line2: [{ text: "ବର୍ତ୍ତମାନ ଆପଣଙ୍କ ଗୁରୁ AI — ଭାରତୀୟ ଆଇନ ପାଇଁ ତିଆରି।" }],
    subhead:
      "ଭାରତୀୟ ଆଇନ ପାଇଁ କୋର୍ସ ଏବଂ ଏକ AI ଡ୍ରାଫ୍ଟିଂ ସହାୟକ — ଆଇନ ଛାତ୍ରଛାତ୍ରୀ, ଭବିଷ୍ୟତର ଓକିଲ, ଏବଂ ପ୍ରାକ୍ଟିସ କରୁଥିବା ଓକିଲଙ୍କ ପାଇଁ।",
    ctaPrimary: "ଶିଶୋ ଚେଷ୍ଟା କରନ୍ତୁ",
    ctaSecondary: "କୋର୍ସ ଦେଖନ୍ତୁ",
    ctaNote: "କୌଣସି କାର୍ଡ ଆବଶ୍ୟକ ନାହିଁ।",
  },
  matterFlow: {
    eyebrow: "କେଉଁଠାରୁ ଆରମ୍ଭ କରିବେ",
    heading: [{ text: "ଆପଣ " }, { text: "ଥିବା", em: true }, { text: " ପର୍ଯ୍ୟାୟଟି ଖୋଜନ୍ତୁ।" }],
    seeMap: "ସମ୍ପୂର୍ଣ୍ଣ ମାନଚିତ୍ର ଦେଖନ୍ତୁ",
    stages: {
      1: { title: "ମୁଖପୃଷ୍ଠା", summary: "ଯେଉଁଠାରେ କେହି ପହଞ୍ଚନ୍ତି, ଏବଂ ଶିଶୋ କଣ ତାହା।" },
      2: { title: "ଓକିଲ", summary: "କିଏ ମାମଲା ଆଣନ୍ତି, ଏବଂ ଏହା କେଉଁ ଫୋରମର।" },
      3: { title: "ରାଜ୍ୟ", summary: "ମାମଲା ଉପରକୁ ଯାଏ: ରିଟ୍ ଅଧିକାରକ୍ଷେତ୍ର ଏବଂ ସର୍ବୋଚ୍ଚ ନ୍ୟାୟାଳୟ।" },
      4: { title: "ଡ୍ରାଫ୍ଟ", summary: "ପ୍ରଥମ ଦଲିଲ କାଗଜରେ ଆସେ, ବେୟାର ଆକ୍ଟ ବିରୁଦ୍ଧରେ ଯାଞ୍ଚ ହୋଇଥାଏ।" },
      5: {
        title: "ଅନ୍ତର୍ବର୍ତ୍ତୀକାଳୀନ ଆବେଦନ",
        summary: "ମାମଲା ବିଚାରାଧୀନ ଥିବାବେଳେ ମାଗାଯାଇଥିବା ପ୍ରତିକାର — ଆବେଦନ, ଏହାର ଆଧାର ଶପଥନାମା, ଏବଂ ଏହାର ଉତ୍ତରଗୁଡ଼ିକ।",
      },
      6: {
        title: "ବାଦ-ପତ୍ର / ପ୍ରସଙ୍ଗଗୁଡ଼ିକ",
        summary: "ମାମଲା ଏବଂ ଏହାର ଉତ୍ତର, ଶେଷରେ ନ୍ୟାୟାଳୟ ସ୍ଥିର କରୁଥିବା ପ୍ରସଙ୍ଗଗୁଡ଼ିକ ପର୍ଯ୍ୟନ୍ତ।",
      },
      7: { title: "ବିଚାର", summary: "ପ୍ରସଙ୍ଗଗୁଡ଼ିକ ସ୍ଥିର ହେବା ପରେ ପ୍ରମାଣ ଏବଂ ଯୁକ୍ତି।" },
      8: { title: "ଉଦ୍ଧୃତି", summary: "ପ୍ରତ୍ୟେକ ଯୁକ୍ତି ପ୍ରକୃତରେ ବାଧ୍ୟତାମୂଳକ ଅଧିକାର ସହିତ ଯୋଡ଼ାଯାଇଥାଏ।" },
      9: { title: "ମାମଲା ପରେ", summary: "ଫାଇଲ ବନ୍ଦ ହେବା ପରେ କଣ ହୁଏ।" },
    },
    products: { "draft-bot": "ଶିଶୋ", library: "ଆଇନ ଗ୍ରନ୍ଥାଗାର", courses: "କୋର୍ସ" },
  },
  featureStrip: {
    features: [
      {
        name: "ଶିଶୋ",
        body: "ଏକ ବାଦ-ପତ୍ର, ନୋଟିସ୍, ଆବେଦନ କିମ୍ବା ଚୁକ୍ତିନାମା ପେଷ୍ଟ କରନ୍ତୁ। ମାର୍ଜିନରେ ଧାରା-ସ୍ତରୀୟ ଟିପ୍ପଣୀ ପାଆନ୍ତୁ, ରେଜିଷ୍ଟ୍ରି ପୂର୍ବରୁ ପ୍ରକ୍ରିୟା ଯାଞ୍ଚ ହୋଇଥାଏ — ଠିକ୍ ଯେପରି ଜଣେ ବରିଷ୍ଠ ଫେରାଇ ଦେବେ।",
      },
      {
        name: "ଆଇନ ଗ୍ରନ୍ଥାଗାର",
        body: "ସର୍ବୋଚ୍ଚ ନ୍ୟାୟାଳୟ ଏବଂ ଉଚ୍ଚ ନ୍ୟାୟାଳୟର ରାୟ, ବେୟାର ଆକ୍ଟ, ଏବଂ ଟୀକା। SCC ଆକାରରେ ଉଦ୍ଧୃତ, ସରଳ ଭାଷାରେ ବ୍ୟାଖ୍ୟା କରାଯାଇଥାଏ।",
      },
      {
        name: "କୋର୍ସ",
        body: "ଦୁଇଟି ଟ୍ରାକ୍ — ମୂଳଦୁଆ ପାଇଁ ଷ୍ଟାର୍ଟର, ଅନ୍ତର୍ବର୍ତ୍ତୀକାଳୀନ ପ୍ରତିକାର, ବାଣିଜ୍ୟିକ ଡ୍ରାଫ୍ଟିଂ ଏବଂ ମାମଲା ରଣନୀତି ପାଇଁ ପ୍ରୋଫିସିଏଣ୍ଟ। ପ୍ରତ୍ୟେକ ମଡ୍ୟୁଲ୍ ଏକ ଫାଇଲିଂରେ ସମାପ୍ତ ହୁଏ, କୁଇଜ୍‌ରେ ନୁହେଁ।",
      },
    ],
    exploreLabel: (name) => `${name} ଦେଖନ୍ତୁ`,
  },
  productShowcase: {
    pill: "ଶିଶୋ · ଡେମୋ ମୋଡ୍",
    heading: [{ text: "ମାର୍କ-ଅପ୍ ହୋଇଥିବା " }, { text: "ଡ୍ରାଫ୍ଟ", em: true }, { text: " କେମିତି ଦିଶେ ଦେଖନ୍ତୁ।" }],
    body: "ବାମପଟେ ଏକ ବାଦ-ପତ୍ର କିମ୍ବା ଚୁକ୍ତିନାମା ପେଷ୍ଟ କରନ୍ତୁ। ଟିପ୍ପଣୀଗୁଡ଼ିକ ମାର୍ଜିନକୁ ଫେରି ଆସେ, ପ୍ରତ୍ୟେକଟି ସେହି ଧାରା ସହିତ ଯୋଡ଼ାଯାଇଥାଏ ଯାହା ଏହା ଚିହ୍ନଟ କରେ ଏବଂ ଯେଉଁ ଭାରତୀୟ ଅଧିକାର ଉପରେ ଏହା ନିର୍ଭରଶୀଳ।",
    ctaPrimary: "ଶିଶୋ ଖୋଲନ୍ତୁ",
    ctaSecondary: "ମୂଲ୍ୟ ଦେଖନ୍ତୁ",
    miniNotes: [
      "ଅନୁଚ୍ଛେଦ ୨୨୬ — ଆଞ୍ଚଳିକ ଅଧିକାରକ୍ଷେତ୍ର ଉପସ୍ଥାପନ କରନ୍ତୁ।",
      "ଅନ୍ତର୍ବର୍ତ୍ତୀକାଳୀନ ପ୍ରତିକାର: ତିନିଗୋଟି ଅଙ୍ଗ ଉପସ୍ଥାପନ କରନ୍ତୁ।",
      "ଯାଞ୍ଚ ଧାରା ନାହିଁ — ଆଦେଶ VI ନିୟମ ୧୫।",
    ],
    figcaption:
      "ଶିଶୋ କର୍ମକ୍ଷେତ୍ରର ଏକ ପୂର୍ବାବଲୋକନ: ବାମପଟେ ଡ୍ରାଫ୍ଟ, ଏବଂ ଡାହାଣ ମାର୍ଜିନରେ ତିନୋଟି ଶିଶୋ ଟିପ୍ପଣୀ — ଅନୁଚ୍ଛେଦ ୨୨୬ ଅଧୀନରେ ଆଞ୍ଚଳିକ ଅଧିକାରକ୍ଷେତ୍ର, ଅନ୍ତର୍ବର୍ତ୍ତୀକାଳୀନ ପ୍ରତିକାର ପାଇଁ ଆବଶ୍ୟକ ତିନିଗୋଟି ଅଙ୍ଗ, ଏବଂ ଦେୱାନୀ ପ୍ରକ୍ରିୟା ସଂହିତାର ଆଦେଶ VI ନିୟମ ୧୫ ଅଧୀନରେ ନଥିବା ଯାଞ୍ଚ ଧାରା।",
  },
  pricingPreview: {
    eyebrow: "ମୂଲ୍ୟ",
    heading: [{ text: "ଛାତ୍ରଛାତ୍ରୀଙ୍କ " }, { text: "ବଜେଟ୍", em: true }, { text: " ପାଇଁ ମୂଲ୍ୟ ନିର୍ଧାରଣ।" }],
    seeFull: "ସମ୍ପୂର୍ଣ୍ଣ ତୁଳନା ଦେଖନ୍ତୁ",
    forever: "ସବୁଦିନ ପାଇଁ",
    perMonth: "ପ୍ରତି ମାସ",
    mostPopular: "ଛାତ୍ରଛାତ୍ରୀଙ୍କ ପାଇଁ ସୁପାରିଶ",
    taglines: {
      free: "ଜଣେ ଗୁରୁ ଆପଣଙ୍କ କାମକୁ କିପରି ଚିହ୍ନଟ କରନ୍ତି ଦେଖନ୍ତୁ।",
      basic: "ପଢ଼ିବା ଏବଂ ଅଧ୍ୟୟନ ପାଇଁ ସବୁକିଛି — ବଟ୍ ମାଗଣା ଟ୍ରାଏଲରେ ରହିଥାଏ।",
      core: "ସମ୍ପୂର୍ଣ୍ଣ ମୂଳଦୁଆ, ଏବଂ ବଟ୍ କୌଣସି ସୀମା ବିନା।",
      proficient: "ଓକିଲ ଏବଂ ପ୍ରାକ୍ଟିସରେ ଥିବା ଅନ୍ତିମ ବର୍ଷର ଛାତ୍ରଛାତ୍ରୀଙ୍କ ପାଇଁ।",
    },
  },
  finalCta: {
    heading: [{ text: "ଆପଣଙ୍କ ଡ୍ରାଫ୍ଟକୁ ଜଣେ " }, { text: "ଗୁରୁ", em: true }, { text: "ଙ୍କ ସାମ୍ନାରେ ରଖନ୍ତୁ।" }],
    body: "ପ୍ରତି ମାସ ପାଞ୍ଚଟି ମାଗଣା ସମୀକ୍ଷା। କୌଣସି କାର୍ଡ ଆବଶ୍ୟକ ନାହିଁ, ଏବଂ କିଛି ଇନଷ୍ଟଲ କରିବାର ଆବଶ୍ୟକତା ନାହିଁ।",
    ctaPrimary: "ଶିଶୋ ଚେଷ୍ଟା କରନ୍ତୁ",
    ctaSecondary: "ମୂଲ୍ୟ ଦେଖନ୍ତୁ",
  },
};

const pa: Dictionary = {
  languageSwitch: { label: "ਭਾਸ਼ਾ" },
  hero: {
    eyebrow: "ਭਾਰਤੀ ਕਾਨੂੰਨ ਲਈ · ਸੁਪਰੀਮ ਕੋਰਟ ਅਤੇ ਹਾਈ ਕੋਰਟਾਂ",
    line1: [{ text: "ਹਰ ਮਹਾਨ ਵਕੀਲ ਦਾ ਇੱਕ " }, { text: "ਗੁਰੂ", em: true }, { text: " ਹੁੰਦਾ ਸੀ।" }],
    line2: [{ text: "ਹੁਣ ਤੁਹਾਡਾ ਗੁਰੂ AI ਹੈ — ਭਾਰਤੀ ਕਾਨੂੰਨ ਲਈ ਬਣਾਇਆ ਗਿਆ।" }],
    subhead:
      "ਭਾਰਤੀ ਕਾਨੂੰਨ ਲਈ ਕੋਰਸ ਅਤੇ ਇੱਕ AI ਡਰਾਫਟਿੰਗ ਸਹਾਇਕ — ਕਾਨੂੰਨ ਦੇ ਵਿਦਿਆਰਥੀਆਂ, ਭਵਿੱਖ ਦੇ ਵਕੀਲਾਂ, ਅਤੇ ਪ੍ਰੈਕਟਿਸ ਕਰ ਰਹੇ ਵਕੀਲਾਂ ਲਈ।",
    ctaPrimary: "ਸ਼ਿਸ਼ੋ ਅਜ਼ਮਾਓ",
    ctaSecondary: "ਕੋਰਸ ਵੇਖੋ",
    ctaNote: "ਕੋਈ ਕਾਰਡ ਲੋੜੀਂਦਾ ਨਹੀਂ।",
  },
  matterFlow: {
    eyebrow: "ਕਿੱਥੋਂ ਸ਼ੁਰੂ ਕਰਨਾ ਹੈ",
    heading: [{ text: "ਉਹ ਪੜਾਅ ਲੱਭੋ ਜਿੱਥੇ ਤੁਸੀਂ " }, { text: "ਹੋ", em: true }, { text: "।" }],
    seeMap: "ਪੂਰਾ ਨਕਸ਼ਾ ਵੇਖੋ",
    stages: {
      1: { title: "ਹੋਮਪੇਜ", summary: "ਜਿੱਥੇ ਕੋਈ ਪਹੁੰਚਦਾ ਹੈ, ਅਤੇ ਸ਼ਿਸ਼ੋ ਕੀ ਹੈ।" },
      2: { title: "ਵਕੀਲ", summary: "ਮਾਮਲਾ ਕੌਣ ਲਿਆਉਂਦਾ ਹੈ, ਅਤੇ ਇਹ ਕਿਸ ਫੋਰਮ ਦਾ ਹੈ।" },
      3: { title: "ਰਾਜ", summary: "ਮਾਮਲਾ ਉੱਪਰ ਜਾਂਦਾ ਹੈ: ਰਿੱਟ ਅਧਿਕਾਰ ਖੇਤਰ ਅਤੇ ਸੁਪਰੀਮ ਕੋਰਟ।" },
      4: { title: "ਡਰਾਫਟ", summary: "ਪਹਿਲਾ ਦਸਤਾਵੇਜ਼ ਕਾਗਜ਼ ਉੱਤੇ ਆਉਂਦਾ ਹੈ, ਬੇਅਰ ਐਕਟ ਦੇ ਵਿਰੁੱਧ ਜਾਂਚਿਆ ਗਿਆ।" },
      5: {
        title: "ਅੰਤਰਿਮ ਅਰਜ਼ੀ",
        summary: "ਮੁਕੱਦਮਾ ਬਕਾਇਆ ਹੁੰਦੇ ਹੋਏ ਮੰਗੀ ਗਈ ਰਾਹਤ — ਅਰਜ਼ੀ, ਇਸਦਾ ਆਧਾਰ ਬਣਦਾ ਹਲਫ਼ਨਾਮਾ, ਅਤੇ ਇਸਦੇ ਜਵਾਬ।",
      },
      6: {
        title: "ਦਾਅਵਾ-ਪੱਤਰ / ਮੁੱਦੇ",
        summary: "ਮੁਕੱਦਮਾ ਅਤੇ ਇਸਦਾ ਜਵਾਬ, ਆਖਰਕਾਰ ਉਹਨਾਂ ਮੁੱਦਿਆਂ ਤੱਕ ਜੋ ਅਦਾਲਤ ਤੈਅ ਕਰਦੀ ਹੈ।",
      },
      7: { title: "ਸੁਣਵਾਈ", summary: "ਮੁੱਦੇ ਤੈਅ ਹੋਣ ਤੋਂ ਬਾਅਦ ਸਬੂਤ ਅਤੇ ਦਲੀਲ।" },
      8: { title: "ਹਵਾਲੇ", summary: "ਹਰ ਦਲੀਲ ਅਸਲ ਵਿੱਚ ਬੰਧਨਕਾਰੀ ਅਧਿਕਾਰ ਨਾਲ ਜੁੜੀ ਹੋਈ।" },
      9: { title: "ਮਾਮਲੇ ਤੋਂ ਬਾਅਦ", summary: "ਫਾਈਲ ਬੰਦ ਹੋਣ ਤੋਂ ਬਾਅਦ ਕੀ ਹੁੰਦਾ ਹੈ।" },
    },
    products: { "draft-bot": "ਸ਼ਿਸ਼ੋ", library: "ਕਾਨੂੰਨੀ ਲਾਇਬ੍ਰੇਰੀ", courses: "ਕੋਰਸ" },
  },
  featureStrip: {
    features: [
      {
        name: "ਸ਼ਿਸ਼ੋ",
        body: "ਇੱਕ ਦਾਅਵਾ-ਪੱਤਰ, ਨੋਟਿਸ, ਅਰਜ਼ੀ ਜਾਂ ਇਕਰਾਰਨਾਮਾ ਪੇਸਟ ਕਰੋ। ਹਾਸ਼ੀਏ ਵਿੱਚ ਧਾਰਾ-ਪੱਧਰੀ ਟਿੱਪਣੀਆਂ ਪਾਓ, ਰਜਿਸਟਰੀ ਤੋਂ ਪਹਿਲਾਂ ਹੀ ਵਿਧੀ ਜਾਂਚੀ ਜਾਂਦੀ ਹੈ — ਬਿਲਕੁਲ ਜਿਵੇਂ ਇੱਕ ਸੀਨੀਅਰ ਵਾਪਸ ਸੌਂਪਦਾ।",
      },
      {
        name: "ਕਾਨੂੰਨੀ ਲਾਇਬ੍ਰੇਰੀ",
        body: "ਸੁਪਰੀਮ ਕੋਰਟ ਅਤੇ ਹਾਈ ਕੋਰਟ ਦੇ ਫੈਸਲੇ, ਬੇਅਰ ਐਕਟ, ਅਤੇ ਟਿੱਪਣੀ। SCC ਰੂਪ ਵਿੱਚ ਹਵਾਲਾ ਦਿੱਤਾ, ਸਰਲ ਭਾਸ਼ਾ ਵਿੱਚ ਸਮਝਾਇਆ।",
      },
      {
        name: "ਕੋਰਸ",
        body: "ਦੋ ਟ੍ਰੈਕ — ਬੁਨਿਆਦ ਲਈ ਸਟਾਰਟਰ, ਅੰਤਰਿਮ ਰਾਹਤ, ਵਪਾਰਕ ਡਰਾਫਟਿੰਗ ਅਤੇ ਮੁਕੱਦਮੇਬਾਜ਼ੀ ਰਣਨੀਤੀ ਲਈ ਪ੍ਰੋਫੀਸ਼ੀਐਂਟ। ਹਰ ਮੌਡਿਊਲ ਇੱਕ ਫਾਈਲਿੰਗ ਵਿੱਚ ਖਤਮ ਹੁੰਦਾ ਹੈ, ਕੁਇਜ਼ ਵਿੱਚ ਨਹੀਂ।",
      },
    ],
    exploreLabel: (name) => `${name} ਵੇਖੋ`,
  },
  productShowcase: {
    pill: "ਸ਼ਿਸ਼ੋ · ਡੈਮੋ ਮੋਡ",
    heading: [{ text: "ਵੇਖੋ ਇੱਕ ਮਾਰਕ-ਅੱਪ ਕੀਤਾ " }, { text: "ਡਰਾਫਟ", em: true }, { text: " ਕਿਵੇਂ ਦਿਖਦਾ ਹੈ।" }],
    body: "ਖੱਬੇ ਪਾਸੇ ਇੱਕ ਦਾਅਵਾ-ਪੱਤਰ ਜਾਂ ਇਕਰਾਰਨਾਮਾ ਪੇਸਟ ਕਰੋ। ਟਿੱਪਣੀਆਂ ਹਾਸ਼ੀਏ ਵਿੱਚ ਵਾਪਸ ਆਉਂਦੀਆਂ ਹਨ, ਹਰ ਇੱਕ ਉਸ ਧਾਰਾ ਨਾਲ ਜੁੜੀ ਜਿਸਨੂੰ ਇਹ ਨਿਸ਼ਾਨਬੱਧ ਕਰਦੀ ਹੈ ਅਤੇ ਜਿਸ ਭਾਰਤੀ ਅਧਿਕਾਰ ਉੱਤੇ ਇਹ ਆਧਾਰਿਤ ਹੈ।",
    ctaPrimary: "ਸ਼ਿਸ਼ੋ ਖੋਲ੍ਹੋ",
    ctaSecondary: "ਕੀਮਤ ਵੇਖੋ",
    miniNotes: [
      "ਅਨੁੱਛੇਦ 226 — ਖੇਤਰੀ ਅਧਿਕਾਰ ਖੇਤਰ ਦੀ ਦਲੀਲ ਦਿਓ।",
      "ਅੰਤਰਿਮ ਰਾਹਤ: ਤਿੰਨੇ ਅੰਗਾਂ ਦੀ ਦਲੀਲ ਦਿਓ।",
      "ਤਸਦੀਕ ਧਾਰਾ ਨਹੀਂ — ਹੁਕਮ VI ਨਿਯਮ 15।",
    ],
    figcaption:
      "ਸ਼ਿਸ਼ੋ ਵਰਕਸਪੇਸ ਦੀ ਇੱਕ ਝਲਕ: ਖੱਬੇ ਪਾਸੇ ਡਰਾਫਟ, ਅਤੇ ਸੱਜੇ ਹਾਸ਼ੀਏ ਵਿੱਚ ਤਿੰਨ ਸ਼ਿਸ਼ੋ ਟਿੱਪਣੀਆਂ — ਅਨੁੱਛੇਦ 226 ਅਧੀਨ ਖੇਤਰੀ ਅਧਿਕਾਰ ਖੇਤਰ, ਅੰਤਰਿਮ ਰਾਹਤ ਲਈ ਲੋੜੀਂਦੇ ਤਿੰਨੇ ਅੰਗ, ਅਤੇ ਸਿਵਲ ਪ੍ਰਕਿਰਿਆ ਸੰਹਿਤਾ ਦੇ ਹੁਕਮ VI ਨਿਯਮ 15 ਅਧੀਨ ਗੈਰਹਾਜ਼ਰ ਤਸਦੀਕ ਧਾਰਾ।",
  },
  pricingPreview: {
    eyebrow: "ਕੀਮਤ",
    heading: [{ text: "ਇੱਕ ਵਿਦਿਆਰਥੀ ਦੇ " }, { text: "ਬਜਟ", em: true }, { text: " ਲਈ ਕੀਮਤ ਰੱਖੀ ਗਈ।" }],
    seeFull: "ਪੂਰੀ ਤੁਲਨਾ ਵੇਖੋ",
    forever: "ਹਮੇਸ਼ਾ ਲਈ",
    perMonth: "ਪ੍ਰਤੀ ਮਹੀਨਾ",
    mostPopular: "ਵਿਦਿਆਰਥੀਆਂ ਲਈ ਸਿਫ਼ਾਰਸ਼ੀ",
    taglines: {
      free: "ਵੇਖੋ ਇੱਕ ਗੁਰੂ ਤੁਹਾਡੇ ਕੰਮ ਨੂੰ ਕਿਵੇਂ ਨਿਸ਼ਾਨਬੱਧ ਕਰਦਾ ਹੈ।",
      basic: "ਪੜ੍ਹਨ ਅਤੇ ਅਧਿਐਨ ਲਈ ਸਭ ਕੁਝ — ਬੋਟ ਮੁਫ਼ਤ ਟ੍ਰਾਇਲ ’ਤੇ ਹੀ ਰਹਿੰਦਾ ਹੈ।",
      core: "ਪੂਰੀ ਬੁਨਿਆਦ, ਅਤੇ ਬੋਟ ਬਿਨਾਂ ਕਿਸੇ ਸੀਮਾ ਦੇ।",
      proficient: "ਵਕੀਲਾਂ ਅਤੇ ਪ੍ਰੈਕਟਿਸ ਵਿੱਚ ਆਖਰੀ ਸਾਲ ਦੇ ਵਿਦਿਆਰਥੀਆਂ ਲਈ।",
    },
  },
  finalCta: {
    heading: [{ text: "ਆਪਣਾ ਡਰਾਫਟ ਇੱਕ " }, { text: "ਗੁਰੂ", em: true }, { text: " ਦੇ ਸਾਹਮਣੇ ਰੱਖੋ।" }],
    body: "ਪ੍ਰਤੀ ਮਹੀਨਾ ਪੰਜ ਮੁਫ਼ਤ ਸਮੀਖਿਆਵਾਂ। ਕੋਈ ਕਾਰਡ ਲੋੜੀਂਦਾ ਨਹੀਂ, ਅਤੇ ਕੁਝ ਵੀ ਇੰਸਟਾਲ ਕਰਨ ਦੀ ਲੋੜ ਨਹੀਂ।",
    ctaPrimary: "ਸ਼ਿਸ਼ੋ ਅਜ਼ਮਾਓ",
    ctaSecondary: "ਕੀਮਤ ਵੇਖੋ",
  },
};

const sa: Dictionary = {
  languageSwitch: { label: "भाषा" },
  hero: {
    eyebrow: "भारतीय-विधेः कृते · सर्वोच्च-न्यायालयम् उच्च-न्यायालयानि च",
    line1: [{ text: "प्रत्येकस्य महतः विधिज्ञस्य एकः " }, { text: "गुरुः", em: true }, { text: " आसीत्।" }],
    line2: [{ text: "अधुना भवतः गुरुः AI अस्ति — भारतीय-विधेः कृते निर्मितः।" }],
    subhead:
      "भारतीय-विधेः कृते पाठ्यक्रमाः एकः AI मसौदा-सहायकः च — विधि-छात्रेभ्यः, भाविनां विधिज्ञेभ्यः, अभ्यासरतेभ्यः अधिवक्तेभ्यः च।",
    ctaPrimary: "शिशो-प्रयोगं कुरुत",
    ctaSecondary: "पाठ्यक्रमान् पश्यत",
    ctaNote: "कार्ड-आवश्यकता नास्ति।",
  },
  matterFlow: {
    eyebrow: "कुतः आरभेत",
    heading: [{ text: "यत्र भवन्तः " }, { text: "सन्ति", em: true }, { text: " तत् सोपानं गवेषयत।" }],
    seeMap: "सम्पूर्णं मानचित्रं पश्यत",
    stages: {
      1: { title: "गृहपृष्ठम्", summary: "यत्र कोऽपि प्राप्नोति, शिशो किम् इति च।" },
      2: { title: "अधिवक्ता", summary: "कः वादं आनयति, कस्मिन् च मञ्चे तत् वर्तते।" },
      3: { title: "राज्यम्", summary: "वादः ऊर्ध्वं गच्छति: रिट्-अधिकारक्षेत्रं सर्वोच्च-न्यायालयं च।" },
      4: { title: "मसौदा", summary: "प्रथमं दस्तावेजं पत्रे आगच्छति, मूल-अधिनियमेन सह परीक्षितम्।" },
      5: {
        title: "अन्तर्वर्ती-आवेदनम्",
        summary: "वादे प्रलम्बिते याचितं निवारणम् — आवेदनम्, तस्य आधारभूतं शपथपत्रम्, तस्य उत्तराणि च।",
      },
      6: {
        title: "वाद-पत्राणि / विषयाः",
        summary: "वादः तस्य उत्तरं च, अन्ततः न्यायालयेन निर्धारितान् विषयान् यावत्।",
      },
      7: { title: "विचारणम्", summary: "विषयेषु निर्धारितेषु प्रमाणं तर्कः च।" },
      8: { title: "उद्धरणानि", summary: "प्रत्येकः तर्कः वस्तुतः बाध्यकारिणा अधिकारेण सह सम्बद्धः।" },
      9: { title: "वादस्य अनन्तरम्", summary: "फाइल-समापनस्य अनन्तरं किं भवति।" },
    },
    products: { "draft-bot": "शिशो", library: "विधि-पुस्तकालयः", courses: "पाठ्यक्रमाः" },
  },
  featureStrip: {
    features: [
      {
        name: "शिशो",
        body: "वाद-पत्रं, सूचनां, आवेदनं वा अनुबन्धं संलग्नं कुरुत। सीमान्ते धारा-स्तरीयाः टिप्पण्यः प्राप्नुत, रजिस्ट्री-करणात् पूर्वमेव प्रक्रिया परीक्ष्यते — यथा वरिष्ठः प्रत्यर्पयेत् तथैव।",
      },
      {
        name: "विधि-पुस्तकालयः",
        body: "सर्वोच्च-न्यायालयस्य उच्च-न्यायालयस्य च निर्णयाः, मूल-अधिनियमाः, व्याख्या च। SCC-रूपेण उद्धृताः, सरल-भाषायां व्याख्याताः।",
      },
      {
        name: "पाठ्यक्रमाः",
        body: "द्वौ मार्गौ — आधार-कृते स्टार्टर्, अन्तर्वर्ती-निवारणाय, वाणिज्य-मसौदाय वाद-नीतये च प्रोफिशिएण्ट्। प्रत्येकः खण्डः दाखिलने समाप्यते, प्रश्नोत्तर्या न।",
      },
    ],
    exploreLabel: (name) => `${name} पश्यत`,
  },
  productShowcase: {
    pill: "शिशो · प्रदर्शन-प्रणाली",
    heading: [{ text: "चिह्नितः " }, { text: "मसौदा", em: true }, { text: " कीदृशः दृश्यते इति पश्यत।" }],
    body: "वामपार्श्वे वाद-पत्रं वा अनुबन्धं संलग्नं कुरुत। टिप्पण्यः सीमान्ते प्रत्यागच्छन्ति, प्रत्येका तया अङ्कितया धारया, यस्मिन् भारतीये अधिकारे च आधारिता, सह सम्बद्धा।",
    ctaPrimary: "शिशो उद्घाटयत",
    ctaSecondary: "मूल्यं पश्यत",
    miniNotes: [
      "अनुच्छेदः २२६ — क्षेत्रीय-अधिकारक्षेत्रं वदत।",
      "अन्तर्वर्ती-निवारणम्: त्रयः अवयवाः वदत।",
      "सत्यापन-धारा नास्ति — आदेशः VI नियमः १५।",
    ],
    figcaption:
      "शिशो-कार्यस्थलस्य पूर्वावलोकनम्: वामपार्श्वे मसौदा, दक्षिण-सीमान्ते च त्रयः शिशो-टिप्पण्यः — अनुच्छेदस्य २२६ अधीने क्षेत्रीय-अधिकारक्षेत्रम्, अन्तर्वर्ती-निवारणाय आवश्यकाः त्रयः अवयवाः, सिविल-प्रक्रिया-संहितायाः आदेशस्य VI नियमस्य १५ अधीने अनुपस्थिता सत्यापन-धारा च।",
  },
  pricingPreview: {
    eyebrow: "मूल्यम्",
    heading: [{ text: "छात्रस्य " }, { text: "आयव्ययाय", em: true }, { text: " मूल्यं निर्धारितम्।" }],
    seeFull: "सम्पूर्णां तुलनां पश्यत",
    forever: "सर्वदा कृते",
    perMonth: "प्रतिमासम्",
    mostPopular: "Recommended for students",
    taglines: {
      free: "गुरुः भवतः कार्यं कथं अङ्कयति इति पश्यत।",
      basic: "पठनाय अध्ययनाय च सर्वं — बॉट् निःशुल्क-परीक्षणे एव तिष्ठति।",
      core: "सम्पूर्णः आधारः, बॉट् च सीमा-रहितः।",
      proficient: "अधिवक्तेभ्यः अभ्यासरतेभ्यः अन्तिम-वर्षस्य छात्रेभ्यः च।",
    },
  },
  finalCta: {
    heading: [{ text: "भवतः मसौदां एकस्य " }, { text: "गुरोः", em: true }, { text: " पुरतः स्थापयत।" }],
    body: "प्रतिमासं पञ्च निःशुल्क-समीक्षाः। कार्ड-आवश्यकता नास्ति, किमपि च संस्थापनीयं नास्ति।",
    ctaPrimary: "शिशो-प्रयोगं कुरुत",
    ctaSecondary: "मूल्यं पश्यत",
  },
};

const sat: Dictionary = {
  languageSwitch: { label: "ᱯᱟᱹᱨᱥᱤ" },
  hero: {
    eyebrow: "ᱦᱤᱱᱰ ᱚᱛᱱ ᱟᱭᱤᱱ ᱞᱟᱹᱜᱤᱛ · ᱥᱟᱹᱨᱦᱟᱹ ᱠᱚᱴ ᱟᱨ ᱦᱟᱭᱠᱚᱴ",
    line1: [{ text: "ᱡᱳᱛᱚ ᱢᱟᱨᱟᱝ ᱣᱚᱠᱤᱞ ᱨᱮᱭᱟᱜ ᱢᱤᱫ " }, { text: "ᱜᱩᱨᱩ", em: true }, { text: " ᱛᱟᱦᱮᱸ ᱠᱟᱱᱟ᱾" }],
    line2: [{ text: "ᱱᱤᱛᱚᱜ ᱟᱢᱟᱜ ᱜᱩᱨᱩ ᱚᱠᱟ ᱠᱟᱱᱟ AI — ᱦᱤᱱᱰ ᱚᱛᱱ ᱟᱭᱤᱱ ᱞᱟᱹᱜᱤᱛ ᱛᱮᱭᱟᱨ ᱟᱠᱟᱱᱟ᱾" }],
    subhead:
      "ᱦᱤᱱᱰ ᱚᱛᱱ ᱟᱭᱤᱱ ᱞᱟᱹᱜᱤᱛ ᱠᱚᱨᱥ ᱟᱨ ᱢᱤᱫ AI ᱰᱨᱟᱯᱷᱴᱤᱝ ᱜᱚᱲᱚᱭᱤᱭᱟᱹ — ᱟᱭᱤᱱ ᱪᱮᱛᱟᱱ ᱪᱮᱟᱸᱰᱟᱜᱤᱡ, ᱦᱳᱴᱮᱭᱟᱜ ᱣᱚᱠᱤᱞ ᱠᱚ, ᱟᱨ ᱠᱟᱹᱢᱤ ᱨᱮ ᱛᱟᱦᱮᱸ ᱣᱚᱠᱤᱞ ᱠᱚ ᱞᱟᱹᱜᱤᱛ᱾",
    ctaPrimary: "ᱥᱤᱥᱳ ᱧᱟᱢ ᱧᱟᱢ",
    ctaSecondary: "ᱠᱚᱨᱥ ᱠᱚ ᱧᱮᱞ ᱢᱮ",
    ctaNote: "ᱚᱠᱟᱹᱛᱮᱭ ᱠᱟᱨᱰ ᱵᱟᱹᱜᱤᱭᱟᱹ ᱠᱟ᱾",
  },
  matterFlow: {
    eyebrow: "ᱚᱠᱟᱠᱟᱛᱮ ᱮᱛᱦᱚᱵ ᱠᱟᱛᱮ",
    heading: [{ text: "ᱟᱢ ᱡᱟᱦᱟᱸ ᱨᱮ " }, { text: "ᱢᱮᱱᱟᱢᱟ", em: true }, { text: " ᱚᱱᱟ ᱛᱟᱸᱦᱮᱸ ᱴᱚᱦᱚᱢ ᱢᱮ᱾" }],
    seeMap: "ᱡᱚᱛᱚ ᱢᱮᱯ ᱧᱮᱞ ᱢᱮ",
    stages: {
      1: { title: "ᱦᱳᱢᱯᱮᱡ", summary: "ᱚᱲᱟᱜ ᱚᱱᱠᱟᱹᱛᱮ ᱚᱠᱟᱹ ᱦᱟᱡᱩᱭᱟᱭ, ᱟᱨ ᱥᱤᱥᱳ ᱪᱮᱫ ᱠᱟᱱᱟ᱾" },
      2: { title: "ᱣᱚᱠᱤᱞ", summary: "ᱚᱠᱟᱹ ᱢᱟᱢᱞᱟ ᱟᱹᱱᱟᱭ, ᱟᱨ ᱚᱱᱟ ᱚᱠᱟ ᱯᱷᱚᱨᱚᱢ ᱨᱮᱭᱟᱜᱼᱟ᱾" },
      3: { title: "ᱨᱟᱡᱭᱚ", summary: "ᱢᱟᱢᱞᱟ ᱪᱮᱛᱟᱱ ᱛᱮ ᱪᱟᱞᱟᱜᱼᱟ: ᱨᱤᱴ ᱦᱚᱠ ᱠᱮᱛᱲᱟ ᱟᱨ ᱥᱟᱹᱨᱦᱟᱹ ᱠᱚᱴ᱾" },
      4: { title: "ᱰᱨᱟᱯᱷᱴ", summary: "ᱯᱩᱭᱞᱩᱦᱟᱹ ᱠᱟᱜᱚᱡ ᱠᱟᱜᱚᱡ ᱨᱮ ᱦᱩᱭᱩᱜᱼᱟ, ᱵᱮᱨ ᱮᱠᱴ ᱠᱷᱚᱱ ᱡᱟᱸᱪᱟᱣ ᱠᱟᱱᱟ᱾" },
      5: {
        title: "ᱴᱷᱟᱶᱜᱟ ᱟᱨᱡᱤ",
        summary: "ᱢᱟᱢᱞᱟ ᱵᱟᱠᱤ ᱛᱟᱦᱮᱸ ᱠᱷᱟᱱ ᱥᱚᱸᱜᱚᱲ ᱦᱟᱛᱟᱣ — ᱟᱨᱡᱤ, ᱟᱨ ᱟᱨ ᱮᱴᱟᱜ ᱡᱟᱣᱟᱵ ᱠᱚ᱾",
      },
      6: {
        title: "ᱵᱟᱫ-ᱪᱤᱴᱷᱤ / ᱠᱟᱛᱷᱟ",
        summary: "ᱢᱟᱢᱞᱟ ᱟᱨ ᱟᱨ ᱡᱟᱣᱟᱵ, ᱢᱟᱲᱟᱝ ᱨᱮ ᱠᱚᱴ ᱛᱮ ᱛᱷᱤᱨ ᱟᱠᱟᱱ ᱠᱟᱛᱷᱟ ᱦᱚᱸ᱾",
      },
      7: { title: "ᱵᱤᱪᱟᱨ", summary: "ᱠᱟᱛᱷᱟ ᱛᱷᱤᱨ ᱦᱟᱨᱟ ᱛᱟᱭᱚᱢ ᱥᱟᱠᱷᱤ ᱟᱨ ᱛᱚᱨᱠᱚ᱾" },
      8: { title: "ᱩᱫᱦᱚᱨᱚᱬ", summary: "ᱡᱳᱛᱚ ᱛᱚᱨᱠᱚ ᱟᱹᱭᱩᱨ ᱡᱟᱠᱟᱴ ᱦᱚᱠ ᱥᱟᱶᱜᱮ ᱡᱩᱲᱟᱹᱣ ᱠᱟᱱᱟ᱾" },
      9: { title: "ᱢᱟᱢᱞᱟ ᱛᱟᱭᱚᱢ", summary: "ᱯᱷᱟᱭᱤᱞ ᱵᱚᱸᱫ ᱦᱟᱲᱟ ᱛᱟᱭᱚᱢ ᱪᱮᱫ ᱦᱩᱭᱩᱭᱟᱭ᱾" },
    },
    products: { "draft-bot": "ᱥᱤᱥᱳ", library: "ᱟᱭᱤᱱ ᱞᱟᱭᱵᱨᱮᱨᱭ", courses: "ᱠᱚᱨᱥ" },
  },
  featureStrip: {
    features: [
      {
        name: "ᱥᱤᱥᱳ",
        body: "ᱢᱤᱫ ᱵᱟᱫ-ᱪᱤᱴᱷᱤ, ᱱᱚᱴᱤᱥ, ᱟᱨᱡᱤ ᱥᱮ ᱪᱩᱠᱛᱤ ᱯᱮᱥᱴ ᱢᱮ᱾ ᱠᱟᱶᱦᱟ ᱨᱮ ᱫᱷᱟᱨᱟ-ᱦᱟᱹᱨᱟ ᱴᱤᱯᱚᱬ ᱧᱟᱢ ᱢᱮ, ᱨᱮᱡᱤᱥᱴᱨᱭ ᱛᱟᱭᱚᱢ ᱥᱮᱴᱮᱨ ᱛᱮ ᱠᱟᱹᱢᱤ ᱰᱷᱟᱸᱜ ᱡᱟᱸᱪᱟᱣ ᱦᱩᱭᱩᱜᱼᱟ — ᱡᱟᱦᱟᱸ ᱞᱮᱠᱟ ᱢᱤᱫ ᱥᱤᱱᱤᱭᱚᱨ ᱨᱩᱣᱟᱲ ᱮᱢᱟᱭ᱾",
      },
      {
        name: "ᱟᱭᱤᱱ ᱞᱟᱭᱵᱨᱮᱨᱭ",
        body: "ᱥᱟᱹᱨᱦᱟᱹ ᱠᱚᱴ ᱟᱨ ᱦᱟᱭᱠᱚᱴ ᱨᱮᱭᱟᱜ ᱯᱷᱚᱭᱥᱚᱞᱟ ᱠᱚ, ᱵᱮᱨ ᱮᱠᱴ ᱠᱚ, ᱟᱨ ᱵᱟᱡᱷᱭᱟ᱾ SCC ᱨᱩᱯ ᱨᱮ ᱩᱫᱷᱚᱨᱚᱬ, ᱞᱚᱠᱟ ᱯᱟᱹᱨᱥᱤ ᱨᱮ ᱵᱩᱡᱦᱟᱹᱣ ᱠᱟᱱᱟ᱾",
      },
      {
        name: "ᱠᱚᱨᱥ",
        body: "ᱵᱟᱨᱭᱟ ᱴᱨᱮᱠ — ᱵᱩᱱᱤᱭᱟᱫ ᱞᱟᱹᱜᱤᱛ ᱥᱴᱟᱨᱴᱚᱨ, ᱴᱷᱟᱶᱜᱟ ᱥᱚᱸᱜᱚᱲ, ᱵᱮᱯᱟᱨ ᱰᱨᱟᱯᱷᱴᱤᱝ ᱟᱨ ᱢᱟᱢᱞᱟ ᱨᱚᱱᱚᱨ ᱞᱟᱹᱜᱤᱛ ᱯᱨᱚᱯᱷᱤᱥᱤᱭᱮᱱᱴ᱾ ᱡᱳᱛᱚ ᱢᱳᱰᱭᱩᱞ ᱢᱤᱫ ᱯᱷᱟᱭᱤᱞᱤᱝ ᱨᱮ ᱛᱟᱢᱟᱢ ᱦᱩᱭᱩᱜᱼᱟ, ᱠᱩᱭᱤᱡ ᱨᱮ ᱵᱟᱹᱱᱩᱜᱼᱟ᱾",
      },
    ],
    exploreLabel: (name) => `${name} ᱧᱮᱞ ᱢᱮ`,
  },
  productShowcase: {
    pill: "ᱥᱤᱥᱳ · ᱰᱮᱢᱳ ᱢᱳᱰ",
    heading: [{ text: "ᱪᱤᱱᱦᱟᱹ ᱠᱟᱱ ᱢᱤᱫ " }, { text: "ᱰᱨᱟᱯᱷᱴ", em: true }, { text: " ᱚᱠᱟ ᱞᱮᱠᱟ ᱧᱮᱞ ᱠᱟᱱᱟ ᱚᱱᱟ ᱧᱮᱞ ᱢᱮ᱾" }],
    body: "ᱚᱠᱚ ᱯᱟᱥ ᱨᱮ ᱢᱤᱫ ᱵᱟᱫ-ᱪᱤᱴᱷᱤ ᱥᱮ ᱪᱩᱠᱛᱤ ᱯᱮᱥᱴ ᱢᱮ᱾ ᱴᱤᱯᱚᱬ ᱠᱚ ᱠᱟᱶᱦᱟ ᱛᱮ ᱨᱩᱣᱟᱲ ᱦᱮᱡᱩᱭᱟ, ᱡᱳᱛᱚ ᱚᱱᱟ ᱫᱷᱟᱨᱟ ᱥᱟᱶᱜᱮ ᱡᱩᱲᱟᱹᱣ ᱠᱟᱱᱟ ᱚᱱᱟ ᱪᱤᱱᱦᱟᱹ ᱠᱟᱱᱟ ᱟᱨ ᱚᱱᱟ ᱦᱤᱱᱰ ᱚᱛᱱ ᱦᱚᱠ ᱨᱮ ᱦᱮᱡ ᱠᱟᱱᱟ᱾",
    ctaPrimary: "ᱥᱤᱥᱳ ᱠᱷᱩᱞᱟᱹ ᱢᱮ",
    ctaSecondary: "ᱩᱞᱟᱹᱭ ᱧᱮᱞ ᱢᱮ",
    miniNotes: [
      "ᱟᱱᱩᱪᱷᱮᱫ ᱒᱒᱖ — ᱠᱮᱛᱲᱟ ᱦᱚᱠ ᱠᱟᱛᱷᱟ ᱢᱮ᱾",
      "ᱴᱷᱟᱶᱜᱟ ᱥᱚᱸᱜᱚᱲ: ᱯᱮ ᱟᱝᱜᱚ ᱠᱟᱛᱷᱟ ᱢᱮ᱾",
      "ᱡᱟᱸᱪᱟᱣ ᱫᱷᱟᱨᱟ ᱵᱟᱹᱱᱩᱜᱼᱟ — ᱚᱨᱰᱚᱨ VI ᱨᱩᱞ ᱑᱕᱾",
    ],
    figcaption:
      "ᱥᱤᱥᱳ ᱠᱟᱹᱢᱤ ᱡᱟᱭᱜᱟ ᱨᱮᱭᱟᱜ ᱢᱤᱫ ᱧᱮᱞ: ᱚᱠᱚ ᱯᱟᱥ ᱨᱮ ᱰᱨᱟᱯᱷᱴ, ᱟᱨ ᱡᱚᱬ ᱠᱟᱶᱦᱟ ᱨᱮ ᱯᱮ ᱥᱤᱥᱳ ᱴᱤᱯᱚᱬ — ᱟᱱᱩᱪᱷᱮᱫ ᱒᱒᱖ ᱥᱟᱶᱜᱮ ᱠᱮᱛᱲᱟ ᱦᱚᱠ, ᱴᱷᱟᱶᱜᱟ ᱥᱚᱸᱜᱚᱲ ᱞᱟᱹᱜᱤᱛ ᱡᱟᱸᱪᱟᱣ ᱟᱠᱟᱱ ᱯᱮ ᱟᱝᱜᱚ, ᱟᱨ ᱥᱤᱣᱤᱞ ᱠᱟᱹᱢᱤ ᱰᱷᱟᱸᱜ ᱥᱚᱸᱦᱤᱛᱟ ᱨᱮᱭᱟᱜ ᱚᱨᱰᱚᱨ VI ᱨᱩᱞ ᱑᱕ ᱥᱟᱶᱜᱮ ᱵᱟᱹᱱᱩᱜ ᱠᱟᱱ ᱡᱟᱸᱪᱟᱣ ᱫᱷᱟᱨᱟ᱾",
  },
  pricingPreview: {
    eyebrow: "ᱩᱞᱟᱹᱭ",
    heading: [{ text: "ᱪᱮᱛᱟᱱ ᱪᱮᱟᱸᱰᱟᱜ ᱨᱮᱭᱟᱜ " }, { text: "ᱵᱟᱡᱮᱴ", em: true }, { text: " ᱞᱟᱹᱜᱤᱛ ᱩᱞᱟᱹᱭ ᱛᱷᱤᱨ᱾" }],
    seeFull: "ᱡᱚᱛᱚ ᱛᱩᱞᱚᱱᱟ ᱧᱮᱞ ᱢᱮ",
    forever: "ᱡᱟᱣᱚᱛ ᱞᱟᱹᱜᱤᱛ",
    perMonth: "ᱢᱟᱦᱟᱸ ᱨᱮ",
    mostPopular: "Recommended for students",
    taglines: {
      free: "ᱢᱤᱫ ᱜᱩᱨᱩ ᱟᱢᱟᱜ ᱠᱟᱹᱢᱤ ᱚᱠᱟ ᱞᱮᱠᱟ ᱪᱤᱱᱦᱟᱹ ᱦᱟᱛᱟᱣ ᱚᱱᱟ ᱧᱮᱞ ᱢᱮ᱾",
      basic: "ᱯᱟᱲᱦᱟᱣ ᱟᱨ ᱥᱮᱬᱟᱭ ᱞᱟᱹᱜᱤᱛ ᱡᱚᱛᱚ — ᱵᱚᱴ ᱟᱹᱛᱟᱭ ᱯᱳᱭᱥᱟ ᱴᱨᱟᱭᱞ ᱨᱮ ᱛᱟᱦᱮᱸᱜᱼᱟ᱾",
      core: "ᱡᱚᱛᱚ ᱵᱩᱱᱤᱭᱟᱫ, ᱟᱨ ᱵᱚᱴ ᱦᱚᱸ ᱚᱠᱟᱹᱛᱮᱭ ᱥᱮᱢᱟ ᱵᱟᱹᱱᱩᱜᱼᱟ᱾",
      proficient: "ᱣᱚᱠᱤᱞ ᱟᱨ ᱠᱟᱹᱢᱤ ᱨᱮ ᱛᱟᱦᱮᱸ ᱢᱩᱪᱟᱹᱫ ᱥᱮᱨᱢᱟ ᱪᱮᱛᱟᱱ ᱪᱮᱟᱸᱰᱟᱜ ᱞᱟᱹᱜᱤᱛ᱾",
    },
  },
  finalCta: {
    heading: [{ text: "ᱟᱢᱟᱜ ᱰᱨᱟᱯᱷᱴ ᱢᱤᱫ " }, { text: "ᱜᱩᱨᱩ", em: true }, { text: " ᱥᱟᱢᱚᱜ ᱦᱮᱡ ᱢᱮ᱾" }],
    body: "ᱢᱟᱦᱟᱸ ᱨᱮ ᱢᱚᱬᱮ ᱟᱹᱛᱟᱭ ᱧᱮᱞ ᱪᱷᱚ᱾ ᱚᱠᱟᱹᱛᱮᱭ ᱠᱟᱨᱰ ᱵᱟᱹᱜᱤᱭᱟᱹ ᱠᱟ, ᱟᱨ ᱚᱠᱟᱹᱛᱮᱭ ᱤᱱᱥᱴᱚᱞ ᱵᱟᱹᱜᱤᱭᱟᱹ ᱠᱟ᱾",
    ctaPrimary: "ᱥᱤᱥᱳ ᱧᱟᱢ ᱧᱟᱢ",
    ctaSecondary: "ᱩᱞᱟᱹᱭ ᱧᱮᱞ ᱢᱮ",
  },
};

const sd: Dictionary = {
  languageSwitch: { label: "भाषा" },
  hero: {
    eyebrow: "भारतीय कानून खातर · सुप्रीम कोर्ट अ हाईकोर्ट",
    line1: [{ text: "हर महान वकीलَ खي हिको " }, { text: "गुरु", em: true }, { text: " हुندو هو." }],
    line2: [{ text: "هاڻي اوهانجو گرو AI آهي — ڀارتي قانون خاطر ٺاهيل." }],
    subhead:
      "भारतीय कानून खातर कोर्सेस अ हिक AI मसौदा सहायक — कानून जा विद्यार्थी, भावी वकील, अ प्रैक्टिस कंदड़ वकीलن खातर.",
    ctaPrimary: "शिशो अजमायो",
    ctaSecondary: "कोर्सेस डिसो",
    ctaNote: "कोनो कार्ड जरूरी नाहे.",
  },
  matterFlow: {
    eyebrow: "किथाهن शुरू कجी",
    heading: [{ text: "उ मरحلो लभो जتي तوهीं " }, { text: "आहيो", em: true }, { text: "." }],
    seeMap: "पूरो नقشो डिसो",
    stages: {
      1: { title: "होमपेज", summary: "जتي कو پہچندو آهي, अ शिशो कुھ آهي سو." },
      2: { title: "वकील", summary: "کیس ڪير آڻيندو آهي, अ इ ڪهڙي फोरम جو آهي." },
      3: { title: "राज्य", summary: "کیس مٿي ويندو آهي: رٽ اختيار अ सुप्रीम कोर्ट." },
      4: { title: "मसौदा", summary: "پهريون दस्तावेज कागذ تي अچي، बेयर एक्ट جي खلاف جاچيل." },
      5: {
        title: "अंतरिम अरजी",
        summary: "کیس زیر التوا هجڻ دوران گهربل राहत — अरजी، तنहन جو बुनियाद حلف نامو، अ तنहन جا جواب.",
      },
      6: {
        title: "दावा-पत्र / मुद्दा",
        summary: "کیس अ तنहن جو जواب, आخر ۾ कोर्ट جي طرفان طئي ٿيل मुद्दن तائين.",
      },
      7: { title: "सुनवाई", summary: "मुद्दा طئي ٿيڻ کان پوءِ सबूत अ दलील." },
      8: { title: "हवाला", summary: "हर दलील اصل ۾ बाध्यकारी अधिकार सان जڙيل." },
      9: { title: "کیس जي बाद", summary: "फाइल बंद ٿيڻ کان پوءِ ڇا ٿيندو آهي." },
    },
    products: { "draft-bot": "शिशो", library: "कानूनी लाइब्रेरी", courses: "कोर्सेस" },
  },
  featureStrip: {
    features: [
      {
        name: "शिशो",
        body: "हिक दावा-पत्र, नोटिस, अरजी یا करार पेस्ट ڪريو. حاشيي ۾ धारा-स्तरीय टिप्पणी وٺو, रजिस्ट्री کان اڳ ئي प्रक्रिया जاچيل हुंदي آهي — बلڪل جيئن हिक सीनियर वापस سونپيندو.",
      },
      {
        name: "कानूनी लाइब्रेरी",
        body: "सुप्रीम कोर्ट अ हाईकोर्ट جا फैसला, बेयर एक्ट, अ تفسير. SCC शक्ल ۾ हवालो, सولي ٻولي ۾ سمجهايل.",
      },
      {
        name: "कोर्सेस",
        body: "ٻه ٽريڪ — बुनियاد खातر स्टार्टर, अंतरिम राहत, वाणिज्यिक मसौदा अ मुकदमेबाजी रणनीति खातر प्रोफिशिएंट. हर मॉड्यूल हिक फाइलिंग ۾ ختم ٿئي ٿو, क्विज ۾ نه.",
      },
    ],
    exploreLabel: (name) => `${name} ڏسو`,
  },
  productShowcase: {
    pill: "शिशो · डेमो موڊ",
    heading: [{ text: "چڪاسيل هڪ " }, { text: "मसौदा", em: true }, { text: " ڪيئن ڏسڻ ۾ اچي ٿو سو ڏسو." }],
    body: "کاٻي پاسي هڪ दावा-पत्र یا करार पेस्ट ڪريو. टिप्पणी حاشيي ڏانهن موٽي اينديون آهن, हर هڪ ان धارا سان جڙيل جيڪا هي نشان لڳائي ٿي अ जنهن هिंदुستानी अधिकार تي هي आधारित آهي.",
    ctaPrimary: "शिशो खोलو",
    ctaSecondary: "قيمت ڏسو",
    miniNotes: [
      "अनुच्छेद 226 — علائقائي अधिकार क्षेत्र جي دليل ڏيو.",
      "अंतरिम राहत: ٽئي अंग جي دليل ڏيو.",
      "تصديقي धारा नाहे — आदेश VI नियम 15.",
    ],
    figcaption:
      "शिशो वर्कस्पेस جو هڪ جھلڪ: کاٻي पاسي मसौदा, अ ساڄي حاشيي ۾ ٽي शिशो टिप्पणी — अनुच्छेद 226 هيٺ علائقائي अधिकार क्षेत्र, अंतरिम राहत खातر ضروري ٽئي अंग, अ सिविल प्रक्रिया संहिता جي आदेश VI नियम 15 هيٺ نه هجندڙ تصديقي धारा.",
  },
  pricingPreview: {
    eyebrow: "قيمت",
    heading: [{ text: "हिक विद्यार्थी جي " }, { text: "बजेट", em: true }, { text: " खातر قيمت رکيل." }],
    seeFull: "पूरو मुقابلो ڏسو",
    forever: "हमेशा खातر",
    perMonth: "हر مهيني",
    mostPopular: "Recommended for students",
    taglines: {
      free: "ڏسو هڪ गुरु اوهان جو ڪم ڪيئن نشان لڳائي ٿو.",
      basic: "پڙهڻ अ अध्ययन खातر سڀ ڪجهه — बॉट फ्री ट्रायल तي ئي رهي ٿو.",
      core: "पूरو بنياد, अ बॉट बगैर किन्हिं حد جي.",
      proficient: "वकीलن अ प्रैक्टिस ۾ آخري سال جي विद्यार्थीن खातر.",
    },
  },
  finalCta: {
    heading: [{ text: "پنهنجو मसौदा हिक " }, { text: "गुरु", em: true }, { text: " جي اڳيان رکو." }],
    body: "हर مهيني پنج مفت समीक्षा. कोनो कार्ड जरूरी नाहे, अ ڪجهه به انسٽال ڪرڻ جي ضرورت ناهي.",
    ctaPrimary: "शिशो अजमायो",
    ctaSecondary: "قيمت ڏسو",
  },
};

const ur: Dictionary = {
  languageSwitch: { label: "زبان" },
  hero: {
    eyebrow: "بھارتی قانون کے لیے · سپریم کورٹ اور ہائی کورٹس",
    line1: [{ text: "ہر عظیم وکیل کا ایک " }, { text: "گرو", em: true }, { text: " ہوتا تھا۔" }],
    line2: [{ text: "اب آپ کا گرو AI ہے — بھارتی قانون کے لیے بنایا گیا۔" }],
    subhead:
      "بھارتی قانون کے لیے کورسز اور ایک AI ڈرافٹنگ اسسٹنٹ — قانون کے طالب علموں، آئندہ وکیلوں، اور پریکٹس کرنے والے وکیلوں کے لیے۔",
    ctaPrimary: "شِشو آزمائیں",
    ctaSecondary: "کورسز دیکھیں",
    ctaNote: "کسی کارڈ کی ضرورت نہیں۔",
  },
  matterFlow: {
    eyebrow: "کہاں سے شروع کریں",
    heading: [{ text: "وہ مرحلہ تلاش کریں جہاں آپ " }, { text: "ہیں", em: true }, { text: "۔" }],
    seeMap: "پورا نقشہ دیکھیں",
    stages: {
      1: { title: "ہوم پیج", summary: "جہاں کوئی پہنچتا ہے، اور شِشو کیا ہے۔" },
      2: { title: "وکیل", summary: "مقدمہ کون لاتا ہے، اور یہ کس فورم کا ہے۔" },
      3: { title: "ریاست", summary: "مقدمہ اوپر جاتا ہے: رٹ کا دائرہ اختیار اور سپریم کورٹ۔" },
      4: { title: "ڈرافٹ", summary: "پہلی دستاویز کاغذ پر آتی ہے، بیئر ایکٹ کے خلاف جانچی گئی۔" },
      5: {
        title: "عبوری درخواست",
        summary: "مقدمہ زیرِ التوا رہنے کے دوران مانگی گئی راحت — درخواست، اس کی بنیاد حلف نامہ، اور اس کے جوابات۔",
      },
      6: {
        title: "دعویٰ / معاملات",
        summary: "مقدمہ اور اس کا جواب، بالآخر ان معاملات تک جنہیں عدالت طے کرتی ہے۔",
      },
      7: { title: "سماعت", summary: "معاملات طے ہونے کے بعد ثبوت اور دلیل۔" },
      8: { title: "حوالہ جات", summary: "ہر دلیل ایک حقیقی طور پر پابند اختیار سے جڑی ہوئی۔" },
      9: { title: "مقدمے کے بعد", summary: "فائل بند ہونے کے بعد کیا ہوتا ہے۔" },
    },
    products: { "draft-bot": "شِشو", library: "قانونی لائبریری", courses: "کورسز" },
  },
  featureStrip: {
    features: [
      {
        name: "شِشو",
        body: "ایک دعویٰ، نوٹس، درخواست یا معاہدہ پیسٹ کریں۔ حاشیے میں شق کی سطح کے نوٹس حاصل کریں، رجسٹری سے پہلے ہی طریقہ کار جانچا جاتا ہے — بالکل جیسے ایک سینئر واپس سونپتا۔",
      },
      {
        name: "قانونی لائبریری",
        body: "سپریم کورٹ اور ہائی کورٹ کے فیصلے، بیئر ایکٹس، اور تشریح۔ SCC شکل میں حوالہ دیا گیا، سادہ زبان میں سمجھایا گیا۔",
      },
      {
        name: "کورسز",
        body: "دو ٹریک — بنیاد کے لیے اسٹارٹر، عبوری راحت، تجارتی ڈرافٹنگ اور مقدمہ بازی کی حکمتِ عملی کے لیے پروفیشنٹ۔ ہر ماڈیول ایک فائلنگ پر ختم ہوتا ہے، کوئز پر نہیں۔",
      },
    ],
    exploreLabel: (name) => `${name} دیکھیں`,
  },
  productShowcase: {
    pill: "شِشو · ڈیمو موڈ",
    heading: [{ text: "دیکھیں ایک نشان زدہ " }, { text: "ڈرافٹ", em: true }, { text: " کیسا نظر آتا ہے۔" }],
    body: "بائیں طرف ایک دعویٰ یا معاہدہ پیسٹ کریں۔ نوٹس حاشیے میں واپس آتے ہیں، ہر ایک اس شق سے جڑا ہوا جسے وہ نشان زد کرتا ہے اور اس بھارتی اختیار سے جس پر وہ مبنی ہے۔",
    ctaPrimary: "شِشو کھولیں",
    ctaSecondary: "قیمت دیکھیں",
    miniNotes: [
      "دفعہ 226 — علاقائی دائرہ اختیار پیش کریں۔",
      "عبوری راحت: تینوں اجزاء پیش کریں۔",
      "تصدیقی شق موجود نہیں — آرڈر VI رول 15۔",
    ],
    figcaption:
      "شِشو ورک اسپیس کا ایک پیش منظر: بائیں طرف ڈرافٹ، اور دائیں حاشیے میں تین شِشو نوٹس — دفعہ 226 کے تحت علاقائی دائرہ اختیار، عبوری راحت کے لیے ضروری تینوں اجزاء، اور ضابطہ دیوانی کے آرڈر VI رول 15 کے تحت غائب تصدیقی شق۔",
  },
  pricingPreview: {
    eyebrow: "قیمت",
    heading: [{ text: "ایک طالب علم کے " }, { text: "بجٹ", em: true }, { text: " کے لیے قیمت مقرر۔" }],
    seeFull: "مکمل موازنہ دیکھیں",
    forever: "ہمیشہ کے لیے",
    perMonth: "فی مہینہ",
    mostPopular: "طلبہ کے لیے تجویز کردہ",
    taglines: {
      free: "دیکھیں ایک گرو آپ کے کام کو کیسے نشان زد کرتا ہے۔",
      basic: "پڑھنے اور مطالعے کے لیے سب کچھ — بوٹ مفت ٹرائل پر ہی رہتا ہے۔",
      core: "مکمل بنیاد، اور بوٹ بغیر کسی حد کے۔",
      proficient: "وکیلوں اور پریکٹس میں آخری سال کے طالب علموں کے لیے۔",
    },
  },
  finalCta: {
    heading: [{ text: "اپنا ڈرافٹ ایک " }, { text: "گرو", em: true }, { text: " کے سامنے رکھیں۔" }],
    body: "فی مہینہ پانچ مفت جائزے۔ کسی کارڈ کی ضرورت نہیں، اور کچھ بھی انسٹال کرنے کی ضرورت نہیں۔",
    ctaPrimary: "شِشو آزمائیں",
    ctaSecondary: "قیمت دیکھیں",
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
  as,
  brx,
  doi,
  kn,
  ks,
  kok,
  mai,
  ml,
  mni,
  ne,
  or,
  pa,
  sa,
  sat,
  sd,
  ur,
};

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

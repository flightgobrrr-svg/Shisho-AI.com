/**
 * The states and union territories of India.
 *
 * 28 states and 8 union territories — the position since 26 January 2020,
 * after the Jammu and Kashmir Reorganisation Act, 2019 split the former state
 * into the union territories of Jammu and Kashmir and of Ladakh, and after
 * Dadra and Nagar Haveli was merged with Daman and Diu into a single union
 * territory on 26 January 2020.
 *
 * Both lists are alphabetical. They are kept apart rather than merged into one
 * flat list because the constitutional distinction is real and a litigant
 * picking a forum needs to see it — the select renders them as two optgroups.
 */

export const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

export const UNION_TERRITORIES = [
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi (NCT)",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

export type StateName =
  | (typeof STATES)[number]
  | (typeof UNION_TERRITORIES)[number];

/**
 * The High Court exercising jurisdiction over each state and union territory.
 *
 * VERIFIED against the list of High Courts and their territorial jurisdiction
 * before it was written down — the same rule lib/library.ts and
 * lib/documents.ts apply. Three courts sit over more than one territory, which
 * is exactly why this could not be guessed from the state name:
 *
 *   Bombay .................. Maharashtra, Goa, Dadra and Nagar Haveli and
 *                             Daman and Diu
 *   Gauhati ................. Assam, Arunachal Pradesh, Nagaland, Mizoram
 *   Punjab and Haryana ...... Punjab, Haryana, Chandigarh
 *   Calcutta ................ West Bengal, Andaman and Nicobar Islands
 *   Madras .................. Tamil Nadu, Puducherry
 *   Kerala .................. Kerala, Lakshadweep
 *   J&K and Ladakh .......... Jammu and Kashmir, Ladakh
 *
 * Several courts are named for a city that has since been renamed (Bombay,
 * Madras, Calcutta). Those are the courts' own current legal names and are
 * deliberately not "corrected".
 */
export const HIGH_COURT_BY_STATE: Record<StateName, string> = {
  "Andhra Pradesh": "Andhra Pradesh High Court",
  "Arunachal Pradesh": "Gauhati High Court",
  Assam: "Gauhati High Court",
  Bihar: "Patna High Court",
  Chhattisgarh: "Chhattisgarh High Court",
  Goa: "Bombay High Court",
  Gujarat: "Gujarat High Court",
  Haryana: "Punjab and Haryana High Court",
  "Himachal Pradesh": "Himachal Pradesh High Court",
  Jharkhand: "Jharkhand High Court",
  Karnataka: "Karnataka High Court",
  Kerala: "Kerala High Court",
  "Madhya Pradesh": "Madhya Pradesh High Court",
  Maharashtra: "Bombay High Court",
  Manipur: "Manipur High Court",
  Meghalaya: "Meghalaya High Court",
  Mizoram: "Gauhati High Court",
  Nagaland: "Gauhati High Court",
  Odisha: "Orissa High Court",
  Punjab: "Punjab and Haryana High Court",
  Rajasthan: "Rajasthan High Court",
  Sikkim: "Sikkim High Court",
  "Tamil Nadu": "Madras High Court",
  Telangana: "Telangana High Court",
  Tripura: "Tripura High Court",
  "Uttar Pradesh": "Allahabad High Court",
  Uttarakhand: "Uttarakhand High Court",
  "West Bengal": "Calcutta High Court",

  "Andaman and Nicobar Islands": "Calcutta High Court",
  Chandigarh: "Punjab and Haryana High Court",
  "Dadra and Nagar Haveli and Daman and Diu": "Bombay High Court",
  "Delhi (NCT)": "Delhi High Court",
  "Jammu and Kashmir": "High Court of Jammu & Kashmir and Ladakh",
  Ladakh: "High Court of Jammu & Kashmir and Ladakh",
  Lakshadweep: "Kerala High Court",
  Puducherry: "Madras High Court",
};

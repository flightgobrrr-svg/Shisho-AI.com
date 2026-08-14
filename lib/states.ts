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

/**
 * Bare Acts index — Central Acts, and a curated (deliberately non-exhaustive)
 * state-wise index. This is a reference index, not a full-text repository:
 * it names an act and its year so a reader knows what to look for, it does
 * not reproduce or summarise the act's text.
 *
 * The Central list is held to a high confidence bar — these are all
 * well-documented, frequently-cited enactments. The state list is not: per
 * an explicit scoping decision, entries only appear where the name and year
 * are ones we're actually confident about, rather than padding every state
 * out to a uniform length. Smaller/less-documented states will visibly have
 * shorter lists, and a few (governed substantially by Sixth Schedule
 * autonomous district councils or distinct customary-law frameworks) carry
 * a note instead of invented act titles. Always verify against the current
 * bare act or state gazette before relying on any entry here — state
 * legislation is amended and renamed more often than central legislation,
 * and this index is not a substitute for that check.
 */

export type CentralAct = { sno: number; name: string; year: number };

export const CENTRAL_ACTS: CentralAct[] = [
  { sno: 1, name: "Arbitration and Conciliation Act", year: 1996 },
  { sno: 2, name: "Bharatiya Nagarik Suraksha Sanhita", year: 2023 },
  { sno: 3, name: "Bharatiya Nyaya Sanhita", year: 2023 },
  { sno: 4, name: "Bharatiya Sakshya Adhiniyam", year: 2023 },
  { sno: 5, name: "Code of Civil Procedure", year: 1908 },
  { sno: 6, name: "Code of Criminal Procedure", year: 1973 },
  { sno: 7, name: "Companies Act", year: 2013 },
  { sno: 8, name: "Constitution of India", year: 1950 },
  { sno: 9, name: "Consumer Protection Act", year: 2019 },
  { sno: 10, name: "Copyright Act", year: 1957 },
  { sno: 11, name: "Dowry Prohibition Act", year: 1961 },
  { sno: 12, name: "Electricity Act", year: 2003 },
  { sno: 13, name: "Environment (Protection) Act", year: 1986 },
  { sno: 14, name: "Factories Act", year: 1948 },
  { sno: 15, name: "Family Courts Act", year: 1984 },
  { sno: 16, name: "Foreign Exchange Management Act", year: 1999 },
  { sno: 17, name: "General Clauses Act", year: 1897 },
  { sno: 18, name: "Guardians and Wards Act", year: 1890 },
  { sno: 19, name: "Hindu Adoptions and Maintenance Act", year: 1956 },
  { sno: 20, name: "Hindu Marriage Act", year: 1955 },
  { sno: 21, name: "Hindu Minority and Guardianship Act", year: 1956 },
  { sno: 22, name: "Hindu Succession Act", year: 1956 },
  { sno: 23, name: "Income Tax Act", year: 1961 },
  { sno: 24, name: "Indian Contract Act", year: 1872 },
  { sno: 25, name: "Indian Divorce Act", year: 1869 },
  { sno: 26, name: "Indian Evidence Act", year: 1872 },
  { sno: 27, name: "Indian Partnership Act", year: 1932 },
  { sno: 28, name: "Indian Penal Code", year: 1860 },
  { sno: 29, name: "Indian Stamp Act", year: 1899 },
  { sno: 30, name: "Indian Succession Act", year: 1925 },
  { sno: 31, name: "Industrial Disputes Act", year: 1947 },
  { sno: 32, name: "Information Technology Act", year: 2000 },
  { sno: 33, name: "Insolvency and Bankruptcy Code", year: 2016 },
  { sno: 34, name: "Juvenile Justice (Care and Protection of Children) Act", year: 2015 },
  { sno: 35, name: "Limitation Act", year: 1963 },
  { sno: 36, name: "Maintenance and Welfare of Parents and Senior Citizens Act", year: 2007 },
  { sno: 37, name: "Motor Vehicles Act", year: 1988 },
  { sno: 38, name: "Muslim Women (Protection of Rights on Divorce) Act", year: 1986 },
  { sno: 39, name: "Narcotic Drugs and Psychotropic Substances Act", year: 1985 },
  { sno: 40, name: "Negotiable Instruments Act", year: 1881 },
  { sno: 41, name: "Protection of Children from Sexual Offences Act", year: 2012 },
  { sno: 42, name: "Protection of Women from Domestic Violence Act", year: 2005 },
  { sno: 43, name: "Registration Act", year: 1908 },
  { sno: 44, name: "Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act", year: 2013 },
  { sno: 45, name: "Right to Information Act", year: 2005 },
  { sno: 46, name: "Sale of Goods Act", year: 1930 },
  { sno: 47, name: "Scheduled Castes and Scheduled Tribes (Prevention of Atrocities) Act", year: 1989 },
  { sno: 48, name: "Special Marriage Act", year: 1954 },
  { sno: 49, name: "Specific Relief Act", year: 1963 },
  { sno: 50, name: "Transfer of Property Act", year: 1882 },
  { sno: 51, name: "Trade Marks Act", year: 1999 },
  { sno: 52, name: "Wakf Act", year: 1995 },
];

export type StateAct = { sno: number; name: string; year: number };
export type StateActGroup = { state: string; acts: StateAct[]; note?: string };

/** Alphabetical by state; each state's acts are serially numbered from 1
 *  within that state (not globally), matching how a reader would look them
 *  up state-by-state. */
export const STATE_ACTS: StateActGroup[] = [
  { state: "Andhra Pradesh", acts: [
    { sno: 1, name: "Andhra Pradesh Buildings (Lease, Rent and Eviction) Control Act", year: 1960 },
    { sno: 2, name: "Andhra Pradesh Shops and Establishments Act", year: 1988 },
    { sno: 3, name: "Andhra Pradesh Land Reforms (Ceiling on Agricultural Holdings) Act", year: 1973 },
    { sno: 4, name: "Andhra Pradesh Co-operative Societies Act", year: 1964 },
    { sno: 5, name: "Andhra Pradesh Municipalities Act", year: 1965 },
  ] },
  { state: "Arunachal Pradesh", acts: [], note: "Large parts of the state are governed by customary law and local self-government arrangements distinct from the standard state-legislation pattern; specific act names are omitted here pending verification rather than guessed." },
  { state: "Assam", acts: [
    { sno: 1, name: "Assam Urban Areas Rent Control Act", year: 1972 },
    { sno: 2, name: "Assam Shops and Establishments Act", year: 1971 },
    { sno: 3, name: "Assam Land and Revenue Regulation", year: 1886 },
    { sno: 4, name: "Assam Panchayat Act", year: 1994 },
  ] },
  { state: "Bihar", acts: [
    { sno: 1, name: "Bihar Buildings (Lease, Rent and Eviction) Control Act", year: 1982 },
    { sno: 2, name: "Bihar Shops and Establishments Act", year: 1953 },
    { sno: 3, name: "Bihar Land Reforms Act", year: 1950 },
    { sno: 4, name: "Bihar Municipal Act", year: 2007 },
  ] },
  { state: "Chhattisgarh", acts: [
    { sno: 1, name: "Chhattisgarh Municipal Corporation Act", year: 1956 },
    { sno: 2, name: "Chhattisgarh Panchayat Raj Adhiniyam", year: 1993 },
  ], note: "Chhattisgarh (formed 2000) initially adapted Madhya Pradesh's pre-2000 legislation, including the M.P. Accommodation Control Act, 1961 and M.P. Shops and Establishments Act, 1958 — check whether a given adapted act has since been replaced by a Chhattisgarh-specific enactment." },
  { state: "Goa", acts: [
    { sno: 1, name: "Goa, Daman and Diu Buildings (Lease, Rent and Eviction) Control Act", year: 1968 },
    { sno: 2, name: "Goa Shops and Establishments Act", year: 1973 },
    { sno: 3, name: "Goa Land Revenue Code", year: 1968 },
    { sno: 4, name: "Goa Municipalities Act", year: 1968 },
  ] },
  { state: "Gujarat", acts: [
    { sno: 1, name: "Gujarat Public Trusts Act", year: 1950 },
    { sno: 2, name: "Gujarat Town Planning and Urban Development Act", year: 1976 },
    { sno: 3, name: "Gujarat Co-operative Societies Act", year: 1961 },
    { sno: 4, name: "Gujarat Agricultural Lands Ceiling Act", year: 1960 },
  ], note: "Gujarat has substantially revised its shops-and-establishments and rent-control framework in recent years — confirm the current in-force titles before citing." },
  { state: "Haryana", acts: [
    { sno: 1, name: "Haryana Urban (Control of Rent and Eviction) Act", year: 1973 },
    { sno: 2, name: "Haryana Municipal Act", year: 1973 },
    { sno: 3, name: "Haryana Panchayati Raj Act", year: 1994 },
  ], note: "Haryana continued to apply several pre-1966 Punjab acts (e.g. the Punjab Shops and Commercial Establishments Act, 1958) after its formation — check whether a Haryana-specific replacement now applies." },
  { state: "Himachal Pradesh", acts: [
    { sno: 1, name: "Himachal Pradesh Urban Rent Control Act", year: 1987 },
    { sno: 2, name: "Himachal Pradesh Shops and Commercial Establishments Act", year: 1969 },
    { sno: 3, name: "Himachal Pradesh Land Revenue Act", year: 1954 },
    { sno: 4, name: "Himachal Pradesh Panchayati Raj Act", year: 1994 },
  ] },
  { state: "Jharkhand", acts: [
    { sno: 1, name: "Jharkhand Municipal Act", year: 2011 },
    { sno: 2, name: "Jharkhand Panchayati Raj Act", year: 2001 },
  ], note: "Jharkhand (formed 2000) initially continued Bihar's pre-2000 legislation, including the Bihar Buildings (Lease, Rent and Eviction) Control Act, 1982 — check whether it has since been replaced." },
  { state: "Karnataka", acts: [
    { sno: 1, name: "Karnataka Rent Act", year: 1999 },
    { sno: 2, name: "Karnataka Shops and Commercial Establishments Act", year: 1961 },
    { sno: 3, name: "Karnataka Land Reforms Act", year: 1961 },
    { sno: 4, name: "Karnataka Municipal Corporations Act", year: 1976 },
    { sno: 5, name: "Karnataka Co-operative Societies Act", year: 1959 },
  ] },
  { state: "Kerala", acts: [
    { sno: 1, name: "Kerala Buildings (Lease and Rent Control) Act", year: 1965 },
    { sno: 2, name: "Kerala Shops and Commercial Establishments Act", year: 1960 },
    { sno: 3, name: "Kerala Land Reforms Act", year: 1963 },
    { sno: 4, name: "Kerala Panchayat Raj Act", year: 1994 },
    { sno: 5, name: "Kerala Co-operative Societies Act", year: 1969 },
  ] },
  { state: "Madhya Pradesh", acts: [
    { sno: 1, name: "Madhya Pradesh Accommodation Control Act", year: 1961 },
    { sno: 2, name: "Madhya Pradesh Shops and Establishments Act", year: 1958 },
    { sno: 3, name: "Madhya Pradesh Land Revenue Code", year: 1959 },
    { sno: 4, name: "Madhya Pradesh Panchayat Raj Avam Gram Swaraj Adhiniyam", year: 1993 },
    { sno: 5, name: "Madhya Pradesh Municipal Corporation Act", year: 1956 },
  ] },
  { state: "Maharashtra", acts: [
    { sno: 1, name: "Maharashtra Rent Control Act", year: 1999 },
    { sno: 2, name: "Maharashtra Regional and Town Planning Act", year: 1966 },
    { sno: 3, name: "Maharashtra Land Revenue Code", year: 1966 },
    { sno: 4, name: "Maharashtra Shops and Establishments (Regulation of Employment and Conditions of Service) Act", year: 2017 },
    { sno: 5, name: "Maharashtra Co-operative Societies Act", year: 1960 },
    { sno: 6, name: "Maharashtra Public Trusts Act", year: 1950 },
  ] },
  { state: "Manipur", acts: [
    { sno: 1, name: "Manipur Shops and Establishments Act", year: 1972 },
    { sno: 2, name: "Manipur Municipalities Act", year: 1994 },
    { sno: 3, name: "Manipur Panchayati Raj Act", year: 1994 },
  ] },
  { state: "Meghalaya", acts: [], note: "Most of the state falls under Sixth Schedule autonomous district councils (Khasi Hills, Jaintia Hills, Garo Hills), which legislate on land, customary law and local administration separately from the standard state-Act pattern — specific enactments are omitted here pending verification." },
  { state: "Mizoram", acts: [], note: "Mizoram is substantially governed by customary Mizo law and Sixth Schedule district council arrangements, with special protection under Article 371G limiting Parliament's own legislative reach over religious/social practice, customary law and land. Specific state Act names are omitted here pending verification rather than guessed." },
  { state: "Nagaland", acts: [], note: "Nagaland has special protection under Article 371A: no Act of Parliament affecting Naga customary law and procedure, religious/social practices, or ownership and transfer of land applies to the state unless the state Legislative Assembly so decides. Specific state Act names are omitted here pending verification rather than guessed." },
  { state: "Odisha", acts: [
    { sno: 1, name: "Odisha House Rent Control Act", year: 1967 },
    { sno: 2, name: "Odisha Shops and Commercial Establishments Act", year: 1956 },
    { sno: 3, name: "Odisha Land Reforms Act", year: 1960 },
    { sno: 4, name: "Odisha Grama Panchayat Act", year: 1964 },
    { sno: 5, name: "Odisha Municipal Act", year: 1950 },
  ] },
  { state: "Punjab", acts: [
    { sno: 1, name: "East Punjab Urban Rent Restriction Act", year: 1949 },
    { sno: 2, name: "Punjab Shops and Commercial Establishments Act", year: 1958 },
    { sno: 3, name: "Punjab Land Revenue Act", year: 1887 },
    { sno: 4, name: "Punjab Panchayati Raj Act", year: 1994 },
    { sno: 5, name: "Punjab Municipal Corporation Act", year: 1976 },
  ] },
  { state: "Rajasthan", acts: [
    { sno: 1, name: "Rajasthan Rent Control Act", year: 2001 },
    { sno: 2, name: "Rajasthan Shops and Commercial Establishments Act", year: 1958 },
    { sno: 3, name: "Rajasthan Land Revenue Act", year: 1956 },
    { sno: 4, name: "Rajasthan Tenancy Act", year: 1955 },
    { sno: 5, name: "Rajasthan Panchayati Raj Act", year: 1994 },
  ] },
  { state: "Sikkim", acts: [], note: "Sikkim retains distinct land, revenue and old-law protections under Article 371F stemming from its 1975 merger with India — many pre-merger regulations remain in force alongside later state legislation. Specific Act names are omitted here pending verification rather than guessed." },
  { state: "Tamil Nadu", acts: [
    { sno: 1, name: "Tamil Nadu Buildings (Lease and Rent Control) Act", year: 1960 },
    { sno: 2, name: "Tamil Nadu Shops and Establishments Act", year: 1947 },
    { sno: 3, name: "Tamil Nadu Land Reforms (Fixation of Ceiling on Land) Act", year: 1961 },
    { sno: 4, name: "Tamil Nadu Panchayats Act", year: 1994 },
    { sno: 5, name: "Tamil Nadu Societies Registration Act", year: 1975 },
  ] },
  { state: "Telangana", acts: [], note: "Telangana (formed 2014) continued Andhra Pradesh's pre-bifurcation legislation via adaptation orders, including the A.P. Buildings (Lease, Rent and Eviction) Control Act, 1960 and A.P. Shops and Establishments Act, 1988, renamed to Telangana in text where adapted. Confirm current adapted titles before citing — several have since been re-enacted as standalone Telangana Acts." },
  { state: "Tripura", acts: [
    { sno: 1, name: "Tripura Shops and Establishments Act", year: 1970 },
    { sno: 2, name: "Tripura Land Revenue and Land Reforms Act", year: 1960 },
    { sno: 3, name: "Tripura Panchayati Raj Act", year: 1993 },
  ] },
  { state: "Uttar Pradesh", acts: [
    { sno: 1, name: "Uttar Pradesh Urban Buildings (Regulation of Letting, Rent and Eviction) Act", year: 1972 },
    { sno: 2, name: "Uttar Pradesh Shops and Commercial Establishments Act", year: 1962 },
    { sno: 3, name: "Uttar Pradesh Zamindari Abolition and Land Reforms Act", year: 1950 },
    { sno: 4, name: "Uttar Pradesh Panchayat Raj Act", year: 1947 },
    { sno: 5, name: "Uttar Pradesh Municipal Corporation Adhiniyam", year: 1959 },
  ] },
  { state: "Uttarakhand", acts: [
    { sno: 1, name: "Uttarakhand Panchayati Raj Act", year: 2016 },
  ], note: "Uttarakhand (formed 2000) initially continued Uttar Pradesh's pre-2000 legislation, including the U.P. Urban Buildings (Regulation of Letting, Rent and Eviction) Act, 1972 — check whether it has since been replaced." },
  { state: "West Bengal", acts: [
    { sno: 1, name: "West Bengal Premises Tenancy Act", year: 1997 },
    { sno: 2, name: "West Bengal Shops and Establishments Act", year: 1963 },
    { sno: 3, name: "West Bengal Land Reforms Act", year: 1955 },
    { sno: 4, name: "West Bengal Panchayat Act", year: 1973 },
    { sno: 5, name: "West Bengal Societies Registration Act", year: 1961 },
  ] },
  { state: "Delhi (NCT)", acts: [
    { sno: 1, name: "Delhi Rent Control Act", year: 1958 },
    { sno: 2, name: "Delhi Shops and Establishments Act", year: 1954 },
    { sno: 3, name: "Delhi Municipal Corporation Act", year: 1957 },
    { sno: 4, name: "Delhi Land Reforms Act", year: 1954 },
  ], note: "Delhi (NCT) is listed here alongside the states because it is by far the most-litigated Union Territory; the other seven Union Territories are not covered in this pass." },
];

export function findStateActs(state: string): StateActGroup | undefined {
  return STATE_ACTS.find((s) => s.state === state);
}

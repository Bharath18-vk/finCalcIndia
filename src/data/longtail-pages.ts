export type LongtailCalculatorType =
  | "personal-loan-emi"
  | "home-loan-emi"
  | "car-loan-emi"
  | "sip"
  | "step-up-sip"
  | "lumpsum"
  | "fd";

export interface LongtailPageConfig {
  slug: string; // The URL slug (e.g., "5-lakh-3-years")
  calculator: LongtailCalculatorType;
  baseRoute: string; // e.g. "/personal-loan-emi"
  params: {
    amount: number;
    tenureYears: number;
    rate?: number;
    stepUpPercentage?: number;
  };
  primaryKeyword: string;
  title: string;
  h1: string;
  metaDescription: string;
  parentHub: string;
  parentCalculator: string;
  relatedSlugs: string[]; // neighboring scenario URLs
  status: "live" | "draft";
}

/**
 * Curated whitelist of long-tail search scenarios.
 * Strictly capped at 30 live pages in Phase 1.
 * Only pages with status 'live' are indexed and included in sitemaps.
 */
export const LONGTAIL_PAGES: LongtailPageConfig[] = [
  // 1. Personal Loan - 5 Lakh, 3 Years
  {
    slug: "5-lakh-3-years",
    calculator: "personal-loan-emi",
    baseRoute: "/personal-loan-emi",
    params: {
      amount: 500000,
      tenureYears: 3,
      rate: 11.0,
    },
    primaryKeyword: "emi on 5 lakh personal loan for 3 years",
    title: "EMI on 5 Lakh Personal Loan for 3 Years - Exact Monthly Repayment",
    h1: "EMI on ₹5 Lakh Personal Loan for 3 Years",
    metaDescription:
      "Calculate the exact EMI on a ₹5 lakh personal loan for 3 years at 11% interest. See monthly repayment, interest as % of loan, and full 36-month schedule.",
    parentHub: "/loans",
    parentCalculator: "/personal-loan-emi-calculator",
    relatedSlugs: [
      "/personal-loan-emi/2-lakh-2-years",
      "/car-loan-emi/5-lakh-4-years",
      "/personal-loan-emi-calculator",
    ],
    status: "live",
  },

  // 2. Personal Loan - 2 Lakh, 2 Years
  {
    slug: "2-lakh-2-years",
    calculator: "personal-loan-emi",
    baseRoute: "/personal-loan-emi",
    params: {
      amount: 200000,
      tenureYears: 2,
      rate: 11.0,
    },
    primaryKeyword: "emi on 2 lakh personal loan for 2 years",
    title: "EMI on 2 Lakh Personal Loan for 2 Years - Monthly Schedule & Interest",
    h1: "EMI on ₹2 Lakh Personal Loan for 2 Years",
    metaDescription:
      "Find the monthly EMI on a ₹2 lakh personal loan for 2 years at an illustrative 11% interest rate. View total interest payout and tenure options.",
    parentHub: "/loans",
    parentCalculator: "/personal-loan-emi-calculator",
    relatedSlugs: [
      "/personal-loan-emi/5-lakh-3-years",
      "/personal-loan-emi-calculator",
    ],
    status: "live",
  },

  // 3. Home Loan - 50 Lakh, 20 Years
  {
    slug: "50-lakh-20-years",
    calculator: "home-loan-emi",
    baseRoute: "/home-loan-emi",
    params: {
      amount: 5000000,
      tenureYears: 20,
      rate: 8.5,
    },
    primaryKeyword: "50 lakh home loan emi for 20 years",
    title: "50 Lakh Home Loan EMI for 20 Years - Monthly Repayment & Schedule",
    h1: "50 Lakh Home Loan EMI for 20 Years",
    metaDescription:
      "Monthly EMI on a ₹50 lakh home loan for 20 years at benchmark 8.5% EBLR interest. See interest vs principal breakdown and complete amortization.",
    parentHub: "/loans",
    parentCalculator: "/home-loan-emi-calculator",
    relatedSlugs: [
      "/home-loan-emi/30-lakh-15-years",
      "/home-loan-emi-calculator",
      "/loans",
    ],
    status: "live",
  },

  // 4. Home Loan - 30 Lakh, 15 Years
  {
    slug: "30-lakh-15-years",
    calculator: "home-loan-emi",
    baseRoute: "/home-loan-emi",
    params: {
      amount: 3000000,
      tenureYears: 15,
      rate: 8.5,
    },
    primaryKeyword: "30 lakh home loan emi for 15 years",
    title: "30 Lakh Home Loan EMI for 15 Years - Amortization & Repayment",
    h1: "30 Lakh Home Loan EMI for 15 Years",
    metaDescription:
      "Calculate the monthly installment on a ₹30 lakh home loan for 15 years at 8.5% interest. Review total interest savings compared to a 20-year loan.",
    parentHub: "/loans",
    parentCalculator: "/home-loan-emi-calculator",
    relatedSlugs: [
      "/home-loan-emi/50-lakh-20-years",
      "/home-loan-emi-calculator",
    ],
    status: "live",
  },

  // 5. Car Loan - 8 Lakh, 5 Years
  {
    slug: "8-lakh-5-years",
    calculator: "car-loan-emi",
    baseRoute: "/car-loan-emi",
    params: {
      amount: 800000,
      tenureYears: 5,
      rate: 8.85,
    },
    primaryKeyword: "8 lakh car loan emi for 5 years",
    title: "8 Lakh Car Loan EMI for 5 Years - Auto Loan Interest & Schedule",
    h1: "8 Lakh Car Loan EMI for 5 Years",
    metaDescription:
      "Compute monthly EMI on an ₹8 lakh car loan for 5 years at benchmark 8.85% interest. See 60-month amortization and total cost of financing.",
    parentHub: "/loans",
    parentCalculator: "/car-loan-emi-calculator",
    relatedSlugs: [
      "/car-loan-emi/5-lakh-4-years",
      "/car-loan-emi-calculator",
      "/loans",
    ],
    status: "live",
  },

  // 6. Car Loan - 5 Lakh, 4 Years
  {
    slug: "5-lakh-4-years",
    calculator: "car-loan-emi",
    baseRoute: "/car-loan-emi",
    params: {
      amount: 500000,
      tenureYears: 4,
      rate: 8.85,
    },
    primaryKeyword: "5 lakh car loan emi for 4 years",
    title: "5 Lakh Car Loan EMI for 4 Years - Monthly Payment & Breakdown",
    h1: "5 Lakh Car Loan EMI for 4 Years",
    metaDescription:
      "Calculate your monthly installment on a ₹5 lakh auto loan for 4 years at 8.85% interest. Check interest percentage and repayment options.",
    parentHub: "/loans",
    parentCalculator: "/car-loan-emi-calculator",
    relatedSlugs: [
      "/car-loan-emi/8-lakh-5-years",
      "/car-loan-emi-calculator",
    ],
    status: "live",
  },

  // 7. SIP - 5000 per month, 10 Years
  {
    slug: "5000-per-month-10-years",
    calculator: "sip",
    baseRoute: "/sip",
    params: {
      amount: 5000,
      tenureYears: 10,
      rate: 12.0,
    },
    primaryKeyword: "sip of 5000 per month for 10 years",
    title: "SIP of 5000 Per Month for 10 Years - Returns & Corpus Breakdown",
    h1: "SIP of ₹5,000 Per Month for 10 Years",
    metaDescription:
      "Investing ₹5,000 per month in mutual funds for 10 years at 12% expected return yields an estimated ₹11.62 Lakh. See invested capital and wealth growth.",
    parentHub: "/investments",
    parentCalculator: "/sip-calculator",
    relatedSlugs: [
      "/sip/10000-per-month-15-years",
      "/step-up-sip/5000-per-month-10-percent-stepup-15-years",
      "/sip-calculator",
    ],
    status: "live",
  },

  // 8. SIP - 10000 per month, 15 Years
  {
    slug: "10000-per-month-15-years",
    calculator: "sip",
    baseRoute: "/sip",
    params: {
      amount: 10000,
      tenureYears: 15,
      rate: 12.0,
    },
    primaryKeyword: "sip of 10000 per month for 15 years",
    title: "SIP of 10000 Per Month for 15 Years - Maturity Value & Growth",
    h1: "SIP of ₹10,000 Per Month for 15 Years",
    metaDescription:
      "Find out the maturity value of a ₹10,000 monthly SIP for 15 years at 12% CAGR. Discover total capital invested versus wealth gains.",
    parentHub: "/investments",
    parentCalculator: "/sip-calculator",
    relatedSlugs: [
      "/sip/5000-per-month-10-years",
      "/step-up-sip/10000-per-month-10-percent-stepup-20-years",
      "/sip-calculator",
    ],
    status: "live",
  },

  // 9. Step-Up SIP - 5000 per month, 10% step-up, 15 Years
  {
    slug: "5000-per-month-10-percent-stepup-15-years",
    calculator: "step-up-sip",
    baseRoute: "/step-up-sip",
    params: {
      amount: 5000,
      tenureYears: 15,
      rate: 12.0,
      stepUpPercentage: 10,
    },
    primaryKeyword: "step-up sip calculator with 10% annual increase",
    title: "Step-Up SIP Calculator: 5000 Per Month with 10% Annual Increase for 15 Years",
    h1: "Step-Up SIP: ₹5,000/Month with 10% Annual Increase for 15 Years",
    metaDescription:
      "Calculate returns on a ₹5,000 monthly SIP with a 10% annual step-up over 15 years at 12% return. Compare with flat SIP and see the compounding advantage.",
    parentHub: "/investments",
    parentCalculator: "/step-up-sip-calculator",
    relatedSlugs: [
      "/step-up-sip/10000-per-month-10-percent-stepup-20-years",
      "/sip/5000-per-month-10-years",
      "/step-up-sip-calculator",
    ],
    status: "live",
  },

  // 10. Step-Up SIP - 10000 per month, 10% step-up, 20 Years
  {
    slug: "10000-per-month-10-percent-stepup-20-years",
    calculator: "step-up-sip",
    baseRoute: "/step-up-sip",
    params: {
      amount: 10000,
      tenureYears: 20,
      rate: 12.0,
      stepUpPercentage: 10,
    },
    primaryKeyword: "step-up sip 10000 per month for 20 years",
    title: "Step-Up SIP of 10000 Per Month for 20 Years with 10% Step-Up",
    h1: "Step-Up SIP: ₹10,000/Month for 20 Years (10% Step-Up)",
    metaDescription:
      "Calculate the maturity value from a ₹10,000 per month SIP with a 10% annual step-up over 20 years at an illustrative 12% return.",
    parentHub: "/investments",
    parentCalculator: "/step-up-sip-calculator",
    relatedSlugs: [
      "/step-up-sip/5000-per-month-10-percent-stepup-15-years",
      "/sip/10000-per-month-15-years",
      "/step-up-sip-calculator",
    ],
    status: "live",
  },

  // 11. Lumpsum - 10 Lakh, 10 Years
  {
    slug: "10-lakh-10-years",
    calculator: "lumpsum",
    baseRoute: "/lumpsum",
    params: {
      amount: 1000000,
      tenureYears: 10,
      rate: 12.0,
    },
    primaryKeyword: "10 lakh lumpsum for 10 years return",
    title: "10 Lakh Lumpsum for 10 Years Return - Wealth Gain & Projections",
    h1: "10 Lakh Lumpsum Investment for 10 Years",
    metaDescription:
      "A one-time ₹10 lakh mutual fund investment for 10 years at 12% expected return grows to approximately ₹31.06 Lakh. See growth multiple and holding period sensitivity.",
    parentHub: "/investments",
    parentCalculator: "/lumpsum-calculator",
    relatedSlugs: [
      "/lumpsum/5-lakh-5-years",
      "/sip/5000-per-month-10-years",
      "/lumpsum-calculator",
    ],
    status: "live",
  },

  // 12. Lumpsum - 5 Lakh, 5 Years
  {
    slug: "5-lakh-5-years",
    calculator: "lumpsum",
    baseRoute: "/lumpsum",
    params: {
      amount: 500000,
      tenureYears: 5,
      rate: 12.0,
    },
    primaryKeyword: "5 lakh lumpsum for 5 years return",
    title: "5 Lakh Lumpsum for 5 Years Return - Expected Mutual Fund Growth",
    h1: "5 Lakh Lumpsum Investment for 5 Years",
    metaDescription:
      "Calculate the 5-year growth of a ₹5 lakh lumpsum mutual fund investment at 12% CAGR. Review wealth gained and yearly capital appreciation.",
    parentHub: "/investments",
    parentCalculator: "/lumpsum-calculator",
    relatedSlugs: [
      "/lumpsum/10-lakh-10-years",
      "/fd/5-lakh-5-years",
      "/lumpsum-calculator",
    ],
    status: "live",
  },

  // 13. Fixed Deposit - 5 Lakh, 5 Years
  {
    slug: "5-lakh-5-years",
    calculator: "fd",
    baseRoute: "/fd",
    params: {
      amount: 500000,
      tenureYears: 5,
      rate: 6.8,
    },
    primaryKeyword: "interest on 5 lakh fd for 5 years",
    title: "Interest on 5 Lakh FD for 5 Years - Maturity Value & Growth",
    h1: "Interest on ₹5 Lakh Fixed Deposit for 5 Years",
    metaDescription:
      "Calculate the maturity amount and interest earned on a ₹5 lakh fixed deposit for 5 years with quarterly compounding at 6.80%. Compare general vs senior citizen returns.",
    parentHub: "/savings",
    parentCalculator: "/fd-calculator",
    relatedSlugs: [
      "/fd/1-lakh-1-year",
      "/lumpsum/5-lakh-5-years",
      "/fd-calculator",
    ],
    status: "live",
  },

  // 14. Fixed Deposit - 1 Lakh, 1 Year
  {
    slug: "1-lakh-1-year",
    calculator: "fd",
    baseRoute: "/fd",
    params: {
      amount: 100000,
      tenureYears: 1,
      rate: 6.8,
    },
    primaryKeyword: "interest on 1 lakh fd for 1 year",
    title: "Interest on 1 Lakh FD for 1 Year - Quarterly Compounding Maturity",
    h1: "Interest on ₹1 Lakh Fixed Deposit for 1 Year",
    metaDescription:
      "See the interest earned on a ₹1 lakh bank fixed deposit for 1 year at 6.80% with quarterly compounding. View effective yield and senior citizen bonus.",
    parentHub: "/savings",
    parentCalculator: "/fd-calculator",
    relatedSlugs: [
      "/fd/5-lakh-5-years",
      "/fd-calculator",
      "/savings",
    ],
    status: "live",
  },
];

export function getLiveLongtailPages(): LongtailPageConfig[] {
  return LONGTAIL_PAGES.filter((p) => p.status === "live");
}

export function getLongtailPage(
  calculator: LongtailCalculatorType,
  slug: string
): LongtailPageConfig | undefined {
  return LONGTAIL_PAGES.find(
    (p) => p.calculator === calculator && p.slug === slug && p.status === "live"
  );
}

import { LONGTAIL_PAGES } from "./longtail-pages";

export interface SiteRoute {
  path: string;
  title: string;
  category: "core-calculator" | "hub" | "longtail-loan" | "longtail-investment" | "longtail-savings" | "legal" | "guide";
  parentHub?: string;
  primaryKeyword: string;
  changeFreq: "daily" | "weekly" | "monthly";
  priority: number;
  status: "live" | "draft";
}

const STATIC_ROUTES: SiteRoute[] = [
  // Home
  {
    path: "/",
    title: "FinCalc India | Fast & Accurate Indian Financial Calculators",
    category: "hub",
    primaryKeyword: "financial calculator india",
    changeFreq: "weekly",
    priority: 1.0,
    status: "live",
  },

  // Category Hubs
  {
    path: "/loans",
    title: "Loan & EMI Calculators | FinCalc India",
    category: "hub",
    primaryKeyword: "loan calculators india",
    changeFreq: "weekly",
    priority: 0.9,
    status: "live",
  },
  {
    path: "/investments",
    title: "Investment & Mutual Fund Calculators | FinCalc India",
    category: "hub",
    primaryKeyword: "investment calculators india",
    changeFreq: "weekly",
    priority: 0.9,
    status: "live",
  },
  {
    path: "/savings",
    title: "Savings & Fixed Deposit Calculators | FinCalc India",
    category: "hub",
    primaryKeyword: "savings calculators india",
    changeFreq: "weekly",
    priority: 0.9,
    status: "live",
  },

  // Core Head Calculators
  {
    path: "/emi-calculator",
    title: "EMI Calculator - Loan Equated Monthly Installment & Amortization",
    category: "core-calculator",
    parentHub: "/loans",
    primaryKeyword: "emi calculator",
    changeFreq: "weekly",
    priority: 0.9,
    status: "live",
  },
  {
    path: "/home-loan-emi-calculator",
    title: "Home Loan EMI Calculator - Housing Loan Repayment & Amortization",
    category: "core-calculator",
    parentHub: "/loans",
    primaryKeyword: "home loan emi calculator",
    changeFreq: "weekly",
    priority: 0.9,
    status: "live",
  },
  {
    path: "/personal-loan-emi-calculator",
    title: "Personal Loan EMI Calculator - Monthly Payment & Interest Schedule",
    category: "core-calculator",
    parentHub: "/loans",
    primaryKeyword: "personal loan emi calculator",
    changeFreq: "weekly",
    priority: 0.9,
    status: "live",
  },
  {
    path: "/car-loan-emi-calculator",
    title: "Car Loan EMI Calculator - Auto Loan Monthly Installment Calculator",
    category: "core-calculator",
    parentHub: "/loans",
    primaryKeyword: "car loan emi calculator",
    changeFreq: "weekly",
    priority: 0.9,
    status: "live",
  },
  {
    path: "/sip-calculator",
    title: "SIP Calculator - Mutual Fund Systematic Investment Plan Wealth Calculator",
    category: "core-calculator",
    parentHub: "/investments",
    primaryKeyword: "sip calculator",
    changeFreq: "weekly",
    priority: 0.9,
    status: "live",
  },
  {
    path: "/step-up-sip-calculator",
    title: "Step-Up SIP Calculator - Top-Up Mutual Fund Investment Calculator",
    category: "core-calculator",
    parentHub: "/investments",
    primaryKeyword: "step up sip calculator",
    changeFreq: "weekly",
    priority: 0.9,
    status: "live",
  },
  {
    path: "/lumpsum-calculator",
    title: "Lumpsum Calculator - One-Time Mutual Fund Return Calculator",
    category: "core-calculator",
    parentHub: "/investments",
    primaryKeyword: "lumpsum calculator",
    changeFreq: "weekly",
    priority: 0.9,
    status: "live",
  },
  {
    path: "/fd-calculator",
    title: "FD Calculator - Fixed Deposit Maturity & Quarterly Interest Calculator",
    category: "core-calculator",
    parentHub: "/savings",
    primaryKeyword: "fd calculator",
    changeFreq: "weekly",
    priority: 0.9,
    status: "live",
  },
  {
    path: "/rd-calculator",
    title: "RD Calculator - Recurring Deposit Maturity & Quarterly Interest Calculator",
    category: "core-calculator",
    parentHub: "/savings",
    primaryKeyword: "rd calculator",
    changeFreq: "weekly",
    priority: 0.9,
    status: "live",
  },
  {
    path: "/ppf-calculator",
    title: "PPF Calculator - Public Provident Fund Maturity & Interest Calculator",
    category: "core-calculator",
    parentHub: "/savings",
    primaryKeyword: "ppf calculator",
    changeFreq: "weekly",
    priority: 0.9,
    status: "live",
  },
  {
    path: "/cagr-calculator",
    title: "CAGR Calculator - Compound Annual Growth Rate Calculator India",
    category: "core-calculator",
    parentHub: "/investments",
    primaryKeyword: "cagr calculator",
    changeFreq: "weekly",
    priority: 0.9,
    status: "live",
  },
  {
    path: "/compound-interest-calculator",
    title: "Compound Interest Calculator - Annual, Quarterly & Monthly Compounding",
    category: "core-calculator",
    parentHub: "/investments",
    primaryKeyword: "compound interest calculator",
    changeFreq: "weekly",
    priority: 0.9,
    status: "live",
  },
  {
    path: "/loan-prepayment-calculator",
    title: "Home Loan Prepayment Calculator - Tenure Reduction & Interest Savings",
    category: "core-calculator",
    parentHub: "/loans",
    primaryKeyword: "home loan prepayment calculator",
    changeFreq: "weekly",
    priority: 0.9,
    status: "live",
  },
  {
    path: "/loan-eligibility-calculator",
    title: "Home Loan Eligibility Calculator - Borrowing Power by Salary",
    category: "core-calculator",
    parentHub: "/loans",
    primaryKeyword: "home loan eligibility calculator",
    changeFreq: "weekly",
    priority: 0.9,
    status: "live",
  },
  {
    path: "/swp-calculator",
    title: "SWP Calculator - Systematic Withdrawal Plan Calculator for Monthly Income",
    category: "core-calculator",
    parentHub: "/investments",
    primaryKeyword: "swp calculator",
    changeFreq: "weekly",
    priority: 0.9,
    status: "live",
  },
  {
    path: "/amortization-calculator",
    title: "Loan Amortization Schedule Calculator - Yearly & Monthly Principal Breakdown",
    category: "core-calculator",
    parentHub: "/loans",
    primaryKeyword: "loan amortization schedule calculator",
    changeFreq: "weekly",
    priority: 0.9,
    status: "live",
  },
  {
    path: "/income-tax-calculator",
    title: "Income Tax Calculator FY 2024-25 & 2025-26 - New vs Old Regime Comparison",
    category: "core-calculator",
    parentHub: "/investments",
    primaryKeyword: "income tax calculator",
    changeFreq: "weekly",
    priority: 0.9,
    status: "live",
  },
  {
    path: "/salary-calculator",
    title: "Salary Calculator - CTC to In-Hand / Take-Home Salary Calculator India",
    category: "core-calculator",
    parentHub: "/investments",
    primaryKeyword: "salary calculator in hand",
    changeFreq: "weekly",
    priority: 0.9,
    status: "live",
  },
  {
    path: "/hra-calculator",
    title: "HRA Calculator - House Rent Allowance Tax Exemption Calculator Rule 2A",
    category: "core-calculator",
    parentHub: "/savings",
    primaryKeyword: "hra calculator",
    changeFreq: "weekly",
    priority: 0.9,
    status: "live",
  },
  {
    path: "/gratuity-calculator",
    title: "Gratuity Calculator - Payment of Gratuity Act 1972 Calculator India",
    category: "core-calculator",
    parentHub: "/savings",
    primaryKeyword: "gratuity calculator",
    changeFreq: "weekly",
    priority: 0.9,
    status: "live",
  },
  {
    path: "/nps-calculator",
    title: "NPS Calculator - National Pension System Tier-1 Pension & Corpus Calculator",
    category: "core-calculator",
    parentHub: "/investments",
    primaryKeyword: "nps calculator",
    changeFreq: "weekly",
    priority: 0.9,
    status: "live",
  },
  {
    path: "/epf-calculator",
    title: "EPF Calculator - Employees' Provident Fund Maturity & Interest Calculator India",
    category: "core-calculator",
    parentHub: "/savings",
    primaryKeyword: "epf calculator",
    changeFreq: "weekly",
    priority: 0.9,
    status: "live",
  },

  // Blog & Educational Guides
  {
    path: "/blog",
    title: "Financial Guides & Calculators | FinCalc India",
    category: "hub",
    primaryKeyword: "personal finance guides india",
    changeFreq: "weekly",
    priority: 0.8,
    status: "live",
  },
  {
    path: "/blog/home-loan-prepayment-guide",
    title: "Complete Guide to Home Loan Prepayment: Tenure Reduction vs EMI Reduction",
    category: "guide",
    primaryKeyword: "home loan prepayment tenure vs emi",
    changeFreq: "monthly",
    priority: 0.8,
    status: "live",
  },
  {
    path: "/blog/how-rd-interest-calculated",
    title: "How Recurring Deposit (RD) Interest is Calculated in Indian Banks",
    category: "guide",
    primaryKeyword: "how rd interest is calculated",
    changeFreq: "monthly",
    priority: 0.8,
    status: "live",
  },
  {
    path: "/blog/ppf-vs-mutual-fund-sip",
    title: "PPF vs Mutual Fund SIP: 15-Year Wealth Creation Comparison",
    category: "guide",
    primaryKeyword: "ppf vs sip 15 year comparison",
    changeFreq: "monthly",
    priority: 0.8,
    status: "live",
  },
  {
    path: "/blog/how-swp-works",
    title: "How Systematic Withdrawal Plan (SWP) Works: Generating Regular Monthly Pension",
    category: "guide",
    primaryKeyword: "how swp works in mutual funds",
    changeFreq: "monthly",
    priority: 0.8,
    status: "live",
  },
  {
    path: "/blog/cagr-vs-xirr-vs-absolute-return",
    title: "CAGR vs XIRR vs Absolute Return: Which Return Metric Matters When",
    category: "guide",
    primaryKeyword: "cagr vs xirr vs absolute return",
    changeFreq: "monthly",
    priority: 0.8,
    status: "live",
  },

  // Compliance & Institutional Pages
  {
    path: "/about",
    title: "About Us | FinCalc India",
    category: "legal",
    primaryKeyword: "about fincalc india",
    changeFreq: "monthly",
    priority: 0.3,
    status: "live",
  },
  {
    path: "/contact",
    title: "Contact Us | FinCalc India",
    category: "legal",
    primaryKeyword: "contact fincalc india",
    changeFreq: "monthly",
    priority: 0.3,
    status: "live",
  },
  {
    path: "/privacy",
    title: "Privacy Policy | FinCalc India",
    category: "legal",
    primaryKeyword: "privacy policy",
    changeFreq: "monthly",
    priority: 0.3,
    status: "live",
  },
  {
    path: "/terms",
    title: "Terms of Service | FinCalc India",
    category: "legal",
    primaryKeyword: "terms of service",
    changeFreq: "monthly",
    priority: 0.3,
    status: "live",
  },
  {
    path: "/disclaimer",
    title: "Disclaimer & Financial Methodology | FinCalc India",
    category: "legal",
    primaryKeyword: "financial calculator disclaimer",
    changeFreq: "monthly",
    priority: 0.3,
    status: "live",
  },
];

// Combine static routes with curated long-tail routes
export const SITE_ROUTES: SiteRoute[] = [
  ...STATIC_ROUTES,
  ...LONGTAIL_PAGES.map((lt): SiteRoute => {
    let category: SiteRoute["category"] = "longtail-loan";
    if (lt.calculator === "sip" || lt.calculator === "step-up-sip" || lt.calculator === "lumpsum") {
      category = "longtail-investment";
    } else if (lt.calculator === "fd") {
      category = "longtail-savings";
    }

    return {
      path: `${lt.baseRoute}/${lt.slug}`,
      title: lt.title,
      category,
      parentHub: lt.parentCalculator,
      primaryKeyword: lt.primaryKeyword,
      changeFreq: "monthly",
      priority: 0.8,
      status: lt.status,
    };
  }),
];

export function getLiveRoutes(): SiteRoute[] {
  return SITE_ROUTES.filter((r) => r.status === "live");
}

export function getRouteByPath(path: string): SiteRoute | undefined {
  return SITE_ROUTES.find((r) => r.path === path);
}

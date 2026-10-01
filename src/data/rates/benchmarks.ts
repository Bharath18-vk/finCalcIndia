export type RateClassification = "externally-sourced" | "illustrative-assumption";

export interface BenchmarkRateConfig {
  id: string;
  category: "loan" | "deposit" | "small-savings" | "market";
  name: string;
  symbol: string;
  value: number; // Primary canonical value
  defaultRate: number; // Compatible alias for calculation views
  minRate: number;
  maxRate: number;
  step: number;
  rateClassification: RateClassification; // Explicitly distinguishes externally-sourced vs illustrative-assumption
  effectiveFrom: string; // ISO date YYYY-MM-DD
  effectiveTo?: string; // Optional if slab has ended
  financialYear?: string; // Applicable financial year if notified annually
  sourceName: string;
  sourceUrl: string;
  verifiedAt: string; // ISO date YYYY-MM-DD
  notes: string;
}

/**
 * Versioned Financial Assumptions & Benchmark Rates
 *
 * Rules:
 * 1. Rates are strictly separated into:
 *    - externally-sourced: Current rates verified from official institutional schedules (e.g. SBI EBLR, Govt PPF)
 *    - illustrative-assumption: Market-linked or lender-variable baselines for planning (e.g. 12% equity return, 11% personal loan)
 *    - user-entered: Any customized rate the user types into calculator inputs
 * 2. Never claim an assumption is an official rate unless backed by an authoritative source.
 * 3. Always display verified "as of" dates and allow manual overrides.
 */
export const BENCHMARK_RATES: Record<string, BenchmarkRateConfig> = {
  homeLoan: {
    id: "homeLoan",
    category: "loan",
    name: "Home Loan Benchmark Rate (SBI EBLR / RLLR)",
    symbol: "HL",
    value: 8.50,
    defaultRate: 8.50,
    minRate: 6.5,
    maxRate: 15.0,
    step: 0.05,
    rateClassification: "externally-sourced",
    effectiveFrom: "2024-01-01",
    sourceName: "State Bank of India (SBI) External Benchmark Lending Rate Schedule",
    sourceUrl: "https://sbi.co.in",
    verifiedAt: "2024-10-01",
    notes: "Externally sourced floating home loan EBLR benchmark for salaried borrowers with CIBIL score 750+. Rates vary by lender, spread, and individual risk profile.",
  },
  personalLoan: {
    id: "personalLoan",
    category: "loan",
    name: "Personal Loan Illustrative Rate Assumption",
    symbol: "PL",
    value: 11.00,
    defaultRate: 11.00,
    minRate: 9.5,
    maxRate: 28.0,
    step: 0.1,
    rateClassification: "illustrative-assumption",
    effectiveFrom: "2024-01-01",
    sourceName: "Representative Median of Major Indian Commercial Banks (SBI, HDFC, ICICI)",
    sourceUrl: "https://www.rbi.org.in",
    verifiedAt: "2024-10-01",
    notes: "Illustrative rate assumption for prime salaried applicants. Unsecured personal loans are credit-scored and rates range from 10.5% to 24% across lenders.",
  },
  carLoan: {
    id: "carLoan",
    category: "loan",
    name: "Car Loan Illustrative Rate Assumption",
    symbol: "CL",
    value: 8.85,
    defaultRate: 8.85,
    minRate: 7.5,
    maxRate: 18.0,
    step: 0.05,
    rateClassification: "illustrative-assumption",
    effectiveFrom: "2024-01-01",
    sourceName: "Representative New Car Financing Rate Schedule across Commercial Banks",
    sourceUrl: "https://sbi.co.in",
    verifiedAt: "2024-10-01",
    notes: "Illustrative annual rate assumption for new vehicle financing for salaried individuals. Used cars and non-salaried borrowers typically attract higher rates.",
  },
  fixedDeposit: {
    id: "fixedDeposit",
    category: "deposit",
    name: "Bank Fixed Deposit Illustrative Rate (1-3 Year Slab)",
    symbol: "FD",
    value: 6.80,
    defaultRate: 6.80,
    minRate: 3.0,
    maxRate: 10.0,
    step: 0.05,
    rateClassification: "illustrative-assumption",
    effectiveFrom: "2024-01-01",
    sourceName: "Representative Median of Public & Private Sector Bank 1-3 Year Term Deposit Slabs",
    sourceUrl: "https://www.rbi.org.in",
    verifiedAt: "2024-10-01",
    notes: "Illustrative 6.80% annual rate assumption for general citizens on 1 to 3-year cumulative term deposits. Compounded quarterly as mandated by RBI conventions. Senior citizens typically receive a +0.50% p.a. premium.",
  },
  ppf: {
    id: "ppf",
    category: "small-savings",
    name: "Public Provident Fund (PPF)",
    symbol: "PPF",
    value: 7.10,
    defaultRate: 7.10,
    minRate: 5.0,
    maxRate: 12.0,
    step: 0.1,
    rateClassification: "externally-sourced",
    effectiveFrom: "2024-01-01",
    sourceName: "Ministry of Finance, Government of India (Quarterly Small Savings Notification)",
    sourceUrl: "https://dea.gov.in",
    verifiedAt: "2024-10-01",
    notes: "Government-notified quarterly small savings interest rate. Fully exempt from income tax under Section 80C and EEE status.",
  },
  recurringDeposit: {
    id: "recurringDeposit",
    category: "deposit",
    name: "Bank Recurring Deposit (RD) Illustrative Rate (1-3 Year Slab)",
    symbol: "RD",
    value: 6.80,
    defaultRate: 6.80,
    minRate: 3.0,
    maxRate: 10.0,
    step: 0.05,
    rateClassification: "illustrative-assumption",
    effectiveFrom: "2024-01-01",
    sourceName: "Representative Median of Public & Private Sector Bank 1-3 Year RD Slabs",
    sourceUrl: "https://www.rbi.org.in",
    verifiedAt: "2024-10-01",
    notes: "Illustrative 6.80% annual rate assumption for general citizens on 1 to 3-year recurring deposits with quarterly compounding per RBI/IBA conventions. Senior citizens typically receive a +0.50% p.a. premium.",
  },
  sipReturn: {
    id: "sipReturn",
    category: "market",
    name: "Equity Mutual Fund 12% Illustrative Annual Return Assumption",
    symbol: "SIP",
    value: 12.00,
    defaultRate: 12.00,
    minRate: 1.0,
    maxRate: 30.0,
    step: 0.5,
    rateClassification: "illustrative-assumption",
    effectiveFrom: "2024-01-01",
    sourceName: "Long-Term Historical Multi-Cycle Indian Equity Market Observation",
    sourceUrl: "https://www.bseindia.com",
    verifiedAt: "2024-10-01",
    notes: "12% illustrative annual return assumption based on historical long-term equity market trends. Returns are market-linked, non-linear, and not guaranteed. Not an official AMC or AMFI guaranteed rate.",
  },
  swpReturn: {
    id: "swpReturn",
    category: "market",
    name: "SWP Conservative Hybrid Mutual Fund Illustrative Return",
    symbol: "SWP",
    value: 8.50,
    defaultRate: 8.50,
    minRate: 4.0,
    maxRate: 18.0,
    step: 0.25,
    rateClassification: "illustrative-assumption",
    effectiveFrom: "2024-01-01",
    sourceName: "Representative Multi-Year Conservative Hybrid Fund Average Category Return",
    sourceUrl: "https://www.amfiindia.com",
    verifiedAt: "2024-10-01",
    notes: "Illustrative 8.50% annual return assumption typically used for retirement SWP planning in hybrid mutual funds. Market-linked and not guaranteed.",
  },
  epf: {
    id: "epf",
    category: "small-savings",
    name: "Employees' Provident Fund (EPF) Statutory Rate",
    symbol: "EPF",
    value: 8.25,
    defaultRate: 8.25,
    minRate: 6.0,
    maxRate: 12.0,
    step: 0.05,
    rateClassification: "externally-sourced",
    effectiveFrom: "2023-04-01",
    effectiveTo: "2025-03-31",
    financialYear: "FY 2023-24 & FY 2024-25",
    sourceName: "Employees' Provident Fund Organisation (EPFO) / Ministry of Labour and Employment Notification",
    sourceUrl: "https://www.epfindia.gov.in",
    verifiedAt: "2024-10-01",
    notes: "Statutory interest rate of 8.25% p.a. declared by the Central Board of Trustees (CBT), EPFO for FY 2023-24 and continued for FY 2024-25, credited annually and compounded monthly. Rates are determined and notified annually by EPFO and are not permanent.",
  },
  nps: {
    id: "nps",
    category: "market",
    name: "NPS Balanced Tier-1 Asset Allocation Illustrative Return",
    symbol: "NPS",
    value: 10.00,
    defaultRate: 10.00,
    minRate: 5.0,
    maxRate: 18.0,
    step: 0.25,
    rateClassification: "illustrative-assumption",
    effectiveFrom: "2024-01-01",
    sourceName: "PFRDA Multi-Year NPS Scheme Return Track Records (Equity, Corporate Debt, Govt Securities)",
    sourceUrl: "https://www.pfrda.org.in",
    verifiedAt: "2024-10-01",
    notes: "Illustrative 10.00% annual return assumption for a moderate lifecycle or balanced active portfolio (combination of Asset Classes E, C, and G). Market-linked, non-guaranteed.",
  },
};

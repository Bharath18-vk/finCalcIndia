export interface BlogSection {
  id: string;
  title: string;
  paragraphs: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  primaryKeyword: string;
  metaDescription: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  readTimeMinutes: number;
  category: "Loans" | "Savings" | "Investments";
  relatedCalculatorUrl: string;
  relatedCalculatorName: string;
  summary: string;
  tableOfContents: { id: string; title: string }[];
  sections: BlogSection[];
  faqs: { question: string; answer: string }[];
}

export const BLOG_POSTS: BlogPost[] = [
  // Guide 1: Home Loan Prepayment
  {
    slug: "home-loan-prepayment-guide",
    title: "Complete Guide to Home Loan Prepayment: Tenure Reduction vs EMI Reduction",
    primaryKeyword: "home loan prepayment tenure vs emi",
    metaDescription:
      "Understand how home loan prepayment works in India. Compare tenure reduction vs EMI reduction, calculate interest savings, and learn RBI zero-penalty prepayment rules.",
    publishedAt: "2024-10-01",
    updatedAt: "2024-10-01",
    author: "FinCalc India Financial Research Team",
    readTimeMinutes: 7,
    category: "Loans",
    relatedCalculatorUrl: "/loan-prepayment-calculator",
    relatedCalculatorName: "Loan Prepayment Calculator",
    summary:
      "A home loan is typically a borrower's largest financial liability. By making disciplined prepayments—even just one extra EMI per year—you can save hundreds of thousands of rupees in compound interest and retire your debt years ahead of schedule.",
    tableOfContents: [
      { id: "how-prepayment-works", title: "How Home Loan Prepayment Works" },
      { id: "tenure-vs-emi", title: "Tenure Reduction vs EMI Reduction: Which is Better?" },
      { id: "rbi-rules", title: "RBI Guidelines on Prepayment Penalties" },
      { id: "strategies", title: "3 Proven Home Loan Prepayment Strategies" },
      { id: "tax-implications", title: "Impact on Section 24(b) Tax Deductions" },
    ],
    sections: [
      {
        id: "how-prepayment-works",
        title: "How Home Loan Prepayment Works",
        paragraphs: [
          "In a standard reducing-balance loan, interest is calculated on the outstanding principal at the beginning of each monthly billing cycle. When you pay your regular monthly Equated Monthly Installment (EMI), a portion covers the accrued interest, and only the remaining portion reduces your principal.",
          "When you make a partial prepayment, the entire lump sum goes directly towards reducing the principal balance. This permanently curtails the base on which all future interest is calculated, stopping compounding in its tracks.",
          "Because interest front-loading is highest in the first 5 to 7 years of a 20-year or 30-year home loan, prepayments made during the early stages generate exponentially higher interest savings than payments made near maturity.",
        ],
      },
      {
        id: "tenure-vs-emi",
        title: "Tenure Reduction vs EMI Reduction: Which is Better?",
        paragraphs: [
          "Whenever you make a prepayment, your lender will ask you to choose between two adjustments: reducing your remaining tenure (keeping your monthly EMI unchanged) or reducing your monthly EMI (keeping the original maturity date unchanged).",
          "From a pure mathematical standpoint, Tenure Reduction is vastly superior. By keeping your monthly payment the same, your loan is paid off years earlier, eliminating dozens of interest-bearing cycles.",
          "EMI Reduction, on the other hand, provides immediate monthly cash-flow relief. While it saves some interest, it keeps the debt alive for the entire original duration, resulting in significantly lower cumulative savings than tenure reduction.",
        ],
      },
      {
        id: "rbi-rules",
        title: "RBI Guidelines on Prepayment Penalties",
        paragraphs: [
          "Under Reserve Bank of India (RBI) circulars, commercial banks, housing finance companies (HFCs), and NBFCs are strictly prohibited from charging any foreclosure or prepayment fees on floating-rate housing loans given to individual borrowers.",
          "You have the statutory right to prepay any amount at any frequency—whether ₹10,000 or ₹10 Lakh—without incurring any penal charges.",
          "Always request an updated loan repayment schedule and revised amortization statement from your bank following any prepayment to verify that the capital was credited directly against the principal.",
        ],
      },
      {
        id: "strategies",
        title: "3 Proven Home Loan Prepayment Strategies",
        paragraphs: [
          "1. The 1 Extra EMI Rule: Paying just 13 EMIs in a 12-month calendar year can cut a 20-year home loan by nearly 4 to 5 years.",
          "2. Annual 5% Prepayment: Allocating annual performance bonuses or tax refunds to prepay 5% of the initial loan principal every year can finish a 20-year loan in roughly 10 years.",
          "3. Annual 5% Step-Up EMI: Increasing your monthly EMI by 5% each year alongside salary increments steadily shrinks your outstanding balance without causing sudden liquidity strain.",
        ],
      },
      {
        id: "tax-implications",
        title: "Impact on Section 24(b) Tax Deductions",
        paragraphs: [
          "Under Section 24(b) of the Income Tax Act (Old Tax Regime), borrowers can deduct up to ₹2,00,000 per financial year against home loan interest paid on a self-occupied property.",
          "While reducing total interest slightly lowers your tax deduction in subsequent years, saving ₹100 in interest to save ₹30 in taxes is economically irrational. Prepaying high-cost debt always delivers superior net financial returns.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can my bank refuse a part-prepayment?",
        answer: "No. Banks cannot refuse part-prepayments on individual floating-rate home loans under RBI rules, though some lenders set a minimum part-payment threshold (e.g. equal to one month's EMI or ₹10,000).",
      },
      {
        question: "Should I prepay my home loan or invest in mutual funds?",
        answer: "If your home loan interest rate is 8.5% to 9.5%, prepaying provides a guaranteed, tax-free return equal to your borrowing cost. If you have an emergency fund and long investment horizon (7+ years), balancing equity investments (historical 12% illustrative return) with moderate debt prepayments is generally optimal.",
      },
      {
        question: "How soon can I make a prepayment after loan disbursement?",
        answer: "Most banks allow part-prepayments as soon as your first monthly EMI is successfully debited.",
      },
    ],
  },

  // Guide 2: How RD Interest is Calculated
  {
    slug: "how-rd-interest-calculated",
    title: "How Recurring Deposit (RD) Interest is Calculated in Indian Banks",
    primaryKeyword: "how rd interest is calculated",
    metaDescription:
      "Learn the exact quarterly compounding formula used by SBI, HDFC, and Post Office for Recurring Deposits (RD). Understand why simple interest calculations are incorrect.",
    publishedAt: "2024-10-01",
    updatedAt: "2024-10-01",
    author: "FinCalc India Financial Research Team",
    readTimeMinutes: 6,
    category: "Savings",
    relatedCalculatorUrl: "/rd-calculator",
    relatedCalculatorName: "Recurring Deposit (RD) Calculator",
    summary:
      "Recurring deposits are among India's most popular disciplined savings products. However, few depositors understand how Indian banks compound monthly installments on a quarterly basis.",
    tableOfContents: [
      { id: "quarterly-compounding", title: "The Quarterly Compounding Convention" },
      { id: "iba-formula", title: "The Standard IBA / RBI Calculation Formula" },
      { id: "rd-vs-sip", title: "Recurring Deposit vs Mutual Fund SIP" },
      { id: "tax-rules", title: "TDS and Income Tax Rules on RD Interest" },
    ],
    sections: [
      {
        id: "quarterly-compounding",
        title: "The Quarterly Compounding Convention",
        paragraphs: [
          "Unlike simple recurring investment models where each month's contribution earns simple interest, Indian commercial banks and India Post compound Recurring Deposit interest QUARTERLY (four times a year).",
          "Because installments are deposited every month, each monthly installment remains deposited for a different number of months. The first installment earns interest for the entire tenure, while the final installment earns interest for only one month.",
        ],
      },
      {
        id: "iba-formula",
        title: "The Standard IBA / RBI Calculation Formula",
        paragraphs: [
          "The Indian Banks' Association (IBA) formula calculates maturity value using geometric series summation:",
          "M = P * [ (1 + q)^(n/3) - 1 ] / [ 1 - (1 + q)^(-1/3) ]",
          "Here, P is the monthly deposit amount, q is the quarterly interest rate (Annual Rate / 400), and n is the tenure in months.",
          "Because interest compounds quarterly, the effective annual yield (APY) is always higher than the nominal contracted rate. For instance, a 6.80% nominal rate produces an effective annual yield of 6.98%.",
        ],
      },
      {
        id: "rd-vs-sip",
        title: "Recurring Deposit vs Mutual Fund SIP",
        paragraphs: [
          "While both RD and SIP involve periodic monthly contributions, their risk and return profiles are fundamentally distinct.",
          "An RD provides guaranteed principal protection and a fixed contractual interest rate backed by RBI deposit insurance (up to ₹5 Lakh per bank under DICGC).",
          "A mutual fund SIP invests in market-linked assets (equities or bonds) where returns fluctuate with market conditions but offer potential inflation-beating long-term compounding.",
        ],
      },
      {
        id: "tax-rules",
        title: "TDS and Income Tax Rules on RD Interest",
        paragraphs: [
          "Interest earned on Recurring Deposits is fully taxable at your applicable income tax slab rate under 'Income from Other Sources'.",
          "Under Section 194A of the Income Tax Act, banks deduct 10% TDS if total interest across branches exceeds ₹40,000 per financial year (₹50,000 for senior citizens). Depositors with income below the taxable threshold can submit Form 15G or 15H to prevent TDS deduction.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I change my RD installment amount midway?",
        answer: "No. Standard bank RDs require a fixed installment decided at the time of opening. Some banks offer flexible RD variants (like SBI Flexi Deposit) allowing variable monthly contributions within limits.",
      },
      {
        question: "Is there a penalty for missing an RD installment?",
        answer: "Yes, banks typically charge a small penalty (e.g. ₹1.50 to ₹2.00 per ₹100 per month) on delayed installments. Consistent defaults may lead to account closure.",
      },
    ],
  },

  // Guide 3: PPF vs Mutual Fund SIP
  {
    slug: "ppf-vs-mutual-fund-sip",
    title: "PPF vs Mutual Fund SIP: 15-Year Wealth Creation Comparison",
    primaryKeyword: "ppf vs sip 15 year comparison",
    metaDescription:
      "Compare Public Provident Fund (PPF) and Mutual Fund SIP over a 15-year horizon. Analyze guaranteed EEE tax-free returns against market-linked compounding.",
    publishedAt: "2024-10-01",
    updatedAt: "2024-10-01",
    author: "FinCalc India Financial Research Team",
    readTimeMinutes: 8,
    category: "Investments",
    relatedCalculatorUrl: "/ppf-calculator",
    relatedCalculatorName: "PPF Calculator",
    summary:
      "When planning for a 15-year financial milestone, Indian investors frequently debate between the sovereign security of PPF and the wealth-building potential of an equity mutual fund SIP. Here is a definitive mathematical breakdown.",
    tableOfContents: [
      { id: "key-differences", title: "Core Differences: PPF vs Equity SIP" },
      { id: "15-year-simulation", title: "15-Year Mathematical Wealth Comparison" },
      { id: "tax-efficiency", title: "Tax Treatment: EEE vs LTCG" },
      { id: "ideal-allocation", title: "How to Combine PPF and SIP in Your Portfolio" },
    ],
    sections: [
      {
        id: "key-differences",
        title: "Core Differences: PPF vs Equity SIP",
        paragraphs: [
          "PPF is a government-backed statutory small savings scheme with a mandatory 15-year lock-in period. Interest rates are revised quarterly by the Ministry of Finance (currently 7.10% p.a.). It carries sovereign safety and complete exemption from income tax.",
          "An Equity Mutual Fund SIP invests in broad market indexes or diversified portfolios. Returns are non-linear and market-linked, but historically have generated 12% to 14% multi-cycle annual returns over 10+ year holding periods.",
        ],
      },
      {
        id: "15-year-simulation",
        title: "15-Year Mathematical Wealth Comparison",
        paragraphs: [
          "Consider an annual investment of ₹1,50,000 (₹12,500/month) over a full 15-year holding term (Total capital deposited: ₹22,50,000):",
          "In PPF at 7.10% p.a. (compounded annually), the maturity payout is approximately ₹40.68 Lakh, generating ₹18.18 Lakh in tax-free interest.",
          "In an Equity SIP at an illustrative 12.0% annual return, the same ₹12,500 monthly investment accumulates to approximately ₹63.07 Lakh, generating ₹40.57 Lakh in wealth gains.",
          "Even after factoring in 12.5% LTCG tax on mutual funds, the equity mutual fund SIP generates substantially higher terminal wealth due to the power of higher compounding rates.",
        ],
      },
      {
        id: "tax-efficiency",
        title: "Tax Treatment: EEE vs LTCG",
        paragraphs: [
          "PPF enjoys unmatched EEE status: contributions qualify for Section 80C deductions, annual interest accrual is completely tax-exempt, and maturity proceeds are 100% tax-free under Section 10(10D).",
          "Under Budget 2024 rules, Equity Mutual Funds are subject to 12.5% Long-Term Capital Gains (LTCG) tax on profits exceeding ₹1.25 Lakh per financial year for units held over 12 months.",
        ],
      },
      {
        id: "ideal-allocation",
        title: "How to Combine PPF and SIP in Your Portfolio",
        paragraphs: [
          "Rather than treating PPF and SIP as mutually exclusive, astute investors use both for asset allocation. PPF provides a risk-free debt foundation that stabilizes your portfolio, while equity SIPs provide inflation-beating growth for long-term goals.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I withdraw money from PPF before 15 years?",
        answer: "Partial withdrawals are allowed from the 7th financial year onward, capped at 50% of the account balance at the end of the fourth preceding year or the previous year, whichever is lower.",
      },
      {
        question: "Can NRIs invest in PPF?",
        answer: "NRIs cannot open new PPF accounts. However, if a resident Indian opened an account before moving abroad, they can continue contributing on a non-repatriable basis until its 15-year maturity.",
      },
    ],
  },

  // Guide 4: How SWP Works
  {
    slug: "how-swp-works",
    title: "How Systematic Withdrawal Plan (SWP) Works: Generating Regular Monthly Pension",
    primaryKeyword: "how swp works in mutual funds",
    metaDescription:
      "Discover how a Systematic Withdrawal Plan (SWP) creates tax-efficient monthly income from mutual funds. Understand safe withdrawal rates and capital preservation rules.",
    publishedAt: "2024-10-01",
    updatedAt: "2024-10-01",
    author: "FinCalc India Financial Research Team",
    readTimeMinutes: 7,
    category: "Investments",
    relatedCalculatorUrl: "/swp-calculator",
    relatedCalculatorName: "SWP Calculator",
    summary:
      "A Systematic Withdrawal Plan (SWP) allows mutual fund investors to withdraw a fixed sum at regular intervals from their corpus, offering a modern, tax-efficient alternative to traditional bank fixed deposit interest payouts.",
    tableOfContents: [
      { id: "what-is-swp", title: "What is an SWP and How Does it Work?" },
      { id: "tax-advantage", title: "The Superior Tax Efficiency of SWP vs Bank FD" },
      { id: "safe-withdrawal", title: "Understanding the Safe Withdrawal Rate" },
      { id: "fund-selection", title: "Which Mutual Funds are Best for SWP?" },
    ],
    sections: [
      {
        id: "what-is-swp",
        title: "What is an SWP and How Does it Work?",
        paragraphs: [
          "An SWP is the reverse of a Systematic Investment Plan (SIP). Instead of putting money in, you instruct the mutual fund house to redeem a specific rupee amount from your accumulated corpus and deposit it directly into your bank account on a chosen date each month.",
          "The remaining corpus stays invested in the fund, continuing to earn compound returns and participate in market growth.",
        ],
      },
      {
        id: "tax-advantage",
        title: "The Superior Tax Efficiency of SWP vs Bank FD",
        paragraphs: [
          "In a bank fixed deposit, 100% of the interest paid out is added to your annual income and taxed at your maximum slab rate (up to 30% plus surcharge).",
          "In an SWP, each monthly withdrawal is treated as a unit redemption consisting of both original capital (principal) and capital gains. Only the capital gains portion is subject to tax, making SWP dramatically more tax-efficient for retirees in higher tax brackets.",
        ],
      },
      {
        id: "safe-withdrawal",
        title: "Understanding the Safe Withdrawal Rate",
        paragraphs: [
          "To ensure your retirement corpus never depletes, your annual withdrawal rate should be lower than the portfolio's expected rate of return.",
          "For example, in a conservative hybrid mutual fund generating an illustrative 8.5% annual return, keeping your withdrawal rate at 5.5% to 6.0% ensures that your monthly pension is fully funded while your capital base continues to grow alongside inflation.",
        ],
      },
      {
        id: "fund-selection",
        title: "Which Mutual Funds are Best for SWP?",
        paragraphs: [
          "Conservative Hybrid Funds and Balanced Advantage Funds (Dynamic Asset Allocation) are widely considered the most suitable categories for SWP because their balanced equity-debt allocation cushions against severe market drawdowns while providing steady compounding.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can my SWP amount be changed later?",
        answer: "Yes. You can increase, decrease, pause, or terminate your SWP at any time without penalty by submitting a request online or through your mutual fund portal.",
      },
      {
        question: "What happens if market values drop sharply during an SWP?",
        answer: "During a market downturn, more units must be redeemed to generate the same fixed rupee payout. Maintaining 1 to 2 years of emergency cash in a liquid fund prevents forced redemptions during deep equity corrections.",
      },
    ],
  },

  // Guide 5: CAGR vs XIRR vs Absolute Return
  {
    slug: "cagr-vs-xirr-vs-absolute-return",
    title: "CAGR vs XIRR vs Absolute Return: Which Return Metric Matters When",
    primaryKeyword: "cagr vs xirr vs absolute return",
    metaDescription:
      "Demystify mutual fund return metrics. Learn the difference between Absolute Return, CAGR, and XIRR, and understand when to use each for accurate performance measurement.",
    publishedAt: "2024-10-01",
    updatedAt: "2024-10-01",
    author: "FinCalc India Financial Research Team",
    readTimeMinutes: 6,
    category: "Investments",
    relatedCalculatorUrl: "/cagr-calculator",
    relatedCalculatorName: "CAGR Calculator",
    summary:
      "Evaluating investment performance in India requires using the right return metric for the right cash flow structure. Here is how to choose between Absolute Return, CAGR, and XIRR.",
    tableOfContents: [
      { id: "absolute-return", title: "1. Absolute Return: Simple Capital Appreciation" },
      { id: "cagr", title: "2. CAGR: The Gold Standard for Lumpsum Investments" },
      { id: "xirr", title: "3. XIRR: The Essential Metric for SIPs and Cash Flows" },
      { id: "comparison-summary", title: "Summary: When to Use Which Metric" },
    ],
    sections: [
      {
        id: "absolute-return",
        title: "1. Absolute Return: Simple Capital Appreciation",
        paragraphs: [
          "Absolute Return measures the percentage change between beginning and ending value: ((Final Value - Initial Value) / Initial Value) * 100.",
          "Crucially, Absolute Return ignores time entirely. A 50% absolute return achieved in 1 year represents stellar performance, whereas a 50% absolute return over 10 years represents a sluggish 4.14% annual growth that lags inflation.",
          "Rule: Use Absolute Return only for holding periods of less than one year.",
        ],
      },
      {
        id: "cagr",
        title: "2. CAGR: The Gold Standard for Lumpsum Investments",
        paragraphs: [
          "Compound Annual Growth Rate (CAGR) computes the smoothed annual rate of growth over multiple years: (Final / Initial)^(1 / Years) - 1.",
          "CAGR accounts for compound interest and eliminates the distortions created by short-term market volatility.",
          "Rule: Use CAGR whenever evaluating a single one-time investment held for more than 12 months.",
        ],
      },
      {
        id: "xirr",
        title: "3. XIRR: The Essential Metric for SIPs and Cash Flows",
        paragraphs: [
          "Neither Absolute Return nor CAGR can accurately measure mutual fund SIP performance because an SIP consists of multiple cash inflows occurring on different dates.",
          "Extended Internal Rate of Return (XIRR) assigns an exact timeline and holding period to every individual monthly installment, computing an annualized return across the entire cash-flow schedule.",
          "Rule: Always use XIRR for evaluating SIPs, SWPs, or any portfolio with irregular top-ups and withdrawals.",
        ],
      },
      {
        id: "comparison-summary",
        title: "Summary: When to Use Which Metric",
        paragraphs: [
          "• Holding period under 1 year: Use Absolute Return.",
          "• One-time lumpsum investment over 1+ years: Use CAGR.",
          "• Periodic SIP, top-up, or withdrawal cash flows: Use XIRR.",
        ],
      },
    ],
    faqs: [
      {
        question: "Why is my SIP XIRR different from the fund's published CAGR?",
        answer: "Fund factsheets publish 1-year, 3-year, and 5-year CAGR based on a hypothetical one-time lumpsum investment. Your personal SIP XIRR will differ because each of your installments entered the market at different NAV price levels.",
      },
      {
        question: "Can CAGR be negative?",
        answer: "Yes. If your ending investment value is lower than your initial capital, CAGR will be negative, reflecting the annualized percentage loss.",
      },
    ],
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

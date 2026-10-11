# FinCalc India — Finance Calculator Baseline Checkpoint

**Checkpoint Date:** October 2026  
**Platform:** [FinCalc India](https://fincalcindia.in)  
**Corpus / Repository:** `Bharath18-vk/finCalcIndia`  
**Milestone:** Pre-Phase A Quality Baseline (22 Core Calculators Audited, Fixed & Regression Tested)  
**Companion Document:** [`FINANCE_CALCULATOR_AUDIT.md`](./FINANCE_CALCULATOR_AUDIT.md)

---

## 1. Baseline Summary Metrics

```text
============================================================
FinCalc India Finance Calculator Baseline
------------------------------------------------------------
Calculators: 22
Production routes: 60
Tests: 178/178
Test suites: 24/24
Build: PASS
Calculator average: 95.6/100
Platform architecture: 93.6/100
Critical issues: 0
High-priority calculation issues: 0
============================================================
```

| Metric | Baseline Value | Standard / Verification Method |
| :--- | :---: | :--- |
| **Total Production Calculators** | **22** | Core Indian financial tools across 5 distinct domains |
| **Total Production Routes** | **60** | Static HTML & SSG routes generated via `next build` |
| **Automated Tests** | **178 / 178** | Vitest 3.2.7 unit & integration assertions (100% Passing) |
| **Test Suites** | **24 / 24** | Dedicated test files covering all 18 calculation engines |
| **Build Status** | **PASS** | Next.js 15.5 SSG build with zero TypeScript or lint errors |
| **Calculator Score Average** | **95.6 / 100** | Bottom-up arithmetic mean across 10 evaluation dimensions |
| **Platform Architecture Score** | **93.6 / 100** | Top-down platform score including systemic architecture audit |
| **Critical Issues** | **0** | Zero mathematical, balance-sheet, or crash bugs |
| **High-Priority Calculation Issues**| **0** | 100% resolved (0% loan eligibility & FD copy fixed & tested) |
| **Current Tax Law Target** | **AY 2026-27** | Finance Act 2025 (Section 115BAC + 87A marginal relief) |

---

## 2. Infrastructure & Technical Stack Baseline

- **Framework**: Next.js 15.1.7 (React 19.0.0, React DOM 19.0.0)
- **App Router Architecture**: 100% Static Site Generation (`output: export` compatible SSG)
- **Language**: TypeScript 5.7.3 (`strict: true`, `noEmit: true`)
- **Styling**: Tailwind CSS 3.4.17 with PostCSS & Autoprefixer
- **Visual Chart Engine**: Recharts 2.15.1 (dynamic client-side lazy loaded via `next/dynamic` with `ssr: false`)
- **Icons**: Lucide React 1.16.0
- **Validation**: Zod 3.24.2
- **Testing Framework**: Vitest 3.2.7
- **Formatting Utilities**: Pure Indian Rupee formatter (`formatINR`), Crores/Lakhs shorthand (`formatCompactINR`), tenure formatters (`formatTenure`)
- **Privacy Standard**: Client-side execution with monetary data scrubbing in analytics

---

## 3. Inventory of the 22 Baseline Calculators

### Category 1: Loans & Debt (7 Calculators)

| # | Calculator | Route | Engine File | Component View | Baseline Score | Tests |
| :-: | :--- | :--- | :--- | :--- | :-: | :-: |
| 1 | **EMI Calculator** | `/emi-calculator` | `src/lib/calculators/emi.ts` | `EMICalculatorView.tsx` | 96.0 (A+) | 9 |
| 2 | **Home Loan EMI** | `/home-loan-emi-calculator` | `src/lib/calculators/emi.ts` | `EMICalculatorView.tsx` | 97.0 (A+) | 9 |
| 3 | **Personal Loan EMI** | `/personal-loan-emi-calculator` | `src/lib/calculators/emi.ts` | `EMICalculatorView.tsx` | 95.0 (A+) | 9 |
| 4 | **Car Loan EMI** | `/car-loan-emi-calculator` | `src/lib/calculators/emi.ts` | `EMICalculatorView.tsx` | 95.0 (A+) | 9 |
| 5 | **Loan Prepayment** | `/loan-prepayment-calculator` | `src/lib/calculators/prepayment.ts` | `LoanPrepaymentView.tsx` | 91.0 (A) | 4 |
| 6 | **Loan Eligibility** | `/loan-eligibility-calculator` | `src/lib/calculators/loan-eligibility.ts` | `LoanEligibilityView.tsx` | 94.0 (A) | 5 |
| 7 | **Amortization Schedule** | `/amortization-calculator` | `src/lib/calculators/emi.ts` | `AmortizationCalculatorView.tsx` | 92.0 (A) | 9 |

### Category 2: Investments & Wealth (6 Calculators)

| # | Calculator | Route | Engine File | Component View | Baseline Score | Tests |
| :-: | :--- | :--- | :--- | :--- | :-: | :-: |
| 8 | **SIP Calculator** | `/sip-calculator` | `src/lib/calculators/sip.ts` | `SIPCalculatorView.tsx` | 96.5 (A+) | 6 |
| 9 | **Step-Up SIP** | `/step-up-sip-calculator` | `src/lib/calculators/step-up-sip.ts` | `StepUpSIPCalculatorView.tsx` | 95.5 (A+) | 4 |
| 10 | **Lumpsum Calculator** | `/lumpsum-calculator` | `src/lib/calculators/lumpsum.ts` | `LumpsumCalculatorView.tsx` | 95.0 (A+) | 3 |
| 11 | **CAGR Calculator** | `/cagr-calculator` | `src/lib/calculators/cagr.ts` | `CAGRCalculatorView.tsx` | 94.0 (A) | 4 |
| 12 | **Compound Interest** | `/compound-interest-calculator` | `src/lib/calculators/compound-interest.ts` | `CompoundInterestCalculatorView.tsx` | 94.0 (A) | 4 |
| 13 | **SWP Calculator** | `/swp-calculator` | `src/lib/calculators/swp.ts` | `SWPCalculatorView.tsx` | 91.5 (A) | 4 |

### Category 3: Savings & Deposits (3 Calculators)

| # | Calculator | Route | Engine File | Component View | Baseline Score | Tests |
| :-: | :--- | :--- | :--- | :--- | :-: | :-: |
| 14 | **FD Calculator** | `/fd-calculator` | `src/lib/calculators/fd.ts` | `FDCalculatorView.tsx` | 97.5 (A+) | 6 |
| 15 | **RD Calculator** | `/rd-calculator` | `src/lib/calculators/rd.ts` | `RDCalculatorView.tsx` | 96.0 (A+) | 5 |
| 16 | **PPF Calculator** | `/ppf-calculator` | `src/lib/calculators/ppf.ts` | `PPFCalculatorView.tsx` | 97.5 (A+) | 6 |

### Category 4: Taxation & Compensation (3 Calculators)

| # | Calculator | Route | Engine File | Component View | Baseline Score | Tests |
| :-: | :--- | :--- | :--- | :--- | :-: | :-: |
| 17 | **Income Tax Calculator** | `/income-tax-calculator` | `src/lib/calculators/income-tax.ts` | `IncomeTaxCalculatorView.tsx` | 98.5 (A+) | 8 |
| 18 | **Salary In-Hand** | `/salary-calculator` | `src/lib/calculators/salary.ts` | `SalaryCalculatorView.tsx` | 97.0 (A+) | 4 |
| 19 | **HRA Exemption** | `/hra-calculator` | `src/lib/calculators/hra.ts` | `HRACalculatorView.tsx` | 97.0 (A+) | 3 |

### Category 5: Retirement & Employment (3 Calculators)

| # | Calculator | Route | Engine File | Component View | Baseline Score | Tests |
| :-: | :--- | :--- | :--- | :--- | :-: | :-: |
| 20 | **Gratuity Calculator** | `/gratuity-calculator` | `src/lib/calculators/gratuity.ts` | `GratuityCalculatorView.tsx` | 97.5 (A+) | 6 |
| 21 | **NPS Calculator** | `/nps-calculator` | `src/lib/calculators/nps.ts` | `NPSCalculatorView.tsx` | 98.0 (A+) | 9 |
| 22 | **EPF Calculator** | `/epf-calculator` | `src/lib/calculators/epf.ts` | `EPFCalculatorView.tsx` | 97.5 (A+) | 4 |

---

## 4. Production Route Inventory (60 Total Routes)

The baseline production build statically generates 60 discrete routes:

### Core Calculators & Category Hubs (27 Routes)
- `/` (Home Page)
- `/loans` (Category Hub)
- `/emi-calculator`
- `/home-loan-emi-calculator`
- `/personal-loan-emi-calculator`
- `/car-loan-emi-calculator`
- `/loan-prepayment-calculator`
- `/loan-eligibility-calculator`
- `/amortization-calculator`
- `/investments` (Category Hub)
- `/sip-calculator`
- `/step-up-sip-calculator`
- `/lumpsum-calculator`
- `/cagr-calculator`
- `/compound-interest-calculator`
- `/swp-calculator`
- `/savings` (Category Hub)
- `/fd-calculator`
- `/rd-calculator`
- `/ppf-calculator`
- `/income-tax-calculator`
- `/salary-calculator`
- `/hra-calculator`
- `/gratuity-calculator`
- `/nps-calculator`
- `/epf-calculator`

### Programmatic Longtail SSG Pages (14 Routes)
- `/home-loan-emi/50-lakh-20-years`
- `/home-loan-emi/30-lakh-15-years`
- `/personal-loan-emi/5-lakh-3-years`
- `/personal-loan-emi/2-lakh-2-years`
- `/car-loan-emi/8-lakh-5-years`
- `/car-loan-emi/5-lakh-4-years`
- `/sip/5000-per-month-10-years`
- `/sip/10000-per-month-15-years`
- `/step-up-sip/5000-per-month-10-percent-stepup-15-years`
- `/step-up-sip/10000-per-month-10-percent-stepup-20-years`
- `/lumpsum/10-lakh-10-years`
- `/lumpsum/5-lakh-5-years`
- `/fd/5-lakh-5-years`
- `/fd/1-lakh-1-year`

### Editorial Content & Statutory Guides (6 Routes)
- `/blog` (Index)
- `/blog/home-loan-prepayment-guide`
- `/blog/how-rd-interest-calculated`
- `/blog/ppf-vs-mutual-fund-sip`
- `/blog/old-vs-new-tax-regime-fy-2025-26`
- `/blog/epf-interest-rate-calculation`

### Trust, Legal & Discovery Routes (13 Routes)
- `/about`
- `/contact`
- `/disclaimer`
- `/privacy`
- `/terms`
- `/sitemap.xml`
- `/robots.txt`
- `/_not-found`
- Favicons & Web Manifest assets (`/icon.svg`, `/icon.png`, `/apple-icon.png`)

---

## 5. Statutory Benchmark Baseline

All statutory parameters are strictly decoupled in `src/data/rates/benchmarks.ts` and `src/data/rates/taxRules.ts`:

| Scheme / Benchmark | Baseline Statutory Value | Authority / Source | Verified Date | Classification |
| :--- | :---: | :--- | :---: | :--- |
| **New Tax Regime Slabs** | 7 Slabs (Section 115BAC) | CBDT, Finance Act 2025 | 2025-02-15 | Statutory Law |
| **Salaried Standard Deduction** | ₹75,000 | Finance Act 2025 | 2025-02-15 | Statutory Law |
| **Section 87A Tax Rebate** | ₹60,000 (Taxable up to ₹12L) | Finance Act 2025 | 2025-02-15 | Statutory Law |
| **Public Provident Fund (PPF)**| 7.10% p.a. (Annual compounding) | Ministry of Finance (DEA) | 2025-01-01 | Externally-Sourced |
| **Employees' Provident Fund (EPF)**| 8.25% p.a. (Monthly accrual) | EPFO Central Board of Trustees| 2025-02-01 | Externally-Sourced |
| **Gratuity Statutory Ceiling** | ₹20,00,000 | Payment of Gratuity Act, 1972 | 2025-01-01 | Statutory Law |
| **EPF Statutory Wage Ceiling** | ₹15,000/month (₹1,800 cap) | EPFO Notification | 2025-01-01 | Statutory Law |
| **NPS Small Corpus Threshold** | ₹5,00,000 (Normal exit) | PFRDA Exit Regulations | 2025-01-01 | Regulatory Law |
| **Home Loan Benchmark (EBLR)** | 8.50% p.a. | State Bank of India (SBI) | 2025-02-01 | Externally-Sourced |
| **Fixed Deposit Benchmark** | 6.80% p.a. (Quarterly comp.) | Median of SBI, HDFC, ICICI | 2025-02-01 | Illustrative |
| **SIP Equity Return Assumption** | 12.00% p.a. | Historical Nifty 50 TRI proxy | 2025-02-01 | Illustrative |

---

## 6. Regression Testing Baseline

Total Automated Tests: **178 Passing** across **24 Test Suites** (`vitest run`).

### Dedicated Regression Test Coverage Added in Baseline Checkpoint:
1. **Loan Eligibility Zero-Interest Promotion (`tests/calculators/loan-eligibility.test.ts`)**:
   - Asserts `annualRate: 0` evaluates to 0% and does not default to 8.5%.
   - Verifies ₹1 Lakh income at 50% FOIR returns exactly ₹1.2 Crore eligible loan over 240 months with ₹0 interest.
2. **Savings Hub Popular Scenario Alignment (`tests/calculators/fd.test.ts`)**:
   - Asserts ₹5 Lakh FD for 5 years at 6.8% quarterly compounding returns exactly `700469` and formats to `"₹7,00,469"`.
3. **Old Regime Senior Citizen Surcharge Marginal Relief (`tests/calculators/income-tax.test.ts`)**:
   - Asserts ₹51 Lakh taxable income for senior citizen (60–80 yrs) computes ₹64,000 marginal relief and ₹70,000 surcharge after relief based on the ₹3 Lakh senior citizen exemption limit.
4. **Old Regime Super Senior Citizen Surcharge Marginal Relief (`tests/calculators/income-tax.test.ts`)**:
   - Asserts ₹51 Lakh taxable income for super senior citizen (80+ yrs) computes ₹63,000 marginal relief and ₹70,000 surcharge after relief based on the ₹5 Lakh super senior citizen exemption limit.

---

## 7. Scaling Quality Standards (Targets for 50, 100, 200 Calculators)

As FinCalc India expands from 22 to 50, 100, and 200 calculators:

1. **Zero Regression Policy**: The 178 baseline tests must remain green at all times. Every new calculator added must include independent benchmark tests.
2. **Calculator Average Floor**: Average calculator score must remain $\ge 95.0 / 100$.
3. **Platform Architecture Floor**: Platform architecture score must remain $\ge 90.0 / 100$.
4. **Decoupled Engine Rule**: All calculation logic must be written as pure, zero-dependency functions in `src/lib/calculators/`, independently testable without DOM or React runtime.
5. **Answer Engine Optimization (AEO)**: Every new calculator must provide an immediate direct answer in the first 100 words, complete formula block, variable definitions, and schema-backed FAQ section.
6. **Statutory Integrity**: No hardcoded tax slabs or regulatory interest rates inside components. All statutory numbers must be imported from `src/data/rates/`.

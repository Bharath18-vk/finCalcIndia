# Phase A — Batch 4 Implementation Report
**FinCalc India ([fincalcindia.in](https://fincalcindia.in))**  
*Completion Date:* October 11, 2026  
*Status:* **Complete & Verified (82/82 SSG Static Pages, 430/430 Tests Passing, 0 Type Errors)*

---

## 1. Executive Summary
Phase A Batch 4 has been built, tested, and integrated into FinCalc India. All calculators adhere strictly to the `CalculatorEngine` contract, pure client-side execution, Zod input validation schemas, Indian numbering formats, and the 7-case test pattern.

The platform has expanded from **37 calculators (77 static pages)** to **42 calculators (82 static pages)**.

---

## 2. Calculators Implemented in Batch 4

### 1. GST Calculator (`/gst-calculator`)
- **Statutory Authority:** Central Board of Indirect Taxes and Customs (CBIC) / GST Council of India.
- **Features:**
  - Forward Exclusive addition (Net → Gross) and Reverse Inclusive extraction (Gross MRP → Pre-tax Net).
  - Statutory slabs: Exempt (0%), Rough Diamonds (0.25%), Gold/Jewellery (3%), Essential Foods (5%), Standard (12%), Commercial/Services (18%), Luxury/Automobiles (28%).
  - Jurisdictional division: Equal 50:50 split between CGST and SGST for Intra-State sales, or single 100% IGST for Inter-State transactions.
  - Multi-unit bulk billing quantity multiplier.
- **Engine:** `src/lib/calculators/gst.ts`
- **View:** `src/components/calculators/GstCalculatorView.tsx`
- **Route:** `src/app/gst-calculator/page.tsx`
- **Tests:** `tests/calculators/gst.test.ts` (8/8 passing)

---

### 2. Inflation Calculator (`/inflation-calculator`)
- **Authority / Data Source:** Reserve Bank of India (RBI) CPI inflation target framework & Central Board of Direct Taxes (CBDT) Cost Inflation Index (CII) notifications.
- **Features:**
  - Compound purchasing power erosion: $\text{FV} = \text{PV} \times (1 + r)^t$ and $\text{Purchasing Power} = \frac{\text{PV}}{(1 + r)^t}$.
  - Statutory CBDT Cost Inflation Index (CII) table covering FY 2001-02 (base 100) through FY 2024-25 (CII 363).
  - Rule of 72 doubling period calculator.
  - Category-specific future expenditure forecasting (Higher Education at 10%, Healthcare at 10%, Child Marriage, Retirement Lifestyle).
  - Year-by-year compounding progression table.
- **Engine:** `src/lib/calculators/inflation.ts`
- **View:** `src/components/calculators/InflationCalculatorView.tsx`
- **Route:** `src/app/inflation-calculator/page.tsx`
- **Tests:** `tests/calculators/inflation.test.ts` (7/7 passing)

---

### 3. Loan Comparison Calculator (`/loan-comparison-calculator`)
- **Features:**
  - Parallel reducing-balance loan calculations comparing Loan Offer A vs Loan Offer B.
  - Dynamic rate sensitivity and tenure trade-offs.
  - Upfront bank processing fee comparison with 18% GST impact.
  - Side-by-side verdict identifying the lower EMI option and the lowest total lifetime cost option with exact rupee savings.
  - Detailed side-by-side amortization and lifetime cash flow breakdown.
- **Engine:** `src/lib/calculators/loan-comparison.ts`
- **View:** `src/components/calculators/LoanComparisonView.tsx`
- **Route:** `src/app/loan-comparison-calculator/page.tsx`
- **Tests:** `tests/calculators/loan-comparison.test.ts` (7/7 passing)

---

### 4. Calorie & Macro Calculator (`/calorie-calculator`)
- **Clinical Model:** Gold-standard Mifflin-St Jeor Clinical Equation (validated by the American Dietetic Association):
  $$\text{BMR} = 10 \cdot W + 6.25 \cdot H - 5 \cdot A + s$$
  ($+5$ for biological men, $-161$ for biological women).
- **Features:**
  - Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE) with activity multipliers ($1.2\times$ to $1.9\times$).
  - Target calorie planning: Maintenance, Mild Loss ($-250$ kcal), Moderate Loss ($-500$ kcal), Aggressive Loss ($-1000$ kcal), Clean Bulk ($+300$ kcal), Muscle Gain ($+500$ kcal).
  - Safe minimum calorie floor constraint: Enforces 1,200 kcal for women and 1,500 kcal for men to avoid metabolic damage.
  - Macronutrient partitioning: Balanced Indian Diet (30% Protein / 40% Carbs / 30% Fats) and Fitness & Muscle-Sparing (35% Protein / 35% Carbs / 30% Fats) in daily grams.
  - Baseline daily hydration guideline (33ml per kg body mass).
- **Engine:** `src/lib/calculators/calorie.ts`
- **View:** `src/components/calculators/CalorieCalculatorView.tsx`
- **Route:** `src/app/calorie-calculator/page.tsx`
- **Tests:** `tests/calculators/calorie.test.ts` (7/7 passing)

---

### 5. NPS vs EPF Calculator (`/nps-vs-epf-calculator`)
- **Regulatory Framework:** Employees' Provident Fund Organisation (EPFO) & Pension Fund Regulatory and Development Authority (PFRDA).
- **Features:**
  - Side-by-side career compounding of identical monthly investments:
    - **EPF:** 8.25% p.a. sovereign guaranteed return, monthly running balance crediting, 100% tax-free lump sum at maturity (EEE status).
    - **NPS Tier-1:** 10%–12% market-linked multi-asset CAGR, max 60% tax-free lump sum under Section 10(12A), min 40% mandatory annuity purchase generating guaranteed monthly lifetime pension.
  - Exclusive Section 80CCD(1B) tax deduction (up to ₹50,000/yr over Section 80C) calculated across tax slabs (saving up to ₹15,600/yr in the 30% bracket).
  - Trajectory schedule with 5-year milestone and all-year view.
  - Regulatory comparison matrix (Asset allocation, liquidity, taxation, pension guarantees).
- **Engine:** `src/lib/calculators/nps-vs-epf.ts`
- **View:** `src/components/calculators/NpsVsEpfView.tsx`
- **Route:** `src/app/nps-vs-epf-calculator/page.tsx`
- **Tests:** `tests/calculators/nps-vs-epf.test.ts` (7/7 passing)

---

## 3. Navigation & SEO Integration
- **`src/data/site-map.ts`:** Added all 5 routes to `STATIC_ROUTES`.
- **`src/data/keyword-map.ts`:** Registered primary keywords and intents for all 5 tools.
- **`src/lib/analytics.ts`:** Registered `"gst" | "inflation" | "loan-comparison" | "calorie" | "nps-vs-epf"` in `CalculatorId`.
- **Global Footer (`src/app/layout.tsx`):** Linked each calculator in its appropriate responsive column (Loan Calculators, Investments & Savings, Tax/Salary/Govt, Everyday & Guides).
- **Category Hubs & Homepage (`src/app/page.tsx`, `src/app/loans/page.tsx`, `src/app/investments/page.tsx`):** Added interactive cards and deep-links.

---

## 4. Verification & Health Metrics
- **TypeScript:** `npx tsc --noEmit` → **0 errors**.
- **Vitest Unit Tests:** `npm test` → **45/45 test files passed, 430/430 tests passed (100% pass rate)**.
- **Production Build:** `npm run build` → **82/82 static pages generated via Next.js 15.5.26 SSG**.
- **Dev Server:** Running live on `http://localhost:3000`.

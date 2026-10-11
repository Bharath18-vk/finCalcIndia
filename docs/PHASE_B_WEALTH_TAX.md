# FinCalc India — Phase B: Advanced Wealth, Tax Strategy & FIRE Architecture

## Overview
Phase B expands FinCalc India into institutional-grade wealth planning, early retirement modeling, and post-Budget 2024 taxation strategy.

All 5 Phase B calculators are built with pure client-side mathematical engines, Zod validation contracts, responsive UI slot layouts, Schema.org JSON-LD microdata, and 100% Next.js SSG static generation.

---

## 1. Calculators Delivered in Phase B

| Calculator | Route | Category | Core Law / Formula | Primary Benefit |
| :--- | :--- | :--- | :--- | :--- |
| **Capital Gains Tax** | `/capital-gains-tax-calculator` | Tax & Wealth | Sec 111A, 112A, 112, 50AA (Finance Act 2024) | Compares 12.5% unindexed vs 20% indexed real estate grandfathering; calculates equity LTCG/STCG |
| **FIRE (Early Retirement)** | `/fire-calculator` | Retirement | Bengen SWR (3.5% India benchmark) + CPI Compounding | Solves exact FIRE corpus, retirement longevity, and Lean/Regular/Fat/Coast/Barista FIRE tiers |
| **Step-Up SWP** | `/step-up-swp-calculator` | Retirement | $W_y = W_0 (1+g)^{y-1}$ + Monthly Compounding Depletion | Evaluates inflation-hedged monthly cashflow and discovers max safe initial withdrawal |
| **Dual Tax Exemption Optimizer** | `/dual-exemption-calculator` | Tax Strategy | Sec 10(13A) Rule 2A + Sec 24(b) (₹2L Cap) + Sec 80C | Validates simultaneous HRA + Home Loan claims across hometown vs work city scenarios |
| **Portfolio Rebalancing** | `/portfolio-rebalance-calculator` | Investment | Strategic Allocation Drift $\Delta = W_i - W_{target}$ | Tax-Smart "Cash Flow First" rebalancing deploying fresh capital with zero capital gains friction |

---

## 2. Statutory Accuracy & Equations

### 2.1 Capital Gains Tax (Budget 2024 Revisions)
- **Listed Equity Shares & Equity Mutual Funds**:
  - **LTCG (> 12 Months)**: Taxed at **12.5%** under Section 112A on gains exceeding the enhanced statutory exemption threshold of **₹1,25,000** (previously ₹1,00,000).
  - **STCG ($\le$ 12 Months)**: Taxed at **20%** under Section 111A (previously 15%).
- **Real Estate (Immovable Property)**:
  - **Holding Threshold**: 24 months.
  - **Statutory Rate**: 12.5% without indexation.
  - **Grandfathering Choice**: For properties acquired before July 23, 2024, individuals and HUFs can evaluate:
    $$\text{Option A} = (\text{Sale} - \text{Cost}) \times 12.5\% \times 1.04$$
    $$\text{Option B} = (\text{Sale} - \text{Indexed Cost}_{\text{CII}}) \times 20\% \times 1.04$$
    The engine computes both and selects the lower tax option.
- **Debt Mutual Funds (Post April 1, 2023)**:
  - Treated as deemed STCG taxed at individual income slab rate under Section 50AA regardless of holding duration.
- **Physical Gold, SGBs, & Unlisted Equities**:
  - 24-month holding threshold; 12.5% LTCG without indexation.
- **Cess**: 4% Health & Education Cess applied across all taxes.

### 2.2 FIRE (Financial Independence Retire Early)
- **Compounded Future Living Cost**:
  $$\text{Future Annual Expenses} = (\text{Current Monthly Expenses} \times 12) \times (1 + i)^n$$
- **Required Target Corpus**:
  $$\text{Corpus}_{\text{FIRE}} = \frac{\text{Future Annual Expenses}}{\text{SWR}}$$
  *Default SWR: 3.5% (recommended for 40+ year Indian retirements).*
- **Lifestyle Tiers**:
  - Lean FIRE: 75% of regular corpus (frugal baseline).
  - Fat FIRE: 135% of regular corpus (luxury buffer).
  - Coast FIRE: Today's capital required to compound without further contributions: $\frac{\text{Corpus}_{\text{FIRE}}}{(1 + r_{\text{pre}})^n}$.
  - Barista FIRE: 50% expenses covered by part-time/consulting income.

### 2.3 Step-Up SWP
- **Annual Escalation**:
  $$W_{m, y} = W_0 \times (1 + g)^{y-1}$$
- **Capital Depletion**:
  $$B_m = (B_{m-1} - W_m) \times \left(1 + \frac{r}{12}\right)$$
- **Max Sustainable Starting Withdrawal**: Binary search solver computing initial monthly payout ensuring $B_{m} \ge 0$ across all months in planned retirement horizon.

### 2.4 Dual Tax Exemption Optimizer (HRA + Home Loan)
- **HRA Rule 2A**: Minimum of:
  1. Actual HRA received
  2. 50% of Basic Salary (Metro) or 40% (Non-Metro)
  3. Rent paid minus 10% of Basic Salary
- **Section 24(b) Home Loan Interest**:
  - Self-occupied: Capped at ₹2,00,000 per financial year.
  - Let-out: 30% standard deduction applied to rental income; net loss set-off against salary capped at ₹2,00,000 per FY.
- **Scenario Legality**:
  - Different Cities (Hometown owned, work city rented): 100% legal and statutory.
  - Same City: Valid with commuting distance or elderly parent occupancy documentation.
  - Under Construction: HRA allowable; pre-construction loan interest claimable in 5 equal annual installments post-possession.

### 2.5 Portfolio Rebalancing
- **Drift %**: $\text{Drift}_i = \text{Current Weight}_i - \text{Target Weight}_i$.
- **Cash Flow First Strategy**: Directs incoming fresh investment capital strictly to underweight asset classes:
  $$\text{Allocation}_i = \min\left(\text{Shortfall}_i, \text{Fresh Capital} \times \frac{\text{Shortfall}_i}{\sum \text{Shortfalls}}\right)$$
  Incurs **₹0 capital gains tax** and **0 exit loads**.

---

## 3. Platform Growth Metrics

| Metric | Baseline (Phase 1-3) | Phase A (Batches 1-4) | Phase B (Current) |
| :--- | :--- | :--- | :--- |
| **Total Live Calculators** | 22 | 42 | **47** |
| **Total Static SSG Routes** | 46 | 82 | **87** |
| **Vitest Passing Tests** | 246 | 430 | **457** |
| **TypeScript / Build Errors** | 0 | 0 | **0** |

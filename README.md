# FinCalc India

Comprehensive, high-performance financial calculators built specifically for the Indian financial ecosystem.

## Overview

FinCalc India provides statutory-compliant, real-time financial calculations across:
- **Loans & EMI**: Standard EMI, Home Loan, Personal Loan, Car Loan, Prepayment & Foreclosure calculators.
- **Investments**: SIP, Lumpsum, Step-up SIP, FD (Quarterly compounding), RD, PPF, Sukanya Samriddhi Yojana (SSY), Senior Citizen Savings Scheme (SCSS), Mutual Fund CAGR/XIRR.
- **Retirement & Tax**: Income Tax Calculator (AY 2026-27 / FY 2025-26 New Regime with Section 87A rebate & marginal relief), EPF (8.25%), NPS (All Citizen & Corporate Models), Gratuity ($15/26$ statutory rule).

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Static Site Generation)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS
- **Charts**: Recharts (dynamically loaded for optimal Core Web Vitals)
- **Icons**: Lucide React
- **Testing**: Vitest (168 unit & integration tests)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing

```bash
npm test
```

### Type Checking & Production Build

```bash
npx tsc --noEmit
npm run build
```

## License

MIT

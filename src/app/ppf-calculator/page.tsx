import React from "react";
import { Metadata } from "next";
import { PPFCalculatorView } from "@/components/calculators/PPFCalculatorView";
import { BENCHMARK_RATES } from "@/data/rates/benchmarks";
import { FAQItem } from "@/components/ui/FAQSection";

export const metadata: Metadata = {
  title: "PPF Calculator - Public Provident Fund Maturity & Interest Calculator",
  description:
    "Calculate your 15-year Public Provident Fund (PPF) maturity corpus, tax-free interest, and loan/withdrawal limits at the official Ministry of Finance notified rate of 7.10%.",
  alternates: {
    canonical: "/ppf-calculator",
  },
  openGraph: {
    title: "PPF Calculator - Public Provident Fund Tax-Free Maturity Calculator",
    description:
      "Model 15 to 30 year PPF investments with annual lump-sum or monthly installments at the government-notified rate of 7.10% p.a.",
    url: "/ppf-calculator",
    type: "website",
  },
};

export default function PPFCalculatorPage() {
  const benchmark = BENCHMARK_RATES.ppf || {
    defaultRate: 7.1,
    verifiedAt: "2024-10-01",
  };

  const faqs: FAQItem[] = [
    {
      question: "What is the best date to deposit money into a PPF account?",
      answer:
        "Deposit on or before the 5th of every month. The government rules mandate that interest is calculated on the lowest balance between the close of the 5th day and the end of the month. If depositing an annual lumpsum, deposit between April 1st and April 5th to earn interest for all 12 months.",
    },
    {
      question: "What is the tax status of Public Provident Fund (PPF)?",
      answer:
        "PPF enjoys EEE (Exempt-Exempt-Exempt) tax status: annual contributions are deductible under Section 80C (up to ₹1.5 Lakh/yr under Old Regime), annual interest accrual is completely tax-free, and maturity payouts are 100% exempt from income tax under Section 10(10D).",
    },
    {
      question: "Can I extend my PPF account after 15 years?",
      answer:
        "Yes. You can extend your PPF account indefinitely in blocks of 5 years (15, 20, 25, 30 years). You can choose to extend with fresh contributions or without further contributions while continuing to earn interest on the balance.",
    },
    {
      question: "When can I take a loan or make partial withdrawals from PPF?",
      answer:
        "A loan facility is available from the 3rd to the 6th financial year (up to 25% of the balance at the end of the 2nd preceding year). Partial withdrawals are permitted from the 7th financial year onwards (up to 50% of the eligible balance).",
    },
  ];

  const relatedLinks = [
    {
      title: "Recurring Deposit (RD) Calculator",
      description: "Model short to medium term guaranteed recurring bank deposits.",
      href: "/rd-calculator",
      badge: "Bank Savings",
    },
    {
      title: "SIP Calculator",
      description: "Compare PPF vs market-linked mutual fund SIP wealth accumulation.",
      href: "/sip-calculator",
      badge: "Equity Wealth",
    },
    {
      title: "FD Calculator",
      description: "Check cumulative term deposit returns across bank tenures.",
      href: "/fd-calculator",
    },
    {
      title: "Savings Hub",
      description: "Overview of all guaranteed small savings and deposit tools.",
      href: "/savings",
    },
  ];

  return (
    <PPFCalculatorView
      title="Public Provident Fund (PPF) Calculator"
      badge="Small Savings Scheme"
      description="Calculate your 15-year tax-free maturity corpus, annual interest accrual, statutory loan eligibility, and partial withdrawal limits at the current 7.10% government rate."
      initialDeposit={150000}
      initialFrequency="annual"
      initialRate={benchmark.defaultRate}
      initialTenureYears={15}
      benchmarkNote={`Govt PPF Benchmark: ${benchmark.defaultRate}%`}
      asOfDate={benchmark.verifiedAt}
      breadcrumbs={[
        { label: "Savings Calculators", href: "/savings" },
        { label: "PPF Calculator", href: "/ppf-calculator" },
      ]}
      faqs={faqs}
      relatedLinks={relatedLinks}
    />
  );
}

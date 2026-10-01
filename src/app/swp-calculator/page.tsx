import React from "react";
import { Metadata } from "next";
import { SWPCalculatorView } from "@/components/calculators/SWPCalculatorView";
import { BENCHMARK_RATES } from "@/data/rates/benchmarks";
import { FAQItem } from "@/components/ui/FAQSection";

export const metadata: Metadata = {
  title: "SWP Calculator - Systematic Withdrawal Plan Calculator for Monthly Income",
  description:
    "Calculate monthly cash payouts, remaining mutual fund corpus, capital depletion timelines, and wealth growth from your Systematic Withdrawal Plan (SWP).",
  alternates: {
    canonical: "/swp-calculator",
  },
  openGraph: {
    title: "SWP Calculator - Mutual Fund Monthly Pension & Cash Flow Calculator",
    description:
      "Plan tax-efficient monthly income from your retirement or investment corpus with custom return assumptions and capital longevity analysis.",
    url: "/swp-calculator",
    type: "website",
  },
};

export default function SWPCalculatorPage() {
  const benchmark = BENCHMARK_RATES.swpReturn || {
    defaultRate: 8.5,
    verifiedAt: "2024-10-01",
  };

  const faqs: FAQItem[] = [
    {
      question: "How does a Systematic Withdrawal Plan (SWP) generate monthly income?",
      answer:
        "In an SWP, you instruct the mutual fund to redeem a fixed rupee amount on a set date each month and transfer it directly to your bank account. The remaining corpus continues to compound in the fund, participating in ongoing market growth.",
    },
    {
      question: "Why is SWP more tax-efficient than Bank FD monthly interest?",
      answer:
        "In a bank FD, 100% of the interest payout is taxable at your income tax slab rate (up to 30%+). In an SWP, each withdrawal is treated as a unit redemption consisting partly of your original principal (tax-free) and partly of capital gains. Only the capital gains portion is taxed, resulting in substantially lower net tax outflow.",
    },
    {
      question: "What is a safe withdrawal rate for retirement in India?",
      answer:
        "A safe withdrawal rate is typically between 5% and 6% of the initial corpus in a balanced or hybrid mutual fund portfolio expected to earn 8% to 10%. Keeping withdrawals below expected return ensures your capital base grows alongside inflation.",
    },
    {
      question: "What happens if I withdraw more than the fund's returns?",
      answer:
        "If your withdrawal rate exceeds the portfolio's annual growth rate, your principal balance will steadily decline over time, eventually leading to capital depletion. Our calculator alerts you with a Capital Depletion Warning showing the exact month your corpus runs out.",
    },
  ];

  const relatedLinks = [
    {
      title: "SIP Calculator",
      description: "Model regular monthly accumulation to build your SWP corpus.",
      href: "/sip-calculator",
      badge: "Wealth Creation",
    },
    {
      title: "Lumpsum Calculator",
      description: "Calculate future one-time growth without monthly withdrawals.",
      href: "/lumpsum-calculator",
      badge: "Lumpsum",
    },
    {
      title: "PPF Calculator",
      description: "Guaranteed sovereign tax-free small savings corpus calculator.",
      href: "/ppf-calculator",
    },
    {
      title: "Investment Hub",
      description: "Overview of all mutual fund accumulation and withdrawal tools.",
      href: "/investments",
    },
  ];

  return (
    <SWPCalculatorView
      title="SWP Calculator"
      badge="Regular Cash Flow"
      description="Calculate regular monthly pension income, capital longevity, and terminal portfolio value from your invested mutual fund corpus under custom return assumptions."
      initialInvestment={5000000}
      initialMonthlyWithdrawal={35000}
      initialAnnualReturn={benchmark.defaultRate}
      initialTenureYears={15}
      benchmarkNote={`Conservative Hybrid Benchmark: ${benchmark.defaultRate}%`}
      asOfDate={benchmark.verifiedAt}
      breadcrumbs={[
        { label: "Investment Calculators", href: "/investments" },
        { label: "SWP Calculator", href: "/swp-calculator" },
      ]}
      faqs={faqs}
      relatedLinks={relatedLinks}
    />
  );
}

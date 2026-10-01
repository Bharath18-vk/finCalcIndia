import React from "react";
import { Metadata } from "next";
import { RDCalculatorView } from "@/components/calculators/RDCalculatorView";
import { BENCHMARK_RATES } from "@/data/rates/benchmarks";
import { FAQItem } from "@/components/ui/FAQSection";

export const metadata: Metadata = {
  title: "RD Calculator - Recurring Deposit Maturity & Quarterly Interest Calculator",
  description:
    "Calculate Recurring Deposit (RD) maturity amount and interest earned using official Indian banking quarterly compounding rules. Compare senior citizen rates across 1 to 10 years.",
  alternates: {
    canonical: "/rd-calculator",
  },
  openGraph: {
    title: "RD Calculator - Recurring Deposit Quarterly Compounding Calculator",
    description:
      "Accurate Recurring Deposit maturity calculator based on Indian Banks' Association (IBA) quarterly compounding directives.",
    url: "/rd-calculator",
    type: "website",
  },
};

export default function RDCalculatorPage() {
  const benchmark = BENCHMARK_RATES.recurringDeposit || {
    defaultRate: 6.8,
    verifiedAt: "2024-10-01",
  };

  const faqs: FAQItem[] = [
    {
      question: "How is Recurring Deposit (RD) interest calculated in Indian banks?",
      answer:
        "In accordance with Indian Banks' Association (IBA) and RBI guidelines, commercial banks and India Post compound RD interest QUARTERLY. Each monthly installment earns compound interest for the remaining tenure until maturity.",
    },
    {
      question: "Do senior citizens get higher interest on recurring deposits?",
      answer:
        "Yes. Most Indian public and private sector banks offer an additional 0.50% p.a. (50 basis points) interest rate for resident senior citizens (aged 60 and above).",
    },
    {
      question: "Is TDS applicable on Recurring Deposit interest?",
      answer:
        "Yes. Under Section 194A of the Income Tax Act, banks deduct 10% TDS if total interest earned across branches exceeds ₹40,000 in a financial year (₹50,000 for senior citizens). If your total taxable income is zero, you can submit Form 15G or 15H.",
    },
    {
      question: "What is the difference between an RD and a Mutual Fund SIP?",
      answer:
        "An RD offers guaranteed returns with fixed interest and sovereign capital protection (up to ₹5 Lakh under DICGC). An SIP invests in market-linked mutual funds without guaranteed returns, but historically delivers higher long-term compounding over 5+ year horizons.",
    },
  ];

  const relatedLinks = [
    {
      title: "Fixed Deposit (FD) Calculator",
      description: "Calculate maturity payout on one-time term deposits.",
      href: "/fd-calculator",
      badge: "Lumpsum Deposit",
    },
    {
      title: "PPF Calculator",
      description: "15-year government guaranteed tax-free small savings scheme.",
      href: "/ppf-calculator",
      badge: "EEE Tax-Free",
    },
    {
      title: "SIP Calculator",
      description: "Explore market-linked systematic investment planning in mutual funds.",
      href: "/sip-calculator",
    },
    {
      title: "Savings Hub",
      description: "Overview of all guaranteed deposit and savings calculators.",
      href: "/savings",
    },
  ];

  return (
    <RDCalculatorView
      title="Recurring Deposit (RD) Calculator"
      badge="Bank Deposits"
      description="Estimate your maturity payout, total interest accrued, and effective annual yield (APY) on monthly recurring deposits using standard RBI quarterly compounding conventions."
      initialMonthlyDeposit={5000}
      initialAnnualRate={benchmark.defaultRate}
      initialTenureMonths={36}
      benchmarkNote={`Bank RD Benchmark: ${benchmark.defaultRate}%`}
      asOfDate={benchmark.verifiedAt}
      breadcrumbs={[
        { label: "Savings Calculators", href: "/savings" },
        { label: "RD Calculator", href: "/rd-calculator" },
      ]}
      faqs={faqs}
      relatedLinks={relatedLinks}
    />
  );
}

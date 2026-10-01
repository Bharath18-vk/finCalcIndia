import React from "react";
import type { Metadata } from "next";
import { FDCalculatorView } from "@/components/calculators/FDCalculatorView";
import { BENCHMARK_RATES } from "@/data/rates/benchmarks";

export const metadata: Metadata = {
  title: "FD Calculator - Fixed Deposit Maturity & Quarterly Interest Calculator",
  description:
    "Calculate bank fixed deposit (FD) maturity amount and interest earned using official RBI quarterly compounding rules. Includes senior citizen slab comparisons and APY yields.",
  alternates: {
    canonical: "/fd-calculator",
  },
  openGraph: {
    title: "FD Calculator - Fixed Deposit Maturity & Quarterly Interest Calculator",
    description:
      "Accurate bank fixed deposit calculator with quarterly compounding and senior citizen rates.",
    url: "https://fincalcindia.com/fd-calculator",
  },
};

export default function FDCalculatorPage() {
  const benchmark = BENCHMARK_RATES.fixedDeposit;

  const faqs = [
    {
      question: "Why do Indian bank fixed deposits compound quarterly?",
      answer:
        "According to Reserve Bank of India (RBI) directives, Indian commercial banks compute interest on cumulative fixed deposits on a quarterly basis (every 3 months). The interest earned in each quarter is added to the principal to form the opening balance for the subsequent quarter, yielding an Effective Annual Yield (APY) higher than the nominal rate.",
    },
    {
      question: "What is the additional interest rate for senior citizens?",
      answer:
        "Almost all major Indian commercial banks (including SBI, HDFC, ICICI, and Punjab National Bank) offer an additional interest rate of 0.50% p.a. (50 basis points) on fixed deposits across all tenure slabs for Indian resident senior citizens (aged 60 and above).",
    },
    {
      question: "What is TDS on Fixed Deposits and how is it deducted?",
      answer:
        "Under Section 194A of the Income Tax Act, banks deduct Tax Deducted at Source (TDS) at 10% (if PAN is provided) when total interest earned across all branches of a bank exceeds ₹40,000 in a financial year (₹50,000 for senior citizens). If your total taxable income is below the taxable threshold, you can submit Form 15G (for general citizens) or Form 15H (for senior citizens) to prevent TDS deduction.",
    },
    {
      question: "What is a 5-year tax-saving fixed deposit?",
      answer:
        "A 5-year tax-saving FD qualifies for deductions under Section 80C of the Income Tax Act (up to ₹1.5 Lakh per financial year under the Old Tax Regime). These deposits have a mandatory 5-year lock-in period with no premature withdrawal or loan facility permitted.",
    },
  ];

  const relatedLinks = [
    {
      title: "Interest on 5 Lakh FD for 5 Years",
      description: "Direct interest calculation and maturity payout for a ₹5 Lakh fixed deposit over 5 years.",
      href: "/fd/5-lakh-5-years",
      badge: "Popular Scenario",
    },
    {
      title: "Savings Hub",
      description: "Overview of all guaranteed interest and deposit calculators.",
      href: "/savings",
    },
    {
      title: "Lumpsum Calculator",
      description: "Compare bank deposit returns with market-linked mutual funds.",
      href: "/lumpsum-calculator",
    },
    {
      title: "SIP Calculator",
      description: "Explore monthly systematic investment alternatives.",
      href: "/sip-calculator",
    },
  ];

  return (
    <FDCalculatorView
      title="Fixed Deposit (FD) Calculator"
      badge="Bank Fixed Deposits"
      description="Compute your fixed deposit maturity value, cumulative interest, and effective annual yield using standard RBI quarterly compounding rules."
      initialPrincipal={500000}
      initialAnnualRate={benchmark.defaultRate}
      initialTenureYears={3}
      benchmarkNote={`Illustrative Rate: ${benchmark.defaultRate}% (Quarterly Compounding)`}
      asOfDate={benchmark.verifiedAt}
      breadcrumbs={[
        { label: "Savings", href: "/savings" },
        { label: "FD Calculator", href: "/fd-calculator" },
      ]}
      faqs={faqs}
      relatedLinks={relatedLinks}
    />
  );
}

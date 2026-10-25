import React from "react";
import type { Metadata } from "next";
import { FDCalculatorView } from "@/components/calculators/FDCalculatorView";
import { FDContent } from "@/components/calculators/content/FDContent";
import { BENCHMARK_RATES } from "@/data/rates/benchmarks";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateSoftwareSchema } from "@/lib/seo/schema";

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
    url: "https://fincalcindia.in/fd-calculator",
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
      question: "What is the difference between Cumulative and Non-Cumulative FDs?",
      answer:
        "In a Cumulative FD, interest is reinvested quarterly and paid alongside the principal upon maturity, maximizing compound interest growth. In a Non-Cumulative FD, interest is disbursed directly to your bank account monthly, quarterly, or half-yearly, making it ideal for investors seeking regular income.",
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
      question: "Are bank fixed deposits safe in India? What is DICGC insurance?",
      answer:
        "Yes, deposits in all scheduled commercial and cooperative banks are protected by the Deposit Insurance and Credit Guarantee Corporation (DICGC), a wholly-owned subsidiary of the RBI. DICGC insures deposits up to ₹5,00,000 per depositor per bank, covering both principal and accrued interest.",
    },
    {
      question: "What is a 5-year tax-saving fixed deposit?",
      answer:
        "A 5-year tax-saving FD qualifies for deductions under Section 80C of the Income Tax Act (up to ₹1.5 Lakh per financial year under the Old Tax Regime). These deposits have a mandatory 5-year lock-in period with no premature withdrawal or loan facility permitted.",
    },
    {
      question: "Is FD interest taxed every year or only upon maturity?",
      answer:
        "For cumulative fixed deposits, interest is taxed on an accrual basis each financial year, not only at final maturity. Banks report annual accrued interest in your Form 26AS and AIS, and you must include it under 'Income from Other Sources' in your annual ITR.",
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

  const jsonLd = generateSoftwareSchema({
    name: "FD Calculator - Fixed Deposit Maturity & Quarterly Interest Calculator",
    description:
      "Calculate bank fixed deposit (FD) maturity amount and interest earned using official RBI quarterly compounding rules. Includes senior citizen slab comparisons and APY yields.",
    url: "/fd-calculator",
    applicationCategory: "FinanceApplication",
    featureList: [
      "Official Indian commercial bank quarterly compounding convention",
      "General vs senior citizen (+0.50% p.a.) comparison",
      "Maturity value, total interest, and effective annual yield (APY)",
      "Section 80C 5-year tax saving deposit analysis",
      "Shareable URL calculation links",
    ],
  });

  return (
    <>
      <JsonLd data={jsonLd} />
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
        explainerContent={<FDContent />}
      />
    </>
  );
}

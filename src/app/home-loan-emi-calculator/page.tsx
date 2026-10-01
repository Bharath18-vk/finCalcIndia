import React from "react";
import type { Metadata } from "next";
import { EMICalculatorView } from "@/components/calculators/EMICalculatorView";
import { BENCHMARK_RATES } from "@/data/rates/benchmarks";

export const metadata: Metadata = {
  title: "Home Loan EMI Calculator - Housing Loan Interest & Repayment Schedule",
  description:
    "Calculate your home loan EMI online using current EBLR/RLLR benchmark rates. See monthly principal vs interest breakdown, yearly schedule, and total interest cost.",
  alternates: {
    canonical: "/home-loan-emi-calculator",
  },
  openGraph: {
    title: "Home Loan EMI Calculator - Housing Loan Interest & Repayment Schedule",
    description:
      "Estimate housing loan monthly installments and yearly amortization using official bank benchmark rates.",
    url: "https://fincalcindia.in/home-loan-emi-calculator",
  },
};

export default function HomeLoanEMICalculatorPage() {
  const benchmark = BENCHMARK_RATES.homeLoan;

  const faqs = [
    {
      question: "What is an EBLR / RLLR benchmark in Indian home loans?",
      answer:
        "External Benchmark Lending Rate (EBLR) or Repo Linked Lending Rate (RLLR) is the standardized benchmark rate mandated by the RBI since October 2019. When the RBI revises the repo rate, commercial banks adjust their home loan interest rates accordingly, ensuring transparent transmission of rate changes.",
    },
    {
      question: "What is the ideal home loan tenure for an Indian buyer?",
      answer:
        "While 20 to 30-year tenures keep monthly installments affordable, the total interest paid often exceeds the principal borrowed. Financial planners often suggest taking a 20-year loan to maintain cash flow while making regular principal prepayments each year to eliminate the debt in 8 to 12 years.",
    },
    {
      question: "Can I claim tax deductions on home loan EMI?",
      answer:
        "Under the Old Tax Regime, you can claim up to ₹1.5 Lakh per financial year on principal repayment under Section 80C, and up to ₹2 Lakh on interest paid for a self-occupied property under Section 24(b). Under the New Tax Regime (Section 115BAC), these specific deductions are generally not permitted for self-occupied homes.",
    },
    {
      question: "Are there prepayment charges on floating-rate home loans?",
      answer:
        "No. The Reserve Bank of India has banned foreclosure and part-prepayment charges on all individual floating-rate home loans across commercial banks and housing finance companies (HFCs).",
    },
  ];

  const relatedLinks = [
    {
      title: "50 Lakh Home Loan for 20 Years",
      description: "Direct monthly breakdown for ₹50L housing loan benchmark.",
      href: "/home-loan-emi/50-lakh-20-years",
      badge: "Popular Scenario",
    },
    {
      title: "General EMI Calculator",
      description: "Generic loan calculator with customizable terms.",
      href: "/emi-calculator",
    },
    {
      title: "Loan Hub",
      description: "Overview of all debt and EMI tools for Indian borrowers.",
      href: "/loans",
    },
    {
      title: "SIP Calculator",
      description: "Plan mutual fund investments to offset mortgage interest.",
      href: "/sip-calculator",
    },
  ];

  return (
    <EMICalculatorView
      calculatorType="home-loan-emi"
      title="Home Loan EMI Calculator"
      badge="Housing Loan"
      description="Estimate your monthly mortgage payments based on current Indian banking EBLR benchmarks. Review yearly tax-deductible principal breakdowns and interest sensitivity."
      initialPrincipal={5000000}
      initialAnnualRate={benchmark.defaultRate}
      initialTenureYears={20}
      minPrincipal={500000}
      maxPrincipal={100000000}
      principalStep={100000}
      principalPresets={[
        { label: "₹25 Lakh", value: 2500000 },
        { label: "₹40 Lakh", value: 4000000 },
        { label: "₹50 Lakh", value: 5000000 },
        { label: "₹75 Lakh", value: 7500000 },
        { label: "₹1 Crore", value: 10000000 },
      ]}
      minRate={6.5}
      maxRate={15}
      rateStep={0.05}
      benchmarkNote={`SBI EBLR Benchmark: ${benchmark.defaultRate}%`}
      asOfDate={benchmark.verifiedAt}
      minTenureYears={5}
      maxTenureYears={30}
      tenurePresets={[
        { label: "10 Years", years: 10 },
        { label: "15 Years", years: 15 },
        { label: "20 Years", years: 20 },
        { label: "25 Years", years: 25 },
        { label: "30 Years", years: 30 },
      ]}
      breadcrumbs={[
        { label: "Loans", href: "/loans" },
        { label: "Home Loan EMI Calculator", href: "/home-loan-emi-calculator" },
      ]}
      faqs={faqs}
      relatedLinks={relatedLinks}
    />
  );
}

import React from "react";
import type { Metadata } from "next";
import { EMICalculatorView } from "@/components/calculators/EMICalculatorView";
import { BENCHMARK_RATES } from "@/data/rates/benchmarks";

export const metadata: Metadata = {
  title: "Personal Loan EMI Calculator - Monthly Payment & Interest Schedule",
  description:
    "Calculate your personal loan monthly EMI, total interest burden, and amortization schedule. Compare short vs long tenures with typical Indian bank interest rates.",
  alternates: {
    canonical: "/personal-loan-emi-calculator",
  },
  openGraph: {
    title: "Personal Loan EMI Calculator - Monthly Payment & Interest Schedule",
    description:
      "Accurate personal loan EMI calculator with instant amortization schedules and rate sensitivity.",
    url: "https://fincalcindia.com/personal-loan-emi-calculator",
  },
};

export default function PersonalLoanEMICalculatorPage() {
  const benchmark = BENCHMARK_RATES.personalLoan;

  const faqs = [
    {
      question: "How are personal loan interest rates determined in India?",
      answer:
        "Because personal loans are unsecured (requiring no collateral), lenders evaluate your monthly net salary, employer reputation (Category A/B corporates), debt-to-income ratio, and your CIBIL score (ideally 750+). Prime borrowers typically receive rates between 10.5% and 13%, while higher-risk applicants may see rates above 18%.",
    },
    {
      question: "Are personal loan interest rates fixed or floating?",
      answer:
        "Most commercial banks and NBFCs in India sanction personal loans on a fixed interest rate basis for the entire duration (typically 1 to 5 years). A few institutions offer floating-rate variants.",
    },
    {
      question: "Can I prepay or foreclose a personal loan early?",
      answer:
        "Unlike floating-rate home loans, banks often levy a foreclosure charge (typically 2% to 5% plus GST on the outstanding principal balance) if a fixed-rate personal loan is closed ahead of tenure, or require a lock-in period of 6 to 12 months before prepayment is allowed.",
    },
    {
      question: "What is the maximum tenure for an Indian personal loan?",
      answer:
        "Standard personal loan tenures range from 12 months (1 year) to 60 months (5 years). A small number of public and private sector banks offer extended tenures up to 7 years (84 months) for high-salary executives or government employees.",
    },
  ];

  const relatedLinks = [
    {
      title: "5 Lakh Personal Loan for 3 Years",
      description: "Direct monthly repayment breakdown for standard ₹5L borrowing.",
      href: "/personal-loan-emi/5-lakh-3-years",
      badge: "Popular Scenario",
    },
    {
      title: "Car Loan EMI",
      description: "Vehicle loan repayment options.",
      href: "/car-loan-emi-calculator",
    },
    {
      title: "General EMI Calculator",
      description: "Generic loan calculator with flexible inputs.",
      href: "/emi-calculator",
    },
    {
      title: "Loan Hub",
      description: "Browse all loan calculators.",
      href: "/loans",
    },
  ];

  return (
    <EMICalculatorView
      calculatorType="personal-loan-emi"
      title="Personal Loan EMI Calculator"
      badge="Unsecured Loan"
      description="Plan your unsecured personal loan installments. Analyze how 1 to 5 year tenures and bank interest rates influence your monthly budget and overall debt interest."
      initialPrincipal={500000}
      initialAnnualRate={benchmark.defaultRate}
      initialTenureYears={3}
      minPrincipal={25000}
      maxPrincipal={4000000}
      principalStep={25000}
      principalPresets={[
        { label: "₹1 Lakh", value: 100000 },
        { label: "₹2 Lakh", value: 200000 },
        { label: "₹3 Lakh", value: 300000 },
        { label: "₹5 Lakh", value: 500000 },
        { label: "₹10 Lakh", value: 1000000 },
      ]}
      minRate={9.5}
      maxRate={28}
      rateStep={0.1}
      benchmarkNote={`Typical Benchmark: ${benchmark.defaultRate}%`}
      asOfDate={benchmark.verifiedAt}
      minTenureYears={1}
      maxTenureYears={7}
      tenurePresets={[
        { label: "1 Year", years: 1 },
        { label: "2 Years", years: 2 },
        { label: "3 Years", years: 3 },
        { label: "4 Years", years: 4 },
        { label: "5 Years", years: 5 },
      ]}
      breadcrumbs={[
        { label: "Loans", href: "/loans" },
        { label: "Personal Loan EMI Calculator", href: "/personal-loan-emi-calculator" },
      ]}
      faqs={faqs}
      relatedLinks={relatedLinks}
    />
  );
}

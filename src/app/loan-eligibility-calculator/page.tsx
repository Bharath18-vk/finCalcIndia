import React from "react";
import { Metadata } from "next";
import { LoanEligibilityView } from "@/components/calculators/LoanEligibilityView";
import { BENCHMARK_RATES } from "@/data/rates/benchmarks";
import { FAQItem } from "@/components/ui/FAQSection";

export const metadata: Metadata = {
  title: "Home Loan Eligibility Calculator - Borrowing Power by Salary",
  description:
    "Calculate your maximum home loan and personal loan eligibility based on monthly take-home salary, existing EMIs, and standard Indian bank FOIR ratios.",
  alternates: {
    canonical: "/loan-eligibility-calculator",
  },
  openGraph: {
    title: "Loan Eligibility Calculator - Check Borrowing Power by Income",
    description:
      "Estimate how much loan you qualify for using standard banking FOIR guidelines across 5 to 30 year repayment terms.",
    url: "/loan-eligibility-calculator",
    type: "website",
  },
};

export default function LoanEligibilityPage() {
  const benchmark = BENCHMARK_RATES.homeLoan || {
    defaultRate: 8.5,
    verifiedAt: "2024-10-01",
  };

  const faqs: FAQItem[] = [
    {
      question: "What is FOIR and how do banks use it to calculate loan eligibility?",
      answer:
        "FOIR stands for Fixed Obligation to Income Ratio. It is the percentage of your net monthly income that banks allow you to allocate towards total loan EMIs. Most Indian banks cap FOIR at 40% to 55% to ensure you have enough remaining income for living expenses.",
    },
    {
      question: "How can I increase my loan eligibility?",
      answer:
        "You can increase your loan eligibility by: 1) Adding a working co-applicant (spouse or parent), 2) Choosing a longer repayment tenure (up to 30 years), 3) Paying off existing credit card debt or personal loans, and 4) Maintaining a CIBIL score of 750+ to qualify for lower interest rates.",
    },
    {
      question: "Does existing credit card debt reduce my loan borrowing capacity?",
      answer:
        "Yes. Banks factor in all active debt commitments, including personal loans, car loans, and credit card minimum dues, when determining your available monthly EMI capacity.",
    },
    {
      question: "What minimum CIBIL score is required for maximum loan eligibility?",
      answer:
        "A credit score of 750 or higher is generally considered prime by Indian lenders, qualifying you for maximum sanctioned loan-to-value ratios and the most competitive benchmark interest rates.",
    },
  ];

  const relatedLinks = [
    {
      title: "Home Loan EMI Calculator",
      description: "Estimate monthly installments on your eligible loan sanction.",
      href: "/home-loan-emi-calculator",
      badge: "Housing Loan",
    },
    {
      title: "Loan Prepayment Calculator",
      description: "See how early prepayments save interest and shorten tenure.",
      href: "/loan-prepayment-calculator",
      badge: "Debt Reduction",
    },
    {
      title: "Loan Amortization Schedule",
      description: "Inspect month-by-month principal and interest breakdown.",
      href: "/amortization-calculator",
    },
    {
      title: "Loan Hub",
      description: "All loan calculators, borrowing power, and amortization tools.",
      href: "/loans",
    },
  ];

  return (
    <LoanEligibilityView
      title="Loan Eligibility Calculator"
      badge="Borrowing Capacity"
      description="Determine your maximum borrowing power, allowable debt obligations, and monthly repayment limits based on your take-home salary and standard bank FOIR ratios."
      initialIncome={100000}
      initialExistingEMIs={10000}
      initialAnnualRate={benchmark.defaultRate}
      initialTenureYears={20}
      initialFOIR={50}
      benchmarkNote={`Floating Home Loan Benchmark: ${benchmark.defaultRate}%`}
      asOfDate={benchmark.verifiedAt}
      breadcrumbs={[
        { label: "Loan Calculators", href: "/loans" },
        { label: "Loan Eligibility Calculator", href: "/loan-eligibility-calculator" },
      ]}
      faqs={faqs}
      relatedLinks={relatedLinks}
    />
  );
}

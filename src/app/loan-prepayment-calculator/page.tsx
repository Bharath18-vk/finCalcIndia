import React from "react";
import { Metadata } from "next";
import { LoanPrepaymentView } from "@/components/calculators/LoanPrepaymentView";
import { BENCHMARK_RATES } from "@/data/rates/benchmarks";
import { FAQItem } from "@/components/ui/FAQSection";

export const metadata: Metadata = {
  title: "Home Loan Prepayment Calculator - Tenure Reduction & Interest Savings",
  description:
    "Calculate how partial lump-sum prepayments, extra monthly EMIs, and annual bonus prepayments reduce your home loan tenure and save lakhs in compound interest.",
  alternates: {
    canonical: "/loan-prepayment-calculator",
  },
  openGraph: {
    title: "Home Loan Prepayment Calculator - Compare Tenure vs EMI Reduction",
    description:
      "Find out exactly how many years you can shave off your home loan and calculate total interest savings under RBI zero-penalty prepayment guidelines.",
    url: "/loan-prepayment-calculator",
    type: "website",
  },
};

export default function LoanPrepaymentPage() {
  const benchmark = BENCHMARK_RATES.homeLoan || {
    defaultRate: 8.5,
    verifiedAt: "2024-10-01",
  };

  const faqs: FAQItem[] = [
    {
      question: "Are there any penalties for prepaying a home loan in India?",
      answer:
        "No. Under Reserve Bank of India (RBI) regulations, commercial banks, housing finance companies (HFCs), and NBFCs cannot charge any foreclosure charges or prepayment penalties on individual floating-rate home loans.",
    },
    {
      question: "Which is better: reducing loan tenure or reducing monthly EMI?",
      answer:
        "Reducing tenure is almost always mathematically superior. By keeping your monthly EMI the same, your loan is paid off years earlier, eliminating dozens of compound interest cycles and maximizing total interest savings.",
    },
    {
      question: "When is the best time during the loan tenure to make prepayments?",
      answer:
        "Prepaying in the initial 1 to 7 years of a long-term loan produces the highest financial savings because interest constitutes the majority of your early EMI installments. Prepayments directly reduce the principal balance on which all future interest is calculated.",
    },
    {
      question: "How does paying 1 extra EMI per year affect a 20-year home loan?",
      answer:
        "Paying just 1 extra EMI each year (or increasing your regular monthly EMI by ~8.5%) can shave approximately 4 to 5 years off a standard 20-year home loan and save substantial interest.",
    },
  ];

  const relatedLinks = [
    {
      title: "Home Loan EMI Calculator",
      description: "Calculate standard monthly payments and initial amortization.",
      href: "/home-loan-emi-calculator",
      badge: "Housing Loan",
    },
    {
      title: "Loan Amortization Schedule",
      description: "View month-by-month and year-by-year reducing balance schedules.",
      href: "/amortization-calculator",
      badge: "Amortization",
    },
    {
      title: "Loan Eligibility Calculator",
      description: "Estimate maximum borrowing power based on net salary.",
      href: "/loan-eligibility-calculator",
    },
    {
      title: "Loan Hub",
      description: "All loan repayment, eligibility, and debt reduction calculators.",
      href: "/loans",
    },
  ];

  return (
    <LoanPrepaymentView
      title="Loan Prepayment Calculator"
      badge="Debt Reduction"
      description="Discover how extra monthly installments, lump-sum part-payments, or annual bonus prepayments can eliminate years from your debt and save lakhs of rupees in compound interest."
      initialPrincipal={3000000}
      initialAnnualRate={benchmark.defaultRate}
      initialTenureYears={20}
      benchmarkNote={`Floating Home Loan Benchmark: ${benchmark.defaultRate}%`}
      asOfDate={benchmark.verifiedAt}
      breadcrumbs={[
        { label: "Loan Calculators", href: "/loans" },
        { label: "Loan Prepayment Calculator", href: "/loan-prepayment-calculator" },
      ]}
      faqs={faqs}
      relatedLinks={relatedLinks}
    />
  );
}

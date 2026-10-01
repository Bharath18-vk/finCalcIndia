import React from "react";
import type { Metadata } from "next";
import { EMICalculatorView } from "@/components/calculators/EMICalculatorView";
import { BENCHMARK_RATES } from "@/data/rates/benchmarks";

export const metadata: Metadata = {
  title: "EMI Calculator - Loan Equated Monthly Installment & Amortization",
  description:
    "Free online EMI calculator for loans in India. Calculate monthly EMI, total interest payable, and full year-by-year amortization schedule formatted in Indian Rupees.",
  alternates: {
    canonical: "/emi-calculator",
  },
  openGraph: {
    title: "EMI Calculator - Loan Equated Monthly Installment & Amortization",
    description:
      "Calculate monthly EMI, total interest payable, and complete repayment amortization schedule formatted in Indian Rupees.",
    url: "https://fincalcindia.com/emi-calculator",
  },
};

export default function EMICalculatorPage() {
  const benchmark = BENCHMARK_RATES.homeLoan;

  const faqs = [
    {
      question: "What is an Equated Monthly Installment (EMI)?",
      answer:
        "An EMI (Equated Monthly Installment) is a fixed monthly payment made by a borrower to a lender on a specified calendar date each month. It combines both principal repayment and accrued interest, structured so the loan clears entirely by the end of the tenure.",
    },
    {
      question: "How does loan tenure affect my total interest payout?",
      answer:
        "A longer loan tenure lowers your monthly EMI burden, making repayment easier on a monthly cash-flow basis. However, because interest accrues over more months, the total interest paid to the lender increases dramatically. A shorter tenure increases monthly EMI but significantly cuts lifetime interest.",
    },
    {
      question: "Does this EMI calculator use the reducing balance method?",
      answer:
        "Yes. Standard Indian commercial banks and NBFCs compute EMIs using the reducing balance method. Interest for each monthly cycle is calculated solely on the outstanding principal balance, not the original sanctioned loan amount.",
    },
    {
      question: "Can I prepay my loan to reduce EMI or tenure?",
      answer:
        "Under Reserve Bank of India (RBI) guidelines, individual floating-rate retail loans (such as home loans) attract zero prepayment or foreclosure penalties. Prepaying principal directly reduces your outstanding balance, reducing either your ongoing EMI or the remaining tenure.",
    },
  ];

  const relatedLinks = [
    {
      title: "Home Loan EMI",
      description: "Mortgage amortization with current EBLR/RLLR benchmark rates.",
      href: "/home-loan-emi-calculator",
      badge: "8.50%",
    },
    {
      title: "Personal Loan EMI",
      description: "Unsecured loan installment planning and sensitivity analysis.",
      href: "/personal-loan-emi-calculator",
      badge: "11.0%",
    },
    {
      title: "Car Loan EMI",
      description: "Auto loan repayment schedule for new and used vehicles.",
      href: "/car-loan-emi-calculator",
      badge: "8.85%",
    },
    {
      title: "50 Lakh Home Loan for 20 Years",
      description: "Specific benchmark mortgage scenario with full schedule.",
      href: "/home-loan-emi/50-lakh-20-years",
    },
    {
      title: "5 Lakh Personal Loan for 3 Years",
      description: "Pre-computed personal loan monthly repayment and breakdown.",
      href: "/personal-loan-emi/5-lakh-3-years",
    },
    {
      title: "Loan Hub",
      description: "Explore all borrowing and debt amortization calculators.",
      href: "/loans",
    },
  ];

  return (
    <EMICalculatorView
      calculatorType="emi"
      title="EMI Calculator"
      badge="All Loans"
      description="Calculate your equated monthly installment, total interest burden, and download or review your complete yearly repayment amortization schedule."
      initialPrincipal={1000000}
      initialAnnualRate={9.5}
      initialTenureYears={5}
      minPrincipal={10000}
      maxPrincipal={100000000}
      principalPresets={[
        { label: "₹2 Lakh", value: 200000 },
        { label: "₹5 Lakh", value: 500000 },
        { label: "₹10 Lakh", value: 1000000 },
        { label: "₹25 Lakh", value: 2500000 },
        { label: "₹50 Lakh", value: 5000000 },
      ]}
      minRate={1}
      maxRate={30}
      rateStep={0.1}
      benchmarkNote="Standard Banking Benchmark"
      asOfDate={benchmark.verifiedAt}
      minTenureYears={1}
      maxTenureYears={30}
      tenurePresets={[
        { label: "1 Year", years: 1 },
        { label: "3 Years", years: 3 },
        { label: "5 Years", years: 5 },
        { label: "10 Years", years: 10 },
        { label: "20 Years", years: 20 },
      ]}
      breadcrumbs={[
        { label: "Loans", href: "/loans" },
        { label: "EMI Calculator", href: "/emi-calculator" },
      ]}
      faqs={faqs}
      relatedLinks={relatedLinks}
    />
  );
}

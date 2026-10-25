import React from "react";
import type { Metadata } from "next";
import { EMICalculatorView } from "@/components/calculators/EMICalculatorView";
import { EMIContent } from "@/components/calculators/content/EMIContent";
import { BENCHMARK_RATES } from "@/data/rates/benchmarks";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateSoftwareSchema } from "@/lib/seo/schema";

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
    url: "https://fincalcindia.in/emi-calculator",
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
      question: "Does this EMI calculator use the reducing balance method or flat rate?",
      answer:
        "Yes, our calculator strictly uses the reducing balance method mandated by the Reserve Bank of India (RBI) for commercial banks and NBFCs. Interest for each monthly installment is calculated solely on the outstanding principal balance, not the original sanctioned amount.",
    },
    {
      question: "What is the difference between reducing balance and flat interest rate?",
      answer:
        "In a flat rate loan, interest is calculated on the entire initial principal across all years, regardless of how much you have already repaid. An 8.00% flat rate on a 5-year loan is equivalent to an effective reducing balance rate of ~14.5% to 15.0%. Always ensure your bank quotes the effective reducing rate.",
    },
    {
      question: "Can I prepay my loan to reduce EMI or tenure without penalty?",
      answer:
        "Under Reserve Bank of India (RBI) directives, individual floating-rate retail loans (such as home loans) attract zero prepayment or foreclosure penalties. Prepaying principal directly reduces your outstanding balance, allowing you to choose between lowering your ongoing monthly EMI or shortening your remaining tenure.",
    },
    {
      question: "How does RBI Repo Rate changes affect my floating rate EMI?",
      answer:
        "Floating rate loans in India are linked to an External Benchmark Lending Rate (EBLR), typically the RBI Repo Rate. When the RBI adjusts the repo rate, banks automatically revise their lending benchmark. By default, most lenders adjust the remaining loan tenure rather than changing the monthly EMI, though borrowers can request an EMI reset.",
    },
    {
      question: "What happens if I make one extra EMI payment every year?",
      answer:
        "Paying just 1 extra EMI every calendar year directly towards the principal on a 20-year home loan reduces your total tenure by roughly 4 to 4.5 years and eliminates up to 20% of your total lifetime interest burden, saving lakhs of rupees.",
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

  const jsonLd = generateSoftwareSchema({
    name: "EMI Calculator - Loan Equated Monthly Installment & Amortization",
    description:
      "Free online EMI calculator for loans in India. Calculate monthly EMI, total interest payable, and full year-by-year amortization schedule formatted in Indian Rupees.",
    url: "/emi-calculator",
    applicationCategory: "FinanceApplication",
    featureList: [
      "Reducing balance EMI computation matching Indian banking standards",
      "Principal vs interest breakdown with interactive sliders",
      "Comprehensive year-by-year and month-by-month amortization schedule",
      "Rate sensitivity matrix across loan tenures from 1 to 30 years",
      "Shareable URL calculation links",
      "Printable and PDF-ready loan report",
    ],
  });

  return (
    <>
      <JsonLd data={jsonLd} />
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
        explainerContent={<EMIContent />}
      />
    </>
  );
}

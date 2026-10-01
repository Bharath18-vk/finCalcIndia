import React from "react";
import type { Metadata } from "next";
import { EMICalculatorView } from "@/components/calculators/EMICalculatorView";
import { BENCHMARK_RATES } from "@/data/rates/benchmarks";

export const metadata: Metadata = {
  title: "Car Loan EMI Calculator - Auto Loan Monthly Payment & Amortization",
  description:
    "Calculate your new or used car loan EMI. Compare 3, 5, and 7-year auto loan tenures, total interest outgo, and monthly repayment schedules.",
  alternates: {
    canonical: "/car-loan-emi-calculator",
  },
  openGraph: {
    title: "Car Loan EMI Calculator - Auto Loan Monthly Payment & Amortization",
    description:
      "Calculate car loan EMIs, interest cost, and amortization schedule with current auto loan interest rates.",
    url: "https://fincalcindia.com/car-loan-emi-calculator",
  },
};

export default function CarLoanEMICalculatorPage() {
  const benchmark = BENCHMARK_RATES.carLoan;

  const faqs = [
    {
      question: "What is the standard on-road loan financing percentage for cars in India?",
      answer:
        "Most Indian commercial banks (such as SBI, HDFC, and ICICI) finance 85% to 90% of the ex-showroom or on-road price of a new car. A down payment of 10% to 15% is typically required from the buyer, though select lenders offer 100% on-road financing for select prime corporate employees.",
    },
    {
      question: "Are new car loan interest rates lower than used car loans?",
      answer:
        "Yes. New car loans typically offer lower interest rates (benchmarked between 8.75% and 9.5% p.a.), while used/pre-owned car loans carry higher rates (often 12% to 16% p.a.) due to vehicle depreciation and valuation risk.",
    },
    {
      question: "What is the most popular tenure for a car loan in India?",
      answer:
        "A 5-year (60 months) or 7-year (84 months) tenure is the most common choice. A 5-year tenure strikes a balance between manageable monthly installments and vehicle depreciation.",
    },
    {
      question: "Can I make part-prepayments on an auto loan?",
      answer:
        "Many banks allow part-prepayments after an initial lock-in period of 6 months, though some fixed-rate auto loans may charge a nominal prepayment fee (typically 1% to 3% plus GST on the prepaid amount). Check with your lender before finalizing your agreement.",
    },
  ];

  const relatedLinks = [
    {
      title: "8 Lakh Car Loan for 5 Years",
      description: "Pre-calculated monthly EMI and amortization for a ₹8 Lakh auto loan over 5 years.",
      href: "/car-loan-emi/8-lakh-5-years",
      badge: "Popular Scenario",
    },
    {
      title: "Personal Loan EMI",
      description: "Alternative financing without vehicle hypothecation.",
      href: "/personal-loan-emi-calculator",
    },
    {
      title: "General EMI Calculator",
      description: "Standard reducing balance installment calculator.",
      href: "/emi-calculator",
    },
    {
      title: "Loan Hub",
      description: "All loan and debt calculators.",
      href: "/loans",
    },
  ];

  return (
    <EMICalculatorView
      calculatorType="car-loan-emi"
      title="Car Loan EMI Calculator"
      badge="Auto Loan"
      description="Estimate your monthly automobile loan payment, total interest outlay, and full repayment schedule across 1 to 7 year financing options."
      initialPrincipal={800000}
      initialAnnualRate={benchmark.defaultRate}
      initialTenureYears={5}
      minPrincipal={50000}
      maxPrincipal={15000000}
      principalStep={25000}
      principalPresets={[
        { label: "₹5 Lakh", value: 500000 },
        { label: "₹8 Lakh", value: 800000 },
        { label: "₹12 Lakh", value: 1200000 },
        { label: "₹18 Lakh", value: 1800000 },
        { label: "₹25 Lakh", value: 2500000 },
      ]}
      minRate={7.5}
      maxRate={18}
      rateStep={0.05}
      benchmarkNote={`Auto Loan Benchmark: ${benchmark.defaultRate}%`}
      asOfDate={benchmark.verifiedAt}
      minTenureYears={1}
      maxTenureYears={7}
      tenurePresets={[
        { label: "3 Years", years: 3 },
        { label: "4 Years", years: 4 },
        { label: "5 Years", years: 5 },
        { label: "7 Years", years: 7 },
      ]}
      breadcrumbs={[
        { label: "Loans", href: "/loans" },
        { label: "Car Loan EMI Calculator", href: "/car-loan-emi-calculator" },
      ]}
      faqs={faqs}
      relatedLinks={relatedLinks}
    />
  );
}

import React from "react";
import { Metadata } from "next";
import { EPFCalculatorView } from "@/components/calculators/EPFCalculatorView";
import { BENCHMARK_RATES } from "@/data/rates/benchmarks";
import { FAQItem } from "@/components/ui/FAQSection";

export const metadata: Metadata = {
  title: "EPF Calculator - Employees' Provident Fund Maturity & Interest Calculator India",
  description:
    "Calculate your EPF maturity balance, employee (12%) and employer (3.67%) contributions, and official EPFO 8.25% compound interest with annual salary hike projections.",
  alternates: {
    canonical: "/epf-calculator",
  },
  openGraph: {
    title: "EPF Calculator - Employees' Provident Fund Maturity Calculator India",
    description:
      "Accurate Indian EPF calculator based on official EPFO 8.25% interest rate, monthly running balance accrual, and 58-year superannuation rules.",
    url: "/epf-calculator",
    type: "website",
  },
};

export default function EPFCalculatorPage() {
  const benchmark = BENCHMARK_RATES.epf || {
    defaultRate: 8.25,
    verifiedAt: "2024-10-01",
  };

  const faqs: FAQItem[] = [
    {
      question: "How is EPF interest calculated and credited?",
      answer:
        "Interest is calculated at the end of each month on the running closing balance of your EPF account using the annual rate notified by EPFO (currently 8.25% p.a.). However, the accumulated interest is officially credited to your member passbook once a year at the end of the financial year on March 31st.",
    },
    {
      question: "How is employer contribution split between EPF and EPS?",
      answer:
        "Your employer contributes 12% of your Basic Salary + DA. Out of this 12%, 8.33% (subject to a statutory wage ceiling cap of ₹1,250 per month based on ₹15,000 basic salary) is allocated to the Employees' Pension Scheme (EPS-95), and the remaining 3.67% (plus any excess over ₹1,250) is credited to your EPF balance.",
    },
    {
      question: "Is EPF withdrawal completely tax-free?",
      answer:
        "EPF withdrawal is 100% tax-free if you have completed 5 or more continuous years of service. If you withdraw before completing 5 years, the entire employer contribution and interest earned become taxable as salary income, and TDS is deducted under Section 192A.",
    },
    {
      question: "What is the new tax rule on EPF contributions above ₹2.5 Lakhs?",
      answer:
        "Under Section 10(11) and 10(12), interest earned on an employee's annual EPF contribution exceeding ₹2,50,000 in a financial year (or ₹5,00,000 where no employer contribution exists) is taxable under 'Income from Other Sources'. EPFO maintains a separate non-taxable and taxable ledger in your passbook.",
    },
  ];

  const relatedLinks = [
    {
      title: "Salary In-Hand Calculator",
      description: "See how your monthly 12% EPF deduction impacts take-home pay.",
      href: "/salary-calculator",
      badge: "Take-Home Pay",
    },
    {
      title: "PPF Calculator",
      description: "Compare statutory EPF benefits against 15-year voluntary Public Provident Fund.",
      href: "/ppf-calculator",
      badge: "Tax-Free Savings",
    },
    {
      title: "NPS Calculator",
      description: "Calculate your complementary National Pension System retirement wealth.",
      href: "/nps-calculator",
      badge: "Pension Planning",
    },
  ];

  return (
    <EPFCalculatorView
      title="EPF Calculator: Employees' Provident Fund Maturity & Interest"
      description="Calculate your accumulated EPF retirement corpus at age 58. Models 12% employee share, 3.67% employer EPF allocation, annual salary increments, and the official 8.25% EPFO interest rate."
      initialMonthlyBasic={35000}
      initialCurrentAge={25}
      initialRetirementAge={58}
      initialIncrementRate={5.0}
      initialInterestRate={benchmark.defaultRate}
      benchmarkNote="8.25% Official EPFO Rate"
      asOfDate={benchmark.verifiedAt}
      breadcrumbs={[
        { label: "Savings", href: "/savings" },
        { label: "EPF Calculator", href: "/epf-calculator" },
      ]}
      faqs={faqs}
      relatedLinks={relatedLinks}
    />
  );
}

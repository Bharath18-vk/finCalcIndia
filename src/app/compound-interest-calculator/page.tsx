import React from "react";
import { Metadata } from "next";
import { CompoundInterestCalculatorView } from "@/components/calculators/CompoundInterestCalculatorView";
import { FAQItem } from "@/components/ui/FAQSection";

export const metadata: Metadata = {
  title: "Compound Interest Calculator - Annual, Quarterly & Monthly Compounding",
  description:
    "Calculate compound interest and maturity amounts across annual, half-yearly, quarterly, monthly, and daily frequencies. Compare against simple interest to see compounding power.",
  alternates: {
    canonical: "/compound-interest-calculator",
  },
  openGraph: {
    title: "Compound Interest Calculator - Compounding Frequency Comparison",
    description:
      "See how interest on interest compounds across daily, monthly, quarterly, and annual frequencies with full amortization schedules.",
    url: "/compound-interest-calculator",
    type: "website",
  },
};

export default function CompoundInterestCalculatorPage() {
  const faqs: FAQItem[] = [
    {
      question: "What is compound interest and how does it work?",
      answer:
        "Compound interest is interest calculated on both the initial principal and the accumulated interest from preceding periods. Because interest earned is reinvested, your money grows exponentially rather than linearly.",
    },
    {
      question: "How does compounding frequency affect my returns?",
      answer:
        "The more frequently interest is compounded (e.g. daily or monthly vs annually), the higher your effective annual yield (APY). For example, at a 10% nominal rate, annual compounding yields 10.0%, while monthly compounding yields an effective 10.47% p.a.",
    },
    {
      question: "What compounding frequency do Indian banks use?",
      answer:
        "Indian commercial banks compound Fixed Deposits (FD) and Recurring Deposits (RD) QUARTERLY by standard RBI convention. Savings bank account interest is calculated on a daily closing balance basis and credited quarterly.",
    },
    {
      question: "What is the Rule of 72 in compound interest?",
      answer:
        "The Rule of 72 estimates how many years it takes to double your money at a given annual rate: Years to double ≈ 72 / Annual Interest Rate. For example, at 12% annual return, your money doubles in approximately 72 / 12 = 6 years.",
    },
  ];

  const relatedLinks = [
    {
      title: "Fixed Deposit (FD) Calculator",
      description: "Indian bank term deposit calculator with quarterly compounding.",
      href: "/fd-calculator",
      badge: "Bank FD",
    },
    {
      title: "CAGR Calculator",
      description: "Calculate the compound annual growth rate of any multi-year return.",
      href: "/cagr-calculator",
      badge: "CAGR",
    },
    {
      title: "Lumpsum Calculator",
      description: "Estimate one-time mutual fund wealth generation.",
      href: "/lumpsum-calculator",
    },
    {
      title: "Investment Hub",
      description: "All compounding, investment, and wealth planning tools.",
      href: "/investments",
    },
  ];

  return (
    <CompoundInterestCalculatorView
      title="Compound Interest Calculator"
      badge="Compounding Power"
      description="Calculate maturity amounts, total compound interest, and effective annual yields (APY) across annual, semi-annual, quarterly, monthly, and daily compounding frequencies."
      initialPrincipal={100000}
      initialAnnualRate={8.0}
      initialTenureYears={5}
      initialFrequency="quarterly"
      breadcrumbs={[
        { label: "Investment Calculators", href: "/investments" },
        { label: "Compound Interest Calculator", href: "/compound-interest-calculator" },
      ]}
      faqs={faqs}
      relatedLinks={relatedLinks}
    />
  );
}

import React from "react";
import { Metadata } from "next";
import { NPSCalculatorView } from "@/components/calculators/NPSCalculatorView";
import { BENCHMARK_RATES } from "@/data/rates/benchmarks";
import { FAQItem } from "@/components/ui/FAQSection";

export const metadata: Metadata = {
  title: "NPS Calculator - National Pension System Tier-1 Pension & Corpus Calculator",
  description:
    "Calculate your National Pension System (NPS) retirement corpus, 60% tax-free lump sum payout, and estimated monthly pension from mandatory 40% annuity reinvestment.",
  alternates: {
    canonical: "/nps-calculator",
  },
  openGraph: {
    title: "NPS Calculator - National Pension System Pension Calculator",
    description:
      "Accurate Indian NPS calculator modeling monthly contributions, compounding returns, lump sum tax exemption, and annuity monthly pension.",
    url: "/nps-calculator",
    type: "website",
  },
};

export default function NPSCalculatorPage() {
  const benchmark = BENCHMARK_RATES.nps || {
    defaultRate: 10.0,
    verifiedAt: "2024-10-01",
  };

  const faqs: FAQItem[] = [
    {
      question: "How does the National Pension System (NPS) work?",
      answer:
        "NPS is a voluntary, long-term retirement savings scheme regulated by PFRDA. Your contributions are invested across Asset Classes: Equity (E), Corporate Bonds (C), and Government Securities (G). At age 60, up to 60% of the corpus can be withdrawn tax-free, and at least 40% must be used to purchase a lifelong monthly annuity.",
    },
    {
      question: "What are the tax benefits of investing in NPS Tier-1?",
      answer:
        "NPS offers three distinct tax benefits: 1) Section 80CCD(1) deduction up to ₹1.5 Lakh (within Section 80C limit), 2) Section 80CCD(1B) dedicated deduction of an additional ₹50,000 exclusively for NPS, and 3) Section 80CCD(2) employer contribution deduction up to 10% (14% for government) of Basic + DA, available in both New and Old Tax Regimes.",
    },
    {
      question: "Is NPS lump sum withdrawal taxable at retirement?",
      answer:
        "No. Under Section 10(12A) of the Income Tax Act, the 60% lump sum withdrawal at superannuation (age 60) is 100% tax-exempt. The remaining 40% used to purchase an annuity is also exempt from initial tax, but monthly pension payments from the annuity are taxable as regular income in the year received.",
    },
    {
      question: "What is the difference between the All Citizen Model and the Corporate Sector Model?",
      answer:
        "Under the All Citizen Model, individual citizens (aged 18–70) contribute on their own behalf and claim deductions under Section 80CCD(1) and 80CCD(1B). Under the Corporate Sector Model, the employer adopts NPS for employees and can co-contribute under Section 80CCD(2) up to 10% of Basic + DA with no ₹1.5L cap. Both models follow PFRDA exit rules with a ₹5 Lakh threshold for 100% lump sum at superannuation and ₹2.5 Lakh for premature exit, but superannuation age under the Corporate Model is determined by employer service rules.",
    },
    {
      question: "What happens in the event of subscriber death before retirement?",
      answer:
        "In the unfortunate event of subscriber death prior to superannuation, 100% of accumulated pension wealth is paid to the registered nominee or legal heirs as a tax-free lump sum under Section 10(12A). Nominees also have the option to voluntarily utilize the corpus to purchase a monthly annuity pension.",
    },
  ];

  const relatedLinks = [
    {
      title: "EPF Calculator",
      description: "Compare your statutory provident fund growth alongside NPS.",
      href: "/epf-calculator",
      badge: "Retirement Savings",
    },
    {
      title: "PPF Calculator",
      description: "Evaluate 15-year risk-free sovereign public provident fund compounding.",
      href: "/ppf-calculator",
      badge: "Guaranteed Return",
    },
    {
      title: "Income Tax Calculator",
      description: "See how the extra ₹50,000 Section 80CCD(1B) deduction reduces tax.",
      href: "/income-tax-calculator",
      badge: "Tax Optimization",
    },
  ];

  return (
    <NPSCalculatorView
      title="NPS Calculator: National Pension System Tier-1 Corpus & Pension"
      description="Project your retirement wealth accumulation, tax-free lump sum payout, and estimated lifetime monthly annuity pension from monthly contributions into the National Pension System."
      initialMonthlyContribution={5000}
      initialCurrentAge={30}
      initialRetirementAge={60}
      initialReturnRate={benchmark.defaultRate}
      asOfDate={benchmark.verifiedAt}
      breadcrumbs={[
        { label: "Investments", href: "/investments" },
        { label: "NPS Calculator", href: "/nps-calculator" },
      ]}
      faqs={faqs}
      relatedLinks={relatedLinks}
    />
  );
}

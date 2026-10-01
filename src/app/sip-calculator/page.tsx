import React from "react";
import type { Metadata } from "next";
import { SIPCalculatorView } from "@/components/calculators/SIPCalculatorView";
import { BENCHMARK_RATES } from "@/data/rates/benchmarks";

export const metadata: Metadata = {
  title: "SIP Calculator - Mutual Fund Systematic Investment Plan Wealth Calculator",
  description:
    "Calculate mutual fund SIP returns with accurate monthly compounding and annuity-due conventions. See wealth gained, maturity value, and year-by-year growth in Indian Rupees.",
  alternates: {
    canonical: "/sip-calculator",
  },
  openGraph: {
    title: "SIP Calculator - Mutual Fund Systematic Investment Plan Wealth Calculator",
    description:
      "Simulate mutual fund wealth growth, growth multiples, and yearly portfolio progression with accurate monthly compounding.",
    url: "https://fincalcindia.in/sip-calculator",
  },
};

export default function SIPCalculatorPage() {
  const benchmark = BENCHMARK_RATES.sipReturn;

  const faqs = [
    {
      question: "What is a Systematic Investment Plan (SIP)?",
      answer:
        "A Systematic Investment Plan (SIP) is an investment vehicle provided by mutual funds in India that allows you to invest a fixed amount of money at regular monthly intervals into an equity, debt, or hybrid fund scheme.",
    },
    {
      question: "Why does this calculator use the Annuity Due convention?",
      answer:
        "In Indian mutual funds, your SIP installment is deducted and units are allotted at the beginning of each installment cycle. Consequently, your money begins generating returns immediately during that first month. The Annuity Due formula [FV = P × (((1+r)^n - 1) / r) × (1+r)] reflects this operational reality.",
    },
    {
      question: "Is 12% an appropriate expected return for Indian equity mutual funds?",
      answer:
        "Historically, broad Indian market indices like the Nifty 50 and BSE Sensex have delivered long-term multi-cycle returns in the 12% to 14% range. A 12% illustrative annual return assumption is commonly used as a planning baseline for long-term equity mutual fund modeling. Mutual fund returns are market-linked, non-linear, and neither guaranteed nor fixed by any fund house or regulatory body.",
    },
    {
      question: "How are mutual fund SIP gains taxed in India?",
      answer:
        "For equity mutual funds (under Budget 2024 tax rules), Long-Term Capital Gains (LTCG) on units held for more than 12 months are taxed at 12.5% on gains exceeding ₹1.25 Lakh per financial year. Short-Term Capital Gains (STCG) on units redeemed within 12 months are taxed at 20%. Note: Each monthly SIP installment has its own separate 1-year holding clock.",
    },
  ];

  const relatedLinks = [
    {
      title: "Step-Up SIP Calculator",
      description: "Model annual percentage increments to accelerate wealth accumulation.",
      href: "/step-up-sip-calculator",
      badge: "Compounding Bonus",
    },
    {
      title: "Lumpsum Calculator",
      description: "Compare one-time lump sum investing vs monthly SIPs.",
      href: "/lumpsum-calculator",
    },
    {
      title: "SIP of 5000/Month for 10 Years",
      description: "Detailed return breakdown for ₹5,000 monthly SIP over a 10-year horizon.",
      href: "/sip/5000-per-month-10-years",
      badge: "Scenario",
    },
    {
      title: "Investment Hub",
      description: "Overview of all mutual fund and investment calculators.",
      href: "/investments",
    },
  ];

  return (
    <SIPCalculatorView
      title="SIP Calculator"
      badge="Mutual Funds"
      description="Forecast your wealth accumulation through systematic mutual fund investments. Uses monthly compounding and transparent annuity-due conventions formatted natively in Lakhs and Crores."
      initialMonthlyInvestment={5000}
      initialAnnualRate={benchmark.defaultRate}
      initialTenureYears={10}
      benchmarkNote="12% Illustrative Annual Return Assumption"
      asOfDate={benchmark.verifiedAt}
      breadcrumbs={[
        { label: "Investments", href: "/investments" },
        { label: "SIP Calculator", href: "/sip-calculator" },
      ]}
      faqs={faqs}
      relatedLinks={relatedLinks}
    />
  );
}

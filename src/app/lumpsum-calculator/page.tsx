import React from "react";
import type { Metadata } from "next";
import { LumpsumCalculatorView } from "@/components/calculators/LumpsumCalculatorView";
import { BENCHMARK_RATES } from "@/data/rates/benchmarks";

export const metadata: Metadata = {
  title: "Lumpsum Calculator - One-Time Mutual Fund Return & Wealth Growth",
  description:
    "Calculate future value and returns on one-time lumpsum mutual fund investments. See holding period projections, rate sensitivity, and growth multiples in Indian Rupees.",
  alternates: {
    canonical: "/lumpsum-calculator",
  },
  openGraph: {
    title: "Lumpsum Calculator - One-Time Mutual Fund Return & Wealth Growth",
    description:
      "Estimate one-time mutual fund investment returns, wealth multiples, and holding period sensitivity.",
    url: "https://fincalcindia.com/lumpsum-calculator",
  },
};

export default function LumpsumCalculatorPage() {
  const benchmark = BENCHMARK_RATES.sipReturn;

  const faqs = [
    {
      question: "What is a lumpsum investment?",
      answer:
        "A lumpsum investment is a single, one-time deposit of capital into a financial instrument (such as an equity mutual fund, index fund, or exchange-traded fund) rather than spreading the contribution across monthly intervals.",
    },
    {
      question: "Which is better: Lumpsum or SIP?",
      answer:
        "Neither is universally superior; they serve different cash flows. If you have received a bonus, inheritance, or property sale proceeds, deploying via a lumpsum or Systematic Transfer Plan (STP) gets capital compounding immediately. If you earn a regular monthly salary, SIPs provide rupee-cost averaging and eliminate the stress of timing market peaks and troughs.",
    },
    {
      question: "What is the Rule of 72 in lumpsum investing?",
      answer:
        "The Rule of 72 is a quick mental math shortcut to estimate how many years it takes for your investment to double. Divide 72 by your expected annual return rate. At a 12% annual return, your money doubles approximately every 6 years (72 / 12 = 6).",
    },
    {
      question: "How does market volatility affect a lumpsum investment?",
      answer:
        "Lumpsum investments carry market entry timing risk in the short term. However, over horizons longer than 7 to 10 years, historical Indian equity data shows that the compounding benefits of time in the market tend to significantly outweigh the effects of initial entry timing.",
    },
  ];

  const relatedLinks = [
    {
      title: "10 Lakh Lumpsum for 10 Years",
      description: "Direct scenario projection for ₹10 Lakh corpus growth.",
      href: "/lumpsum/10-lakh-10-years",
      badge: "Popular Scenario",
    },
    {
      title: "SIP Calculator",
      description: "Model monthly disciplined systematic investing.",
      href: "/sip-calculator",
    },
    {
      title: "FD Calculator",
      description: "Compare equity lumpsum against guaranteed bank fixed deposits.",
      href: "/fd-calculator",
    },
    {
      title: "Investment Hub",
      description: "Explore all mutual fund calculators.",
      href: "/investments",
    },
  ];

  return (
    <LumpsumCalculatorView
      title="Lumpsum Calculator"
      badge="Equity & Mutual Funds"
      description="Estimate the long-term compounding growth of a one-time capital investment in mutual funds, index funds, or equities."
      initialInvestment={500000}
      initialAnnualRate={benchmark.defaultRate}
      initialTenureYears={10}
      breadcrumbs={[
        { label: "Investments", href: "/investments" },
        { label: "Lumpsum Calculator", href: "/lumpsum-calculator" },
      ]}
      faqs={faqs}
      relatedLinks={relatedLinks}
    />
  );
}

import React from "react";
import { Metadata } from "next";
import { CAGRCalculatorView } from "@/components/calculators/CAGRCalculatorView";
import { FAQItem } from "@/components/ui/FAQSection";

export const metadata: Metadata = {
  title: "CAGR Calculator - Compound Annual Growth Rate Calculator India",
  description:
    "Calculate the Compound Annual Growth Rate (CAGR) and absolute return of your mutual fund, equity, or real estate investment over any multi-year holding period.",
  alternates: {
    canonical: "/cagr-calculator",
  },
  openGraph: {
    title: "CAGR Calculator - Compound Annual Growth Rate Calculator",
    description:
      "Accurately compute annualized compound growth rate, total wealth gain, and investment multiple over 1 to 30 years.",
    url: "/cagr-calculator",
    type: "website",
  },
};

export default function CAGRCalculatorPage() {
  const faqs: FAQItem[] = [
    {
      question: "What is CAGR and how does it differ from absolute return?",
      answer:
        "Absolute return measures the raw percentage change between initial and final values without considering time. CAGR computes the smoothed annual compounded growth rate, allowing you to accurately compare investments held over different durations.",
    },
    {
      question: "What is the formula for CAGR?",
      answer:
        "CAGR = (Ending Value / Beginning Value)^(1 / Tenure in Years) - 1. For example, doubling an investment from ₹1 Lakh to ₹2 Lakh in 5 years equals (2)^(1/5) - 1 = 14.87% CAGR.",
    },
    {
      question: "When should I use XIRR instead of CAGR?",
      answer:
        "Use CAGR for one-time lumpsum investments where money is invested once and withdrawn once. For investments with multiple cash flows on different dates (such as monthly SIPs or SWP payouts), you must use XIRR (Extended Internal Rate of Return).",
    },
    {
      question: "Can CAGR be negative?",
      answer:
        "Yes. If your investment's ending value is lower than your initial capital, CAGR will be negative, representing your annualized compound loss.",
    },
  ];

  const relatedLinks = [
    {
      title: "Lumpsum Calculator",
      description: "Project future investment values at an expected CAGR.",
      href: "/lumpsum-calculator",
      badge: "One-Time",
    },
    {
      title: "Compound Interest Calculator",
      description: "Explore the impact of annual, quarterly, and monthly compounding.",
      href: "/compound-interest-calculator",
      badge: "Compounding",
    },
    {
      title: "SIP Calculator",
      description: "Model regular monthly mutual fund investments.",
      href: "/sip-calculator",
    },
    {
      title: "Investment Hub",
      description: "Overview of all equity, debt, and mutual fund calculators.",
      href: "/investments",
    },
  ];

  return (
    <CAGRCalculatorView
      title="CAGR Calculator"
      badge="Investment Metrics"
      description="Calculate the true annualized growth rate (CAGR), absolute return percentage, and capital multiple of any investment portfolio across multi-year holding periods."
      initialValue={100000}
      finalValue={200000}
      initialTenureYears={5}
      breadcrumbs={[
        { label: "Investment Calculators", href: "/investments" },
        { label: "CAGR Calculator", href: "/cagr-calculator" },
      ]}
      faqs={faqs}
      relatedLinks={relatedLinks}
    />
  );
}

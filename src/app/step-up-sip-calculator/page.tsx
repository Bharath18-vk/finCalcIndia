import React from "react";
import type { Metadata } from "next";
import { StepUpSIPCalculatorView } from "@/components/calculators/StepUpSIPCalculatorView";
import { BENCHMARK_RATES } from "@/data/rates/benchmarks";

export const metadata: Metadata = {
  title: "Step-Up SIP Calculator - Top-Up Mutual Fund Investment Calculator",
  description:
    "Calculate the power of increasing your mutual fund SIP annually. See side-by-side comparisons against a flat SIP, growth multipliers, and yearly investment progression.",
  alternates: {
    canonical: "/step-up-sip-calculator",
  },
  openGraph: {
    title: "Step-Up SIP Calculator - Top-Up Mutual Fund Investment Calculator",
    description:
      "Calculate how an annual top-up increases your mutual fund corpus compared to a flat SIP.",
    url: "https://fincalcindia.com/step-up-sip-calculator",
  },
};

export default function StepUpSIPCalculatorPage() {
  const benchmark = BENCHMARK_RATES.sipReturn;

  const faqs = [
    {
      question: "What is a Step-Up SIP (Top-Up SIP)?",
      answer:
        "A Step-Up SIP (also called Top-Up SIP) is a feature that automatically increases your monthly mutual fund installment by a fixed percentage (e.g. 10%) or fixed rupee amount once every year. This aligns your investments with annual salary increments and prevents lifestyle inflation from eating away your savings.",
    },
    {
      question: "Why does a 10% annual step-up make such a dramatic difference?",
      answer:
        "Because of compound interest and time. By stepping up your monthly contributions in line with career earnings growth, you invest significantly more capital during your peak earning years, while maintaining manageable contributions early in your career.",
    },
    {
      question: "Can I choose between a percentage step-up or a fixed amount?",
      answer:
        "Yes. Most Indian Asset Management Companies (AMCs) and platforms (like Zerodha Coin, Groww, and CAMS) allow you to specify either a percentage increase (e.g., +10% annually) or a fixed rupee top-up (e.g., +₹1,000 every year).",
    },
    {
      question: "Can I stop or pause the step-up if my income changes?",
      answer:
        "Yes. You can modify, pause, or cancel the top-up instruction on your mutual fund portal without terminating your underlying base SIP.",
    },
  ];

  const relatedLinks = [
    {
      title: "Step-Up SIP: 5000 + 10% for 15 Years",
      description: "Direct scenario breakdown for standard corporate career path.",
      href: "/step-up-sip/5000-per-month-10-percent-stepup-15-years",
      badge: "Popular Scenario",
    },
    {
      title: "SIP Calculator",
      description: "Standard constant monthly mutual fund SIP calculator.",
      href: "/sip-calculator",
    },
    {
      title: "Lumpsum Calculator",
      description: "One-time mutual fund investment compounding.",
      href: "/lumpsum-calculator",
    },
    {
      title: "Investment Hub",
      description: "All wealth and investment tools.",
      href: "/investments",
    },
  ];

  return (
    <StepUpSIPCalculatorView
      title="Step-Up SIP Calculator"
      badge="Top-Up Strategy"
      description="Calculate the exponential wealth compounding created by increasing your monthly mutual fund SIP contributions annually alongside your salary growth."
      initialMonthlyInvestment={5000}
      initialAnnualRate={benchmark.defaultRate}
      initialTenureYears={15}
      initialStepUpPercentage={10}
      breadcrumbs={[
        { label: "Investments", href: "/investments" },
        { label: "Step-Up SIP Calculator", href: "/step-up-sip-calculator" },
      ]}
      faqs={faqs}
      relatedLinks={relatedLinks}
    />
  );
}

import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, IndianRupee, TrendingUp, PiggyBank, ReceiptText } from "lucide-react";
import { formatINR } from "@/lib/formatters";

export const metadata: Metadata = {
  title: "FinCalc India - Fast, Accurate Indian Financial Calculators",
  description:
    "Free, fast, and mathematically accurate Indian financial calculators for Loans (EMI, Home, Personal, Car), Investments (SIP, Step-Up SIP, Lumpsum), and Fixed Deposits.",
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  const popularCalculators = [
    {
      title: "Income Tax Calculator",
      description: "Current AY 2026-27 & 2025-26 New vs Old Regime tax comparison with Section 87A rebate up to ₹60,000 and marginal relief.",
      href: "/income-tax-calculator",
      category: "Tax",
      badge: "AY 2026-27",
    },
    {
      title: "Salary Calculator (In-Hand)",
      description: "Convert annual CTC into take-home monthly salary with EPF, Professional Tax, and TDS deductions.",
      href: "/salary-calculator",
      category: "Salary",
      badge: "In-Hand Pay",
    },
    {
      title: "EMI Calculator",
      description: "Calculate equated monthly installments, total interest, and complete amortization schedule for any loan.",
      href: "/emi-calculator",
      category: "Loan",
      badge: "Most Popular",
    },
    {
      title: "Home Loan EMI",
      description: "Estimate housing loan EMIs, interest savings, and prepayments with current bank benchmarks.",
      href: "/home-loan-emi-calculator",
      category: "Loan",
    },
    {
      title: "SIP Calculator",
      description: "Simulate mutual fund wealth growth with monthly compounding and annuity-due conventions.",
      href: "/sip-calculator",
      category: "Investment",
      badge: "High Intent",
    },
    {
      title: "NPS Calculator",
      description: "Model Tier-1 corpus, tax-free lump sum withdrawal, and lifelong monthly pension annuity.",
      href: "/nps-calculator",
      category: "Retirement",
    },
    {
      title: "Step-Up SIP Calculator",
      description: "Compute the exponential compounding power of increasing your monthly investment by 10% each year.",
      href: "/step-up-sip-calculator",
      category: "Investment",
    },
    {
      title: "Fixed Deposit (FD)",
      description: "Accurate quarterly compounding maturity calculations matching official Indian commercial bank guidelines.",
      href: "/fd-calculator",
      category: "Savings",
    },
    {
      title: "EPF Calculator",
      description: "Calculate provident fund retirement corpus using the official 8.25% EPFO statutory rate.",
      href: "/epf-calculator",
      category: "Retirement",
      badge: "8.25% EPFO",
    },
  ];

  return (
    <div className="w-full space-y-12 py-10 sm:py-16">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <IndianRupee className="w-3.5 h-3.5" />
          <span>Engineered for Indian Financial Planning</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Clear, Fast & Mathematically Precise{" "}
          <span className="text-emerald-600">Financial Calculators</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Accurate calculations formatted in Indian Rupees (Lakhs & Crores). Transparent formulas, zero lag, and comprehensive amortization breakdowns.
        </p>

        {/* Quick Hub Navigation Cards */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <Link
            href="/loans"
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Calculator className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 group-hover:text-emerald-700">
              Loan Hub
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Home, Personal, Car & General EMI amortization.
            </p>
          </Link>

          <Link
            href="/investments"
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-700">
              Investment Hub
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              SIP, Step-Up SIP, SWP & wealth targets.
            </p>
          </Link>

          <Link
            href="/savings"
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <PiggyBank className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 group-hover:text-amber-700">
              Savings Hub
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Fixed Deposits, PPF, RD & guaranteed interest.
            </p>
          </Link>

          <Link
            href="/income-tax-calculator"
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ReceiptText className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 group-hover:text-purple-700">
              Tax & Salary
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Budget 2024 Tax, Take-Home Salary, HRA & NPS.
            </p>
          </Link>
        </div>
      </section>

      {/* Popular Calculators Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Featured Financial Calculators
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Select an instrument to calculate installments, interest, or wealth accumulation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularCalculators.map((calc) => (
            <Link
              key={calc.href}
              href={calc.href}
              className="group p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                    {calc.category}
                  </span>
                  {calc.badge && (
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {calc.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {calc.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {calc.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
                <span className="mr-1">Open Calculator</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Value Pillars Section */}
      <section className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-emerald-400">
                100% Client-Side Speed
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Calculations execute instantaneously in your browser. No server round-trips, no loading spinners, and zero tracking of your personal numbers.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-emerald-400">
                Indian Currency Grouping
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Formatted natively in Lakhs and Crores (e.g. {formatINR(10000000)}), matching how you think and budget in India.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-emerald-400">
                Verified Banking Conventions
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Formulas conform strictly to RBI guidelines, quarterly FD compounding rules, and mutual fund annuity-due standards.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

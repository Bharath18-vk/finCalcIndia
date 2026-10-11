import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  IndianRupee,
  TrendingUp,
  PiggyBank,
  ReceiptText,
  Binary,
  Percent,
  Dice5,
  Calendar,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { formatINR } from "@/lib/formatters";

export const metadata: Metadata = {
  title: "FinCalc India - Fast, Accurate Indian Financial & Math Calculators",
  description:
    "Free, fast, and mathematically accurate Indian calculators for Loans (EMI, Home, Personal, Car), Investments (SIP, Step-Up SIP, Lumpsum), Math & Stats (Percentage, Probability, LCM/GCD), and Government Savings (PPF, SSY, SCSS).",
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

  const mathCalculators = [
    {
      title: "Percentage Calculator",
      description: "Find percentages, percentage increase or decrease, and calculate base changes with step-by-step math.",
      href: "/percentage-calculator",
      category: "Arithmetic",
      badge: "High Intent",
    },
    {
      title: "Probability Calculator",
      description: "Analyze single events, complementary odds, independent intersections, and binomial distributions.",
      href: "/probability-calculator",
      category: "Statistics",
      badge: "Distributions",
    },
    {
      title: "LCM & GCD Calculator",
      description: "Find Least Common Multiple and Greatest Common Divisor for up to 10 numbers with prime factorization.",
      href: "/lcm-gcd-calculator",
      category: "Number Theory",
      badge: "Step-by-Step",
    },
    {
      title: "Simple Interest Calculator",
      description: "Calculate linear simple interest (I = P × R × T) with exact day-basis Indian commercial banking conventions.",
      href: "/simple-interest-calculator",
      category: "Commercial Math",
    },
    {
      title: "Average (Mean & Median)",
      description: "Compute Mean, Median, Mode, Range, geometric mean, and harmonic mean with step-by-step math.",
      href: "/average-calculator",
      category: "Statistics",
    },
    {
      title: "Discount & GST Calculator",
      description: "Compute single discounts, stacked double discounts, and final invoice prices with applicable GST rates.",
      href: "/discount-calculator",
      category: "Commercial Math",
    },
  ];

  const everydayAndGovtCalculators = [
    {
      title: "Age Calculator",
      description: "Exact chronological age in years, months, and days with astronomical calendar day borrowing and birthday countdown.",
      href: "/age-calculator",
      category: "Everyday",
      badge: "Astronomical",
    },
    {
      title: "BMI Calculator (Indian Standard)",
      description: "Body Mass Index assessment with official ICMR/API Asian-Indian cutoffs alongside WHO global criteria.",
      href: "/bmi-calculator",
      category: "Health",
      badge: "ICMR & WHO",
    },
    {
      title: "Tip & Split Bill Calculator",
      description: "Calculate restaurant tips, split bills across diners, and account for 5% or 18% restaurant GST in India.",
      href: "/tip-calculator",
      category: "Everyday",
    },
    {
      title: "Sukanya Samriddhi Yojana (SSY)",
      description: "Model 21-year sovereign-backed girl child savings at 8.2% p.a. with 100% tax-free EEE maturity.",
      href: "/ssy-calculator",
      category: "Government",
      badge: "8.20% Sovereign",
    },
    {
      title: "Senior Citizen Savings Scheme (SCSS)",
      description: "Calculate regular quarterly income with official 8.2% p.a. payout and Section 80TTB ₹50,000 tax deduction.",
      href: "/scss-calculator",
      category: "Government",
      badge: "Quarterly Payout",
    },
    {
      title: "Public Provident Fund (PPF)",
      description: "15 to 30 year government guaranteed tax-free wealth at 7.10% with EEE sovereign status.",
      href: "/ppf-calculator",
      category: "Government",
      badge: "EEE Sovereign",
    },
    {
      title: "GST Calculator India",
      description: "Add or remove GST with forward exclusive and reverse inclusive math across statutory 5%, 12%, 18%, 28% slabs.",
      href: "/gst-calculator",
      category: "Tax & Business",
      badge: "CBIC Slabs",
    },
    {
      title: "Inflation Calculator (CII)",
      description: "Measure future purchasing power loss and calculate capital gains indexation using official CBDT Cost Inflation Index table.",
      href: "/inflation-calculator",
      category: "Investment",
      badge: "CBDT CII",
    },
    {
      title: "Loan Comparison Calculator",
      description: "Compare two loans side-by-side with interest rate differentials, processing fees, and overall lifetime savings.",
      href: "/loan-comparison-calculator",
      category: "Loans",
      badge: "Side-by-Side",
    },
    {
      title: "Calorie & Macro Calculator",
      description: "Clinical Mifflin-St Jeor BMR, TDEE maintenance burn, and daily macro partition targets for Indian diets.",
      href: "/calorie-calculator",
      category: "Health",
      badge: "Mifflin-St Jeor",
    },
    {
      title: "NPS vs EPF Calculator",
      description: "Compare 8.25% sovereign EPF vs 10.5% market NPS, 60% lump-sum tax exemption, and Section 80CCD(1B) savings.",
      href: "/nps-vs-epf-calculator",
      category: "Retirement",
      badge: "Retirement Strategy",
    },
  ];

  return (
    <div className="w-full space-y-12 py-10 sm:py-16">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <IndianRupee className="w-3.5 h-3.5" />
          <span>Engineered for Indian Financial & Mathematical Planning</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Clear, Fast & Mathematically Precise{" "}
          <span className="text-emerald-600">Financial & Math Calculators</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Accurate calculations formatted natively in Indian Rupees, verified financial schedules, step-by-step
          math engines, and instant URL sharing.
        </p>

        {/* Quick Hub Navigation Cards */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
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
              FD, RD, PPF, SSY & SCSS savings.
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
              Budget Tax, Take-Home Pay, HRA & NPS.
            </p>
          </Link>

          <Link
            href="/math"
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-blue-500 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Binary className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 group-hover:text-indigo-700">
              Math & Stats Hub
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Probability, LCM/GCD, Percentage & Stats.
            </p>
          </Link>
        </div>
      </section>

      {/* Featured Financial Calculators Grid */}
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

      {/* Math & Statistics Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Binary className="w-5 h-5 text-blue-600" />
              Math & Statistics Calculators
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Step-by-step arithmetic, combinatorics, probabilities, and statistical analysis.
            </p>
          </div>
          <Link
            href="/math"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            <span>View All 11 Math Tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mathCalculators.map((calc) => (
            <Link
              key={calc.href}
              href={calc.href}
              className="group p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                    {calc.category}
                  </span>
                  {calc.badge && (
                    <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                      {calc.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {calc.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {calc.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end text-xs font-bold text-blue-700 group-hover:translate-x-1 transition-transform">
                <span className="mr-1">Open Calculator</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Everyday Tools & Government Schemes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              Everyday Tools & Sovereign Schemes
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Life utilities, health benchmarks, and Government of India small savings schemes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {everydayAndGovtCalculators.map((calc) => (
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
                Verified Standards & Rules
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Formulas conform strictly to RBI guidelines, quarterly FD compounding rules, ICMR Asian-Indian health metrics, and statutory Post Office saving rates.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

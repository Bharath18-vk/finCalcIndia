import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ArrowRight, Calculator, Home, Briefcase, Car } from "lucide-react";

export const metadata: Metadata = {
  title: "Loan & EMI Calculators India",
  description:
    "Comprehensive suite of Indian loan calculators: General EMI, Home Loan, Personal Loan, and Car Loan with complete amortization schedules.",
  alternates: {
    canonical: "/loans",
  },
};

export default function LoansHubPage() {
  const loanCalculators = [
    {
      title: "General EMI Calculator",
      description: "Calculate monthly installments and total interest for any personal or business loan.",
      href: "/emi-calculator",
      icon: Calculator,
      badge: "Standard",
    },
    {
      title: "Home Loan EMI Calculator",
      description: "Mortgage planning with benchmark EBLR interest rates and yearly principal/interest schedules.",
      href: "/home-loan-emi-calculator",
      icon: Home,
      badge: "Benchmark 8.50%",
    },
    {
      title: "Personal Loan EMI Calculator",
      description: "Evaluate short-to-medium term unsecured borrowing costs with rate sensitivity analysis.",
      href: "/personal-loan-emi-calculator",
      icon: Briefcase,
      badge: "Benchmark 11.0%",
    },
    {
      title: "Car Loan EMI Calculator",
      description: "Compute auto loan monthly installments and total interest burden for new and used vehicles.",
      href: "/car-loan-emi-calculator",
      icon: Car,
      badge: "Benchmark 8.85%",
    },
    {
      title: "Home Loan Prepayment Calculator",
      description: "Calculate how part-prepayments or extra EMIs eliminate loan tenure and save lakhs in interest.",
      href: "/loan-prepayment-calculator",
      icon: Calculator,
      badge: "Debt Reduction",
    },
    {
      title: "Loan Eligibility Calculator",
      description: "Determine your maximum eligible loan borrowing power based on take-home salary and FOIR limits.",
      href: "/loan-eligibility-calculator",
      icon: Home,
      badge: "Borrowing Power",
    },
    {
      title: "Loan Amortization Schedule Calculator",
      description: "Detailed month-by-month and year-by-year reducing balance loan repayment schedule.",
      href: "/amortization-calculator",
      icon: Calculator,
      badge: "Full Schedule",
    },
  ];

  const popularScenarios = [
    {
      title: "₹50 Lakh Home Loan for 20 Years",
      href: "/home-loan-emi/50-lakh-20-years",
      rate: "8.50%",
      approxEmi: "₹43,391",
    },
    {
      title: "₹5 Lakh Personal Loan for 3 Years",
      href: "/personal-loan-emi/5-lakh-3-years",
      rate: "11.00%",
      approxEmi: "₹16,369",
    },
    {
      title: "₹8 Lakh Car Loan for 5 Years",
      href: "/car-loan-emi/8-lakh-5-years",
      rate: "8.85%",
      approxEmi: "₹16,550",
    },
  ];

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Breadcrumbs items={[{ label: "Loan Calculators", href: "/loans" }]} />

      <header className="space-y-3 max-w-3xl">
        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
          Category Hub
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Loan & EMI Calculators
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Plan your borrowings with transparent reducing-balance formulas. Compare how loan tenures and floating interest rates impact your total interest outlay.
        </p>
      </header>

      {/* Core Calculators */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Core Loan Calculators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loanCalculators.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.href}
                href={c.href}
                className="group p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {c.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
                  <span className="mr-1">Open Calculator</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Specific Long-Tail Scenarios */}
      <section className="p-6 sm:p-8 bg-slate-900 text-white rounded-2xl space-y-5">
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-bold text-white">Popular Specific Scenarios</h2>
          <p className="text-xs text-slate-400">
            Pre-computed benchmarks based on representative retail bank rates.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {popularScenarios.map((sc) => (
            <Link
              key={sc.href}
              href={sc.href}
              className="p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-colors space-y-2 block"
            >
              <div className="text-xs font-bold text-emerald-400">{sc.title}</div>
              <div className="text-sm font-semibold text-white">
                EMI: {sc.approxEmi}{" "}
                <span className="text-xs text-slate-400 font-normal">(@ {sc.rate})</span>
              </div>
              <div className="text-[11px] text-slate-400 underline underline-offset-2">
                View Detailed Schedule &rarr;
              </div>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}

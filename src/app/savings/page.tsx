import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ArrowRight, PiggyBank, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Savings & Fixed Deposit Calculators India",
  description:
    "Indian guaranteed savings calculators: Fixed Deposit (FD) quarterly compounding, senior citizen interest rates, and APY comparisons.",
  alternates: {
    canonical: "/savings",
  },
};

export default function SavingsHubPage() {
  const savingsCalculators = [
    {
      title: "Fixed Deposit (FD) Calculator",
      description: "Quarterly compounding fixed deposit calculator with senior citizen slab support.",
      href: "/fd-calculator",
      icon: PiggyBank,
      badge: "Benchmark 6.80%",
    },
    {
      title: "Recurring Deposit (RD) Calculator",
      description: "Monthly savings calculator using official Indian banking quarterly compounding rules.",
      href: "/rd-calculator",
      icon: PiggyBank,
      badge: "Monthly Savings",
    },
    {
      title: "Public Provident Fund (PPF) Calculator",
      description: "Model 15 to 30 year government guaranteed tax-free wealth at 7.10% with EEE tax status.",
      href: "/ppf-calculator",
      icon: PiggyBank,
      badge: "EEE Sovereign",
    },
    {
      title: "Employees' Provident Fund (EPF)",
      description: "Estimate retirement corpus and monthly interest with official 8.25% EPFO statutory returns.",
      href: "/epf-calculator",
      icon: ShieldCheck,
      badge: "8.25% EPFO",
    },
    {
      title: "Gratuity Calculator",
      description: "Calculate statutory gratuity payout under Payment of Gratuity Act 1972 (15/26 formula).",
      href: "/gratuity-calculator",
      icon: ShieldCheck,
      badge: "Statutory",
    },
    {
      title: "HRA Exemption Calculator",
      description: "Calculate taxable vs exempt House Rent Allowance under Section 10(13A) and Rule 2A.",
      href: "/hra-calculator",
      icon: PiggyBank,
      badge: "Rule 2A",
    },
  ];

  const popularScenarios = [
    {
      title: "Interest on ₹5 Lakh FD for 5 Years",
      href: "/fd/5-lakh-5-years",
      rate: "6.80% (Quarterly)",
      maturity: "₹6,99,754",
    },
  ];

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Breadcrumbs items={[{ label: "Savings Calculators", href: "/savings" }]} />

      <header className="space-y-3 max-w-3xl">
        <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
          Category Hub
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Savings & Fixed Deposit Calculators
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Compute guaranteed returns, quarterly compounding interest, and statutory retirement savings adhering to official Indian regulatory frameworks.
        </p>
      </header>

      {/* Core Calculators */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Core Savings & Statutory Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savingsCalculators.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.href}
                href={c.href}
                className="group p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-amber-500 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {c.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end text-xs font-bold text-amber-700 group-hover:translate-x-1 transition-transform">
                  <span className="mr-1">Open Calculator</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Popular Scenarios */}
      <section className="p-6 sm:p-8 bg-slate-900 text-white rounded-2xl space-y-5">
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-bold text-white">Popular Deposit Scenarios</h2>
          <p className="text-xs text-slate-400">
            Calculated using standard quarterly compounding rules.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {popularScenarios.map((sc) => (
            <Link
              key={sc.href}
              href={sc.href}
              className="p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-colors space-y-2 block"
            >
              <div className="text-xs font-bold text-amber-400">{sc.title}</div>
              <div className="text-sm font-semibold text-white">
                Maturity: {sc.maturity}{" "}
                <span className="text-xs text-slate-400 font-normal">(@ {sc.rate})</span>
              </div>
              <div className="text-[11px] text-slate-400 underline underline-offset-2">
                View Interest Breakdown &rarr;
              </div>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}

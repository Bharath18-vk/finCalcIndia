import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ArrowRight, TrendingUp, Sparkles, PieChart } from "lucide-react";

export const metadata: Metadata = {
  title: "Investment & Mutual Fund Calculators India",
  description:
    "Indian investment tools: SIP, Step-Up SIP, and Lumpsum calculators with monthly compounding simulations and growth comparisons.",
  alternates: {
    canonical: "/investments",
  },
};

export default function InvestmentsHubPage() {
  const investmentCalculators = [
    {
      title: "SIP Calculator",
      description: "Standard monthly compounding mutual fund systematic investment planning tool.",
      href: "/sip-calculator",
      icon: TrendingUp,
      badge: "Benchmark 12%",
    },
    {
      title: "Step-Up SIP Calculator",
      description: "Analyze how an annual percentage contribution hike accelerates long-term wealth accumulation.",
      href: "/step-up-sip-calculator",
      icon: Sparkles,
      badge: "Top-Up Strategy",
    },
    {
      title: "Lumpsum Calculator",
      description: "Calculate the long-term future value of a one-time equity or mutual fund investment.",
      href: "/lumpsum-calculator",
      icon: PieChart,
      badge: "One-Time",
    },
    {
      title: "SWP Calculator",
      description: "Model regular monthly cash withdrawals and capital longevity from your mutual fund corpus.",
      href: "/swp-calculator",
      icon: TrendingUp,
      badge: "Regular Income",
    },
    {
      title: "CAGR Calculator",
      description: "Compute the compound annual growth rate and absolute returns of any multi-year investment.",
      href: "/cagr-calculator",
      icon: PieChart,
      badge: "Return Metric",
    },
    {
      title: "Compound Interest Calculator",
      description: "Analyze the exponential power of annual, quarterly, and monthly compounding.",
      href: "/compound-interest-calculator",
      icon: Sparkles,
      badge: "Compounding",
    },
    {
      title: "NPS Calculator",
      description: "Model National Pension System Tier-1 wealth accumulation, 60% lump sum, and lifelong pension annuity.",
      href: "/nps-calculator",
      icon: TrendingUp,
      badge: "Retirement",
    },
  ];

  const popularScenarios = [
    {
      title: "SIP of ₹5,000/Month for 10 Years",
      href: "/sip/5000-per-month-10-years",
      expectedReturn: "12%",
      approxValue: "₹11.62 Lakh",
    },
    {
      title: "Step-Up SIP: ₹5,000 + 10% Annual Step-Up for 15 Years",
      href: "/step-up-sip/5000-per-month-10-percent-stepup-15-years",
      expectedReturn: "12%",
      approxValue: "₹52.09 Lakh",
    },
    {
      title: "₹10 Lakh Lumpsum for 10 Years",
      href: "/lumpsum/10-lakh-10-years",
      expectedReturn: "12%",
      approxValue: "₹31.06 Lakh",
    },
  ];

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Breadcrumbs items={[{ label: "Investment Calculators", href: "/investments" }]} />

      <header className="space-y-3 max-w-3xl">
        <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
          Category Hub
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Investment & Mutual Fund Calculators
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Forecast your wealth creation using precise annuity-due compounding formulas. Evaluate SIP discipline versus lumpsum investing.
        </p>
      </header>

      {/* Core Calculators */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Core Investment Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {investmentCalculators.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.href}
                href={c.href}
                className="group p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {c.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end text-xs font-bold text-blue-700 group-hover:translate-x-1 transition-transform">
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
          <h2 className="text-lg sm:text-xl font-bold text-white">Featured Investment Scenarios</h2>
          <p className="text-xs text-slate-400">
            Illustrative compounding scenarios computed at 12% long-term historical equity CAGR.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {popularScenarios.map((sc) => (
            <Link
              key={sc.href}
              href={sc.href}
              className="p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-colors space-y-2 block"
            >
              <div className="text-xs font-bold text-blue-400">{sc.title}</div>
              <div className="text-sm font-semibold text-white">
                Expected Value: {sc.approxValue}{" "}
                <span className="text-xs text-slate-400 font-normal">(@ {sc.expectedReturn})</span>
              </div>
              <div className="text-[11px] text-slate-400 underline underline-offset-2">
                View Growth Breakdown &rarr;
              </div>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}

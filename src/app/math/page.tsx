import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  ArrowRight,
  Percent,
  Divide,
  Coins,
  Tag,
  BarChart2,
  Scale,
  Dice5,
  Sigma,
  Radical,
  GitFork,
  Binary,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Math & Statistics Calculators Online | FinCalc India",
  description:
    "Free, fast, and mathematically accurate online calculators for Percentage, Probability, Fractions, Standard Deviation, LCM/GCD, Permutations, and Simple Interest.",
  alternates: {
    canonical: "/math",
  },
};

export default function MathHubPage() {
  const mathCalculators = [
    {
      title: "Percentage Calculator",
      description: "Compute percentage of a number, percentage increase/decrease, and relative percentage changes.",
      href: "/percentage-calculator",
      icon: Percent,
      badge: "Most Popular",
      category: "Arithmetic",
    },
    {
      title: "Fraction Calculator",
      description: "Add, subtract, multiply, and divide fractions with automatic GCD reduction and mixed number support.",
      href: "/fraction-calculator",
      icon: Divide,
      badge: "Step-by-Step",
      category: "Arithmetic",
    },
    {
      title: "Simple Interest Calculator",
      description: "Calculate linear simple interest (I = P × R × T) with exact day-basis Indian commercial banking conventions.",
      href: "/simple-interest-calculator",
      icon: Coins,
      badge: "Linear Return",
      category: "Commercial Math",
    },
    {
      title: "Discount Calculator",
      description: "Compute single discounts, stacked double discounts, and GST post-discount invoice prices.",
      href: "/discount-calculator",
      icon: Tag,
      badge: "Retail & GST",
      category: "Commercial Math",
    },
    {
      title: "Average Calculator",
      description: "Determine Mean, Median, Mode, Range, geometric mean, and harmonic mean with step-by-step math.",
      href: "/average-calculator",
      icon: BarChart2,
      badge: "Summary Stats",
      category: "Statistics",
    },
    {
      title: "Ratio Calculator",
      description: "Simplify ratios, solve equivalent proportions (A:B = C:D), and divide quantities proportionally.",
      href: "/ratio-calculator",
      icon: Scale,
      badge: "Proportions",
      category: "Arithmetic",
    },
    {
      title: "Probability Calculator",
      description: "Analyze single events, complementary odds, two-event intersections/unions, and binomial series distributions.",
      href: "/probability-calculator",
      icon: Dice5,
      badge: "Distributions",
      category: "Statistics",
    },
    {
      title: "Standard Deviation Calculator",
      description: "Calculate sample and population standard deviation, variance, standard error, and 68-95-99.7 empirical rule.",
      href: "/standard-deviation-calculator",
      icon: Sigma,
      badge: "Bessel's Correction",
      category: "Statistics",
    },
    {
      title: "Square Root & Exponent Calculator",
      description: "Compute principal square roots, cube roots, nth roots, simplified radical radicals (k√r), and exponent powers.",
      href: "/square-root-calculator",
      icon: Radical,
      badge: "Radical Simplifier",
      category: "Algebra",
    },
    {
      title: "Permutations & Combinations (nPr & nCr)",
      description: "Factorial arrangements, order-sensitive permutations, and order-insensitive combinations with steps.",
      href: "/permutation-combination-calculator",
      icon: GitFork,
      badge: "Combinatorics",
      category: "Discrete Math",
    },
    {
      title: "LCM and GCD / HCF Calculator",
      description: "Find the Least Common Multiple and Greatest Common Divisor for 2 to 10 numbers using prime factorizations.",
      href: "/lcm-gcd-calculator",
      icon: Binary,
      badge: "Prime Factorization",
      category: "Number Theory",
    },
  ];

  return (
    <div className="w-full space-y-10 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Math & Statistics Calculators", href: "/math" },
        ]}
      />

      {/* Header */}
      <section className="space-y-4 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
          <span>Mathematical & Statistical Toolsuite</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Math & Statistics <span className="text-blue-600">Calculators</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          High-performance, pure client-side mathematical calculators built with verified algorithms, step-by-step
          solutions, and instant URL state sharing.
        </p>
      </section>

      {/* Grid of Calculators */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xl font-bold text-slate-900">All Math & Statistics Tools (11)</h2>
          <span className="text-xs font-semibold text-slate-500">100% Free & Client-Side</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mathCalculators.map((calc) => {
            const Icon = calc.icon;
            return (
              <Link
                key={calc.href}
                href={calc.href}
                className="group p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    {calc.badge && (
                      <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                        {calc.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      {calc.category}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {calc.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {calc.description}
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

      {/* Feature Pillars */}
      <section className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Why Use FinCalc India Math Engines?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div className="space-y-2">
            <h3 className="font-bold text-blue-400">Step-by-Step Transparency</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Every engine generates intermediate derivations, formula breakdowns, and variable legends so you understand
              exactly how every answer is reached.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-blue-400">Precision Floating Point</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Handles rational fraction simplification with greatest common divisors, BigInt-compatible combinatorics, and
              astronomical calendar day borrowing.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-blue-400">Instant URL Sharing</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              All input parameters automatically serialize to your address bar, making it effortless to copy and share
              reproducible mathematical solutions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

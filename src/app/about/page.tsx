import React from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CheckCircle2, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about FinCalc India, our editorial standards, mathematical methodology, and commitment to privacy and financial accuracy.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: "About Us", href: "/about" }]} />

      <header className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About FinCalc India
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          FinCalc India is an independent financial technology resource built specifically for Indian consumers, borrowers, and investors.
        </p>
      </header>

      <section className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
        <h2 className="text-xl font-bold text-slate-900">Our Mission</h2>
        <p>
          Financial decision-making in India is often complicated by opaque loan amortizations, hidden charges, and confusing terminology. FinCalc India was created to provide free, instantaneous, and mathematically rigorous calculators that operate completely client-side in your web browser.
        </p>
        <p>
          Whether calculating the monthly EMI on a housing loan, analyzing the impact of an annual 10% step-up on a mutual fund SIP, or checking quarterly compounding on a bank fixed deposit, our tools provide clarity without requiring account registrations, mobile numbers, or lead-generation forms.
        </p>
      </section>

      <section className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
        <h2 className="text-xl font-bold text-slate-900">Core Engineering Principles</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Mathematical Transparency</span>
            </div>
            <p className="text-xs text-slate-600">
              Every formula is published openly on the page. We document compounding frequency, timing conventions (such as annuity-due for SIPs), and edge case handling.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Complete Data Privacy</span>
            </div>
            <p className="text-xs text-slate-600">
              All financial inputs run entirely in your local browser JavaScript engine. We never store, transmit, or monetize your loan amounts, salaries, or investment amounts.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3 text-sm text-slate-700 leading-relaxed">
        <h2 className="text-xl font-bold text-slate-900">Editorial & Benchmark Standards</h2>
        <p>
          Benchmark interest rates (such as SBI EBLR or RBI repo rates) cited across our calculators are sourced from publicly available schedules published by regulated financial institutions. We document the verification date (&quot;as of&quot; date) and always provide editable input fields so users can test any custom interest rate.
        </p>
      </section>
    </article>
  );
}

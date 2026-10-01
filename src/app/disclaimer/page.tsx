import React from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AlertTriangle, BookOpen, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Disclaimer & Mathematical Methodology",
  description:
    "Comprehensive financial disclaimer and transparency documentation for FinCalc India calculation engines.",
  alternates: {
    canonical: "/disclaimer",
  },
};

export default function DisclaimerPage() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: "Disclaimer", href: "/disclaimer" }]} />

      <header className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Disclaimer & Calculation Conventions
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Important disclosures regarding financial assumptions, regulatory standards, and calculation formulas.
        </p>
      </header>

      <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-900 text-sm space-y-2">
        <div className="flex items-center gap-2 font-bold text-base">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
          <span>General Regulatory Notice</span>
        </div>
        <p className="leading-relaxed">
          FinCalc India is an independent mathematical tool provider. We are not a bank, non-banking financial company (NBFC), mutual fund distributor, or SEBI-registered investment advisor. Our tools provide illustrative estimates based solely on user inputs.
        </p>
      </div>

      <section className="space-y-4 text-sm text-slate-700 leading-relaxed">
        <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
          <BookOpen className="w-5 h-5 text-emerald-600" />
          <h2>Standard Calculation Conventions</h2>
        </div>

        <div className="space-y-3 pt-1">
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
            <h3 className="font-bold text-slate-900">Loan & EMI Calculations</h3>
            <p className="text-xs text-slate-600">
              Loan installments are computed using the reducing balance method according to the formula: <code>EMI = [P x r x (1 + r)^n] / [(1 + r)^n - 1]</code>. Daily interest accrual or advance EMI deductions practiced by certain commercial lenders may cause minor differences with bank statements.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
            <h3 className="font-bold text-slate-900">SIP & Mutual Fund Calculations</h3>
            <p className="text-xs text-slate-600">
              SIP projections assume monthly compounding with installments credited at the beginning of each cycle (annuity-due). Mutual fund investments are subject to market volatility. Past returns do not guarantee future returns.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
            <h3 className="font-bold text-slate-900">Fixed Deposit (FD) Compounding</h3>
            <p className="text-xs text-slate-600">
              Fixed deposits are compounded quarterly as per Reserve Bank of India (RBI) conventions for cumulative term deposits. Senior citizen rates reflect the standard 0.50% p.a. premium prevalent in public and private commercial banks.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3 text-sm text-slate-700 leading-relaxed">
        <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
          <ShieldAlert className="w-5 h-5 text-emerald-600" />
          <h2>No Personalized Financial Advice</h2>
        </div>
        <p>
          You should consult a certified financial planner, chartered accountant, or banking relationship manager before entering into major loan commitments, prepayments, or long-term investment decisions.
        </p>
      </section>
    </article>
  );
}

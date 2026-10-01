import React from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions of using FinCalc India financial calculation tools.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: "Terms of Service", href: "/terms" }]} />

      <header className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs text-slate-500">Effective Date: October 2024</p>
      </header>

      <section className="space-y-4 text-sm text-slate-700 leading-relaxed">
        <h2 className="text-lg font-bold text-slate-900">1. Acceptance of Terms</h2>
        <p>
          By accessing and using FinCalc India, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, you may refrain from using our tools.
        </p>

        <h2 className="text-lg font-bold text-slate-900 pt-3">2. Informational and Educational Purpose Only</h2>
        <p>
          All calculators, schedules, tables, and content provided on this website are for general informational and educational purposes only. They do not constitute certified financial, tax, legal, or investment advice.
        </p>

        <h2 className="text-lg font-bold text-slate-900 pt-3">3. No Warranties</h2>
        <p>
          While we make every effort to ensure the accuracy of formulas and mathematical algorithms, calculations are provided &quot;as is&quot; without any warranty of completeness or accuracy. Financial institutions may compute daily balance interest or rounding differently than standard monthly amortization schedules.
        </p>

        <h2 className="text-lg font-bold text-slate-900 pt-3">4. Limitation of Liability</h2>
        <p>
          In no event shall FinCalc India, its developers, or affiliates be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use this website.
        </p>
      </section>
    </article>
  );
}

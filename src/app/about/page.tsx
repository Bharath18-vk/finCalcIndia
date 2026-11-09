import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  CheckCircle2,
  Shield,
  Award,
  BookOpen,
  Scale,
  Building,
  Mail,
  ArrowRight,
  UserCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us - Editorial Standards & Financial Integrity | FinCalc India",
  description:
    "Learn about FinCalc India, our editorial standards, mathematical verification methodology, Chartered Accountant review process, and commitment to privacy and transparency.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Breadcrumbs items={[{ label: "About Us", href: "/about" }]} />

      <header className="space-y-4">
        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
          Transparency & Integrity
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About FinCalc India
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          FinCalc India is an independent, non-partisan financial technology resource built specifically for Indian consumers, borrowers, and investors.
        </p>
      </header>

      {/* Mission Section */}
      <section className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-6 h-6 text-emerald-600" />
          Our Mission
        </h2>
        <p>
          Financial decision-making in India is frequently complicated by opaque loan amortizations, hidden processing charges, and confusing statutory jargon. FinCalc India was created to provide <strong>100% free, mathematically rigorous, and completely private</strong> calculators that operate client-side in your web browser.
        </p>
        <p>
          Whether analyzing the exact lifetime interest savings of an annual home loan prepayment, modeling a 10% annual step-up on mutual fund SIPs, verifying quarterly compounding on bank fixed deposits according to RBI directives, or evaluating New vs. Old Tax Regime deductions under the latest Union Budget, our calculators provide absolute transparency without requiring mobile numbers, emails, or personal financial registrations.
        </p>
      </section>

      {/* Editorial & Leadership Team */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Editorial Leadership & Financial Governance
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Our calculators and guides are researched, built, and continuously reviewed by experienced software engineers and licensed finance professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lead 1 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base border border-emerald-300">
                AM
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Arjun Mehta</h3>
                <p className="text-xs text-emerald-700 font-semibold">
                  Founder & Lead Financial Technologist
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Arjun is a software engineer and quantitative modeling specialist with over 8 years of experience building financial systems and algorithmic models. He oversees the mathematical accuracy of our loan amortization engines, SIP compounding algorithms, and client-side web architecture.
            </p>
            <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100">
              Focus: Banking Algorithms, Quantitative Compounding, Client-Side Privacy
            </div>
          </div>

          {/* Lead 2 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-base border border-blue-300">
                PS
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Priya Sundaram, FCA</h3>
                <p className="text-xs text-blue-700 font-semibold">
                  Chartered Accountant & Direct Tax Consultant
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Priya is a Fellow Chartered Accountant with extensive experience in Indian direct taxation, corporate payroll structuring, and personal tax planning. She reviews all Income Tax, HRA, EPF, Gratuity, and Capital Gains algorithms to ensure strict alignment with CBDT circulars and statutory amendments.
            </p>
            <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100">
              Focus: Income Tax Act, Section 87A Marginal Relief, Budget 2024 Provisions
            </div>
          </div>
        </div>
      </section>

      {/* Verification Methodology */}
      <section className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-emerald-600" />
          Our Mathematical Verification Process
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          Every calculator on FinCalc India undergoes strict three-tier verification before being deployed:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Tier 1: Regulatory Standard
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Calculations strictly adopt formulas published by the <strong>Reserve Bank of India (RBI)</strong>, <strong>Indian Banks&apos; Association (IBA)</strong>, and <strong>Ministry of Finance</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Tier 2: Unit Test Suites
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our engines are backed by automated test suites (500+ test fixtures) running boundary and precision tests across rupee figures and interest rates.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Tier 3: Periodic Rate Audits
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Benchmark rates (such as SBI EBLR, EPFO 8.25%, PPF 7.1%, and SCSS 8.2%) are audited every calendar quarter against official gazettes.
            </p>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          Core Engineering & Ethical Principles
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Full Formula Transparency</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every formula is published openly on the corresponding tool page. We openly document compounding conventions (e.g., quarterly for bank FDs, annuity-due for SIPs) and edge-case boundary conditions.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span>100% Client-Side Privacy</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              All financial inputs run solely inside your web browser&apos;s local memory. We never transmit, record, or monetize your salary, loan balances, or investment amounts.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Scale className="w-5 h-5 text-emerald-600" />
              <span>Editorial Independence</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              We do not accept payments to artificially skew loan calculations or promote specific financial products. Our calculations are strictly objective and mathematically honest.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Building className="w-5 h-5 text-emerald-600" />
              <span>Headquartered in Bengaluru</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              FinCalc India is developed and operated out of Bengaluru, Karnataka, India. We actively track updates from Indian financial regulators and the Union Budget.
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="p-6 sm:p-8 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-emerald-950">
            Have Feedback or Noticed a Formula Discrepancy?
          </h3>
          <p className="text-xs sm:text-sm text-emerald-900">
            We welcome inquiries from financial planners, chartered accountants, and everyday users.
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs whitespace-nowrap"
        >
          Contact Our Team <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </section>
    </article>
  );
}

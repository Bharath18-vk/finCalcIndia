import React from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Mail, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the FinCalc India team for calculator feedback, corrections, or inquiries.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: "Contact Us", href: "/contact" }]} />

      <header className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Contact FinCalc India
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          We welcome feedback from financial planners, software engineers, and everyday users.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Email Inquiries</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            For technical feedback, mathematical verification, bug reports, or rate updates, reach out to our team at:
          </p>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-xs font-semibold text-emerald-800">
            contact@fincalcindia.com
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Reporting Errors</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            If you notice a discrepancy in any calculation formula or regulatory assumption, please include the URL, the values entered, and the expected figure with source citation.
          </p>
          <p className="text-[11px] text-slate-400">
            We aim to review mathematical inquiries within 2 business days.
          </p>
        </div>
      </div>
    </article>
  );
}

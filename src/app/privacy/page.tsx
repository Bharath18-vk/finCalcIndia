import React from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "FinCalc India Privacy Policy: How we protect user privacy by executing financial calculations entirely in the user's browser.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: "Privacy Policy", href: "/privacy" }]} />

      <header className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-500">Last updated: October 2024</p>
      </header>

      <section className="space-y-4 text-sm text-slate-700 leading-relaxed">
        <h2 className="text-lg font-bold text-slate-900">1. Client-Side Calculation Guarantee</h2>
        <p>
          FinCalc India operates on a client-side architecture. When you enter financial numbers—such as loan principal, monthly SIP amount, annual interest rate, or tenure—into any calculator on this site, that data is processed solely within your browser&apos;s local memory (JavaScript).
        </p>
        <p className="font-semibold text-emerald-800">
          We do not transmit, log, store, or sell the financial figures you type into our calculators.
        </p>

        <h2 className="text-lg font-bold text-slate-900 pt-3">2. Web Analytics</h2>
        <p>
          We use aggregated analytics tools (such as Google Analytics 4) to monitor website performance and understand which calculators are most utilized. Our analytics code explicitly forbids sending financial amounts, account numbers, or personally identifiable information (PII). We only track events such as page visits and generic calculator usage counts.
        </p>

        <h2 className="text-lg font-bold text-slate-900 pt-3">3. Cookies and Advertising</h2>
        <p>
          Third-party vendors, including Google AdSense, may use cookies to serve ads based on prior visits to our website or other websites. Users may opt out of personalized advertising by visiting Google Ad Settings.
        </p>

        <h2 className="text-lg font-bold text-slate-900 pt-3">4. External Links</h2>
        <p>
          Our pages may contain links to external reference websites (such as the Reserve Bank of India or Association of Mutual Funds in India). We are not responsible for the privacy practices of external domains.
        </p>

        <h2 className="text-lg font-bold text-slate-900 pt-3">5. Contact Information</h2>
        <p>
          If you have questions regarding our privacy practices, please contact us at contact@fincalcindia.in.
        </p>
      </section>
    </article>
  );
}

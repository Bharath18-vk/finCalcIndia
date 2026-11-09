import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Shield, Lock, Eye, Cookie, FileText, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - Data Protection & Cookie Policy | FinCalc India",
  description:
    "FinCalc India Privacy Policy: How we protect user privacy by executing financial calculations client-side in the browser, our cookie policy, and Google AdSense advertising disclosures.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Breadcrumbs items={[{ label: "Privacy Policy", href: "/privacy" }]} />

      <header className="space-y-4">
        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
          Legal & Compliance
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-500">
          Last Updated: November 2026 | Effective Date: November 2024
        </p>
      </header>

      {/* Client-Side Privacy Guarantee Callout */}
      <div className="p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 space-y-2 text-emerald-950">
        <div className="flex items-center gap-2 font-bold text-base sm:text-lg">
          <Shield className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>Our Core Promise: Complete Client-Side Calculation Privacy</span>
        </div>
        <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
          FinCalc India executes mathematical calculations entirely in your local browser using client-side JavaScript. When you enter personal financial figures—such as your loan principal, monthly salary, investment amount, or tax deductions—that data <strong>never leaves your device</strong>. We do not store, log, transmit, or monetize your financial inputs.
        </p>
      </div>

      <section className="space-y-6 text-sm text-slate-700 leading-relaxed bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        {/* Section 1 */}
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            1. Information We Do Not Collect
          </h2>
          <p>
            Unlike typical lead-generation financial portals, FinCalc India does not require account registrations, phone numbers, Aadhaar or PAN details, or bank account verifications. All calculator parameters typed into input fields and sliders remain volatile within your browser memory and are cleared when you refresh or close the tab.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-600" />
            2. Web Analytics (Google Analytics 4)
          </h2>
          <p>
            We use Google Analytics 4 (GA4) to evaluate high-level website traffic, user interaction patterns, and device types to ensure our calculators render quickly across desktop and mobile screens. GA4 records anonymized metrics such as page visits, bounce rates, and browser types. Our analytics configuration strictly strips financial query parameters to prevent any unintended financial data transmission.
          </p>
        </div>

        {/* Section 3 - Google AdSense Disclosures */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Cookie className="w-4 h-4 text-emerald-600" />
            3. Third-Party Advertising & Google AdSense Policy
          </h2>
          <p>
            We partner with third-party advertising vendors, including Google AdSense, to display advertisements on our website. Please review the following disclosures regarding how advertising cookies operate:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600">
            <li>
              <strong>Third-Party Vendors & Cookies:</strong> Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to FinCalc India or other websites across the Internet.
            </li>
            <li>
              <strong>DoubleClick & Advertising Cookies:</strong> Google&apos;s use of advertising cookies enables it and its partners to serve targeted advertisements to users based on their visits to our site and other destinations on the web.
            </li>
            <li>
              <strong>Personalized Advertising Opt-Out:</strong> Users may opt out of personalized advertising by visiting Google&apos;s Ads Settings at{" "}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 underline font-semibold"
              >
                https://www.google.com/settings/ads
              </a>
              .
            </li>
            <li>
              <strong>Third-Party Opt-Out Tools:</strong> Alternatively, users can opt out of a third-party vendor&apos;s use of cookies for personalized advertising by visiting the Network Advertising Initiative (NAI) opt-out page or{" "}
              <a
                href="https://www.aboutads.info"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 underline font-semibold"
              >
                www.aboutads.info
              </a>
              .
            </li>
          </ul>
        </div>

        {/* Section 4 - India DPDP Act 2023 */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            4. Indian Digital Personal Data Protection Act (DPDP Act 2023)
          </h2>
          <p>
            In full compliance with India&apos;s Digital Personal Data Protection Act 2023, FinCalc India respects the digital privacy of Indian citizens. Because we deliberately do not collect, process, or store personal identifiers (PII), your statutory rights regarding data portability, erasure, and consent are inherently safeguarded by our architectural choice of client-side computation.
          </p>
        </div>

        {/* Section 5 - GDPR & CCPA */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            5. International Rights (GDPR & CCPA/CPRA)
          </h2>
          <p>
            For visitors accessing our service from the European Economic Area (EEA), United Kingdom, or California:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li>We do not sell personal information or share consumer data for monetary or other consideration.</li>
            <li>You have the right to request information regarding any automated tracking technologies employed.</li>
            <li>You have the right to configure your web browser to reject all third-party cookies or utilize Do Not Track (DNT) / Global Privacy Control (GPC) signals.</li>
          </ul>
        </div>

        {/* Section 6 - External Links */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">6. External Authority Citations</h2>
          <p>
            Our calculators and guides cite external authoritative sources such as the Reserve Bank of India (rbi.org.in), Association of Mutual Funds in India (amfiindia.com), and the Income Tax Department (incometax.gov.in). We are not responsible for the privacy policies or content of external third-party domains.
          </p>
        </div>

        {/* Section 7 - Contact */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">7. Data Protection & Privacy Inquiries</h2>
          <p>
            For any questions, clarifications, or requests regarding this Privacy Policy, please reach out to our designated Data Protection desk at:
          </p>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-xs text-slate-800">
            Email: privacy@fincalcindia.in
            <br />
            Postal Address: FinCalc India Privacy Desk, 80 Feet Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034, India
          </div>
        </div>
      </section>
    </article>
  );
}

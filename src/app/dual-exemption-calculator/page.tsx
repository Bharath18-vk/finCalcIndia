import React from "react";
import type { Metadata } from "next";
import { dualExemptionEngine } from "@/lib/calculators/dual-exemption";
import { DualExemptionCalculatorView } from "@/components/calculators/DualExemptionCalculatorView";

export const metadata: Metadata = {
  title: "Dual Tax Exemption Optimizer - Claim HRA & Home Loan Interest Simultaneously",
  description:
    "Free Indian Income Tax calculator to evaluate simultaneous claims for HRA (Section 10(13A)) and Home Loan interest (Section 24(b)) with legal compliance and audit verification checklist.",
  alternates: {
    canonical: "/dual-exemption-calculator",
  },
  openGraph: {
    title: "Dual Tax Exemption Optimizer - HRA & Home Loan Simultaneous Claim",
    description:
      "Find out if you can legally claim both HRA and Home Loan Section 24(b) deductions and how much tax you save.",
    url: "https://fincalcindia.in/dual-exemption-calculator",
    type: "website",
  },
};

export default function DualExemptionCalculatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: dualExemptionEngine.metadata.name,
    operatingSystem: "All",
    applicationCategory: "FinanceApplication",
    url: "https://fincalcindia.in/dual-exemption-calculator",
    description: dualExemptionEngine.metadata.shortDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "Simultaneous HRA Rule 2A and Section 24(b) interest calculation",
      "Scenario analysis: Hometown owned property + Workplace rented residence",
      "Same city commute necessity justification rules",
      "Let-out property rental income and interest set-off rules (capped at ₹2 Lakh)",
      "Section 80C principal and Section 80EEA first-time buyer checks",
      "Old vs New Tax Regime advisory comparison",
      "Shareable URL calculation links",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DualExemptionCalculatorView />
    </>
  );
}

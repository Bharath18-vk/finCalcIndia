import React from "react";
import type { Metadata } from "next";
import { ScssCalculatorView } from "@/components/calculators/ScssCalculatorView";
import { scssEngine } from "@/lib/calculators/scss";

export const metadata: Metadata = {
  title: "SCSS Calculator - Senior Citizen Savings Scheme Quarterly Interest & Payout",
  description:
    "Free online SCSS calculator: calculate quarterly interest payouts, annual income, ₹50,000 Section 80TTB tax deduction, and 5 to 8-year cash flow under current 8.2% rate.",
  alternates: {
    canonical: "/scss-calculator",
  },
  openGraph: {
    title: "SCSS Calculator - Calculate Senior Citizen Savings Scheme Returns",
    description:
      "Calculate regular quarterly pension income for senior citizens with the enhanced ₹30 Lakh deposit limit and 8.2% government interest rate.",
    url: "https://fincalcindia.in/scss-calculator",
    type: "website",
  },
};

export default function ScssCalculatorPage() {
  const meta = scssEngine.metadata;

  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: meta.name,
    operatingSystem: "All",
    applicationCategory: "FinanceApplication",
    url: "https://fincalcindia.in/scss-calculator",
    description: meta.shortDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "Quarterly interest calculation ((P * R) / 400)",
      "Monthly equivalent regular income estimation",
      "Enhanced ₹30 Lakh maximum deposit support",
      "Standard 5-year and extended 8-year tenure projections",
      "Section 80TTB senior citizen ₹50,000 tax exemption breakdown",
      "Annual cash flow and interest accrual schedule",
      "Shareable URL calculation links",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />
      <ScssCalculatorView />
    </>
  );
}

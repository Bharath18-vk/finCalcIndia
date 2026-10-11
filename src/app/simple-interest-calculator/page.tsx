import React from "react";
import type { Metadata } from "next";
import { SimpleInterestCalculatorView } from "@/components/calculators/SimpleInterestCalculatorView";
import { simpleInterestEngine } from "@/lib/calculators/simple-interest";

export const metadata: Metadata = {
  title: "Simple Interest Calculator - SI = (P × R × T) / 100 Formula Online",
  description:
    "Calculate simple interest and total maturity payout with the standard SI formula. Includes yearly breakdown schedules and comparison against compound interest.",
  alternates: {
    canonical: "/simple-interest-calculator",
  },
  openGraph: {
    title: "Simple Interest Calculator - Fast & Accurate Interest Calculation",
    description:
      "Instant simple interest calculation: formula steps, maturity value, monthly interest yield, and compound interest comparison.",
    url: "https://fincalcindia.in/simple-interest-calculator",
    type: "website",
  },
};

export default function SimpleInterestCalculatorPage() {
  const meta = simpleInterestEngine.metadata;

  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: meta.name,
    operatingSystem: "All",
    applicationCategory: "FinancialApplication",
    url: "https://fincalcindia.in/simple-interest-calculator",
    description: meta.shortDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "Simple Interest calculation using SI = (P * R * T) / 100",
      "Total maturity amount calculation",
      "Average monthly interest yield",
      "Comparison vs quarterly compound interest",
      "Yearly accumulation breakdown schedule",
      "Shareable URL calculation links",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />
      <SimpleInterestCalculatorView />
    </>
  );
}

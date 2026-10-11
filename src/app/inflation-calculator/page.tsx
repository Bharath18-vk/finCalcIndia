import React from "react";
import type { Metadata } from "next";
import { inflationEngine } from "@/lib/calculators/inflation";
import { InflationCalculatorView } from "@/components/calculators/InflationCalculatorView";

export const metadata: Metadata = {
  title: "Inflation Calculator India - Future Cost & Purchasing Power Online",
  description:
    "Free online inflation calculator for India. Estimate future cost of living, purchasing power degradation, and milestone goal inflation using realistic CPI and CII rates.",
  alternates: {
    canonical: "/inflation-calculator",
  },
  openGraph: {
    title: "Inflation Calculator India - Future Value & Purchasing Power",
    description:
      "Calculate future cost of living, purchasing power erosion, and Indian Cost Inflation Index (CII) indexation.",
    url: "https://fincalcindia.in/inflation-calculator",
    type: "website",
  },
};

export default function InflationCalculatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: inflationEngine.metadata.name,
    operatingSystem: "All",
    applicationCategory: "FinanceApplication",
    url: "https://fincalcindia.in/inflation-calculator",
    description: inflationEngine.metadata.shortDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "Future cost projection compounding at chosen inflation rate",
      "Purchasing power loss percentage derivation",
      "Indian milestone goals inflation escalation (education, healthcare, retirement)",
      "Comprehensive year-by-year erosion schedule",
      "Statutory CBDT Cost Inflation Index (CII) table (2001-02 to 2024-25)",
      "Shareable URL calculation links",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <InflationCalculatorView />
    </>
  );
}

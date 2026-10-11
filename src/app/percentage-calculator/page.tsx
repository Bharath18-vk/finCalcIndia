import React from "react";
import type { Metadata } from "next";
import { PercentageCalculatorView } from "@/components/calculators/PercentageCalculatorView";
import { percentageEngine } from "@/lib/calculators/percentage";

export const metadata: Metadata = {
  title: "Percentage Calculator - Calculate Percentages, Increase, Decrease & Difference",
  description:
    "Free online percentage calculator: find what is X% of Y, what percent X is of Y, percentage increase and decrease, with complete step-by-step mathematical formulas and examples.",
  alternates: {
    canonical: "/percentage-calculator",
  },
  openGraph: {
    title: "Percentage Calculator - Fast, Accurate & Free Online Tool",
    description:
      "Instant percentage calculation with formulas: what is X% of Y, percent change, increase, decrease, and fractional conversions.",
    url: "https://fincalcindia.in/percentage-calculator",
    type: "website",
  },
};

export default function PercentageCalculatorPage() {
  const meta = percentageEngine.metadata;

  // Granular SoftwareApplication / WebApplication Schema
  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: meta.name,
    operatingSystem: "All",
    applicationCategory: "EducationalApplication",
    url: "https://fincalcindia.in/percentage-calculator",
    description: meta.shortDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "Calculate what is X% of Y",
      "Calculate what percentage X is of Y",
      "Calculate percentage increase between two numbers",
      "Calculate percentage decrease between two numbers",
      "Calculate percentage difference",
      "Instant step-by-step formula explanations",
      "Shareable URL calculation links",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />
      <PercentageCalculatorView />
    </>
  );
}

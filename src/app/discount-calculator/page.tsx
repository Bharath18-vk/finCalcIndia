import React from "react";
import type { Metadata } from "next";
import { DiscountCalculatorView } from "@/components/calculators/DiscountCalculatorView";
import { discountEngine } from "@/lib/calculators/discount";

export const metadata: Metadata = {
  title: "Discount Calculator - Calculate Sale Price & Money Saved Online",
  description:
    "Free discount calculator: calculate sale price, total savings, and final price with optional sales tax or GST. Includes step-by-step formula and percentage off examples.",
  alternates: {
    canonical: "/discount-calculator",
  },
  openGraph: {
    title: "Discount Calculator - Fast & Accurate Sale Price Calculator",
    description:
      "Instant discount and savings calculator with formulas: find final price, net savings, and effective discount rate with GST.",
    url: "https://fincalcindia.in/discount-calculator",
    type: "website",
  },
};

export default function DiscountCalculatorPage() {
  const meta = discountEngine.metadata;

  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: meta.name,
    operatingSystem: "All",
    applicationCategory: "FinancialApplication",
    url: "https://fincalcindia.in/discount-calculator",
    description: meta.shortDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "Calculate sale price after percentage discount",
      "Calculate total money saved",
      "Optional GST/sales tax inclusion",
      "Effective discount rate calculation",
      "Step-by-step formula breakdown",
      "Shareable URL calculation links",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />
      <DiscountCalculatorView />
    </>
  );
}

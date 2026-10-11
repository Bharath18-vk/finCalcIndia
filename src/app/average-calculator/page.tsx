import React from "react";
import type { Metadata } from "next";
import { AverageCalculatorView } from "@/components/calculators/AverageCalculatorView";
import { averageEngine } from "@/lib/calculators/average";

export const metadata: Metadata = {
  title: "Average Calculator - Mean, Median, Mode & Standard Deviation Online",
  description:
    "Free online average calculator: calculate arithmetic mean, median, mode, geometric mean, range, and standard deviation. Supports comma or space-separated datasets with step-by-step statistical formulas.",
  alternates: {
    canonical: "/average-calculator",
  },
  openGraph: {
    title: "Average Calculator - Mean, Median & Mode Calculator Online",
    description:
      "Instant statistical analysis: calculate arithmetic mean, median, mode, sum, range, and standard deviation for any dataset.",
    url: "https://fincalcindia.in/average-calculator",
    type: "website",
  },
};

export default function AverageCalculatorPage() {
  const meta = averageEngine.metadata;

  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: meta.name,
    operatingSystem: "All",
    applicationCategory: "EducationalApplication",
    url: "https://fincalcindia.in/average-calculator",
    description: meta.shortDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "Arithmetic mean calculation",
      "Median and middle value calculation",
      "Mode and frequency identification",
      "Geometric mean calculation for growth rates",
      "Sample and population standard deviation",
      "Sum and count summary",
      "Comma, space, and multiline dataset parsing",
      "Shareable URL calculation links",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />
      <AverageCalculatorView />
    </>
  );
}

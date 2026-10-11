import React from "react";
import type { Metadata } from "next";
import { RatioCalculatorView } from "@/components/calculators/RatioCalculatorView";
import { ratioEngine } from "@/lib/calculators/ratio";

export const metadata: Metadata = {
  title: "Ratio Calculator - Simplify Ratios, Solve Proportions & Divide Quantities",
  description:
    "Free online ratio calculator: simplify ratios to lowest terms, solve proportions (A : B = C : X), scale aspect ratios, and divide amounts into proportional shares with step-by-step mathematical solutions.",
  alternates: {
    canonical: "/ratio-calculator",
  },
  openGraph: {
    title: "Ratio Calculator - Simplify, Solve & Divide Ratios Online",
    description:
      "Instant ratio solver: reduce ratios with GCD, solve proportions by cross-multiplication, and divide total amounts with complete steps.",
    url: "https://fincalcindia.in/ratio-calculator",
    type: "website",
  },
};

export default function RatioCalculatorPage() {
  const meta = ratioEngine.metadata;

  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: meta.name,
    operatingSystem: "All",
    applicationCategory: "EducationalApplication",
    url: "https://fincalcindia.in/ratio-calculator",
    description: meta.shortDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "Simplify ratios to lowest terms with GCD reduction",
      "Solve proportions A : B = C : X via cross-multiplication",
      "Scale aspect ratios (16:9, 4:3, custom resolutions)",
      "Divide total amounts or money into proportional shares",
      "Decimal to integer ratio conversion",
      "Step-by-step mathematical working and reduction explanations",
      "Shareable URL calculation links",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />
      <RatioCalculatorView />
    </>
  );
}

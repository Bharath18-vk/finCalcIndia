import React from "react";
import type { Metadata } from "next";
import { ProbabilityCalculatorView } from "@/components/calculators/ProbabilityCalculatorView";
import { probabilityEngine } from "@/lib/calculators/probability";

export const metadata: Metadata = {
  title: "Probability Calculator - Event Likelihood, Odds & Binomial Probability Online",
  description:
    "Free probability calculator: calculate single event probability P(A), odds in favor, complementary events, two-event independent and mutually exclusive intersections, and binomial distribution formulas.",
  alternates: {
    canonical: "/probability-calculator",
  },
  openGraph: {
    title: "Probability Calculator - Calculate Event Likelihood, Odds & Distributions",
    description:
      "Instant probability analysis: single event odds, independent event intersections, and binomial distribution with complete step-by-step math.",
    url: "https://fincalcindia.in/probability-calculator",
    type: "website",
  },
};

export default function ProbabilityCalculatorPage() {
  const meta = probabilityEngine.metadata;

  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: meta.name,
    operatingSystem: "All",
    applicationCategory: "EducationalApplication",
    url: "https://fincalcindia.in/probability-calculator",
    description: meta.shortDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "Single event probability P(A) = favorable / total",
      "Odds in favor and odds against calculation",
      "Complementary probability P(A') = 1 - P(A)",
      "Two independent events intersection P(A and B) and union P(A or B)",
      "Mutually exclusive events probability",
      "Binomial probability distribution P(X = k) with expected value and variance",
      "Step-by-step mathematical working explanations",
      "Shareable URL calculation links",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />
      <ProbabilityCalculatorView />
    </>
  );
}

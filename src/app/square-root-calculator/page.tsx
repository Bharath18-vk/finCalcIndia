import React from "react";
import type { Metadata } from "next";
import { SquareRootCalculatorView } from "@/components/calculators/SquareRootCalculatorView";
import { squareRootEngine } from "@/lib/calculators/square-root";

export const metadata: Metadata = {
  title: "Square Root Calculator - Radical Simplifier & Exponent Calculator",
  description:
    "Free online square root calculator: calculate square roots, cube roots, nth roots, simplified radical form (k√r), powers (xʸ), and scientific notation with step-by-step mathematical work.",
  alternates: {
    canonical: "/square-root-calculator",
  },
  openGraph: {
    title: "Square Root Calculator - Radicals, Powers & Exponents Online",
    description:
      "Instant radical and exponent calculation: simplify square roots, factor perfect squares, evaluate powers, and find cube roots.",
    url: "https://fincalcindia.in/square-root-calculator",
    type: "website",
  },
};

export default function SquareRootCalculatorPage() {
  const meta = squareRootEngine.metadata;

  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: meta.name,
    operatingSystem: "All",
    applicationCategory: "EducationalApplication",
    url: "https://fincalcindia.in/square-root-calculator",
    description: meta.shortDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "Principal square root calculation",
      "Radical simplification into k√r terms (e.g. √72 = 6√2)",
      "Cube roots and higher degree nth roots",
      "Power and exponentiation xʸ",
      "Scientific notation for very large and small results",
      "Inverse power reciprocal calculation",
      "Step-by-step factorization breakdown",
      "Shareable URL calculation links",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />
      <SquareRootCalculatorView />
    </>
  );
}

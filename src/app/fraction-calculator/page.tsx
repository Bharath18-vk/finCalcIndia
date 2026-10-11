import React from "react";
import type { Metadata } from "next";
import { FractionCalculatorView } from "@/components/calculators/FractionCalculatorView";
import { fractionEngine } from "@/lib/calculators/fraction";

export const metadata: Metadata = {
  title: "Fraction Calculator - Add, Subtract, Multiply & Divide Fractions Online",
  description:
    "Free online fraction calculator: easily add, subtract, multiply, and divide fractions. Features step-by-step simplification to lowest terms, mixed numbers, and decimal conversion.",
  alternates: {
    canonical: "/fraction-calculator",
  },
  openGraph: {
    title: "Fraction Calculator - Accurate Step-by-Step Fraction Arithmetic",
    description:
      "Solve fraction addition, subtraction, multiplication, and division with greatest common divisor (GCD) simplification and mixed number output.",
    url: "https://fincalcindia.in/fraction-calculator",
    type: "website",
  },
};

export default function FractionCalculatorPage() {
  const meta = fractionEngine.metadata;

  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: meta.name,
    operatingSystem: "All",
    applicationCategory: "EducationalApplication",
    url: "https://fincalcindia.in/fraction-calculator",
    description: meta.shortDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "Add, subtract, multiply, and divide fractions",
      "Automatic reduction to lowest terms using GCD",
      "Convert improper fractions to mixed numbers",
      "Decimal equivalents with high precision",
      "Step-by-step mathematical work with common denominator calculation",
      "Shareable URL calculation links",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />
      <FractionCalculatorView />
    </>
  );
}

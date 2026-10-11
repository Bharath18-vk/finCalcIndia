import React from "react";
import type { Metadata } from "next";
import { LcmGcdCalculatorView } from "@/components/calculators/LcmGcdCalculatorView";
import { lcmGcdEngine } from "@/lib/calculators/lcm-gcd";

export const metadata: Metadata = {
  title: "LCM and GCD Calculator - Least Common Multiple & HCF Online",
  description:
    "Free online LCM and GCD calculator: calculate the Least Common Multiple (LCM) and Greatest Common Divisor (GCD / HCF) with prime factorization trees, common divisors, and division steps.",
  alternates: {
    canonical: "/lcm-gcd-calculator",
  },
  openGraph: {
    title: "LCM and GCD (HCF) Calculator Online",
    description:
      "Instant Least Common Multiple and Greatest Common Divisor calculator with prime factorization and step-by-step arithmetic.",
    url: "https://fincalcindia.in/lcm-gcd-calculator",
    type: "website",
  },
};

export default function LcmGcdPage() {
  const meta = lcmGcdEngine.metadata;

  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: meta.name,
    operatingSystem: "All",
    applicationCategory: "EducationalApplication",
    url: "https://fincalcindia.in/lcm-gcd-calculator",
    description: meta.shortDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "Greatest Common Divisor (GCD / HCF) calculation",
      "Least Common Multiple (LCM) calculation",
      "Prime factorization breakdown for all input numbers",
      "List of all common factors and divisors",
      "First 5 common multiples",
      "Step-by-step Euclidean algorithm and prime power explanations",
      "Multi-number support (2 to 20 integers)",
      "Shareable URL calculation links",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />
      <LcmGcdCalculatorView />
    </>
  );
}

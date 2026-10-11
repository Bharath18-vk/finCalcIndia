import React from "react";
import type { Metadata } from "next";
import { PermutationCombinationView } from "@/components/calculators/PermutationCombinationView";
import { permutationCombinationEngine } from "@/lib/calculators/permutation-combination";

export const metadata: Metadata = {
  title: "Permutation and Combination Calculator - nPr & nCr Online",
  description:
    "Free online permutation and combination calculator: calculate nPr (arrangements) and nCr (combinations) with or without repetition, factorials, and step-by-step mathematical work.",
  alternates: {
    canonical: "/permutation-combination-calculator",
  },
  openGraph: {
    title: "Permutation and Combination Calculator - nPr & nCr Solver Online",
    description:
      "Instant combinatorics solver: compute permutations, combinations, factorials, and combinations with replacement with full step explanations.",
    url: "https://fincalcindia.in/permutation-combination-calculator",
    type: "website",
  },
};

export default function PermutationCombinationPage() {
  const meta = permutationCombinationEngine.metadata;

  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: meta.name,
    operatingSystem: "All",
    applicationCategory: "EducationalApplication",
    url: "https://fincalcindia.in/permutation-combination-calculator",
    description: meta.shortDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "Permutations calculation nPr = n! / (n - r)!",
      "Combinations calculation nCr = n! / [r!(n - r)!]",
      "Permutations with repetition n^r",
      "Combinations with repetition C(n + r - 1, r)",
      "Factorials calculation n!, r!, (n - r)!",
      "Step-by-step factorial cancellation and derivation",
      "Shareable URL calculation links",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />
      <PermutationCombinationView />
    </>
  );
}

import React from "react";
import type { Metadata } from "next";
import { TipCalculatorView } from "@/components/calculators/TipCalculatorView";
import { tipEngine } from "@/lib/calculators/tip";

export const metadata: Metadata = {
  title: "Tip Calculator - Split Bill, Gratuity & Restaurant GST Online",
  description:
    "Free online tip and bill split calculator: easily calculate gratuity, add GST/tax, and evenly split dining checks among friends with whole-number rounding.",
  alternates: {
    canonical: "/tip-calculator",
  },
  openGraph: {
    title: "Tip & Bill Split Calculator - Calculate Restaurant Gratuity",
    description:
      "Evenly split restaurant bills, compute tip percentages, and add 5% or 18% restaurant GST with instant per-person breakdown.",
    url: "https://fincalcindia.in/tip-calculator",
    type: "website",
  },
};

export default function TipCalculatorPage() {
  const meta = tipEngine.metadata;

  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: meta.name,
    operatingSystem: "All",
    applicationCategory: "UtilityApplication",
    url: "https://fincalcindia.in/tip-calculator",
    description: meta.shortDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "Calculate tip amount based on customizable percentage",
      "Split total check evenly between 1 and 100 people",
      "Include optional restaurant GST (5% or 18%)",
      "Rounding options for per-person or whole-bill settlements",
      "Pre-tax food subtotal vs post-tax calculation clarity",
      "Shareable URL calculation links",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />
      <TipCalculatorView />
    </>
  );
}

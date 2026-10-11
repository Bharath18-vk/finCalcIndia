import React from "react";
import type { Metadata } from "next";
import { capitalGainsTaxEngine } from "@/lib/calculators/capital-gains-tax";
import { CapitalGainsTaxCalculatorView } from "@/components/calculators/CapitalGainsTaxCalculatorView";

export const metadata: Metadata = {
  title: "Capital Gains Tax Calculator India - LTCG & STCG Post-Budget 2024",
  description:
    "Free online Capital Gains Tax calculator for India updated with Union Budget 2024 rules. Compute LTCG (12.5% with ₹1.25L exemption), STCG (20%), and property grandfathering indexation.",
  alternates: {
    canonical: "/capital-gains-tax-calculator",
  },
  openGraph: {
    title: "Capital Gains Tax Calculator India (Budget 2024 Revised)",
    description:
      "Calculate LTCG & STCG across stocks, mutual funds, gold, and real estate with grandfathering comparison.",
    url: "https://fincalcindia.in/capital-gains-tax-calculator",
    type: "website",
  },
};

export default function CapitalGainsTaxCalculatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: capitalGainsTaxEngine.metadata.name,
    operatingSystem: "All",
    applicationCategory: "FinanceApplication",
    url: "https://fincalcindia.in/capital-gains-tax-calculator",
    description: capitalGainsTaxEngine.metadata.shortDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "Union Budget 2024 revised tax rates (12.5% LTCG, 20% STCG)",
      "Section 112A ₹1,25,000 annual exemption limit for listed equities",
      "Real estate grandfathering comparison (12.5% unindexed vs 20% CII indexed)",
      "Section 50AA debt mutual fund slab rate calculation",
      "Section 54, 54EC, 54F exemption deductions",
      "Shareable URL calculation links",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CapitalGainsTaxCalculatorView />
    </>
  );
}

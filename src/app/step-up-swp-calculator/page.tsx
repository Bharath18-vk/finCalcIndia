import React from "react";
import type { Metadata } from "next";
import { stepUpSwpEngine } from "@/lib/calculators/step-up-swp";
import { StepUpSwpCalculatorView } from "@/components/calculators/StepUpSwpCalculatorView";

export const metadata: Metadata = {
  title: "Step-Up SWP Calculator - Inflation-Adjusted Systematic Withdrawal Plan",
  description:
    "Free Step-Up SWP calculator for Indian mutual funds. Model annual percentage withdrawal increases to beat inflation, simulate corpus longevity, and calculate maximum safe payouts.",
  alternates: {
    canonical: "/step-up-swp-calculator",
  },
  openGraph: {
    title: "Step-Up SWP Calculator - Inflation Adjusted Systematic Withdrawal",
    description:
      "Model increasing annual cashflows from mutual funds to match inflation and prevent corpus depletion.",
    url: "https://fincalcindia.in/step-up-swp-calculator",
    type: "website",
  },
};

export default function StepUpSwpCalculatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: stepUpSwpEngine.metadata.name,
    operatingSystem: "All",
    applicationCategory: "FinanceApplication",
    url: "https://fincalcindia.in/step-up-swp-calculator",
    description: stepUpSwpEngine.metadata.shortDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "Annual percentage step-up withdrawal adjustments",
      "Corpus depletion risk detector with exact exhaustion year",
      "Maximum sustainable initial monthly payout solver",
      "Year-by-year cashflow schedule showing monthly payout and closing balance",
      "Shareable URL calculation links",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StepUpSwpCalculatorView />
    </>
  );
}

import React from "react";
import type { Metadata } from "next";
import { fireEngine } from "@/lib/calculators/fire";
import { FireCalculatorView } from "@/components/calculators/FireCalculatorView";

export const metadata: Metadata = {
  title: "FIRE Calculator India - Financial Independence Retire Early & Corpus Goals",
  description:
    "Calculate your exact FIRE corpus, years to financial freedom, and milestone targets across Lean FIRE, Fat FIRE, Coast FIRE, and Barista FIRE with Indian inflation and safe withdrawal rates.",
  alternates: {
    canonical: "/fire-calculator",
  },
  openGraph: {
    title: "FIRE Calculator India - Early Retirement Corpus & Milestones",
    description:
      "Free early retirement calculator with Lean, Fat, Coast FIRE tiers and realistic Indian inflation models.",
    url: "https://fincalcindia.in/fire-calculator",
    type: "website",
  },
};

export default function FireCalculatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: fireEngine.metadata.name,
    operatingSystem: "All",
    applicationCategory: "FinanceApplication",
    url: "https://fincalcindia.in/fire-calculator",
    description: fireEngine.metadata.shortDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "Target FIRE corpus calculation based on Safe Withdrawal Rate (SWR)",
      "Multi-tier lifestyle modeling (Lean FIRE, Regular FIRE, Fat FIRE)",
      "Coast FIRE and Barista FIRE threshold evaluations",
      "Annual SIP step-up compounding projection",
      "Year-by-year accumulation and retirement longevity schedules",
      "Shareable calculation URL generation",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FireCalculatorView />
    </>
  );
}

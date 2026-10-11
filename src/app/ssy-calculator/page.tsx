import React from "react";
import type { Metadata } from "next";
import { SsyCalculatorView } from "@/components/calculators/SsyCalculatorView";
import { ssyEngine } from "@/lib/calculators/ssy";

export const metadata: Metadata = {
  title: "SSY Calculator - Sukanya Samriddhi Yojana Maturity & Interest Calculator",
  description:
    "Free online Sukanya Samriddhi Yojana (SSY) calculator: calculate maturity corpus, year-by-year 21-year schedule, and tax-free interest with current 8.2% rate.",
  alternates: {
    canonical: "/ssy-calculator",
  },
  openGraph: {
    title: "SSY Calculator - Calculate Sukanya Samriddhi Yojana Maturity",
    description:
      "Calculate 21-year maturity value for your girl child with the current 8.2% government interest rate and 100% tax-free EEE benefits.",
    url: "https://fincalcindia.in/ssy-calculator",
    type: "website",
  },
};

export default function SsyCalculatorPage() {
  const meta = ssyEngine.metadata;

  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: meta.name,
    operatingSystem: "All",
    applicationCategory: "FinanceApplication",
    url: "https://fincalcindia.in/ssy-calculator",
    description: meta.shortDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "Calculate SSY maturity amount after 21 years",
      "Official statutory 8.2% interest rate compounding",
      "15-year deposit and 6-year lock-in growth schedule",
      "Year-by-year breakdown of deposits, interest, and balance",
      "Girl child age tracking across the investment tenure",
      "Tax exemption benefits under Section 80C and Section 10(11A)",
      "Shareable URL calculation links",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />
      <SsyCalculatorView />
    </>
  );
}

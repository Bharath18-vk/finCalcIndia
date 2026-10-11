import React from "react";
import type { Metadata } from "next";
import { npsVsEpfEngine } from "@/lib/calculators/nps-vs-epf";
import { NpsVsEpfView } from "@/components/calculators/NpsVsEpfView";

export const metadata: Metadata = {
  title: "NPS vs EPF Calculator - Compare Retirement Returns, Corpus & Tax Benefits",
  description:
    "Free online NPS vs EPF Comparison Calculator. Compare guaranteed 8.25% EPF with market-linked NPS returns, 60% lump-sum tax exemption, and Section 80CCD(1B) tax savings.",
  alternates: {
    canonical: "/nps-vs-epf-calculator",
  },
  openGraph: {
    title: "NPS vs EPF Calculator - Returns, Corpus & Tax Comparison",
    description:
      "Compare National Pension System (NPS) vs Employees' Provident Fund (EPF): compare wealth compounding, tax-free lump-sum liquidity, monthly annuity pension, and exclusive Section 80CCD tax savings.",
    url: "https://fincalcindia.in/nps-vs-epf-calculator",
    type: "website",
  },
};

export default function NpsVsEpfCalculatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: npsVsEpfEngine.metadata.name,
    operatingSystem: "All",
    applicationCategory: "FinanceApplication",
    url: "https://fincalcindia.in/nps-vs-epf-calculator",
    description: npsVsEpfEngine.metadata.shortDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "Side-by-side EPF (8.25%) vs NPS (10%-12%) compounding simulation",
      "Official EPFO monthly crediting calculation logic",
      "NPS 60% lump-sum (Sec 10(12A)) and 40% mandatory annuity breakdown",
      "Lifelong guaranteed monthly pension estimates",
      "Exclusive Section 80CCD(1B) career tax savings calculation",
      "Year-by-year trajectory schedule table with milestone filtering",
      "Shareable URL calculation links",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NpsVsEpfView />
    </>
  );
}

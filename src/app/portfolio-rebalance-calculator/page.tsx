import React from "react";
import type { Metadata } from "next";
import { portfolioRebalanceEngine } from "@/lib/calculators/portfolio-rebalance";
import { PortfolioRebalanceCalculatorView } from "@/components/calculators/PortfolioRebalanceCalculatorView";

export const metadata: Metadata = {
  title: "Portfolio Rebalancing Calculator - Tax-Smart Asset Allocation & Drift",
  description:
    "Free Portfolio Rebalancing calculator for Indian investors. Calculate equity/debt/gold asset allocation drift and execute tax-smart cash flow rebalancing to avoid capital gains tax.",
  alternates: {
    canonical: "/portfolio-rebalance-calculator",
  },
  openGraph: {
    title: "Portfolio Rebalancing Calculator - Tax-Smart Asset Allocation",
    description:
      "Restore your strategic asset allocation with zero tax friction using cash-flow first rebalancing.",
    url: "https://fincalcindia.in/portfolio-rebalance-calculator",
    type: "website",
  },
};

export default function PortfolioRebalanceCalculatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: portfolioRebalanceEngine.metadata.name,
    operatingSystem: "All",
    applicationCategory: "FinanceApplication",
    url: "https://fincalcindia.in/portfolio-rebalance-calculator",
    description: portfolioRebalanceEngine.metadata.shortDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "Asset allocation drift calculation across Equity, Debt, Gold, and Cash",
      "Tax-Smart Cash Flow First rebalancing to avoid capital gains tax",
      "Full buy & sell rebalancing mode with exact transaction amounts",
      "Customizable drift tolerance threshold (default ±5%)",
      "Step-by-step actionable portfolio rebalancing plan",
      "Shareable URL calculation links",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PortfolioRebalanceCalculatorView />
    </>
  );
}

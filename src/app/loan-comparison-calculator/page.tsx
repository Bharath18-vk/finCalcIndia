import React from "react";
import type { Metadata } from "next";
import { loanComparisonEngine } from "@/lib/calculators/loan-comparison";
import { LoanComparisonView } from "@/components/calculators/LoanComparisonView";

export const metadata: Metadata = {
  title: "Loan Comparison Calculator India - Compare Bank EMI & Total Interest",
  description:
    "Free loan comparison calculator for India. Compare two loan offers side-by-side: monthly EMI, total interest, processing fees, and overall lifetime savings.",
  alternates: {
    canonical: "/loan-comparison-calculator",
  },
  openGraph: {
    title: "Loan Comparison Calculator India - Side-by-Side Bank Offer Comparison",
    description:
      "Compare two home, personal, or car loan offers side by side: EMI, total interest, processing fees, and overall savings.",
    url: "https://fincalcindia.in/loan-comparison-calculator",
    type: "website",
  },
};

export default function LoanComparisonPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: loanComparisonEngine.metadata.name,
    operatingSystem: "All",
    applicationCategory: "FinanceApplication",
    url: "https://fincalcindia.in/loan-comparison-calculator",
    description: loanComparisonEngine.metadata.shortDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "Side-by-side comparison of two independent loan offers",
      "Monthly EMI differential calculation",
      "Lifetime interest and bank processing fee comparison",
      "Total savings recommendation verdict banner",
      "Interactive parameter customization for rate, tenure, and principal",
      "Shareable URL calculation links",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LoanComparisonView />
    </>
  );
}

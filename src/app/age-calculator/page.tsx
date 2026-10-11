import React from "react";
import type { Metadata } from "next";
import { AgeCalculatorView } from "@/components/calculators/AgeCalculatorView";
import { ageEngine } from "@/lib/calculators/age";

export const metadata: Metadata = {
  title: "Age Calculator - Calculate Exact Chronological Age Online",
  description:
    "Free online age calculator: calculate your exact chronological age in years, months, days, hours, and minutes. Includes birthday countdown, day of week, and zodiac sign.",
  alternates: {
    canonical: "/age-calculator",
  },
  openGraph: {
    title: "Age Calculator - Accurate Chronological Age & Birthday Countdown",
    description:
      "Find out your exact age in years, months, days, and total hours lived. Useful for government exam eligibility, insurance, and retirement planning.",
    url: "https://fincalcindia.in/age-calculator",
    type: "website",
  },
};

export default function AgeCalculatorPage() {
  const meta = ageEngine.metadata;

  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: meta.name,
    operatingSystem: "All",
    applicationCategory: "UtilityApplication",
    url: "https://fincalcindia.in/age-calculator",
    description: meta.shortDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "Exact chronological age in years, months, and days",
      "Total elapsed days, weeks, hours, and minutes",
      "Next birthday countdown with day of week",
      "Astronomical calendar borrowing accounting for leap years",
      "Historical or future target date comparison",
      "Zodiac sign and birth day of week detection",
      "Shareable URL calculation links",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />
      <AgeCalculatorView />
    </>
  );
}

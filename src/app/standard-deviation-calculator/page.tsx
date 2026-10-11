import React from "react";
import type { Metadata } from "next";
import { StandardDeviationCalculatorView } from "@/components/calculators/StandardDeviationCalculatorView";
import { standardDeviationEngine } from "@/lib/calculators/standard-deviation";

export const metadata: Metadata = {
  title: "Standard Deviation Calculator - Sample & Population Dispersion Online",
  description:
    "Free online standard deviation calculator: calculate sample (s) and population (σ) standard deviation, variance, standard error of the mean, sum of squares, and step-by-step deviations table for any dataset.",
  alternates: {
    canonical: "/standard-deviation-calculator",
  },
  openGraph: {
    title: "Standard Deviation Calculator - Sample, Population & Variance",
    description:
      "Instant statistical dispersion analysis: sample vs population standard deviation, variance, and 68-95-99.7 empirical rule confidence intervals.",
    url: "https://fincalcindia.in/standard-deviation-calculator",
    type: "website",
  },
};

export default function StandardDeviationCalculatorPage() {
  const meta = standardDeviationEngine.metadata;

  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: meta.name,
    operatingSystem: "All",
    applicationCategory: "EducationalApplication",
    url: "https://fincalcindia.in/standard-deviation-calculator",
    description: meta.shortDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "Sample standard deviation (s) using Bessel's correction (N - 1)",
      "Population standard deviation (σ) using N",
      "Sample and population variance calculation",
      "Sum of squared deviations (SS) calculation",
      "Standard error of the mean (SEM)",
      "Coefficient of variation (CV %)",
      "Empirical rule (68-95-99.7) normal distribution confidence intervals",
      "Step-by-step deviations table showing (x - mean) and (x - mean)^2",
      "Shareable URL calculation links",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />
      <StandardDeviationCalculatorView />
    </>
  );
}

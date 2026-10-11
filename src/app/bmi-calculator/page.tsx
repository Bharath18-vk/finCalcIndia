import React from "react";
import type { Metadata } from "next";
import { BmiCalculatorView } from "@/components/calculators/BmiCalculatorView";
import { bmiEngine } from "@/lib/calculators/bmi";

export const metadata: Metadata = {
  title: "BMI Calculator India - Body Mass Index (ICMR & WHO Standards)",
  description:
    "Free online BMI calculator: calculate Body Mass Index with official Asian-Indian (ICMR) and WHO standards. Includes ideal healthy weight range and BMI Prime.",
  alternates: {
    canonical: "/bmi-calculator",
  },
  openGraph: {
    title: "BMI Calculator - Calculate Body Mass Index Online",
    description:
      "Check your BMI against Indian consensus standards (ICMR/API) and WHO classifications. Supports metric (cm/kg) and imperial (ft/in/lbs) units.",
    url: "https://fincalcindia.in/bmi-calculator",
    type: "website",
  },
};

export default function BmiCalculatorPage() {
  const meta = bmiEngine.metadata;

  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: meta.name,
    operatingSystem: "All",
    applicationCategory: "HealthApplication",
    url: "https://fincalcindia.in/bmi-calculator",
    description: meta.shortDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "Body Mass Index (BMI) calculation",
      "Official Asian-Indian (ICMR / MoHFW) cut-off classification",
      "World Health Organization (WHO) international classification",
      "Ideal healthy weight range for both standards",
      "BMI Prime and Ponderal Index (Rohrer's Index) computation",
      "Dual unit support: Metric (cm, kg) and Imperial (ft, in, lbs)",
      "Shareable URL calculation links",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />
      <BmiCalculatorView />
    </>
  );
}

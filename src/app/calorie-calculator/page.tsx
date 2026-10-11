import React from "react";
import type { Metadata } from "next";
import { calorieEngine } from "@/lib/calculators/calorie";
import { CalorieCalculatorView } from "@/components/calculators/CalorieCalculatorView";

export const metadata: Metadata = {
  title: "Calorie & Macro Calculator - BMR, TDEE & Daily Targets (Mifflin-St Jeor)",
  description:
    "Free online Calorie and Macro Calculator using clinical Mifflin-St Jeor equation. Calculate BMR, maintenance calories (TDEE), and daily protein, carb, fat targets.",
  alternates: {
    canonical: "/calorie-calculator",
  },
  openGraph: {
    title: "Calorie & Macro Calculator - BMR, TDEE & Nutrition Splits",
    description:
      "Accurately estimate maintenance calories (TDEE), deficit/surplus goals, and macronutrient grams (protein, carbs, fats) for weight loss or muscle gain.",
    url: "https://fincalcindia.in/calorie-calculator",
    type: "website",
  },
};

export default function CalorieCalculatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: calorieEngine.metadata.name,
    operatingSystem: "All",
    applicationCategory: "HealthApplication",
    url: "https://fincalcindia.in/calorie-calculator",
    description: calorieEngine.metadata.shortDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "Clinical Mifflin-St Jeor Basal Metabolic Rate (BMR) formula",
      "Total Daily Energy Expenditure (TDEE) activity multipliers",
      "Tailored goals: fat loss, maintenance, or muscle gain",
      "Macronutrient splits (balanced 30/40/30 & high-protein 35/35/30)",
      "Safe minimum calorie floor constraints (1,200 / 1,500 kcal)",
      "Daily hydration guidelines based on body mass",
      "Instant shareable calculation links",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CalorieCalculatorView />
    </>
  );
}

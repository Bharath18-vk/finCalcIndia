import React from "react";
import { Metadata } from "next";
import { IncomeTaxCalculatorView } from "@/components/calculators/IncomeTaxCalculatorView";
import { IncomeTaxContent } from "@/components/calculators/content/IncomeTaxContent";
import { FAQItem } from "@/components/ui/FAQSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateSoftwareSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Income Tax Calculator AY 2026-27 & 2025-26 - New vs Old Regime Calculator",
  description:
    "Calculate income tax for AY 2026-27 (FY 2025-26) with statutory new regime slabs (₹0-4L 0%, ₹4-8L 5%, ₹8-12L 10%, etc.), ₹75,000 standard deduction, and Section 87A rebate up to ₹60,000 (zero tax up to ₹12.75L salaried).",
  alternates: {
    canonical: "/income-tax-calculator",
  },
  openGraph: {
    title: "Income Tax Calculator AY 2026-27 & 2025-26 - New vs Old Regime Comparison",
    description:
      "Accurate Indian income tax calculator comparing New Regime (Section 115BAC) vs Old Regime with current AY 2026-27 slabs, marginal relief, and 80C/80D deductions.",
    url: "/income-tax-calculator",
    type: "website",
  },
};

export default function IncomeTaxCalculatorPage() {
  const faqs: FAQItem[] = [
    {
      question: "What are the new tax slabs for AY 2026-27 (FY 2025-26)?",
      answer:
        "Under Section 115BAC for AY 2026-27: ₹0 to ₹4 Lakh: Nil (0%); ₹4L to ₹8L: 5%; ₹8L to ₹12L: 10%; ₹12L to ₹16L: 15%; ₹16L to ₹20L: 20%; ₹20L to ₹24L: 25%; and Above ₹24L: 30%. In addition, salaried employees receive a flat standard deduction of ₹75,000.",
    },
    {
      question: "How does Section 87A rebate work for AY 2026-27?",
      answer:
        "For resident individuals under the New Regime, if taxable income does not exceed ₹12,00,000, a rebate of 100% of tax payable or ₹60,000 (whichever is lower) is provided. With the ₹75,000 standard deduction, salaried individuals earning up to ₹12,75,000 gross annual income pay zero income tax.",
    },
    {
      question: "How does Section 87A marginal relief protect taxpayers whose income slightly exceeds ₹12 Lakhs?",
      answer:
        "If taxable income slightly exceeds ₹12,00,000 under the New Regime, statutory marginal relief ensures that the tax payable (before 4% cess) cannot exceed the amount by which taxable income exceeds ₹12,00,000. This marginal relief operates up to a taxable income of approximately ₹12,70,588.",
    },
    {
      question: "Which regime is better: New Tax Regime or Old Tax Regime?",
      answer:
        "With the AY 2026-27 New Regime offering zero tax up to ₹12.75 Lakhs (salaried) and lower slab rates across all brackets, the New Regime is more beneficial for the vast majority of taxpayers. The Old Regime is typically advantageous only if total eligible deductions (Standard deduction + 80C + 80D + 24(b) home loan + HRA) exceed ₹4.5 to ₹5 Lakhs.",
    },
    {
      question: "Can salaried employees switch between New and Old regimes every year?",
      answer:
        "Yes. Salaried individuals without income from business or profession can switch between the New Tax Regime and Old Tax Regime each financial year at the time of filing their Income Tax Return (ITR-1 or ITR-2) under Section 139(1). However, individuals with business or professional income (ITR-3/ITR-4) can opt out of the New Regime only once in their lifetime.",
    },
    {
      question: "Is standard deduction available under both New and Old regimes?",
      answer:
        "Yes, but the amounts differ: Under the New Tax Regime (AY 2026-27), the standard deduction for salaried employees and pensioners is ₹75,000. Under the Old Tax Regime, the standard deduction remains capped at ₹50,000.",
    },
    {
      question: "What is the maximum surcharge rate under the New Tax Regime?",
      answer:
        "Under the New Tax Regime, the highest surcharge on individuals with taxable income exceeding ₹2 Crores is capped at 25%, resulting in a maximum marginal tax rate of 39% (including 4% cess). Under the Old Regime, the surcharge for income exceeding ₹5 Crores is 37%, pushing the effective peak rate to 42.74%.",
    },
  ];

  const relatedLinks = [
    {
      title: "Salary In-Hand (CTC) Calculator",
      description: "Calculate your exact monthly bank credit after PF, PT, and TDS.",
      href: "/salary-calculator",
      badge: "Take-Home Pay",
    },
    {
      title: "HRA Exemption Calculator",
      description: "Compute Section 10(13A) Rule 2A tax-exempt house rent allowance.",
      href: "/hra-calculator",
      badge: "Rule 2A",
    },
    {
      title: "NPS Calculator",
      description: "Evaluate Tier-1 retirement corpus and Section 80CCD(1B) pension savings.",
      href: "/nps-calculator",
      badge: "Pension System",
    },
  ];

  const jsonLd = generateSoftwareSchema({
    name: "Income Tax Calculator AY 2026-27 & 2025-26 - New vs Old Regime Calculator",
    description:
      "Calculate income tax for AY 2026-27 (FY 2025-26) with statutory new regime slabs (₹0-4L 0%, ₹4-8L 5%, ₹8-12L 10%, etc.), ₹75,000 standard deduction, and Section 87A rebate up to ₹60,000 (zero tax up to ₹12.75L salaried).",
    url: "/income-tax-calculator",
    applicationCategory: "FinanceApplication",
    featureList: [
      "AY 2026-27 statutory tax slabs under Section 115BAC (Finance Act 2025)",
      "New Regime vs Old Regime automatic tax liability comparison",
      "₹75,000 standard deduction for salaried individuals",
      "Section 87A rebate calculation up to ₹60,000 (zero tax up to ₹12.75 Lakhs)",
      "Statutory marginal relief calculation for income near ₹12 Lakhs",
      "Chapter VI-A deduction modeling (80C, 80D, 80CCD(1B), 24(b))",
    ],
  });

  return (
    <>
      <JsonLd data={jsonLd} />
      <IncomeTaxCalculatorView
        title="Income Tax Calculator AY 2026-27 & AY 2025-26 (New vs Old Regime)"
        badge="AY 2026-27 Slabs (Finance Act 2025)"
        description="Compare your tax liability under current AY 2026-27 statutory slabs (₹0-4L 0%, ₹4-8L 5%, etc.) vs the Old Tax Regime. Includes ₹75,000 standard deduction, Section 87A rebate up to ₹60,000, and marginal relief."
        initialGrossIncome={1200000}
        initialIsSalaried={true}
        asOfDate="AY 2026-27 (Finance Act 2025)"
        breadcrumbs={[
          { label: "Investments", href: "/investments" },
          { label: "Income Tax Calculator", href: "/income-tax-calculator" },
        ]}
        faqs={faqs}
        relatedLinks={relatedLinks}
        explainerContent={<IncomeTaxContent />}
      />
    </>
  );
}

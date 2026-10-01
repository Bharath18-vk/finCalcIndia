import React from "react";
import { Metadata } from "next";
import { HRACalculatorView } from "@/components/calculators/HRACalculatorView";
import { FAQItem } from "@/components/ui/FAQSection";

export const metadata: Metadata = {
  title: "HRA Calculator - House Rent Allowance Tax Exemption Calculator Rule 2A",
  description:
    "Calculate your tax-exempt House Rent Allowance (HRA) under Section 10(13A) and Rule 2A of the Income Tax Act. Compare 50% metro vs 40% non-metro limits and annual tax savings.",
  alternates: {
    canonical: "/hra-calculator",
  },
  openGraph: {
    title: "HRA Calculator - House Rent Allowance Tax Exemption Calculator",
    description:
      "Accurate Indian HRA exemption calculator evaluating the 3 statutory conditions of Section 10(13A) Rule 2A.",
    url: "/hra-calculator",
    type: "website",
  },
};

export default function HRACalculatorPage() {
  const faqs: FAQItem[] = [
    {
      question: "How is HRA exemption calculated under Section 10(13A)?",
      answer:
        "Under Rule 2A, the tax-exempt HRA is the minimum of 3 statutory amounts: 1) Actual HRA received from the employer, 2) 50% of Basic Salary for metro cities (Delhi, Mumbai, Kolkata, Chennai) or 40% for non-metros, and 3) Actual rent paid minus 10% of Basic Salary.",
    },
    {
      question: "Can I claim HRA exemption under the New Tax Regime?",
      answer:
        "No. HRA exemption is exclusively available under the Old Tax Regime. The New Tax Regime (Section 115BAC) disallows all allowance exemptions, including HRA, LTA, and standard Chapter VI-A deductions.",
    },
    {
      question: "When is a landlord's PAN mandatory for HRA claims?",
      answer:
        "If your total rent payment exceeds ₹1,00,000 per financial year (or ₹8,333 per month), it is legally mandatory to provide your landlord's PAN to your employer on Form 12BB.",
    },
    {
      question: "Can I pay rent to my parents and claim HRA?",
      answer:
        "Yes, you can pay rent to your parents and claim HRA exemption provided your parents are the legal owners of the residential property, you have a formal rent agreement with rental payment receipts, and your parents declare this rental income in their annual income tax returns.",
    },
  ];

  const relatedLinks = [
    {
      title: "Income Tax Calculator",
      description: "Compare New vs Old Tax Regime slabs and see if HRA saves you tax.",
      href: "/income-tax-calculator",
      badge: "Tax Comparison",
    },
    {
      title: "Salary In-Hand Calculator",
      description: "Calculate your take-home pay after HRA and monthly TDS deductions.",
      href: "/salary-calculator",
      badge: "Pay Breakdown",
    },
    {
      title: "Home Loan EMI Calculator",
      description: "Explore claiming home loan interest alongside HRA benefits.",
      href: "/home-loan-emi-calculator",
      badge: "Loan Analysis",
    },
  ];

  return (
    <HRACalculatorView
      title="HRA Calculator: House Rent Allowance Tax Exemption (Rule 2A)"
      description="Compute your tax-free House Rent Allowance under Section 10(13A) of the Income Tax Act. Evaluates actual HRA, 50%/40% basic salary caps, and rent paid minus 10% of salary."
      initialBasicSalary={600000}
      initialHRAReceived={240000}
      initialRentPaid={180000}
      asOfDate="Rule 2A (Section 10(13A))"
      breadcrumbs={[
        { label: "Savings", href: "/savings" },
        { label: "HRA Calculator", href: "/hra-calculator" },
      ]}
      faqs={faqs}
      relatedLinks={relatedLinks}
    />
  );
}

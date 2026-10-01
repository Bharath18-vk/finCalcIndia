import React from "react";
import { Metadata } from "next";
import { SalaryCalculatorView } from "@/components/calculators/SalaryCalculatorView";
import { FAQItem } from "@/components/ui/FAQSection";

export const metadata: Metadata = {
  title: "Salary Calculator - CTC to In-Hand / Take-Home Salary Calculator India",
  description:
    "Calculate your monthly in-hand take-home salary from your annual CTC. Complete breakdown of Basic salary, HRA, Employee PF, Professional Tax, and Income Tax (TDS).",
  alternates: {
    canonical: "/salary-calculator",
  },
  openGraph: {
    title: "Salary Calculator - CTC to In-Hand Salary Calculator India",
    description:
      "Accurate Indian CTC to take-home salary calculator with monthly bank credit breakdown and statutory deduction schedules.",
    url: "/salary-calculator",
    type: "website",
  },
};

export default function SalaryCalculatorPage() {
  const faqs: FAQItem[] = [
    {
      question: "What is the difference between CTC and In-Hand Salary?",
      answer:
        "CTC (Cost to Company) represents the total annual expenditure incurred by the employer on you, including employer-side PF, gratuity, and insurance. In-Hand (Take-Home) salary is the net cash credited to your bank account each month after deducting Employee PF, Professional Tax, and Income Tax (TDS).",
    },
    {
      question: "How is Basic Salary calculated from CTC in India?",
      answer:
        "Most Indian employers set Basic Salary between 40% and 50% of the total CTC. Setting Basic at 40-50% optimizes statutory EPF contributions while allowing sufficient room for tax-exempt HRA and special allowances.",
    },
    {
      question: "What is the Employee PF deduction on salary?",
      answer:
        "By statutory EPFO mandate, 12% of your monthly (Basic Salary + DA) is deducted from your gross pay and credited to your EPF account. Your employer matches this contribution with another 12% (split between EPF and EPS).",
    },
    {
      question: "Can I choose not to contribute to EPF to increase take-home pay?",
      answer:
        "If your basic salary at your very first job is above ₹15,000 per month, EPF is voluntary and you can opt out by submitting Form 11 at the time of joining. However, if you are already an active EPF member, continuing contributions is mandatory.",
    },
  ];

  const relatedLinks = [
    {
      title: "Income Tax Calculator",
      description: "Compare New vs Old Tax Regime slabs and Section 87A rebate.",
      href: "/income-tax-calculator",
      badge: "Tax Planning",
    },
    {
      title: "HRA Exemption Calculator",
      description: "Calculate tax-exempt house rent allowance under Rule 2A.",
      href: "/hra-calculator",
      badge: "Tax Exemption",
    },
    {
      title: "EPF Calculator",
      description: "Project your accumulated provident fund balance at retirement.",
      href: "/epf-calculator",
      badge: "Retirement Corpus",
    },
  ];

  return (
    <SalaryCalculatorView
      title="Salary Calculator: CTC to In-Hand / Take-Home Pay India"
      description="Estimate your net monthly bank credit from your annual Cost to Company (CTC). Detailed itemized analysis of Basic salary, HRA, Employee PF (12%), Professional Tax, and monthly TDS withholdings."
      initialAnnualCTC={1200000}
      asOfDate="FY 2024-25 & FY 2025-26"
      breadcrumbs={[
        { label: "Investments", href: "/investments" },
        { label: "Salary Calculator", href: "/salary-calculator" },
      ]}
      faqs={faqs}
      relatedLinks={relatedLinks}
    />
  );
}

import React from "react";
import { Metadata } from "next";
import { GratuityCalculatorView } from "@/components/calculators/GratuityCalculatorView";
import { FAQItem } from "@/components/ui/FAQSection";

export const metadata: Metadata = {
  title: "Gratuity Calculator - Payment of Gratuity Act 1972 Calculator India",
  description:
    "Calculate your gratuity payout under the Payment of Gratuity Act, 1972 using the 15/26 working days formula. Check 5-year eligibility and Section 10(10) ₹20 Lakh tax exemption.",
  alternates: {
    canonical: "/gratuity-calculator",
  },
  openGraph: {
    title: "Gratuity Calculator - Payment of Gratuity Act 1972 Calculator",
    description:
      "Accurate Indian gratuity calculator based on statutory 15/26 working day formula and ₹20 Lakh lifetime tax exemption.",
    url: "/gratuity-calculator",
    type: "website",
  },
};

export default function GratuityCalculatorPage() {
  const faqs: FAQItem[] = [
    {
      question: "What is the formula to calculate gratuity under the Payment of Gratuity Act, 1972?",
      answer:
        "For employees covered under the Act: Gratuity = (15 × Last Drawn Basic Salary + DA × Tenure in Years) / 26. Here, 15 represents 15 working days per completed year of service, and 26 represents the standard number of working days in a month (excluding 4 Sundays).",
    },
    {
      question: "Is 5 years of service mandatory to receive gratuity?",
      answer:
        "Yes. Under Section 4(1) of the Act, an employee must complete a minimum of 5 continuous years of service with an organization to be eligible for gratuity upon resignation, retirement, or superannuation. The only exceptions are demise or permanent disablement.",
    },
    {
      question: "How are fractions of a year treated in gratuity calculations?",
      answer:
        "For organizations covered under the Payment of Gratuity Act, any service tenure exceeding 6 months is rounded up to the next full year. For example, a tenure of 6 years and 7 months is calculated as 7 full years.",
    },
    {
      question: "What is the maximum tax-free gratuity limit in India?",
      answer:
        "Under Section 10(10) of the Income Tax Act, gratuity received up to ₹20,00,000 (Twenty Lakhs) across an employee's entire working lifetime is 100% tax-free. Any gratuity amount exceeding ₹20 Lakhs is added to taxable salary income.",
    },
  ];

  const relatedLinks = [
    {
      title: "Salary In-Hand Calculator",
      description: "Understand your Basic Salary component and monthly take-home pay.",
      href: "/salary-calculator",
      badge: "Salary Planning",
    },
    {
      title: "EPF Calculator",
      description: "Calculate your accumulated employer and employee provident fund.",
      href: "/epf-calculator",
      badge: "Retirement Benefit",
    },
    {
      title: "NPS Calculator",
      description: "Estimate your monthly pension from National Pension System investments.",
      href: "/nps-calculator",
      badge: "Pension Wealth",
    },
  ];

  return (
    <GratuityCalculatorView
      title="Gratuity Calculator: Payment of Gratuity Act, 1972"
      description="Estimate your statutory retirement or resignation gratuity payout based on last drawn monthly basic salary and years of continuous service. Verifies 5-year eligibility and Section 10(10) ₹20 Lakh tax exemption."
      initialMonthlyBasic={50000}
      initialTenureYears={10}
      asOfDate="Payment of Gratuity Act, 1972"
      breadcrumbs={[
        { label: "Savings", href: "/savings" },
        { label: "Gratuity Calculator", href: "/gratuity-calculator" },
      ]}
      faqs={faqs}
      relatedLinks={relatedLinks}
    />
  );
}

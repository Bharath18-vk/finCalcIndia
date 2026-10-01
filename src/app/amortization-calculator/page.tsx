import React from "react";
import { Metadata } from "next";
import { AmortizationCalculatorView } from "@/components/calculators/AmortizationCalculatorView";
import { BENCHMARK_RATES } from "@/data/rates/benchmarks";
import { FAQItem } from "@/components/ui/FAQSection";

export const metadata: Metadata = {
  title: "Loan Amortization Schedule Calculator - Yearly & Monthly Principal Breakdown",
  description:
    "Generate full monthly and annual loan amortization schedules on a reducing balance basis. View interest vs principal splits and remaining loan balances.",
  alternates: {
    canonical: "/amortization-calculator",
  },
  openGraph: {
    title: "Loan Amortization Calculator - Complete Reducing Balance Breakdown",
    description:
      "Interactive month-by-month and year-by-year amortization table showing exact principal repayment, interest charges, and closing balances.",
    url: "/amortization-calculator",
    type: "website",
  },
};

export default function AmortizationCalculatorPage() {
  const benchmark = BENCHMARK_RATES.homeLoan || {
    defaultRate: 8.5,
    verifiedAt: "2024-10-01",
  };

  const faqs: FAQItem[] = [
    {
      question: "What is a loan amortization schedule?",
      answer:
        "A loan amortization schedule is a complete table showing every periodic installment of a reducing-balance loan, detailing how much of each payment goes towards interest, how much goes towards principal repayment, and the remaining loan balance.",
    },
    {
      question: "Why is the interest portion so high in the early years of a loan?",
      answer:
        "Interest is calculated as a percentage of your outstanding principal balance. Because your principal balance is highest in the initial years, the monthly interest charge is highest. As you gradually repay the principal, future interest charges drop, allowing more of your fixed monthly EMI to pay down principal.",
    },
    {
      question: "How can I use an amortization schedule to claim income tax deductions?",
      answer:
        "For home loans in India, your annual amortization statement shows the exact total interest paid (deductible up to ₹2 Lakh under Section 24(b)) and the exact principal repaid (deductible up to ₹1.5 Lakh under Section 80C under the Old Tax Regime).",
    },
    {
      question: "What is the difference between flat interest and reducing balance amortization?",
      answer:
        "In a flat rate loan, interest is charged on the original borrowed amount throughout the entire tenure, making it significantly more expensive. In reducing balance amortization (used by all RBI-regulated home and auto loans), interest is charged strictly on the remaining unpaid principal balance.",
    },
  ];

  const relatedLinks = [
    {
      title: "General EMI Calculator",
      description: "Fast monthly installment calculation for any loan type.",
      href: "/emi-calculator",
      badge: "EMI Tool",
    },
    {
      title: "Home Loan Prepayment Calculator",
      description: "Model how extra payments reduce your amortization schedule.",
      href: "/loan-prepayment-calculator",
      badge: "Debt Reduction",
    },
    {
      title: "Loan Eligibility Calculator",
      description: "Calculate maximum borrowing capacity based on take-home salary.",
      href: "/loan-eligibility-calculator",
    },
    {
      title: "Loan Hub",
      description: "All loan calculation, borrowing, and amortization tools.",
      href: "/loans",
    },
  ];

  return (
    <AmortizationCalculatorView
      title="Loan Amortization Schedule Calculator"
      badge="Repayment Schedule"
      description="Generate comprehensive month-by-month and year-by-year reducing balance amortization tables showing exact interest charges, principal repayment, and outstanding balances."
      initialPrincipal={3000000}
      initialAnnualRate={benchmark.defaultRate}
      initialTenureYears={20}
      benchmarkNote={`Floating Loan Benchmark: ${benchmark.defaultRate}%`}
      asOfDate={benchmark.verifiedAt}
      breadcrumbs={[
        { label: "Loan Calculators", href: "/loans" },
        { label: "Amortization Calculator", href: "/amortization-calculator" },
      ]}
      faqs={faqs}
      relatedLinks={relatedLinks}
    />
  );
}

"use client";

import React, { useState, useMemo } from "react";
import { calculateGratuity, STATUTORY_GRATUITY_EXEMPTION_LIMIT, GRATUITY_STATUTORY_METADATA } from "@/lib/calculators/gratuity";
import { formatINR } from "@/lib/formatters";
import { trackCalculatorUsed, trackCalculatorResultGenerated } from "@/lib/analytics";
import { CalculatorLayout } from "@/components/layout/CalculatorLayout";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { TenureInput } from "@/components/ui/TenureInput";
import { ResultCard } from "@/components/ui/ResultCard";
import { FinancialBreakdownChart } from "@/components/ui/Chart";
import { FormulaExplanation } from "@/components/ui/FormulaExplanation";
import { FAQSection, FAQItem } from "@/components/ui/FAQSection";
import { RelatedCalculators, RelatedLink } from "@/components/ui/RelatedCalculators";
import { BreadcrumbItem } from "@/components/ui/Breadcrumbs";

export interface GratuityCalculatorViewProps {
  title: string;
  badge?: string;
  description: string;
  initialMonthlyBasic: number;
  initialTenureYears: number;
  asOfDate?: string;
  breadcrumbs: BreadcrumbItem[];
  faqs: FAQItem[];
  relatedLinks: RelatedLink[];
}

export const GratuityCalculatorView: React.FC<GratuityCalculatorViewProps> = ({
  title,
  badge = "Payment of Gratuity Act, 1972",
  description,
  initialMonthlyBasic,
  initialTenureYears,
  asOfDate = "Payment of Gratuity Act, 1972 / Section 10(10)",
  breadcrumbs,
  faqs,
  relatedLinks,
}) => {
  const [monthlyBasicSalary, setMonthlyBasicSalary] = useState(initialMonthlyBasic);
  const [monthlyDearnessAllowance, setMonthlyDearnessAllowance] = useState(0);
  const [tenureYears, setTenureYears] = useState(initialTenureYears);
  const [tenureMonths, setTenureMonths] = useState(0);
  const [isCoveredUnderAct, setIsCoveredUnderAct] = useState(true);
  const [waiveFiveYearRule, setWaiveFiveYearRule] = useState(false);

  const result = useMemo(() => {
    return calculateGratuity({
      monthlyBasicSalary,
      monthlyDearnessAllowance,
      tenureYears,
      tenureMonths,
      isCoveredUnderAct,
      waiveFiveYearRuleForDeathOrDisablement: waiveFiveYearRule,
    });
  }, [monthlyBasicSalary, monthlyDearnessAllowance, tenureYears, tenureMonths, isCoveredUnderAct, waiveFiveYearRule]);

  const handleBasicChange = (val: number) => {
    setMonthlyBasicSalary(val);
    trackCalculatorUsed("gratuity", "basicSalary");
    trackCalculatorResultGenerated("gratuity");
  };

  const handleYearsChange = (years: number) => {
    setTenureYears(years);
    trackCalculatorUsed("gratuity", "tenureYears");
    trackCalculatorResultGenerated("gratuity");
  };

  const directAnswer = result.isEligible
    ? `For a last drawn basic salary of ${formatINR(
        monthlyBasicSalary
      )} and ${tenureYears} years ${tenureMonths} months of service, your calculated statutory gratuity is ${formatINR(
        result.totalGratuityCalculated
      )} using the formula: ${result.formulaDisplay}. The entire amount of ${formatINR(
        result.taxExemptGratuity
      )} is 100% tax-free under Section 10(10) (subject to the statutory ₹20 Lakh lifetime ceiling).`
    : `Under Section 4(1) of the Payment of Gratuity Act, 1972, gratuity requires a minimum of 5 continuous years of service. With ${tenureYears} years ${tenureMonths} months of service, you are currently not eligible for a gratuity payout (unless the 5-year requirement is waived due to death or permanent disablement).`;

  return (
    <CalculatorLayout
      title={title}
      badge={badge}
      description={description}
      directAnswer={directAnswer}
      breadcrumbs={breadcrumbs}
      asOfDate={asOfDate}
      inputsSlot={
        <div className="space-y-6">
          <CurrencyInput
            label="Last Drawn Monthly Basic Salary"
            value={monthlyBasicSalary}
            onChange={handleBasicChange}
            min={5000}
            max={5000000}
            step={5000}
            presets={[
              { label: "₹30,000", value: 30000 },
              { label: "₹50,000", value: 50000 },
              { label: "₹75,000", value: 75000 },
              { label: "₹1.5 Lakh", value: 150000 },
            ]}
            helperText="Last drawn month's basic salary credited before exit."
          />

          <CurrencyInput
            label="Monthly Dearness Allowance (DA)"
            value={monthlyDearnessAllowance}
            onChange={setMonthlyDearnessAllowance}
            min={0}
            max={1000000}
            step={2000}
            helperText="DA forming part of retirement benefits (standard for PSUs/Govt; typically ₹0 for private sector)."
          />

          <TenureInput
            label="Completed Continuous Service Tenure"
            years={tenureYears}
            months={tenureMonths}
            onYearsChange={handleYearsChange}
            onMonthsChange={(m) => setTenureMonths(m)}
            minYears={1}
            maxYears={45}
            presets={[
              { label: "5 Years", years: 5 },
              { label: "10 Years", years: 10 },
              { label: "15 Years", years: 15 },
              { label: "25 Years", years: 25 },
            ]}
            helperText="Minimum 5 continuous years required under Section 4(1)."
          />

          {/* Covered Under Act Toggle */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <label className="flex items-center justify-between cursor-pointer p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
              <div>
                <span className="text-sm font-semibold text-slate-800">
                  Covered under Payment of Gratuity Act, 1972
                </span>
                <p className="text-xs text-slate-500">
                  Applies to establishments with 10+ employees. Uses 15/26 formula and rounds service &gt; 6 months to the next year.
                </p>
              </div>
              <input
                type="checkbox"
                checked={isCoveredUnderAct}
                onChange={(e) => setIsCoveredUnderAct(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
              <div>
                <span className="text-sm font-semibold text-slate-800">
                  Waive 5-Year Tenure Rule (Death or Permanent Disablement)
                </span>
                <p className="text-xs text-slate-500">
                  Second proviso to Section 4(1): 5-year continuous service condition is not mandatory in case of death or disablement.
                </p>
              </div>
              <input
                type="checkbox"
                checked={waiveFiveYearRule}
                onChange={(e) => setWaiveFiveYearRule(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>
      }
      resultsSlot={
        <div className="space-y-6">
          {!result.isEligible && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-sm space-y-1">
              <span className="font-bold block">⚠️ 5-Year Continuous Service Requirement</span>
              <p>{result.eligibilityReason}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              label="Total Statutory Gratuity Payable"
              value={formatINR(result.totalGratuityCalculated)}
              subtext={`Based on ${result.effectiveServiceYears} effective service years (${result.formulaDisplay})`}
              highlight
            />
            <ResultCard
              label="Tax-Free Gratuity"
              value={formatINR(result.taxExemptGratuity)}
              subtext="100% Tax-Exempt under Section 10(10)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ResultCard
              label="Taxable Gratuity Component"
              value={formatINR(result.taxableGratuity)}
              subtext={result.taxableGratuity > 0 ? "Subject to income tax slab" : "₹0 taxable amount"}
            />
            <ResultCard
              label="Statutory Exemption Ceiling"
              value={formatINR(STATUTORY_GRATUITY_EXEMPTION_LIMIT)}
              subtext="Section 10(10) lifetime limit (₹20 Lakhs)"
            />
          </div>

          {result.totalGratuityCalculated > 0 && (
            <FinancialBreakdownChart
              slices={[
                { label: "Tax-Exempt Gratuity", value: result.taxExemptGratuity, color: "#059669" },
                ...(result.taxableGratuity > 0
                  ? [{ label: "Taxable Gratuity (> ₹20L)", value: result.taxableGratuity, color: "#dc2626" }]
                  : []),
              ]}
              title="Gratuity Tax Exemption Status (Section 10(10))"
            />
          )}
        </div>
      }
      formulaExplanationSlot={
        <FormulaExplanation
          calculatorName="Statutory Gratuity Formulas & Rules"
          formula="Gratuity = 15/26 × Last Drawn Eligible Wages × Completed Years of Service"
          variables={[
            { symbol: "15/26", description: "15 working days out of 26 monthly working days (excluding 4 Sundays per wage month under Section 4(2))" },
            { symbol: "Eligible Wages", description: "Last drawn monthly Basic Salary + Dearness Allowance (DA)" },
            { symbol: "Completed Years", description: "Service tenure. For covered employees, months > 6 round up to the next full year" },
            { symbol: "Non-Covered Formula", description: "Gratuity = 15/30 × Last Drawn Wages × Completed Years of Service (only completed years count)" },
          ]}
          notes={[
            "Payment of Gratuity Act, 1972 applies to factories, mines, oilfields, plantations, ports, railway companies, shops, and establishments with 10 or more employees.",
            "Section 4(1) mandates a minimum of 5 continuous years of service for eligibility. This condition is explicitly waived under the second proviso in case of death or disablement.",
            "Under Section 10(10) of the Income Tax Act, gratuity received is tax-exempt up to a lifetime statutory ceiling of ₹20,00,000 (Twenty Lakh Rupees). Any excess above ₹20 Lakhs is taxable as income.",
          ]}
        />
      }
      faqSlot={<FAQSection faqs={faqs} />}
      relatedCalculatorsSlot={<RelatedCalculators links={relatedLinks} />}
    />
  );
};

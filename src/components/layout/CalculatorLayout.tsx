import React from "react";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { AdSlot } from "@/components/ui/AdSlot";

export interface CalculatorLayoutProps {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  badge?: string;
  description: string;
  directAnswer?: string; // Direct answer within the first 100 words for SEO
  inputsSlot: React.ReactNode;
  resultsSlot: React.ReactNode;
  chartSlot?: React.ReactNode;
  comparisonTablesSlot?: React.ReactNode;
  contentSlot?: React.ReactNode;
  formulaExplanationSlot?: React.ReactNode;
  faqSlot?: React.ReactNode;
  relatedCalculatorsSlot?: React.ReactNode;
  affiliateSlot?: React.ReactNode;
  asOfDate?: string;
}

export const CalculatorLayout: React.FC<CalculatorLayoutProps> = ({
  breadcrumbs,
  title,
  badge,
  description,
  directAnswer,
  inputsSlot,
  resultsSlot,
  chartSlot,
  comparisonTablesSlot,
  contentSlot,
  formulaExplanationSlot,
  faqSlot,
  relatedCalculatorsSlot,
  affiliateSlot,
  asOfDate,
}) => {
  return (
    <article className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 overflow-hidden">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Header and Direct Answer */}
      <header className="space-y-3.5 max-w-4xl">
        <div className="flex items-center gap-2.5">
          {badge && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
              {badge}
            </span>
          )}
          {asOfDate && (
            <span className="text-xs text-slate-500 font-medium">
              Verified: {asOfDate}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {title}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {description}
        </p>

        {/* Direct Answer Box for SEO & Immediate User Value (First 100 words) */}
        {directAnswer && (
          <div className="p-4 sm:p-5 rounded-xl bg-emerald-50/80 border border-emerald-200/90 text-sm font-medium text-emerald-950 leading-relaxed shadow-sm">
            <span className="font-bold text-emerald-900 mr-1.5">Direct Answer:</span>
            {directAnswer}
          </div>
        )}
      </header>

      {/* Ad slot after intro - non disruptive */}
      <AdSlot slotId="header-bottom" format="horizontal-banner" />

      {/* Main Calculator Grid:
          Desktop: inputs left, results & chart right
          Mobile: inputs, then results immediately below, then chart
      */}
      <section
        aria-label="Interactive Calculator Workspace"
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start"
      >
        {/* Left Column: Inputs */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Adjust Parameters
          </h2>
          {inputsSlot}
        </div>

        {/* Right Column: Key Results & Visual Chart */}
        <div className="lg:col-span-6 space-y-6">
          {resultsSlot}
          {chartSlot && <div>{chartSlot}</div>}
        </div>
      </section>

      {/* Contextual Affiliate Slot (Inactive by default) */}
      {affiliateSlot}

      {/* Comparison & Sensitivity Tables */}
      {comparisonTablesSlot && (
        <section aria-label="Tenure and Sensitivity Analysis" className="w-full">
          {comparisonTablesSlot}
        </section>
      )}

      {/* Ad slot between calculator/tables and deep content */}
      <AdSlot slotId="mid-content" format="horizontal-banner" />

      {/* Computed In-depth Content */}
      {contentSlot && (
        <section aria-label="Detailed Analysis" className="w-full max-w-4xl space-y-4 text-slate-700 leading-relaxed text-sm sm:text-base">
          {contentSlot}
        </section>
      )}

      {/* Mathematical Formula Explanation & Assumptions */}
      {formulaExplanationSlot && (
        <section aria-label="Calculation Methodology" className="w-full">
          {formulaExplanationSlot}
        </section>
      )}

      {/* Frequently Asked Questions */}
      {faqSlot && (
        <section aria-label="Frequently Asked Questions" className="w-full">
          {faqSlot}
        </section>
      )}

      {/* Related Scenarios and Hub Links */}
      {relatedCalculatorsSlot && (
        <section aria-label="Related Financial Scenarios" className="w-full">
          {relatedCalculatorsSlot}
        </section>
      )}

      {/* Regulatory & Institutional Disclaimer */}
      <Disclaimer asOfDate={asOfDate} />
    </article>
  );
};

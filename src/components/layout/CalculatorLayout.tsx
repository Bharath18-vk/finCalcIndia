import React from "react";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { AdSlot } from "@/components/ui/AdSlot";
import { Printer } from "lucide-react";

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
      <div className="print:hidden">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      {/* Official Print-Only Document Header Banner */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">FinCalc India</span>
            <span className="text-xs text-slate-600 block">fincalcindia.in · Official Financial Calculation Report</span>
          </div>
          <div className="text-right text-xs text-slate-600">
            <div>Report Generated: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
            <div className="font-bold text-slate-900">{title}</div>
          </div>
        </div>
      </div>

      {/* Header and Direct Answer */}
      <header className="space-y-4 max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            {badge && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 uppercase tracking-wide">
                {badge}
              </span>
            )}
            {asOfDate && (
              <span className="text-xs text-slate-500 font-medium">
                Verified: {asOfDate}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") window.print();
            }}
            className="print:hidden inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 text-slate-700 shadow-xs transition-all cursor-pointer active:scale-95"
            title="Print or Save this calculation report as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print / Save PDF</span>
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {title}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
          {description}
        </p>

        {/* Direct Answer Box for SEO & Immediate User Value (First 100 words) */}
        {directAnswer && (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-sm font-medium text-emerald-950 leading-relaxed shadow-xs">
            <span className="font-bold text-emerald-900 mr-1.5">Direct Answer:</span>
            {directAnswer}
          </div>
        )}
      </header>

      {/* Ad slot after intro - non disruptive */}
      <AdSlot slotId="header-bottom" format="horizontal-banner" />

      {/* Main Calculator Grid:
          Desktop: inputs left, sticky results & chart right
          Mobile: inputs, then results immediately below, then chart
      */}
      <section
        aria-label="Interactive Calculator Workspace"
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start"
      >
        {/* Left Column: Inputs */}
        <div className="lg:col-span-6 w-full min-w-0 bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Adjust Parameters
            </h2>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Live Interactive
            </span>
          </div>
          {inputsSlot}
        </div>

        {/* Right Column: Key Results & Visual Chart (Sticky on Desktop) */}
        <div className="lg:col-span-6 w-full min-w-0 lg:sticky lg:top-20 space-y-6 self-start">
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

      {/* Official Print-Only Footer Note */}
      <div className="hidden print:block pt-6 border-t border-slate-300 text-[10px] text-slate-500">
        <p>
          <strong>Official Notice:</strong> This summary document is generated for informational and budgeting purposes via FinCalc India (fincalcindia.in).
          Bank loan approvals, credit assessments, interest rates, tax calculations, and actual statutory liabilities remain subject to prevailing RBI directives, CBDT regulations, and individual lender underwriting policies.
        </p>
      </div>
    </article>
  );
};

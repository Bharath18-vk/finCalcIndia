import React from "react";

export interface FormulaStep {
  label: string;
  expression: string;
  explanation: string;
}

export interface FormulaExplanationProps {
  title?: string;
  calculatorName?: string;
  formula: string;
  variables: { symbol: string; name?: string; description?: string; valueDescription?: string }[];
  steps?: FormulaStep[];
  conventions?: string[];
  notes?: string[];
}

export const FormulaExplanation: React.FC<FormulaExplanationProps> = ({
  title,
  calculatorName,
  formula,
  variables,
  steps,
  conventions,
  notes,
}) => {
  const displayTitle = title || (calculatorName ? `How ${calculatorName} is Calculated` : "How This Is Calculated");
  const allConventions = conventions || notes || [];
  return (
    <section className="w-full bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{displayTitle}</h2>
        <p className="text-xs sm:text-sm text-slate-600">
          Transparent mathematical formulas and assumptions used across our financial engines.
        </p>
      </div>

      {/* Formula Display Box */}
      <div className="p-4 sm:p-5 bg-slate-900 text-white rounded-xl font-mono text-sm sm:text-base overflow-x-auto shadow-inner">
        <div className="text-xs text-slate-400 font-sans uppercase tracking-wider mb-1">
          Mathematical Formula
        </div>
        <div className="text-emerald-400 font-bold">{formula}</div>
      </div>

      {/* Variables Table */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Variables & Legend
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
          {variables.map((v) => (
            <div
              key={v.symbol}
              className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200/70"
            >
              <span className="font-mono font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded text-xs shrink-0">
                {v.symbol}
              </span>
              <div>
                <span className="font-semibold text-slate-800">{v.name || v.description}</span>
                {v.valueDescription && (
                  <p className="text-slate-500 text-xs mt-0.5">{v.valueDescription}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Steps Example */}
      {steps && steps.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Step-by-Step Calculation
          </h3>
          <ol className="space-y-2 list-decimal list-inside text-xs sm:text-sm text-slate-700">
            {steps.map((st, i) => (
              <li key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-900">{st.label}:</span>{" "}
                <code className="text-emerald-700 font-mono text-xs bg-emerald-50 px-1 py-0.5 rounded">
                  {st.expression}
                </code>
                <p className="text-slate-600 text-xs mt-1 ml-4">{st.explanation}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Conventions & Assumptions */}
      {allConventions && allConventions.length > 0 && (
        <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/70 space-y-1.5">
          <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
            Conventions & Assumptions
          </h4>
          <ul className="list-disc list-inside space-y-1 text-xs text-emerald-900">
            {allConventions.map((c, idx) => (
              <li key={idx} className="leading-relaxed">
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

import React from "react";
import { formatHumanReadableMath, splitCompoundFormulas } from "@/lib/format-math";

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
  const subFormulas = splitCompoundFormulas(formula);

  return (
    <section className="w-full bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{displayTitle}</h2>
        <p className="text-xs sm:text-sm text-slate-600">
          Transparent, human-readable mathematical formulas and verifiable assumptions.
        </p>
      </div>

      {/* Formula Display Box */}
      <div className="p-4 sm:p-5 bg-slate-900 text-white rounded-xl shadow-inner space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="text-xs text-slate-400 font-sans uppercase tracking-wider font-semibold">
            {subFormulas.length > 1 ? `Mathematical Formulas (${subFormulas.length})` : "Mathematical Formula"}
          </div>
          <span className="text-[11px] text-emerald-400 font-sans font-medium px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
            Standard Notation
          </span>
        </div>

        {subFormulas.length > 1 ? (
          <div className="space-y-2.5">
            {subFormulas.map((sub, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-slate-800/80 rounded-lg border border-slate-700/60 hover:border-emerald-500/40 transition-colors"
              >
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-sans font-bold border border-emerald-500/30 shrink-0 w-fit">
                  Formula {idx + 1}
                </span>
                <div className="font-mono text-sm sm:text-base font-bold text-emerald-300 overflow-x-auto tracking-wide">
                  {sub}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/60 font-mono text-sm sm:text-base font-bold text-emerald-300 overflow-x-auto tracking-wide">
            {subFormulas[0] || formatHumanReadableMath(formula)}
          </div>
        )}
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
                {formatHumanReadableMath(v.symbol)}
              </span>
              <div>
                <span className="font-semibold text-slate-800">
                  {formatHumanReadableMath(v.name || v.description || "")}
                </span>
                {v.valueDescription && (
                  <p className="text-slate-500 text-xs mt-0.5">
                    {formatHumanReadableMath(v.valueDescription)}
                  </p>
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
                <code className="text-emerald-700 font-mono text-xs bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/50">
                  {formatHumanReadableMath(st.expression)}
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
                {formatHumanReadableMath(c)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

"use client";

import React, { useState } from "react";
import { formatINR } from "@/lib/formatters";
import { Check, Copy } from "lucide-react";

export interface MetricItem {
  label: string;
  value: number | string;
  color?: string; // e.g. text-emerald-600 or dot indicator
  formattedValue?: string;
  subtext?: string;
}

export interface ResultCardProps {
  // Legacy / full-panel mode
  title?: string;
  primaryTitle?: string;
  primaryValue?: number;
  primaryFormattedValue?: string;
  primarySubtitle?: string;
  secondaryMetrics?: MetricItem[];
  ratioNote?: string;
  onReset?: () => void;

  // Single metric card mode
  label?: string;
  value?: string | number;
  subtext?: string;
  highlight?: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = (props) => {
  const [copied, setCopied] = useState(false);

  // Single metric card mode
  if (props.label !== undefined) {
    const isHighlight = props.highlight;
    return (
      <div
        className={`p-4 sm:p-5 rounded-xl border transition-all ${
          isHighlight
            ? "bg-emerald-50/70 border-emerald-300 text-slate-900 shadow-xs"
            : "bg-white border-slate-200/90 text-slate-900 shadow-xs hover:border-slate-300"
        }`}
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
          {props.label}
        </span>
        <div
          className={`text-xl sm:text-2xl font-black tracking-tight tabular-nums ${
            isHighlight ? "text-emerald-700" : "text-slate-900"
          }`}
        >
          {typeof props.value === "number" ? formatINR(props.value) : props.value}
        </div>
        {props.subtext && (
          <p className="text-xs text-slate-500 mt-1 font-medium">{props.subtext}</p>
        )}
      </div>
    );
  }

  const {
    title,
    primaryTitle = props.title || "Result",
    primaryValue = 0,
    primaryFormattedValue,
    primarySubtitle,
    secondaryMetrics = [],
    ratioNote,
    onReset,
  } = props;

  const handleCopySummary = async () => {
    const primaryDisplay = primaryFormattedValue || formatINR(primaryValue);
    const summaryLines = [
      `${primaryTitle}: ${primaryDisplay}`,
      ...secondaryMetrics.map((m) => {
        const valStr = m.formattedValue || (typeof m.value === "number" ? formatINR(m.value) : String(m.value));
        return `${m.label}: ${valStr}`;
      }),
    ];
    try {
      await navigator.clipboard.writeText(summaryLines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard access fallback
    }
  };

  return (
    <div className="relative overflow-hidden w-full rounded-2xl p-6 sm:p-7 border border-slate-800/90 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white shadow-xl">
      {/* Subtle top ambient accent highlight */}
      <div
        className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              {primaryTitle}
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              Computed
            </span>
          </div>

          <div className="mt-1.5 text-3xl sm:text-4xl lg:text-[40px] font-black text-emerald-400 tracking-tight tabular-nums leading-none">
            {primaryFormattedValue || formatINR(primaryValue)}
          </div>
          {primarySubtitle && (
            <p className="mt-2 text-xs sm:text-sm text-slate-300 font-medium">
              {primarySubtitle}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopySummary}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/90 hover:bg-slate-700/90 hover:text-white active:scale-95 rounded-lg border border-slate-700/80 transition-all cursor-pointer select-none"
          title="Copy results summary to clipboard"
          aria-label="Copy results summary"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {ratioNote && (
        <div className="relative mt-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 font-medium leading-relaxed">
          {ratioNote}
        </div>
      )}

      {secondaryMetrics.length > 0 && (
        <div className="relative mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {secondaryMetrics.map((metric, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                {metric.color && (
                  <span className={`w-2 h-2 rounded-full shrink-0 ${metric.color}`} />
                )}
                <span className="truncate">{metric.label}</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-white tracking-tight tabular-nums">
                {metric.formattedValue || (typeof metric.value === "number" ? formatINR(metric.value) : metric.value)}
              </div>
              {metric.subtext && (
                <div className="text-[11px] text-slate-400 font-medium">
                  {metric.subtext}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {onReset && (
        <div className="relative mt-5 pt-4 border-t border-slate-800/80 flex justify-end">
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-4 cursor-pointer transition-colors"
          >
            Reset to default values
          </button>
        </div>
      )}
    </div>
  );
};

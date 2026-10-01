"use client";

import React, { useState } from "react";
import { formatINR } from "@/lib/formatters";
import { Check, Copy } from "lucide-react";

export interface MetricItem {
  label: string;
  value: number;
  color?: string; // e.g. text-emerald-600 or dot indicator
  formattedValue?: string;
  subtext?: string;
}

export interface ResultCardProps {
  // Legacy / full-panel mode
  primaryTitle?: string;
  primaryValue?: number;
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
            ? "bg-emerald-50/80 border-emerald-300 text-slate-900 shadow-sm"
            : "bg-white border-slate-200 text-slate-900 shadow-sm"
        }`}
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
          {props.label}
        </span>
        <div
          className={`text-xl sm:text-2xl font-black tracking-tight ${
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
    primaryTitle = "Result",
    primaryValue = 0,
    primarySubtitle,
    secondaryMetrics = [],
    ratioNote,
    onReset,
  } = props;

  const handleCopySummary = async () => {
    const summaryLines = [
      `${primaryTitle}: ${formatINR(primaryValue)}`,
      ...secondaryMetrics.map((m) => `${m.label}: ${m.formattedValue || formatINR(m.value)}`),
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
    <div className="w-full bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-slate-800">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            {primaryTitle}
          </span>
          <div className="mt-1 text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight">
            {formatINR(primaryValue)}
          </div>
          {primarySubtitle && (
            <p className="mt-1 text-xs sm:text-sm text-slate-300 font-medium">
              {primarySubtitle}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopySummary}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 hover:text-white rounded-lg border border-slate-700 transition-colors"
          title="Copy results summary to clipboard"
          aria-label="Copy results summary"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
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
        <div className="mt-4 p-2.5 rounded-lg bg-slate-800/70 border border-slate-700/60 text-xs text-slate-300">
          {ratioNote}
        </div>
      )}

      <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {secondaryMetrics.map((metric, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              {metric.color && (
                <span className={`w-2 h-2 rounded-full ${metric.color}`} />
              )}
              <span>{metric.label}</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-white tracking-tight">
              {metric.formattedValue || formatINR(metric.value)}
            </div>
            {metric.subtext && (
              <div className="text-[11px] text-slate-400 font-medium">
                {metric.subtext}
              </div>
            )}
          </div>
        ))}
      </div>

      {onReset && (
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex justify-end">
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-4"
          >
            Reset to default values
          </button>
        </div>
      )}
    </div>
  );
};

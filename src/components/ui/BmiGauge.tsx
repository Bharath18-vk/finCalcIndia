"use client";

import React from "react";

export interface BmiGaugeProps {
  bmi: number;
  standard?: "icmr" | "who";
  categoryLabel?: string;
  categoryColor?: string;
}

export const BmiGauge: React.FC<BmiGaugeProps> = ({
  bmi,
  standard = "icmr",
  categoryLabel,
  categoryColor = "text-emerald-700",
}) => {
  // Clamp BMI between 12 and 40 for visual scale display
  const minBmi = 12;
  const maxBmi = 40;
  const clampedBmi = Math.min(Math.max(bmi, minBmi), maxBmi);
  const positionPercent = ((clampedBmi - minBmi) / (maxBmi - minBmi)) * 100;

  // Segment boundaries on scale 12 to 40
  // Underweight: 12 - 18.5 -> ((18.5 - 12) / 28) * 100 = 23.2%
  const underweightWidth = ((18.5 - 12) / (maxBmi - minBmi)) * 100;

  // Normal:
  // ICMR: 18.5 - 22.9 -> ((22.9 - 18.5) / 28) * 100 = 15.7%
  // WHO: 18.5 - 24.9 -> ((24.9 - 18.5) / 28) * 100 = 22.8%
  const normalEnd = standard === "icmr" ? 22.9 : 24.9;
  const normalWidth = ((normalEnd - 18.5) / (maxBmi - minBmi)) * 100;

  // Overweight:
  // ICMR: 22.9 - 24.9 -> ((24.9 - 22.9) / 28) * 100 = 7.1%
  // WHO: 24.9 - 29.9 -> ((29.9 - 24.9) / 28) * 100 = 17.8%
  const overweightEnd = standard === "icmr" ? 24.9 : 29.9;
  const overweightWidth = ((overweightEnd - normalEnd) / (maxBmi - minBmi)) * 100;

  // Obese: remaining width
  const obeseWidth = 100 - (underweightWidth + normalWidth + overweightWidth);

  return (
    <div className="w-full bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            BMI Clinical Spectrum ({standard === "icmr" ? "ICMR / Asian-Indian" : "WHO Global"})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Visual classification of metabolic risk category
          </p>
        </div>
        <div className="text-right">
          <span className="text-lg font-black text-slate-900">{bmi.toFixed(1)}</span>
          <span className="text-xs text-slate-500 block -mt-1 font-medium">kg/m²</span>
        </div>
      </div>

      {/* Visual Spectrum Bar */}
      <div className="pt-4 pb-2">
        <div className="relative">
          {/* Needle / Pointer Marker */}
          <div
            className="absolute -top-3.5 transition-all duration-500 -translate-x-1/2 flex flex-col items-center z-10"
            style={{ left: `${positionPercent}%` }}
          >
            <div className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-900 text-white shadow-md whitespace-nowrap">
              {bmi.toFixed(1)}
            </div>
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-slate-900" />
          </div>

          {/* Segmented Bar */}
          <div className="h-4 w-full rounded-full overflow-hidden flex shadow-inner bg-slate-100">
            <div
              style={{ width: `${underweightWidth}%` }}
              className="bg-blue-400 h-full"
              title="Underweight (<18.5)"
            />
            <div
              style={{ width: `${normalWidth}%` }}
              className="bg-emerald-500 h-full"
              title={`Normal (${standard === "icmr" ? "18.5-22.9" : "18.5-24.9"})`}
            />
            <div
              style={{ width: `${overweightWidth}%` }}
              className="bg-amber-400 h-full"
              title={`Overweight (${standard === "icmr" ? "23.0-24.9" : "25.0-29.9"})`}
            />
            <div
              style={{ width: `${obeseWidth}%` }}
              className="bg-rose-500 h-full"
              title={`Obese (≥${standard === "icmr" ? "25.0" : "30.0"})`}
            />
          </div>

          {/* Scale Labels */}
          <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-2 px-1">
            <span>12 (Under)</span>
            <span>18.5</span>
            <span>{normalEnd}</span>
            <span>{overweightEnd}</span>
            <span>40+ (Obese)</span>
          </div>
        </div>
      </div>

      {/* Legend & Current Category */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shrink-0" />
          <span className="text-slate-600">Underweight (&lt;18.5)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-slate-600">
            Normal ({standard === "icmr" ? "18.5-22.9" : "18.5-24.9"})
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
          <span className="text-slate-600">
            Overweight ({standard === "icmr" ? "23-24.9" : "25-29.9"})
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
          <span className="text-slate-600">
            Obese (≥{standard === "icmr" ? "25.0" : "30.0"})
          </span>
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useId } from "react";
import { parseCleanNumber } from "@/lib/formatters";

export interface PercentageInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  presets?: { label: string; value: number }[];
  helperText?: string;
  benchmarkNote?: string;
  error?: string;
  id?: string;
}

export const PercentageInput: React.FC<PercentageInputProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 30,
  step = 0.1,
  presets,
  helperText,
  benchmarkNote,
  error,
  id: customId,
}) => {
  const generatedId = useId();
  const inputId = customId || generatedId;
  const errorId = `${inputId}-error`;

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    const clean = parseCleanNumber(raw);
    onChange(clean);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-slate-800 tracking-tight"
        >
          {label}
        </label>
        {benchmarkNote && (
          <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[200px] sm:max-w-none">
            {benchmarkNote}
          </span>
        )}
      </div>

      <div className="relative rounded-lg shadow-sm">
        <input
          id={inputId}
          type="text"
          inputMode="decimal"
          value={value > 0 ? value : ""}
          onChange={handleTextChange}
          placeholder="0"
          aria-describedby={error ? errorId : undefined}
          className={`block w-full min-h-[44px] rounded-lg border pl-4 pr-10 text-base sm:text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-400 bg-red-50/20"
              : "border-slate-300 focus:border-emerald-600 focus:ring-emerald-500 bg-white"
          }`}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 font-bold select-none">
          %
        </div>
      </div>

      {/* Touch-accessible range slider */}
      <div className="pt-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={Math.min(Math.max(value, min), max)}
          onChange={handleSliderChange}
          aria-label={`${label} slider`}
          className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <div className="flex justify-between text-[11px] font-medium text-slate-500 pt-1 select-none">
          <span>{min}%</span>
          <span>{max}%</span>
        </div>
      </div>

      {/* Preset fast chips */}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1" role="group" aria-label={`${label} quick presets`}>
          {presets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange(preset.value)}
              className={`min-h-[32px] px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
                value === preset.value
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {error ? (
        <p id={errorId} className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};

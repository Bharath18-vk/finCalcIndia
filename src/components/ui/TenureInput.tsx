"use client";

import React, { useId, useState } from "react";
import { parseCleanNumber } from "@/lib/formatters";

export interface TenureInputProps {
  label: string;
  years: number;
  months?: number;
  onYearsChange?: (y: number) => void;
  onChangeYears?: (y: number) => void;
  onMonthsChange?: (m: number) => void;
  minYears?: number;
  maxYears?: number;
  presets?: { label: string; years: number }[];
  allowMonths?: boolean;
  helperText?: string;
  error?: string;
  id?: string;
}

export const TenureInput: React.FC<TenureInputProps> = ({
  label,
  years,
  months = 0,
  onYearsChange,
  onChangeYears,
  onMonthsChange,
  minYears = 1,
  maxYears = 30,
  presets,
  allowMonths = true,
  helperText,
  error,
  id: customId,
}) => {
  const generatedId = useId();
  const inputId = customId || generatedId;
  const [viewMode, setViewMode] = useState<"years" | "months">("years");

  const totalMonths = years * 12 + months;

  const handleYears = (y: number) => {
    onYearsChange?.(y);
    onChangeYears?.(y);
  };

  const handleYearsTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    const val = parseCleanNumber(raw);
    handleYears(val);
  };

  const handleMonthsTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    const val = Math.min(11, parseCleanNumber(raw));
    onMonthsChange?.(val);
  };

  const handleTotalMonthsTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    const total = parseCleanNumber(raw);
    const newY = Math.floor(total / 12);
    const newM = total % 12;
    handleYears(newY);
    onMonthsChange?.(newM);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (viewMode === "years") {
      handleYears(val);
    } else {
      const newY = Math.floor(val / 12);
      const newM = val % 12;
      handleYears(newY);
      onMonthsChange?.(newM);
    }
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
        {allowMonths && (
          <div className="flex items-center p-0.5 bg-slate-100 rounded-md border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode("years")}
              className={`px-2 py-0.5 text-xs font-semibold rounded transition-colors ${
                viewMode === "years"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Years
            </button>
            <button
              type="button"
              onClick={() => setViewMode("months")}
              className={`px-2 py-0.5 text-xs font-semibold rounded transition-colors ${
                viewMode === "months"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Months
            </button>
          </div>
        )}
      </div>

      {viewMode === "years" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="relative rounded-lg shadow-sm">
            <input
              id={inputId}
              type="text"
              inputMode="numeric"
              value={years > 0 ? years : ""}
              onChange={handleYearsTextChange}
              placeholder="0"
              className="block w-full min-h-[44px] rounded-lg border border-slate-300 pl-4 pr-16 text-base sm:text-lg font-bold text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs font-bold text-slate-500 uppercase select-none">
              Years
            </div>
          </div>

          {allowMonths && onMonthsChange && (
            <div className="relative rounded-lg shadow-sm">
              <input
                id={`${inputId}-extra-months`}
                type="text"
                inputMode="numeric"
                value={months > 0 ? months : ""}
                onChange={handleMonthsTextChange}
                placeholder="0"
                aria-label="Additional months"
                className="block w-full min-h-[44px] rounded-lg border border-slate-300 pl-4 pr-16 text-base sm:text-lg font-bold text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs font-bold text-slate-500 uppercase select-none">
                Months
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative rounded-lg shadow-sm">
          <input
            id={inputId}
            type="text"
            inputMode="numeric"
            value={totalMonths > 0 ? totalMonths : ""}
            onChange={handleTotalMonthsTextChange}
            placeholder="0"
            className="block w-full min-h-[44px] rounded-lg border border-slate-300 pl-4 pr-20 text-base sm:text-lg font-bold text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs font-bold text-slate-500 uppercase select-none">
            Months
          </div>
        </div>
      )}

      {/* Touch-accessible range slider */}
      <div className="pt-1">
        <input
          type="range"
          min={viewMode === "years" ? minYears : minYears * 12}
          max={viewMode === "years" ? maxYears : maxYears * 12}
          step={1}
          value={viewMode === "years" ? Math.min(Math.max(years, minYears), maxYears) : Math.min(Math.max(totalMonths, minYears * 12), maxYears * 12)}
          onChange={handleSliderChange}
          aria-label={`${label} slider`}
          className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <div className="flex justify-between text-[11px] font-medium text-slate-500 pt-1 select-none">
          <span>{viewMode === "years" ? `${minYears} Y` : `${minYears * 12} M`}</span>
          <span>{viewMode === "years" ? `${maxYears} Y` : `${maxYears * 12} M`}</span>
        </div>
      </div>

      {/* Preset buttons */}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1" role="group" aria-label={`${label} quick presets`}>
          {presets.map((p) => (
            <button
              key={p.years}
              type="button"
              onClick={() => {
                handleYears(p.years);
                onMonthsChange?.(0);
              }}
              className={`min-h-[32px] px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
                years === p.years && months === 0
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {error ? (
        <p className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};

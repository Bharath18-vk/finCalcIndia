"use client";

import React, { useId } from "react";
import { parseCleanNumber, getSliderBackgroundStyle } from "@/lib/formatters";


export interface NumberInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  presets?: { label: string; value: number }[];
  helperText?: string;
  error?: string;
  unit?: string;
  id?: string;
  placeholder?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  presets,
  helperText,
  error,
  unit,
  id: customId,
  placeholder,
}) => {
  const generatedId = useId();
  const inputId = customId || generatedId;
  const errorId = `${inputId}-error`;

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow digits, decimal, and leading minus
    const sanitized = raw.replace(/[^\d.-]/g, "");
    if (sanitized === "" || sanitized === "-") {
      onChange(0);
      return;
    }
    const clean = parseFloat(sanitized);
    onChange(isNaN(clean) ? 0 : clean);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const hasSlider = min !== undefined && max !== undefined && max > min;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-slate-800 tracking-tight"
        >
          {label}
        </label>
        {unit && (
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            {unit}
          </span>
        )}
      </div>

      {/* Input container */}
      <div className="relative">
        <input
          id={inputId}
          type="text"
          inputMode="decimal"
          value={value === 0 ? "0" : value}
          onChange={handleTextChange}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`w-full h-11 px-3.5 text-slate-900 font-semibold bg-white rounded-xl border transition-colors focus:outline-none focus:ring-2 ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-200"
              : "border-slate-300 focus:border-emerald-600 focus:ring-emerald-100"
          } ${unit ? "pr-12" : ""}`}
        />
        {unit && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-xs font-bold text-slate-400">
            {unit}
          </div>
        )}
      </div>

      {/* Optional range slider if bounded */}
      {hasSlider && (
        <div className="pt-1">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={Math.max(min, Math.min(max, value))}
            onChange={handleSliderChange}
            aria-label={`${label} range slider`}
            style={getSliderBackgroundStyle(value, min, max)}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer focus:outline-none"
          />
          <div className="flex justify-between text-[11px] font-medium text-slate-600 mt-1">
            <span>{min.toLocaleString("en-IN")}</span>
            <span>{max.toLocaleString("en-IN")}</span>
          </div>
        </div>
      )}

      {/* Preset pills */}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(preset.value)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                value === preset.value
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* Error message or helper text */}
      {error ? (
        <p id={errorId} className="text-xs font-medium text-red-600 pt-0.5">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-slate-600 pt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
};

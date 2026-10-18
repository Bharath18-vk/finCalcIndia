"use client";

import React, { useId, useState, useEffect } from "react";
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

  const [textValue, setTextValue] = useState<string>(value === 0 ? "0" : String(value));

  useEffect(() => {
    const currentParsed = parseFloat(textValue.replace(/[^\d.-]/g, ""));
    if (currentParsed !== value) {
      setTextValue(value === 0 ? "0" : String(value));
    }
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const sanitized = raw.replace(/[^\d.-]/g, "");
    setTextValue(sanitized);

    if (sanitized === "" || sanitized === "-" || sanitized === ".") {
      onChange(0);
      return;
    }
    const clean = parseFloat(sanitized);
    if (!isNaN(clean) && isFinite(clean)) {
      onChange(clean);
    }
  };

  const handleBlur = () => {
    if (textValue === "" || textValue === "-" || textValue === ".") {
      setTextValue(String(value));
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setTextValue(String(val));
    onChange(val);
  };

  const hasSlider = min !== undefined && max !== undefined && max > min;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={inputId}
          className="text-xs sm:text-sm font-semibold text-slate-800 tracking-tight"
        >
          {label}
        </label>
        {unit && (
          <span className="text-[11px] sm:text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">
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
          value={textValue}
          onChange={handleTextChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`w-full h-11 px-3.5 text-slate-900 font-bold bg-white rounded-xl border tabular-nums transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-400/20 bg-red-50/20"
              : "border-slate-200/90 hover:border-slate-300"
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
          <div className="flex justify-between text-[11px] font-medium text-slate-400 mt-1 select-none tabular-nums">
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
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer active:scale-95 ${
                value === preset.value
                  ? "bg-emerald-600 text-white border-emerald-600 font-semibold shadow-xs"
                  : "bg-slate-50/80 border-slate-200/90 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* Error message or helper text */}
      {error ? (
        <p id={errorId} className="text-xs font-medium text-red-600 pt-0.5" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 pt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
};

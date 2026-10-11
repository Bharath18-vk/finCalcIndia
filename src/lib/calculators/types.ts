import { z } from "zod";

/**
 * FinCalc India — Unified Calculator Contract & Architecture Types
 *
 * Designed to scale from 22 financial calculators to 100–300+ calculators across:
 * Finance, Math, Statistics, Health, Fitness, Everyday, Engineering, Conversion, Education.
 */

export type CalculatorCategory =
  | "finance"
  | "math"
  | "statistics"
  | "health"
  | "fitness"
  | "everyday"
  | "engineering"
  | "conversion"
  | "education";

export type FieldInputType =
  | "number"
  | "currency"
  | "percentage"
  | "tenure"
  | "select"
  | "boolean"
  | "text";

export interface FieldPreset<TValue = number | string> {
  label: string;
  value: TValue;
}

export interface FieldOption<TValue = number | string> {
  label: string;
  value: TValue;
  description?: string;
}

/**
 * Reusable field model for configuration-driven calculator inputs
 */
export interface CalculatorField<TInput = Record<string, any>> {
  name: keyof TInput & string;
  label: string;
  type: FieldInputType;
  defaultValue: any;
  description?: string;
  helperText?: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  presets?: FieldPreset[];
  options?: FieldOption[];
  placeholder?: string;
  required?: boolean;
}

export interface FormulaVariable {
  symbol: string;
  label: string;
  description?: string;
  valueDescription?: string;
}

export interface FormulaStep {
  label: string;
  expression: string;
  explanation: string;
}

export interface CalculatorFormula {
  expression: string;
  variables: FormulaVariable[];
  steps?: FormulaStep[];
  notes?: string[];
}

export interface CalculatorAuthoritativeSource {
  name: string;
  url: string;
  note?: string;
  verifiedAt?: string;
}

export interface CalculatorFAQ {
  question: string;
  answer: string;
}

export interface CalculatorVersionInfo {
  version: string;
  effectiveFrom?: string; // YYYY-MM-DD
  effectiveTo?: string; // YYYY-MM-DD
  lastReviewed: string; // YYYY-MM-DD
  changelogNotes?: string;
}

/**
 * Unified metadata model supporting SEO, AEO, Schema generation, Breadcrumbs, FAQs, and Auditing
 */
export interface CalculatorMetadata {
  id: string;
  name: string;
  shortDescription: string;
  category: CalculatorCategory;
  subcategory?: string;
  route: string;
  badge?: string;
  directAnswer?: string; // Immediate answer (<100 words) for AEO & Google featured snippets
  keywords: string[];
  formula: CalculatorFormula;
  faqs: CalculatorFAQ[];
  relatedCalculatorIds?: string[];
  sources?: CalculatorAuthoritativeSource[];
  version?: CalculatorVersionInfo;
}

/**
 * Normalized result model for consistent result presentations across all categories
 */
export interface CalculatorResultItem {
  key: string;
  label: string;
  value: number | string;
  formattedValue?: string;
  type?: "currency" | "percentage" | "number" | "text";
  subtext?: string;
  highlight?: boolean;
  color?: string;
}

export interface CalculatorBreakdownRow {
  label: string;
  values: (string | number)[];
}

export interface CalculatorBreakdownTable {
  title?: string;
  headers: string[];
  rows: CalculatorBreakdownRow[];
}

export interface CalculatorResultModel<TResult = any> {
  raw: TResult;
  primary: CalculatorResultItem;
  secondary?: CalculatorResultItem[];
  summaryText?: string;
  table?: CalculatorBreakdownTable;
  chartData?: any;
}

/**
 * Unified validation result container
 */
export interface ValidationResult<TInput> {
  success: boolean;
  data?: TInput;
  errors?: Record<string, string>;
}

/**
 * Scalable Calculator Engine Contract
 *
 * Implemented by pure calculation libraries across all categories.
 */
export interface CalculatorEngine<TInput extends Record<string, any>, TResult> {
  id: string;
  metadata: CalculatorMetadata;
  schema: z.ZodType<TInput>;
  defaultInputs: TInput;
  fields: CalculatorField<TInput>[];
  calculate: (input: TInput) => TResult;
  formatResult?: (result: TResult, input: TInput) => CalculatorResultModel<TResult>;
}

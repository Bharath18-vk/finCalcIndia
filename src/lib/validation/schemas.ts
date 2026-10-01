import { z } from "zod";

export const emiInputSchema = z.object({
  principal: z.number().min(1000, "Loan amount must be at least ₹1,000").max(1000000000, "Loan amount cannot exceed ₹100 Crore"),
  annualRate: z.number().min(0, "Interest rate cannot be negative").max(100, "Interest rate cannot exceed 100%"),
  tenureYears: z.number().min(0, "Tenure cannot be negative").max(40, "Tenure cannot exceed 40 years"),
  tenureMonths: z.number().min(0).max(11).optional().default(0),
});

export const sipInputSchema = z.object({
  monthlyInvestment: z.number().min(100, "Monthly investment must be at least ₹100").max(10000000, "Monthly investment cannot exceed ₹1 Crore"),
  annualReturnRate: z.number().min(0, "Return rate cannot be negative").max(100, "Return rate cannot exceed 100%"),
  tenureYears: z.number().min(1, "Tenure must be at least 1 year").max(50, "Tenure cannot exceed 50 years"),
});

export const stepUpSipInputSchema = z.object({
  monthlyInvestment: z.number().min(100, "Monthly investment must be at least ₹100").max(10000000, "Monthly investment cannot exceed ₹1 Crore"),
  annualReturnRate: z.number().min(0, "Return rate cannot be negative").max(100, "Return rate cannot exceed 100%"),
  tenureYears: z.number().min(1, "Tenure must be at least 1 year").max(50, "Tenure cannot exceed 50 years"),
  annualStepUpPercentage: z.number().min(0, "Step-up percentage cannot be negative").max(100, "Step-up percentage cannot exceed 100%"),
});

export const lumpsumInputSchema = z.object({
  totalInvestment: z.number().min(500, "Investment must be at least ₹500").max(1000000000, "Investment cannot exceed ₹100 Crore"),
  annualReturnRate: z.number().min(0, "Return rate cannot be negative").max(100, "Return rate cannot exceed 100%"),
  tenureYears: z.number().min(1, "Tenure must be at least 1 year").max(50, "Tenure cannot exceed 50 years"),
});

export const fdInputSchema = z.object({
  principal: z.number().min(1000, "Deposit amount must be at least ₹1,000").max(1000000000, "Deposit cannot exceed ₹100 Crore"),
  annualRate: z.number().min(0, "Interest rate cannot be negative").max(50, "Interest rate cannot exceed 50%"),
  tenureYears: z.number().min(0).max(25),
  tenureMonths: z.number().min(0).max(11).optional().default(0),
  tenureDays: z.number().min(0).max(30).optional().default(0),
  compoundingFrequency: z.enum(["monthly", "quarterly", "half-yearly", "annual", "simple"]).default("quarterly"),
  isSeniorCitizen: z.boolean().optional().default(false),
});

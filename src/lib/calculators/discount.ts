import { z } from "zod";
import {
  CalculatorEngine,
  CalculatorField,
  CalculatorMetadata,
  CalculatorResultModel,
} from "./types";
import { registerCalculator } from "./registry";
import { formatINR } from "@/lib/formatters";

export interface DiscountInput {
  originalPrice: number;
  discountPercent: number;
  taxPercent?: number;
}

export interface DiscountResult {
  originalPrice: number;
  discountPercent: number;
  discountAmount: number;
  discountedPrice: number; // Price after discount but before tax
  taxPercent: number;
  taxAmount: number;
  finalPrice: number; // Final price payable including tax
  totalSavings: number;
  effectiveDiscountRate: number;
}

export const discountInputSchema = z.object({
  originalPrice: z
    .number({ invalid_type_error: "Original price must be a number" })
    .min(0, "Original price cannot be negative")
    .max(100000000, "Price cannot exceed ₹10 Crore"),
  discountPercent: z
    .number({ invalid_type_error: "Discount percentage must be a number" })
    .min(0, "Discount cannot be less than 0%")
    .max(100, "Discount cannot exceed 100%"),
  taxPercent: z
    .number({ invalid_type_error: "Tax percentage must be a number" })
    .min(0, "Tax cannot be negative")
    .max(100, "Tax cannot exceed 100%")
    .optional()
    .default(0),
});

export const defaultDiscountInput: DiscountInput = {
  originalPrice: 2000,
  discountPercent: 20,
  taxPercent: 0,
};

/**
 * Pure calculation engine for Sales Discount & Savings
 */
export function calculateDiscount(input: DiscountInput): DiscountResult {
  const price = Math.max(0, Number(input.originalPrice) || 0);
  const discountRate = Math.max(0, Math.min(100, Number(input.discountPercent) || 0));
  const taxRate = Math.max(0, Math.min(100, Number(input.taxPercent) || 0));

  const discountAmount = Math.round((price * discountRate) / 100);
  const discountedPrice = Math.max(0, price - discountAmount);
  const taxAmount = Math.round((discountedPrice * taxRate) / 100);
  const finalPrice = discountedPrice + taxAmount;
  const totalSavings = discountAmount;
  const effectiveDiscountRate = price > 0 ? Number(((totalSavings / price) * 100).toFixed(2)) : 0;

  return {
    originalPrice: price,
    discountPercent: discountRate,
    discountAmount,
    discountedPrice,
    taxPercent: taxRate,
    taxAmount,
    finalPrice,
    totalSavings,
    effectiveDiscountRate,
  };
}

export const discountFields: CalculatorField<DiscountInput>[] = [
  {
    name: "originalPrice",
    label: "Original Price / MRP",
    type: "currency",
    defaultValue: 2000,
    min: 0,
    max: 1000000,
    step: 100,
    presets: [
      { label: "₹500", value: 500 },
      { label: "₹1,000", value: 1000 },
      { label: "₹2,000", value: 2000 },
      { label: "₹5,000", value: 5000 },
      { label: "₹10,000", value: 10000 },
    ],
    helperText: "Original retail or tag price before discount",
  },
  {
    name: "discountPercent",
    label: "Discount Percentage (%)",
    type: "percentage",
    defaultValue: 20,
    min: 0,
    max: 100,
    step: 1,
    presets: [
      { label: "10%", value: 10 },
      { label: "15%", value: 15 },
      { label: "20%", value: 20 },
      { label: "25%", value: 25 },
      { label: "50%", value: 50 },
    ],
    helperText: "Percentage reduction offered",
  },
  {
    name: "taxPercent",
    label: "Sales Tax / GST (% optional)",
    type: "percentage",
    defaultValue: 0,
    min: 0,
    max: 28,
    step: 1,
    presets: [
      { label: "0% (No Tax)", value: 0 },
      { label: "5% GST", value: 5 },
      { label: "12% GST", value: 12 },
      { label: "18% GST", value: 18 },
    ],
    helperText: "Goods and Services Tax (GST) rate if not included in price",
  },
];

export const discountMetadata: CalculatorMetadata = {
  id: "discount",
  name: "Discount Calculator",
  shortDescription:
    "Calculate sale prices, total money saved, and final costs with sales tax / GST. Includes instant discount percentage breakdowns and shopping savings.",
  category: "math",
  subcategory: "arithmetic",
  route: "/discount-calculator",
  badge: "Math & Everyday",
  directAnswer:
    "To calculate a discount, multiply the original price by the discount percentage and divide by 100 (e.g., 20% off ₹2,000 = ₹400 savings). Subtract the savings from the original price to find the final sale price (₹2,000 − ₹400 = ₹1,600).",
  keywords: [
    "discount calculator",
    "calculate discount",
    "sale price calculator",
    "percentage off calculator",
    "gst discount calculator",
    "savings calculator",
  ],
  formula: {
    expression: "Discount Amount = Original Price × (Discount% / 100)  |  Final Price = (Original Price - Discount) × (1 + Tax% / 100)",
    variables: [
      { symbol: "P", label: "Original Price", description: "The list price or MRP before discount" },
      { symbol: "D", label: "Discount Rate (%)", description: "The percentage discount offered" },
      { symbol: "T", label: "Tax / GST Rate (%)", description: "Applicable sales tax or GST percentage" },
    ],
    steps: [
      { label: "Find Discount", expression: "Discount = P × (D / 100)", explanation: "Computes total monetary reduction from list price." },
      { label: "Price After Discount", expression: "Subtotal = P - Discount", explanation: "Subtracts savings to find subtotal." },
      { label: "Apply Tax (if any)", expression: "Final Price = Subtotal × (1 + T / 100)", explanation: "Calculates final payable price including tax." },
    ],
    notes: [
      "In India, MRP is almost always inclusive of GST, so sales tax can usually be left at 0%.",
      "If tax is applicable on discounted price, it is calculated after the markdown is applied.",
    ],
  },
  faqs: [
    {
      question: "How do you calculate 20% off an item?",
      answer:
        "Multiply the original price by 0.20 to get the discount amount. Then subtract that amount from the original price. For example: 20% off ₹1,500 = ₹300 discount → final price = ₹1,200.",
    },
    {
      question: "Is GST added before or after the discount?",
      answer:
        "Under Indian GST laws (Section 15 of CGST Act), trade discounts provided before or at the time of supply are excluded from transaction value. Thus, GST is levied only on the net discounted price.",
    },
    {
      question: "How do I calculate what percentage discount I received?",
      answer:
        "Subtract the sale price from the original price to find your savings, divide by the original price, and multiply by 100: ((Original − Sale) ÷ Original) × 100.",
    },
  ],
  version: {
    version: "1.0.0",
    lastReviewed: "2026-10-05",
    changelogNotes: "Initial release under CalculatorEngine contract.",
  },
};

export const discountEngine: CalculatorEngine<DiscountInput, DiscountResult> = {
  id: "discount",
  metadata: discountMetadata,
  schema: discountInputSchema,
  defaultInputs: defaultDiscountInput,
  fields: discountFields,
  calculate: calculateDiscount,
  formatResult: (result: DiscountResult) => {
    return {
      raw: result,
      primary: {
        key: "finalPrice",
        label: "Final Price to Pay",
        value: result.finalPrice,
        formattedValue: formatINR(result.finalPrice),
        subtext: `You Save: ${formatINR(result.totalSavings)} (${result.effectiveDiscountRate}%)`,
        highlight: true,
      },
      secondary: [
        {
          key: "savings",
          label: "Total Savings",
          value: result.totalSavings,
          formattedValue: formatINR(result.totalSavings),
        },
        {
          key: "original",
          label: "Original Price",
          value: result.originalPrice,
          formattedValue: formatINR(result.originalPrice),
        },
        ...(result.taxAmount > 0
          ? [
              {
                key: "tax",
                label: `GST / Tax (${result.taxPercent}%)`,
                value: result.taxAmount,
                formattedValue: formatINR(result.taxAmount),
              },
            ]
          : []),
      ],
      summaryText: `Original price of ${formatINR(result.originalPrice)} with a ${result.discountPercent}% discount saves you ${formatINR(result.totalSavings)}, bringing the final price to ${formatINR(result.finalPrice)}.`,
    };
  },
};

registerCalculator(discountEngine);

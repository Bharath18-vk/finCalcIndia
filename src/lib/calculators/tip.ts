import { z } from "zod";
import {
  CalculatorEngine,
  CalculatorField,
  CalculatorMetadata,
} from "./types";
import { registerCalculator } from "./registry";
import { formatINR } from "@/lib/formatters";

export type RoundingMode = "none" | "total" | "perPerson";

export interface TipInput {
  billAmount: number;
  tipPercentage: number;
  splitCount: number;
  taxPercentage?: number;
  roundUp?: RoundingMode;
}

export interface TipResult {
  billAmount: number;
  taxPercentage: number;
  taxAmount: number;
  tipPercentage: number;
  tipAmount: number;
  totalAmount: number;
  splitCount: number;
  billPerPerson: number;
  taxPerPerson: number;
  tipPerPerson: number;
  totalPerPerson: number;
  roundedPerPerson: number;
  roundingDifference: number;
  steps: string[];
}

export const tipInputSchema = z.object({
  billAmount: z
    .number({ invalid_type_error: "Bill amount must be a number" })
    .min(0, "Bill amount cannot be negative")
    .max(10000000, "Bill amount cannot exceed ₹1,00,00,000"),
  tipPercentage: z
    .number({ invalid_type_error: "Tip percentage must be a number" })
    .min(0, "Tip percentage cannot be negative")
    .max(100, "Tip percentage cannot exceed 100%"),
  splitCount: z
    .number({ invalid_type_error: "Number of people must be a number" })
    .int("Number of people must be a whole number")
    .min(1, "At least 1 person is required")
    .max(100, "Split count cannot exceed 100 people"),
  taxPercentage: z
    .number({ invalid_type_error: "Tax percentage must be a number" })
    .min(0, "Tax cannot be negative")
    .max(50, "Tax cannot exceed 50%")
    .optional(),
  roundUp: z.enum(["none", "total", "perPerson"]).optional(),
});

export const defaultTipInput: TipInput = {
  billAmount: 2400,
  tipPercentage: 10,
  splitCount: 4,
  taxPercentage: 5,
  roundUp: "none",
};

/**
 * Pure calculation engine for Restaurant Tip & Group Bill Split
 */
export function calculateTip(input: TipInput): TipResult {
  const billAmount = Math.max(0, input.billAmount || 0);
  const tipPercentage = Math.max(0, input.tipPercentage || 0);
  const taxPercentage = Math.max(0, input.taxPercentage || 0);
  const splitCount = Math.max(1, Math.floor(input.splitCount || 1));
  const roundUp = input.roundUp || "none";

  const taxAmount = Math.round(((billAmount * taxPercentage) / 100) * 100) / 100;
  let tipAmount = Math.round(((billAmount * tipPercentage) / 100) * 100) / 100;
  let totalAmount = billAmount + taxAmount + tipAmount;

  let totalPerPerson = totalAmount / splitCount;
  let roundingDifference = 0;
  let roundedPerPerson = totalPerPerson;

  if (roundUp === "perPerson") {
    roundedPerPerson = Math.ceil(totalPerPerson);
    roundingDifference = (roundedPerPerson * splitCount) - totalAmount;
    totalAmount = roundedPerPerson * splitCount;
    tipAmount = totalAmount - billAmount - taxAmount;
  } else if (roundUp === "total") {
    const ceilTotal = Math.ceil(totalAmount);
    roundingDifference = ceilTotal - totalAmount;
    totalAmount = ceilTotal;
    tipAmount = totalAmount - billAmount - taxAmount;
    totalPerPerson = totalAmount / splitCount;
    roundedPerPerson = totalPerPerson;
  }

  const billPerPerson = Math.round((billAmount / splitCount) * 100) / 100;
  const taxPerPerson = Math.round((taxAmount / splitCount) * 100) / 100;
  const tipPerPerson = Math.round((tipAmount / splitCount) * 100) / 100;
  const finalPerPerson = Math.round(roundedPerPerson * 100) / 100;

  const steps = [
    `Base Bill: ${formatINR(billAmount)}`,
    taxPercentage > 0
      ? `Tax (${taxPercentage}% GST/VAT): ${formatINR(taxAmount)}`
      : "No tax applied",
    `Tip / Service Gratuity (${tipPercentage}%): ${formatINR(tipAmount)}`,
    `Total Payable: ${formatINR(totalAmount)}`,
    `Split across ${splitCount} people: ${formatINR(finalPerPerson)} per person (${formatINR(tipPerPerson)} tip per person)`,
  ];

  return {
    billAmount,
    taxPercentage,
    taxAmount,
    tipPercentage,
    tipAmount,
    totalAmount,
    splitCount,
    billPerPerson,
    taxPerPerson,
    tipPerPerson,
    totalPerPerson: Math.round(totalPerPerson * 100) / 100,
    roundedPerPerson: finalPerPerson,
    roundingDifference: Math.round(roundingDifference * 100) / 100,
    steps,
  };
}

export const tipFields: CalculatorField<TipInput>[] = [
  {
    name: "billAmount",
    label: "Bill Amount (₹)",
    type: "currency",
    defaultValue: 2400,
    min: 0,
    max: 10000000,
    step: 50,
  },
  {
    name: "tipPercentage",
    label: "Tip Percentage (%)",
    type: "percentage",
    defaultValue: 10,
    min: 0,
    max: 100,
    step: 1,
  },
  {
    name: "splitCount",
    label: "Split Between (People)",
    type: "number",
    defaultValue: 4,
    min: 1,
    max: 100,
    step: 1,
  },
  {
    name: "taxPercentage",
    label: "Taxes / GST (%)",
    type: "percentage",
    defaultValue: 5,
    min: 0,
    max: 50,
    step: 0.5,
  },
  {
    name: "roundUp",
    label: "Rounding Option",
    type: "select",
    defaultValue: "none",
    options: [
      { label: "Exact (No Rounding)", value: "none" },
      { label: "Round Total Bill Up", value: "total" },
      { label: "Round Per Person Up", value: "perPerson" },
    ],
  },
];

export const tipMetadata: CalculatorMetadata = {
  id: "tip",
  name: "Tip & Bill Split Calculator",
  shortDescription:
    "Calculate restaurant tip amount, total bill with GST/tax, and evenly split costs per person with customizable rounding options.",
  category: "everyday",
  subcategory: "dining",
  route: "/tip-calculator",
  badge: "Everyday & Dining",
  directAnswer:
    "To calculate a tip, multiply the bill amount by the tip percentage (e.g., ₹2,400 × 10% = ₹240). Adding 5% GST (₹120) makes the total ₹2,760. Splitting evenly across 4 people equals ₹690 per person.",
  keywords: [
    "tip calculator",
    "bill split calculator",
    "restaurant tip calculator",
    "split bill with friends",
    "gratuity calculator india",
    "gst tip calculator",
  ],
  formula: {
    expression: "Total Per Person = (Bill Amount + Tax + Tip) / Number of People",
    variables: [
      { symbol: "Bill", label: "Base Bill", description: "Food & beverage total before taxes" },
      { symbol: "Tax", label: "Taxes / GST", description: "Applicable restaurant GST (typically 5% or 18%)" },
      { symbol: "Tip", label: "Tip / Gratuity", description: "Voluntary tip or service charge percentage" },
      { symbol: "People", label: "Split Count", description: "Number of people sharing the check" },
    ],
    steps: [
      { label: "Calculate Tax", expression: "Tax = Bill × (Tax% / 100)", explanation: "Compute sales tax or GST amount." },
      { label: "Calculate Tip", expression: "Tip = Bill × (Tip% / 100)", explanation: "Compute tip amount on base subtotal." },
      { label: "Sum Total", expression: "Total = Bill + Tax + Tip", explanation: "Sum base bill, taxes, and tip." },
      { label: "Split Per Person", expression: "Share Per Person = Total / People", explanation: "Divide total bill equally among friends." },
    ],
    notes: [
      "In India, tipping is voluntary; restaurants often levy a discretionary 5% to 10% service charge.",
      "GST on restaurant dining in India is typically 5% (without input tax credit) or 18% in luxury hotel establishments.",
    ],
  },
  faqs: [
    {
      question: "Is tipping mandatory in restaurants in India?",
      answer:
        "No. According to Central Consumer Protection Authority (CCPA) guidelines, tipping and service charges in Indian hotels and restaurants are strictly voluntary. Diners have the right to request the removal of any mandatory service charge on the invoice.",
    },
    {
      question: "What is the customary tip percentage in India?",
      answer:
        "For good dining service in India, 7% to 10% of the food subtotal is customary if no service charge is already added. For small bills or casual cafes, leaving ₹50 to ₹100 in cash is common practice.",
    },
    {
      question: "Is tip calculated on the bill before or after GST?",
      answer:
        "Financially, tipping on the pre-tax food subtotal is standard and fair practice. Tipping on post-tax totals effectively means paying a tip on government taxes.",
    },
    {
      question: "How does the 'Round Per Person Up' option work?",
      answer:
        "It rounds each individual's share up to the nearest whole rupee, eliminating troublesome decimal fractions when settling bills through UPI or cash.",
    },
  ],
  version: {
    version: "1.0.0",
    lastReviewed: "2026-10-11",
    changelogNotes: "Initial release under CalculatorEngine contract with GST and split support.",
  },
};

export const tipEngine: CalculatorEngine<TipInput, TipResult> = {
  id: "tip",
  metadata: tipMetadata,
  schema: tipInputSchema,
  defaultInputs: defaultTipInput,
  fields: tipFields,
  calculate: calculateTip,
  formatResult: (result: TipResult) => {
    return {
      raw: result,
      primary: {
        key: "totalPerPerson",
        label: "Total Per Person",
        value: result.roundedPerPerson,
        formattedValue: formatINR(result.roundedPerPerson),
        subtext: `Split among ${result.splitCount} people (includes ${formatINR(result.tipPerPerson)} tip each)`,
        highlight: true,
      },
      secondary: [
        {
          key: "totalBill",
          label: "Total Bill Amount",
          value: result.totalAmount,
          formattedValue: formatINR(result.totalAmount),
        },
        {
          key: "totalTip",
          label: "Total Tip / Gratuity",
          value: result.tipAmount,
          formattedValue: formatINR(result.tipAmount),
        },
        {
          key: "totalTax",
          label: "Total GST / Taxes",
          value: result.taxAmount,
          formattedValue: formatINR(result.taxAmount),
        },
        {
          key: "basePerPerson",
          label: "Food Bill Per Person",
          value: result.billPerPerson,
          formattedValue: formatINR(result.billPerPerson),
        },
      ],
      summaryText: `For a bill of ${formatINR(result.billAmount)} with ${result.tipPercentage}% tip and ${result.taxPercentage}% tax, the total is ${formatINR(result.totalAmount)}. Each person pays ${formatINR(result.roundedPerPerson)} across ${result.splitCount} people.`,
    };
  },
};

registerCalculator(tipEngine);

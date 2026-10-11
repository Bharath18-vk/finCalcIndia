import { z } from "zod";
import { CalculatorEngine, CalculatorMetadata, CalculatorField } from "./types";
import { registerCalculator } from "./registry";

export type GstTaxType = "exclusive" | "inclusive";
export type GstSupplyType = "intra-state" | "inter-state";

export interface GstInput {
  amount: number;
  taxType: GstTaxType;
  gstRate: number; // in percent e.g. 5, 12, 18, 28
  supplyType?: GstSupplyType;
  quantity?: number;
}

export interface GstResult {
  netAmount: number; // Base amount without GST
  gstAmount: number; // Total GST component
  grossAmount: number; // Total invoice price including GST
  cgstAmount: number; // Central GST (for intra-state)
  sgstAmount: number; // State GST (for intra-state)
  igstAmount: number; // Integrated GST (for inter-state)
  taxType: GstTaxType;
  supplyType: GstSupplyType;
  gstRate: number;
  quantity: number;
  perUnitNet: number;
  perUnitGross: number;
  perUnitGst: number;
}

export const gstInputSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be greater than zero")
    .max(1000000000, "Amount cannot exceed ₹100 Crores"),
  taxType: z.enum(["exclusive", "inclusive"], {
    invalid_type_error: "Tax type must be exclusive or inclusive",
  }),
  gstRate: z
    .number({ invalid_type_error: "GST rate must be a number" })
    .min(0, "GST rate cannot be negative")
    .max(100, "GST rate cannot exceed 100%"),
  supplyType: z.enum(["intra-state", "inter-state"]).default("intra-state"),
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .int("Quantity must be a whole number")
    .positive("Quantity must be at least 1")
    .max(100000, "Quantity cannot exceed 1,00,000")
    .default(1),
});

export const GST_SLABS = [0, 0.25, 3, 5, 12, 18, 28];

export function calculateGST(input: GstInput): GstResult {
  const amount = Math.max(0.01, isFinite(input.amount) ? input.amount : 1000);
  const taxType = input.taxType === "inclusive" ? "inclusive" : "exclusive";
  const gstRate = Math.max(0, isFinite(input.gstRate) ? input.gstRate : 18);
  const supplyType = input.supplyType === "inter-state" ? "inter-state" : "intra-state";
  const quantity = Math.max(1, Math.floor(isFinite(input.quantity ?? 1) ? (input.quantity ?? 1) : 1));

  const totalRawAmount = amount * quantity;

  let netAmount = 0;
  let gstAmount = 0;
  let grossAmount = 0;

  if (taxType === "exclusive") {
    // GST Exclusive: Amount entered is the pre-tax base price
    netAmount = totalRawAmount;
    gstAmount = (netAmount * gstRate) / 100;
    grossAmount = netAmount + gstAmount;
  } else {
    // GST Inclusive: Amount entered is the total gross invoice price
    grossAmount = totalRawAmount;
    netAmount = grossAmount / (1 + gstRate / 100);
    gstAmount = grossAmount - netAmount;
  }

  // Round values to 2 decimal places (standard currency cents/paise)
  netAmount = Math.round(netAmount * 100) / 100;
  gstAmount = Math.round(gstAmount * 100) / 100;
  grossAmount = Math.round(grossAmount * 100) / 100;

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (supplyType === "intra-state") {
    cgstAmount = Math.round((gstAmount / 2) * 100) / 100;
    sgstAmount = Math.round((gstAmount - cgstAmount) * 100) / 100;
  } else {
    igstAmount = gstAmount;
  }

  const perUnitNet = Math.round((netAmount / quantity) * 100) / 100;
  const perUnitGross = Math.round((grossAmount / quantity) * 100) / 100;
  const perUnitGst = Math.round((gstAmount / quantity) * 100) / 100;

  return {
    netAmount,
    gstAmount,
    grossAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    taxType,
    supplyType,
    gstRate,
    quantity,
    perUnitNet,
    perUnitGross,
    perUnitGst,
  };
}

export const defaultGstInputs: GstInput = {
  amount: 10000,
  taxType: "exclusive",
  gstRate: 18,
  supplyType: "intra-state",
  quantity: 1,
};

const gstFields: CalculatorField<GstInput>[] = [
  {
    name: "amount",
    label: "Amount (₹)",
    type: "number",
    defaultValue: 10000,
    min: 1,
    max: 100000000,
    step: 100,
    unit: "₹",
    helperText: "Enter the base price (for exclusive) or the total MRP (for inclusive).",
  },
  {
    name: "taxType",
    label: "Calculation Type",
    type: "select",
    defaultValue: "exclusive",
    options: [
      { label: "GST Exclusive (Add GST to Base Price)", value: "exclusive" },
      { label: "GST Inclusive (Remove / Reverse GST from MRP)", value: "inclusive" },
    ],
  },
  {
    name: "gstRate",
    label: "GST Rate (%)",
    type: "number",
    defaultValue: 18,
    min: 0,
    max: 100,
    step: 0.1,
    unit: "%",
    helperText: "Common statutory Indian GST slabs: 0%, 5%, 12%, 18%, 28%.",
  },
  {
    name: "supplyType",
    label: "Supply Type",
    type: "select",
    defaultValue: "intra-state",
    options: [
      { label: "Intra-State (Same State: CGST + SGST)", value: "intra-state" },
      { label: "Inter-State (Different State: IGST)", value: "inter-state" },
    ],
  },
  {
    name: "quantity",
    label: "Quantity / Units",
    type: "number",
    defaultValue: 1,
    min: 1,
    max: 10000,
    step: 1,
    helperText: "Number of units or items.",
  },
];

const gstMetadata: CalculatorMetadata = {
  id: "gst",
  name: "GST Calculator India",
  route: "/gst-calculator",
  category: "finance",
  shortDescription:
    "Calculate Goods and Services Tax (GST) in India: add GST to base price or reverse calculate pre-tax amounts with CGST, SGST, and IGST breakdowns.",
  badge: "CBIC Statutory Rates",
  directAnswer:
    "To add GST (exclusive), multiply the base amount by (1 + GST rate / 100). For example, ₹10,000 at 18% GST equals ₹11,800 (₹1,800 tax). To remove GST (inclusive), divide the MRP by (1 + GST rate / 100); an MRP of ₹11,800 has a base price of ₹10,000 and ₹1,800 GST.",
  formula: {
    expression: "\\text{GST Exclusive: } \\text{Gross} = \\text{Net} \\times \\left(1 + \\frac{R}{100}\\right) \\quad \\mid \\quad \\text{GST Inclusive: } \\text{Net} = \\frac{\\text{Gross}}{1 + \\frac{R}{100}}",
    variables: [
      { symbol: "\\text{Net}", label: "Net Amount", description: "Pre-tax base invoice amount" },
      { symbol: "\\text{Gross}", label: "Gross Amount", description: "Total price inclusive of GST" },
      { symbol: "R", label: "GST Rate", description: "Applicable statutory GST rate (e.g. 5%, 12%, 18%, 28%)" },
      { symbol: "\\text{CGST}", label: "Central GST", description: "Central GST (half of GST for intra-state sales)" },
      { symbol: "\\text{SGST}", label: "State GST", description: "State GST (half of GST for intra-state sales)" },
      { symbol: "\\text{IGST}", label: "Integrated GST", description: "Integrated GST (full GST for inter-state sales)" },
    ],
    steps: [
      { label: "Determine Price Type", expression: "\\text{Exclusive vs Inclusive}", explanation: "Select whether entered price is pre-tax base or gross MRP." },
      { label: "Apply Tax Calculation", expression: "\\text{GST} = \\text{Net} \\times \\frac{R}{100}", explanation: "Compute statutory tax addition or reverse extraction." },
      { label: "Split Jurisdictional Levies", expression: "\\text{CGST} = \\text{SGST} = \\frac{\\text{GST}}{2}", explanation: "Divide tax equally for intra-state sales or assign to IGST for inter-state." },
    ],
    notes: [
      "Standard statutory GST slabs in India are 0%, 5%, 12%, 18%, and 28%. Special slabs include 0.25% (rough diamonds) and 3% (gold/silver jewellery).",
      "For intra-state transactions (buyer and seller in the same state), GST is split equally into CGST and SGST.",
      "For inter-state transactions, the entire tax is levied as IGST.",
    ],
  },
  faqs: [
    {
      question: "What is the difference between GST inclusive and exclusive?",
      answer:
        "GST Exclusive means the entered amount is the base price before taxes; GST is added on top. GST Inclusive means the entered price is the final MRP including taxes; the calculator reverse-calculates to find the pre-tax base amount and the tax portion.",
    },
    {
      question: "How is GST split between CGST and SGST in India?",
      answer:
        "When a sale occurs within the same state (intra-state), the total GST is split equally 50:50 between the Central Government (CGST) and the State Government (SGST). For example, an 18% GST rate is split into 9% CGST and 9% SGST.",
    },
    {
      question: "When is IGST applied instead of CGST and SGST?",
      answer:
        "Integrated Goods and Services Tax (IGST) applies when goods or services are supplied across state borders (inter-state) or imported into India. The full tax rate (e.g., 18%) is collected as IGST.",
    },
    {
      question: "What are the common GST slab rates in India?",
      answer:
        "The standard GST rates in India are 0% (essential foods, grains), 5% (packaged foods, domestic transport), 12% (processed foods, business software), 18% (commercial services, banking, electronics), and 28% (luxury items, automobiles, tobacco). Gold and precious metals carry a special 3% rate.",
    },
  ],
  keywords: [
    "gst calculator",
    "gst calculator india",
    "reverse gst calculator",
    "cgst sgst calculator",
    "igst calculator",
    "gst inclusive exclusive",
  ],
  version: {
    version: "1.0.0",
    lastReviewed: "2026-10-11",
    changelogNotes: "Statutory CBIC tax calculation with CGST/SGST/IGST breakdown.",
  },
};

export const gstEngine: CalculatorEngine<GstInput, GstResult> = {
  id: "gst",
  metadata: gstMetadata,
  schema: gstInputSchema,
  defaultInputs: defaultGstInputs,
  fields: gstFields,
  calculate: calculateGST,
};

registerCalculator(gstEngine);

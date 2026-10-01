/**
 * Indian Financial Formatters
 *
 * Implements the Indian numbering system grouping (lakhs and crores):
 * e.g., ₹1,00,000 (1 Lakh), ₹1,00,00,000 (1 Crore).
 *
 * All functions are pure, safe against NaN, Infinity, negative and non-numeric inputs.
 */

/**
 * Formats a number to Indian currency format (e.g. ₹1,25,000 or ₹1,25,000.50)
 */
export function formatINR(
  val: number | string | null | undefined,
  options?: {
    includeSymbol?: boolean;
    maximumFractionDigits?: number;
    minimumFractionDigits?: number;
  }
): string {
  const num = typeof val === "string" ? parseFloat(val.replace(/,/g, "")) : Number(val);

  if (val === null || val === undefined || isNaN(num) || !isFinite(num)) {
    return options?.includeSymbol !== false ? "₹0" : "0";
  }

  const {
    includeSymbol = true,
    maximumFractionDigits = 0,
    minimumFractionDigits = 0,
  } = options || {};

  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const formattedNumber = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits,
    minimumFractionDigits,
  }).format(absNum);

  const prefix = isNegative ? "-" : "";
  const symbol = includeSymbol ? "₹" : "";

  return `${prefix}${symbol}${formattedNumber}`;
}

/**
 * Formats large amounts into Indian human-readable shorthand (e.g. "₹50 L", "₹1.5 Cr", "₹75 K")
 */
export function formatCompactINR(
  val: number | string | null | undefined,
  includeSymbol: boolean = true
): string {
  const num = typeof val === "string" ? parseFloat(val.replace(/,/g, "")) : Number(val);

  if (val === null || val === undefined || isNaN(num) || !isFinite(num)) {
    return includeSymbol ? "₹0" : "0";
  }

  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const symbol = includeSymbol ? "₹" : "";
  const sign = isNegative ? "-" : "";

  if (absNum >= 10000000) {
    // 1 Crore = 10^7
    const cr = absNum / 10000000;
    const formatted = cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2).replace(/\.?0+$/, "");
    return `${sign}${symbol}${formatted} Cr`;
  }
  if (absNum >= 100000) {
    // 1 Lakh = 10^5
    const lakh = absNum / 100000;
    const formatted = lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(2).replace(/\.?0+$/, "");
    return `${sign}${symbol}${formatted} L`;
  }
  if (absNum >= 1000) {
    // 1 Thousand = 10^3
    const k = absNum / 1000;
    const formatted = k % 1 === 0 ? k.toFixed(0) : k.toFixed(1).replace(/\.?0+$/, "");
    return `${sign}${symbol}${formatted} K`;
  }

  return `${sign}${symbol}${Math.round(absNum).toLocaleString("en-IN")}`;
}

/**
 * Converts a number to Indian denomination descriptive words (e.g. "50 Lakh", "1.25 Crore", "15 Thousand")
 */
export function formatIndianWords(val: number | string | null | undefined): string {
  const num = typeof val === "string" ? parseFloat(val.replace(/,/g, "")) : Number(val);

  if (val === null || val === undefined || isNaN(num) || !isFinite(num) || num === 0) {
    return "Zero";
  }

  const absNum = Math.abs(num);
  let result = "";

  if (absNum >= 10000000) {
    const cr = absNum / 10000000;
    const formatted = cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2).replace(/\.?0+$/, "");
    result = `${formatted} Crore${Number(formatted) > 1 ? "s" : ""}`;
  } else if (absNum >= 100000) {
    const lakh = absNum / 100000;
    const formatted = lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(2).replace(/\.?0+$/, "");
    result = `${formatted} Lakh${Number(formatted) > 1 ? "s" : ""}`;
  } else if (absNum >= 1000) {
    const k = absNum / 1000;
    const formatted = k % 1 === 0 ? k.toFixed(0) : k.toFixed(1).replace(/\.?0+$/, "");
    result = `${formatted} Thousand`;
  } else {
    result = Math.round(absNum).toString();
  }

  return num < 0 ? `Minus ${result}` : result;
}

/**
 * Formats a percentage value (e.g. 8.5 -> "8.5%")
 */
export function formatPercentage(
  val: number | string | null | undefined,
  maxDecimals: number = 2
): string {
  const num = typeof val === "string" ? parseFloat(val) : Number(val);
  if (val === null || val === undefined || isNaN(num) || !isFinite(num)) {
    return "0%";
  }
  const formatted = num.toFixed(maxDecimals).replace(/\.?0+$/, "");
  return `${formatted}%`;
}

/**
 * Formats tenure in years and months for display
 */
export function formatTenureYears(years: number, months: number = 0): string {
  const safeYears = isNaN(years) || years < 0 ? 0 : Math.floor(years);
  const safeMonths = isNaN(months) || months < 0 ? 0 : Math.floor(months);

  const parts: string[] = [];
  if (safeYears > 0) {
    parts.push(`${safeYears} Year${safeYears > 1 ? "s" : ""}`);
  }
  if (safeMonths > 0) {
    parts.push(`${safeMonths} Month${safeMonths > 1 ? "s" : ""}`);
  }

  if (parts.length === 0) {
    return "0 Months";
  }

  const totalMonths = safeYears * 12 + safeMonths;
  if (safeYears > 0 && safeMonths === 0) {
    return `${parts.join(" ")} (${totalMonths} Months)`;
  }
  return parts.join(" ");
}

/**
 * Parses user input string into a clean numeric value, stripping symbols and commas
 */
export function parseCleanNumber(input: string | number | null | undefined): number {
  if (input === null || input === undefined) return 0;
  if (typeof input === "number") return isNaN(input) || !isFinite(input) ? 0 : input;

  const cleanStr = input
    .replace(/[₹\s,]/g, "")
    .trim();

  const parsed = parseFloat(cleanStr);
  return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
}

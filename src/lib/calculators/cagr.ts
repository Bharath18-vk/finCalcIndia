/**
 * Compound Annual Growth Rate (CAGR) Calculation Engine
 *
 * Formula:
 *   CAGR = (Final Value / Initial Value)^(1 / Tenure in Years) - 1
 *
 * Absolute Return:
 *   Absolute Return (%) = ((Final Value - Initial Value) / Initial Value) * 100
 *
 * Investment Multiple:
 *   Multiple = Final Value / Initial Value
 */

export interface CAGRInput {
  initialValue: number;
  finalValue: number;
  tenureYears: number;
}

export interface CAGRYearlyPoint {
  year: number;
  projectedValue: number;
  cumulativeGain: number;
}

export interface CAGRResult {
  initialValue: number;
  finalValue: number;
  tenureYears: number;
  cagrPercentage: number;
  absoluteReturnPercentage: number;
  totalGain: number;
  multiple: number;
  isGain: boolean;
  yearlyTrajectory: CAGRYearlyPoint[];
}

export function calculateCAGR(input: CAGRInput): CAGRResult {
  const initialValue = Math.max(0, input.initialValue || 0);
  const finalValue = Math.max(0, input.finalValue || 0);
  const tenureYears = Math.max(0.1, input.tenureYears || 1);

  if (initialValue <= 0) {
    return {
      initialValue: 0,
      finalValue,
      tenureYears,
      cagrPercentage: 0,
      absoluteReturnPercentage: 0,
      totalGain: 0,
      multiple: 1,
      isGain: false,
      yearlyTrajectory: [],
    };
  }

  const totalGain = finalValue - initialValue;
  const isGain = totalGain >= 0;
  const multiple = Number((finalValue / initialValue).toFixed(2));
  const absoluteReturnPercentage = Number(
    (((finalValue - initialValue) / initialValue) * 100).toFixed(2)
  );

  let cagrDecimal = 0;
  if (finalValue > 0) {
    cagrDecimal = Math.pow(finalValue / initialValue, 1 / tenureYears) - 1;
  } else {
    cagrDecimal = -1; // -100%
  }

  const cagrPercentage = Number((cagrDecimal * 100).toFixed(2));

  // Projected trajectory over the tenure
  const fullYears = Math.max(1, Math.round(tenureYears));
  const yearlyTrajectory: CAGRYearlyPoint[] = [];

  for (let y = 1; y <= fullYears; y++) {
    const projected = Math.round(initialValue * Math.pow(1 + cagrDecimal, y));
    yearlyTrajectory.push({
      year: y,
      projectedValue: y === fullYears ? finalValue : projected,
      cumulativeGain: (y === fullYears ? finalValue : projected) - initialValue,
    });
  }

  return {
    initialValue,
    finalValue,
    tenureYears,
    cagrPercentage,
    absoluteReturnPercentage,
    totalGain,
    multiple,
    isGain,
    yearlyTrajectory,
  };
}

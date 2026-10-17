import { describe, it, expect } from "vitest";
import { formatHumanReadableMath, splitCompoundFormulas } from "@/lib/format-math";

describe("Mathematical Formula Human-Readable Formatter", () => {
  it("converts user's uploaded square-root formula into human-readable math", () => {
    const raw = "\\sqrt[n]{x} = x^{1/n} \\quad | \\quad x^y = x \\times x \\times \\dots \\times x \\quad | \\quad \\sqrt{a^2 b} = a \\sqrt{b}";
    const formatted = formatHumanReadableMath(raw);

    // No raw LaTeX commands remaining
    expect(formatted).not.toContain("\\sqrt");
    expect(formatted).not.toContain("\\quad");
    expect(formatted).not.toContain("\\times");
    expect(formatted).not.toContain("\\dots");

    expect(formatted).toContain("ⁿ√(x) = x^(1/n)");
    expect(formatted).toContain("x × x × ... × x");
    expect(formatted).toContain("√(a² b) = a √(b)");

    const parts = splitCompoundFormulas(raw);
    expect(parts.length).toBe(3);
    expect(parts[0]).toBe("ⁿ√(x) = x^(1/n)");
    expect(parts[1]).toBe("x^y = x × x × ... × x");
    expect(parts[2]).toBe("√(a² b) = a √(b)");
  });

  it("converts LaTeX fractions into clear human-readable division", () => {
    const raw = "SI = \\frac{P \\times R \\times T}{100} \\quad | \\quad A = P + SI";
    const formatted = formatHumanReadableMath(raw);

    expect(formatted).not.toContain("\\frac");
    expect(formatted).not.toContain("\\times");
    expect(formatted).toContain("(P × R × T) / (100)");
    expect(formatted).toContain("A = P + SI");
  });

  it("converts standard deviation and statistical symbols", () => {
    const raw = "s = \\sqrt{\\frac{\\sum_{i=1}^n (x_i - \\bar{x})^2}{n - 1}}";
    const formatted = formatHumanReadableMath(raw);

    expect(formatted).not.toContain("\\sqrt");
    expect(formatted).not.toContain("\\frac");
    expect(formatted).not.toContain("\\bar");
    expect(formatted).toContain("√(");
    expect(formatted).toContain("Σ");
  });

  it("converts binomial and combinations notation", () => {
    const raw = "nCr = \\binom{n}{r} = \\frac{n!}{r!(n - r)!}";
    const formatted = formatHumanReadableMath(raw);

    expect(formatted).toContain("C(n, r)");
    expect(formatted).toContain("(n!) / (r!(n - r)!)");
  });

  it("converts text blocks and percentage formulas", () => {
    const raw = "\\text{Percentage Value} = \\frac{X}{100} \\times Y";
    const formatted = formatHumanReadableMath(raw);

    expect(formatted).not.toContain("\\text");
    expect(formatted).toBe("Percentage Value = (X) / (100) × Y");
  });

  it("gracefully handles plain text formulas with zero distortion", () => {
    const plain = "Monthly EMI = [P × r × (1 + r)ⁿ] / [(1 + r)ⁿ - 1]";
    expect(formatHumanReadableMath(plain)).toBe(plain);
  });
});

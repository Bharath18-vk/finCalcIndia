/**
 * Mathematical Formula Human-Readable Formatter
 * Converts LaTeX, technical syntax, and mathematical expressions into clean,
 * natural, human-readable mathematical notation for users.
 */

export function formatHumanReadableMath(raw: string): string {
  if (!raw) return "";

  let s = raw;

  // 1. Root with index: \sqrt[n]{x} -> ⁿ√(x)
  s = s.replace(/\\sqrt\[([a-zA-Z0-9]+)\]\{([^}]+)\}/g, (_, deg, rad) => {
    const superscripts: Record<string, string> = {
      "2": "²",
      "3": "³",
      "4": "⁴",
      "5": "⁵",
      "6": "⁶",
      "7": "⁷",
      "8": "⁸",
      "9": "⁹",
      n: "ⁿ",
      y: "ʸ",
    };
    const sup = superscripts[deg] || `${deg}`;
    return `${sup}√(${rad})`;
  });

  // 2. Standard square root: \sqrt{x} -> √(x)
  s = s.replace(/\\sqrt\{([^}]+)\}/g, "√($1)");

  // 3. Fractions: \frac{num}{den} -> (num) / (den)
  let prev = "";
  while (s !== prev) {
    prev = s;
    s = s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "($1) / ($2)");
  }

  // 4. Binomial: \binom{n}{r} -> C(n, r)
  s = s.replace(/\\binom\{([^}]+)\}\{([^}]+)\}/g, "C($1, $2)");

  // 5. LaTeX text blocks: \text{Some Label} -> Some Label
  s = s.replace(/\\text\{([^}]+)\}/g, "$1");

  // 6. Common LaTeX mathematical operators
  s = s.replace(/\\times/g, "×");
  s = s.replace(/\\cdot/g, "×");
  s = s.replace(/\\div/g, "÷");
  s = s.replace(/\\pm/g, "±");
  s = s.replace(/\\dots/g, "...");
  s = s.replace(/\\bar\{([a-zA-Z0-9]+)\}/g, "$1̄");
  s = s.replace(/\\mu/g, "μ");
  s = s.replace(/\\sigma/g, "σ");
  s = s.replace(/\\Delta/g, "Δ");
  s = s.replace(/\\gcd/g, "GCD");
  s = s.replace(/\\lcm/g, "LCM");
  s = s.replace(/\\sum_\{[^}]*\}/g, "Σ");
  s = s.replace(/\\sum/g, "Σ");
  s = s.replace(/\\prod_\{[^}]*\}/g, "Π");
  s = s.replace(/\\prod/g, "Π");
  s = s.replace(/\\le/g, "≤");
  s = s.replace(/\\ge/g, "≥");
  s = s.replace(/\\ne/g, "≠");
  s = s.replace(/\\cup/g, "∪");
  s = s.replace(/\\cap/g, "∩");

  // 7. Spacing & Partition Operators
  s = s.replace(/\\quad\s*\|\s*\\quad/g, "  |  ");
  s = s.replace(/\\quad\s*\\mid\s*\\quad/g, "  |  ");
  s = s.replace(/\\quad/g, " ");
  s = s.replace(/\\mid/g, " | ");

  // 8. Delimiters
  s = s.replace(/\\left\(/g, "(");
  s = s.replace(/\\right\)/g, ")");
  s = s.replace(/\\left\[/g, "[");
  s = s.replace(/\\right\]/g, "]");
  s = s.replace(/\\left\\\{/g, "{");
  s = s.replace(/\\right\\\}/g, "}");

  // 9. Exponents and sub-scripts
  s = s.replace(/\^\{([^}]+)\}/g, "^($1)");
  s = s.replace(/_\{([^}]+)\}/g, "_$1");
  s = s.replace(/\^2\b/g, "²");
  s = s.replace(/\^3\b/g, "³");

  // 10. Escaped characters & stray backslashes
  s = s.replace(/\\%/g, "%");
  s = s.replace(/\\&/g, "&");
  s = s.replace(/\\([a-zA-Z]+)/g, "$1");

  // 11. Normalize redundant spaces
  s = s.replace(/\s{2,}/g, " ").trim();

  return s;
}

/**
 * Splits compound formula expressions (delimited by |, •, or newlines)
 * into individual clean mathematical sub-equations.
 */
export function splitCompoundFormulas(formula: string): string[] {
  if (!formula) return [];
  const clean = formatHumanReadableMath(formula);
  return clean
    .split(/\s*\|\s*|\s*•\s*|\n+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

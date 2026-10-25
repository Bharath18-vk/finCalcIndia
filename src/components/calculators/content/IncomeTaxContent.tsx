import React from "react";

export const IncomeTaxContent: React.FC = () => {
  return (
    <div className="space-y-8 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs text-slate-700 leading-relaxed">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Comprehensive Guide to Indian Income Tax (AY 2026-27 / FY 2025-26)
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Detailed breakdown of statutory New Regime slabs under Section 115BAC, Section 87A tax rebates, marginal relief mechanics, and New vs. Old Regime breakeven analysis.
        </p>
      </div>

      {/* Section 1: AY 2026-27 Slabs */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">
          1. Statutory Tax Slabs for Assessment Year 2026-27 (Section 115BAC)
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          The Finance Act 2025 restructured personal income tax slabs under the <strong>New Tax Regime (Section 115BAC)</strong>, expanding slab widths to provide relief across all middle-class and salaried income brackets for the financial year 2025-26 (Assessment Year 2026-27):
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3">Taxable Income Slab</th>
                <th className="py-2.5 px-3 text-right">Statutory Tax Rate</th>
                <th className="py-2.5 px-3 text-right">Tax on Full Slab</th>
                <th className="py-2.5 px-3 text-right">Cumulative Tax</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="py-2.5 px-3">₹0 to ₹4,00,000</td>
                <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">Nil (0%)</td>
                <td className="py-2.5 px-3 text-right">₹0</td>
                <td className="py-2.5 px-3 text-right">₹0</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3">₹4,00,001 to ₹8,00,000</td>
                <td className="py-2.5 px-3 text-right">5%</td>
                <td className="py-2.5 px-3 text-right">₹20,000</td>
                <td className="py-2.5 px-3 text-right">₹20,000</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3">₹8,00,001 to ₹12,00,000</td>
                <td className="py-2.5 px-3 text-right">10%</td>
                <td className="py-2.5 px-3 text-right">₹40,000</td>
                <td className="py-2.5 px-3 text-right text-amber-700 font-bold">₹60,000</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3">₹12,00,001 to ₹16,00,000</td>
                <td className="py-2.5 px-3 text-right">15%</td>
                <td className="py-2.5 px-3 text-right">₹60,000</td>
                <td className="py-2.5 px-3 text-right">₹1,20,000</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3">₹16,00,001 to ₹20,00,000</td>
                <td className="py-2.5 px-3 text-right">20%</td>
                <td className="py-2.5 px-3 text-right">₹80,000</td>
                <td className="py-2.5 px-3 text-right">₹2,00,000</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3">₹20,00,001 to ₹24,00,000</td>
                <td className="py-2.5 px-3 text-right">25%</td>
                <td className="py-2.5 px-3 text-right">₹1,00,000</td>
                <td className="py-2.5 px-3 text-right">₹3,00,000</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3">Above ₹24,00,000</td>
                <td className="py-2.5 px-3 text-right text-red-600 font-bold">30%</td>
                <td className="py-2.5 px-3 text-right">30% on excess</td>
                <td className="py-2.5 px-3 text-right">₹3,00,000 + 30%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">
          *A mandatory 4% Health &amp; Education Cess applies to the aggregate of tax liability plus applicable surcharge.
        </p>
      </section>

      {/* Section 2: Standard Deduction & Zero Tax up to 12.75 Lakhs */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">
          2. The ₹12.75 Lakh Zero-Tax Threshold: Standard Deduction &amp; Section 87A
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          For salaried individuals and pensioners, the New Tax Regime provides a flat <strong>₹75,000 Standard Deduction</strong> under Section 16(ia). When coupled with the expanded <strong>Section 87A tax rebate</strong>, salaried employees earning up to ₹12.75 Lakhs per year incur <strong>zero income tax liability</strong>:
        </p>
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs sm:text-sm text-emerald-950 space-y-2">
          <p className="font-bold text-emerald-900">
            Step-by-Step Proof of Zero Tax on ₹12,75,000 Gross Salary
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Gross Salary:</strong> ₹12,75,000</li>
            <li><strong>Less Standard Deduction:</strong> -₹75,000</li>
            <li><strong>Net Taxable Income:</strong> ₹12,00,000</li>
            <li><strong>Slab Tax on ₹12,00,000:</strong> (₹0 on first ₹4L) + (5% on ₹4L = ₹20,000) + (10% on ₹4L = ₹40,000) = <strong>₹60,000</strong></li>
            <li><strong>Section 87A Rebate:</strong> Full rebate of ₹60,000 on taxable income ≤ ₹12,00,000 = <strong>-₹60,000</strong></li>
            <li><strong>Net Tax Payable:</strong> <strong>₹0 (Zero)</strong></li>
          </ul>
        </div>
      </section>

      {/* Section 3: Marginal Relief */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">
          3. How Section 87A Marginal Relief Protects Borderline Incomes
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Without statutory relief, earning just ₹10,000 above the ₹12,00,000 taxable limit would cause you to lose the entire ₹60,000 rebate, triggering over ₹61,500 in tax—meaning you would lose far more in tax than the additional income earned!
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          To prevent this anomaly, the Income Tax Act provides <strong>Statutory Marginal Relief</strong> under Section 87A. The rule mandates that:
        </p>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-mono text-slate-800 text-center">
          Tax Payable (before cess) ≤ Taxable Income - ₹12,00,000
        </div>
        <p className="text-xs text-slate-600">
          For example, if your taxable income is <strong>₹12,20,000</strong> (exceeding ₹12 Lakh by ₹20,000), normal slab tax would be ₹63,000. Marginal relief caps your tax liability to exactly ₹20,000 (plus 4% cess = ₹20,800), saving you ₹43,000 in unfair tax spikes. This relief operates smoothly up to a taxable income of approximately ₹12,70,588.
        </p>
      </section>

      {/* Section 4: New vs Old Regime Breakeven */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">
          4. New vs. Old Tax Regime: When Does the Old Regime Win?
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          The New Tax Regime is the statutory default regime in India. To determine whether you should affirmatively opt for the Old Regime, calculate your total eligible deductions under Chapter VI-A and Section 24(b):
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3">Gross Annual Income</th>
                <th className="py-2.5 px-3 text-right">New Regime Tax</th>
                <th className="py-2.5 px-3 text-right">Deductions Needed for Old Regime to Win</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="py-2.5 px-3">₹12,75,000</td>
                <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">₹0</td>
                <td className="py-2.5 px-3 text-right text-slate-500">&gt; ₹7,75,000 (Virtually Impossible)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3">₹15,00,000</td>
                <td className="py-2.5 px-3 text-right">₹1,09,200</td>
                <td className="py-2.5 px-3 text-right font-bold text-amber-700">&gt; ₹4,25,000 in Deductions</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3">₹20,00,000</td>
                <td className="py-2.5 px-3 text-right">₹2,08,000</td>
                <td className="py-2.5 px-3 text-right font-bold text-amber-700">&gt; ₹4,75,000 in Deductions</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">
          *Eligible Old Regime deductions include Section 80C (₹1.5L), Section 80D (₹25k-₹1L), Section 24(b) home loan interest (₹2L), Section 80CCD(1B) NPS (₹50k), and HRA exemption under Section 10(13A).
        </p>
      </section>

      {/* Section 5: Surcharge Rates */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">
          5. Surcharge Rates for High Earners
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          For high-net-worth individuals, the New Tax Regime caps the maximum surcharge rate at <strong>25%</strong> (for taxable income exceeding ₹2 Crores), whereas the Old Tax Regime continues to levy a punitive <strong>37% surcharge</strong> for incomes exceeding ₹5 Crores. This reduces the peak effective tax rate under the New Regime to 39% compared to 42.74% under the Old Regime.
        </p>
      </section>
    </div>
  );
};

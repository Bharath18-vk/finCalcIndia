import React from "react";

export const SalaryContent: React.FC = () => {
  return (
    <div className="space-y-8 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs text-slate-700 leading-relaxed">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Complete Guide to Salary Structures &amp; Take-Home Pay in India
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Deconstructing Cost to Company (CTC), statutory Employee Provident Fund (EPF), state-wise Professional Tax (PT), and monthly TDS withholdings.
        </p>
      </div>

      {/* Section 1: CTC vs Gross vs In-Hand */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">
          1. CTC vs. Gross Salary vs. Net In-Hand: Why Your Bank Credit Differs
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          One of the most frequent surprises for corporate employees in India is receiving a monthly bank credit substantially lower than their annual CTC divided by 12. Understanding the structural hierarchy of your payslip clarifies this difference:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm">Cost to Company (CTC)</h4>
            <p className="text-xs text-slate-600">
              The aggregate annual expenditure incurred by your employer to retain you. In addition to your direct cash salary, it includes employer statutory PF contributions (12%), statutory gratuity provisions (4.81% of basic), and group medical insurance premiums.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm">Gross Salary</h4>
            <p className="text-xs text-slate-600">
              Your direct compensation before any employee-side deductions. It equals CTC minus employer-side statutory contributions (such as Employer EPF and Gratuity accruals). Gross salary is the baseline figure against which income tax is computed.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
            <h4 className="font-bold text-emerald-950 text-sm">Net In-Hand (Take-Home)</h4>
            <p className="text-xs text-emerald-900">
              The actual net cash credited to your bank account on payday. It is calculated by subtracting Employee EPF (12%), State Professional Tax (PT), and monthly income tax withholdings (TDS under Section 192) from Gross Salary.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Statutory Deductions Breakdown */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">
          2. Statutory Deductions on Indian Payslips
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Every month, three primary statutory deductions reduce your Gross Salary to your final net pay:
        </p>
        <ul className="list-disc pl-5 text-sm text-slate-600 space-y-2">
          <li>
            <strong>Employee Provident Fund (EPF - 12%):</strong> By mandate of the Employees&apos; Provident Funds and Miscellaneous Provisions Act 1952, 12% of your monthly (Basic Salary + Dearness Allowance) is deducted from your paycheck and transferred to your EPFO account. Your employer matches this with an equal 12% (of which 8.33% up to ₹1,250 goes to EPS and the rest to EPF). Both accumulate at an annual sovereign interest rate of 8.25% p.a.
          </li>
          <li>
            <strong>Professional Tax (PT - Article 276(2)):</strong> A state government levy on salaried professionals capped by the Constitution at ₹2,500 per annum. In Maharashtra, it is ₹200 per month (₹300 in February); in Karnataka, ₹200 per month; in Telangana, ₹200 per month; while Delhi, Haryana, Rajasthan, and Uttar Pradesh levy <strong>zero Professional Tax</strong>.
          </li>
          <li>
            <strong>Tax Deducted at Source (TDS - Section 192):</strong> Your employer estimates your annual tax liability based on your chosen regime (New vs. Old), subtracts the standard deduction (₹75,000 in New Regime), and withholds one-twelfth of the annual tax each month.
          </li>
        </ul>
      </section>

      {/* Section 3: Salary Restructuring & Basic % */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">
          3. Optimizing Your Salary: The 40% to 50% Basic Salary Rule
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Most HR compensation teams in India structure Basic Salary at <strong>40% to 50% of total CTC</strong>. Why?
        </p>
        <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5">
          <li>
            <strong>If Basic is too high (e.g., 60%+):</strong> Your EPF contribution increases sharply. While this boosts long-term retirement savings, it significantly diminishes your immediate liquid in-hand cash flow.
          </li>
          <li>
            <strong>If Basic is too low (e.g., &lt; 30%):</strong> Your tax-exempt HRA ceiling drops (HRA is capped at 50% of Basic for metros and 40% for non-metros under Section 10(13A)), increasing your taxable income under the Old Regime.
          </li>
          <li>
            <strong>The Statutory ₹15,000 Wage Ceiling Option:</strong> If your monthly Basic Salary exceeds ₹15,000, some employers allow you to cap EPF contributions to 12% of the ₹15,000 statutory ceiling (₹1,800/month) rather than the full basic pay. This substantially elevates monthly in-hand take-home pay.
          </li>
        </ul>
      </section>

      {/* Section 4: Worked Example Table */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">
          4. Itemized Case Study: ₹12,00,000 Annual CTC Breakdown
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Here is how a ₹12 Lakh CTC is structured under standard corporate benchmarks (40% basic, Maharashtra PT, New Tax Regime AY 2026-27):
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3">Salary Component</th>
                <th className="py-2.5 px-3 text-right">Monthly Amount</th>
                <th className="py-2.5 px-3 text-right">Annual Amount</th>
                <th className="py-2.5 px-3 text-right">% of CTC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="py-2.5 px-3">Basic Salary (40%)</td>
                <td className="py-2.5 px-3 text-right">₹40,000</td>
                <td className="py-2.5 px-3 text-right">₹4,80,000</td>
                <td className="py-2.5 px-3 text-right">40.0%</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3">House Rent Allowance (HRA - 50% of Basic)</td>
                <td className="py-2.5 px-3 text-right">₹20,000</td>
                <td className="py-2.5 px-3 text-right">₹2,40,000</td>
                <td className="py-2.5 px-3 text-right">20.0%</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3">Special &amp; Flexible Allowances</td>
                <td className="py-2.5 px-3 text-right">₹35,200</td>
                <td className="py-2.5 px-3 text-right">₹4,22,400</td>
                <td className="py-2.5 px-3 text-right">35.2%</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-slate-500">Employer EPF Contribution (12% of Basic)</td>
                <td className="py-2.5 px-3 text-right text-slate-500">₹4,800</td>
                <td className="py-2.5 px-3 text-right text-slate-500">₹57,600</td>
                <td className="py-2.5 px-3 text-right text-slate-500">4.8%</td>
              </tr>
              <tr className="bg-slate-50 font-bold text-slate-900">
                <td className="py-2.5 px-3">Total Cost to Company (CTC)</td>
                <td className="py-2.5 px-3 text-right">₹1,00,000</td>
                <td className="py-2.5 px-3 text-right">₹12,00,000</td>
                <td className="py-2.5 px-3 text-right">100.0%</td>
              </tr>
              <tr className="text-red-700">
                <td className="py-2.5 px-3">Less: Employee EPF (12% of Basic)</td>
                <td className="py-2.5 px-3 text-right">-₹4,800</td>
                <td className="py-2.5 px-3 text-right">-₹57,600</td>
                <td className="py-2.5 px-3 text-right">4.8%</td>
              </tr>
              <tr className="text-red-700">
                <td className="py-2.5 px-3">Less: Professional Tax (PT)</td>
                <td className="py-2.5 px-3 text-right">-₹200</td>
                <td className="py-2.5 px-3 text-right">-₹2,500</td>
                <td className="py-2.5 px-3 text-right">0.2%</td>
              </tr>
              <tr className="text-emerald-700">
                <td className="py-2.5 px-3">Less: Monthly Income Tax TDS (AY 2026-27)*</td>
                <td className="py-2.5 px-3 text-right font-bold">₹0</td>
                <td className="py-2.5 px-3 text-right font-bold">₹0</td>
                <td className="py-2.5 px-3 text-right">0.0%</td>
              </tr>
              <tr className="bg-emerald-100 font-black text-slate-900 border-t-2 border-emerald-500">
                <td className="py-3 px-3">Net Take-Home Salary Credited</td>
                <td className="py-3 px-3 text-right text-emerald-800">₹90,200</td>
                <td className="py-3 px-3 text-right text-emerald-800">₹10,82,400</td>
                <td className="py-3 px-3 text-right">90.2%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">
          *Under AY 2026-27 New Tax Regime, taxable salary of ₹12 Lakhs minus ₹75,000 standard deduction leaves ₹11.25 Lakhs, which attracts <strong>zero tax</strong> due to Section 87A rebate.
        </p>
      </section>
    </div>
  );
};

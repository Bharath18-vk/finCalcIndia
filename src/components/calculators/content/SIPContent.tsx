import React from "react";

export const SIPContent: React.FC = () => {
  return (
    <div className="space-y-8 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs text-slate-700 leading-relaxed">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          In-Depth Guide to Systematic Investment Plans (SIPs) in India
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Master the compounding math of regular mutual fund investing, rupee-cost averaging, LTCG taxation under Budget 2024, and multi-decade wealth milestones.
        </p>
      </div>

      {/* Section 1: Annuity Due Compounding */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">
          1. The Mathematics of Compounding: Why We Use Annuity Due
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          A Systematic Investment Plan (SIP) is a disciplined method of allocating a fixed sum of capital at predetermined regular monthly intervals into mutual fund schemes. In standard financial mathematics, cash flows occurring at the end of a period are modeled as an <em>Ordinary Annuity</em>. However, in Indian mutual funds, SIP debits occur on your chosen execution date (typically the 1st, 5th, 10th, or 15th of the month) and units are credited immediately at that day&apos;s closing Net Asset Value (NAV).
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          Because your money is put to work at the <strong>beginning</strong> of each cycle, it compounds for that entire month. Our calculator accurately reflects this by applying the <strong>Annuity Due</strong> formula:
        </p>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-mono text-slate-800 text-center">
          Future Value (FV) = P × [((1 + r)ⁿ - 1) / r] × (1 + r)
        </div>
        <p className="text-xs text-slate-500">
          Where <strong>P</strong> is your monthly installment, <strong>r</strong> is the periodic monthly rate (Annual Return ÷ 12 ÷ 100), and <strong>n</strong> is the total number of monthly payments. The trailing multiplier <code>(1 + r)</code> accounts for the immediate monthly compounding.
        </p>
      </section>

      {/* Section 2: Rupee Cost Averaging */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">
          2. Rupee Cost Averaging: Removing Market Volatility Risk
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          The defining behavioural and mathematical advantage of an equity SIP is <strong>Rupee Cost Averaging</strong>. Rather than attempting to predict market tops and bottoms—a strategy that fails for the overwhelming majority of retail investors—SIP investing automatically exploits market corrections:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm">During Bull Markets (Rising NAV)</h4>
            <p className="text-xs text-slate-600">
              When market valuations rise and NAVs climb, your fixed monthly allocation buys fewer units. Your existing portfolio gains in value, but you do not over-allocate capital at market peaks.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
            <h4 className="font-bold text-emerald-950 text-sm">During Bear Markets (Dips & Crashes)</h4>
            <p className="text-xs text-emerald-900">
              When market indices correct, fund NAVs drop, allowing your fixed monthly contribution to purchase significantly more units at discounted valuations. When markets recover, those units power exponential portfolio gains.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: The 8-4-3 Rule of Compounding */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">
          3. The Power of Time: The 8-4-3 Wealth Accumulation Phenomenon
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Compounding is deeply non-linear. In the first 5 to 7 years of an SIP, the difference between your cumulative invested capital and your total portfolio value appears modest. However, once your accumulated capital begins generating returns that exceed your annual contributions, growth accelerates dramatically.
        </p>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-2">
          <p className="font-bold text-slate-900">
            Case Study: A ₹25,000 Monthly SIP @ 12% Expected Return
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>First ₹1 Crore:</strong> Requires approximately <strong>13.5 to 14 years</strong> of steady investing.</li>
            <li><strong>Second ₹1 Crore (₹1 Cr to ₹2 Cr):</strong> Takes only about <strong>4.5 to 5 years</strong>, requiring less than one-third of the initial time.</li>
            <li><strong>Third ₹1 Crore (₹2 Cr to ₹3 Cr):</strong> Takes merely <strong>2.5 to 3 years</strong>!</li>
          </ul>
          <p className="text-slate-500 pt-1">
            By year 20, the portfolio reaches approximately <strong>₹2.5 Crore</strong>, of which your actual principal investment is just ₹60 Lakhs, while compounding returns contribute over ₹1.9 Crore (76% of total wealth).
          </p>
        </div>
      </section>

      {/* Section 4: Taxation of Mutual Funds (Budget 2024) */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">
          4. Taxation of Mutual Fund SIPs in India (Finance Act 2024 Updates)
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Tax planning is essential when forecasting mutual fund redemption proceeds. Under the current Income Tax provisions introduced in Union Budget 2024:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Holding Period</th>
                <th className="py-2.5 px-3">Tax Rate</th>
                <th className="py-2.5 px-3">Exemption Limit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Equity Funds - LTCG</td>
                <td className="py-2.5 px-3">&gt; 12 Months</td>
                <td className="py-2.5 px-3 text-emerald-800 font-bold">12.5% (+ 4% cess)</td>
                <td className="py-2.5 px-3 text-emerald-700">₹1,25,000 per financial year</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Equity Funds - STCG</td>
                <td className="py-2.5 px-3">≤ 12 Months</td>
                <td className="py-2.5 px-3 text-amber-700 font-bold">20.0% (+ 4% cess)</td>
                <td className="py-2.5 px-3 text-slate-500">Nil (Taxed from ₹1)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Specified Debt Funds</td>
                <td className="py-2.5 px-3">Any Tenure</td>
                <td className="py-2.5 px-3 text-slate-700">Investor Slab Rate</td>
                <td className="py-2.5 px-3 text-slate-500">No indexation benefit (Post 1-Apr-2023)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs sm:text-sm text-emerald-950 space-y-1.5">
          <p className="font-bold text-emerald-900">
            Vital Note: First-In, First-Out (FIFO) Accounting for SIP Units
          </p>
          <p>
            When you invest via SIP, each monthly installment buys a distinct batch of units on that specific transaction date. Therefore, each monthly batch has its <strong>own individual 365-day holding clock</strong>. If you run an SIP for 15 months and redeem everything, only the units purchased during the first 3 months qualify as Long-Term (12.5%); the units purchased during the subsequent 12 months are treated as Short-Term (20%).
          </p>
        </div>
      </section>

      {/* Section 5: Regular vs Step-Up SIP */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">
          5. Regular SIP vs. Step-Up SIP: Beating Lifestyle Inflation
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          While a fixed-amount regular SIP is an excellent starting point, your annual earning capacity increases over your career. Maintaining a flat SIP of ₹10,000 per month for 20 years causes your investment rate to fall behind your rising income and lifestyle costs.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          By adopting a <strong>Step-Up SIP</strong> (increasing your monthly contribution by 10% annually in step with your annual appraisal), your 20-year corpus grows from approximately <strong>₹99.9 Lakhs to over ₹2.03 Crores</strong>—more than doubling your wealth with modest, incremental annual commitments.
        </p>
      </section>
    </div>
  );
};

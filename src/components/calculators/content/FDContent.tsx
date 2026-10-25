import React from "react";

export const FDContent: React.FC = () => {
  return (
    <div className="space-y-8 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs text-slate-700 leading-relaxed">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Comprehensive Guide to Bank Fixed Deposits (FDs) in India
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Master RBI quarterly compounding mechanics, Effective Annual Yield (APY), senior citizen deposit rates, TDS Section 194A compliance, and DICGC insurance protection.
        </p>
      </div>

      {/* Section 1: Quarterly Compounding & APY */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">
          1. The Mathematics of Bank Fixed Deposits: Quarterly Compounding
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Pursuant to Reserve Bank of India (RBI) Master Directives on Interest Rates on Deposits, Indian commercial banks (including public sector giants like SBI and PNB, as well as private banks like HDFC and ICICI) compute interest on cumulative fixed deposits on a <strong>quarterly compounding basis</strong> (every 3 months / 4 times per year).
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          The official compound interest formula applied is:
        </p>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-mono text-slate-800 text-center">
          A = P × (1 + r / 4)⁴ⁿ
        </div>
        <p className="text-xs text-slate-600">
          Where <strong>A</strong> is the final maturity amount, <strong>P</strong> is the principal deposit, <strong>r</strong> is the nominal annual interest rate as a decimal (e.g., 0.07 for 7%), and <strong>n</strong> is the tenure in completed years.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          Because interest is credited and reinvested four times each year, the <strong>Effective Annual Yield (Annual Percentage Yield or APY)</strong> is always higher than the quoted nominal card rate. For example, a nominal rate of <strong>7.00% p.a.</strong> yields an effective annual return of <strong>7.19%</strong>; an <strong>8.00% p.a.</strong> rate yields <strong>8.24% APY</strong>.
        </p>
      </section>

      {/* Section 2: Cumulative vs Non-Cumulative FDs */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">
          2. Cumulative (Reinvestment) vs. Non-Cumulative (Income Payout) FDs
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          When opening a fixed deposit account, banks offer two functional payout options depending on your cash-flow requirements:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm">Cumulative (Reinvestment) Plan</h4>
            <p className="text-xs text-slate-600">
              Interest accumulates and is reinvested every quarter. Both principal and compounding interest are paid out as a lump sum upon deposit maturity. Best suited for long-term goal savers seeking maximized terminal wealth.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm">Non-Cumulative (Periodic Payout) Plan</h4>
            <p className="text-xs text-slate-600">
              Interest is not reinvested; instead, it is disbursed directly into your savings account on a monthly, quarterly, or half-yearly schedule at a discounted rate. Highly popular among retirees requiring steady pension-like cash inflows.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Senior Citizen Rates & DICGC Safety */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">
          3. Senior Citizen Premium &amp; DICGC Deposit Insurance Protection
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Indian financial institutions provide special provisions to protect and enhance returns for senior citizens (individuals aged 60 and above):
        </p>
        <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5">
          <li>
            <strong>Interest Premium (+0.50% to +0.75%):</strong> Resident senior citizens receive an additional 50 to 75 basis points above the standard rate across all tenures. Super senior citizens (aged 80+) often receive an additional 20 to 25 basis points with select banks.
          </li>
          <li>
            <strong>Sovereign DICGC Safety Insurance:</strong> Under the Deposit Insurance and Credit Guarantee Corporation (DICGC) Act, fixed deposits, recurring deposits, and savings balances in all scheduled commercial and cooperative banks are <strong>insured up to ₹5,00,000 per depositor per bank</strong> (inclusive of principal and accrued interest). To maintain 100% insurance coverage on larger corpuses (e.g., ₹25 Lakhs), investors can distribute deposits across different banking institutions.
          </li>
        </ul>
      </section>

      {/* Section 4: Taxation of FD Interest and TDS */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">
          4. Taxation of Fixed Deposit Interest: TDS &amp; Form 15G/15H Rules
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Unlike equity mutual funds, interest on bank fixed deposits is fully taxable under the head <em>&ldquo;Income from Other Sources&rdquo;</em> at your applicable slab rate:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3">Tax Parameter</th>
                <th className="py-2.5 px-3">General Citizen (&lt; 60 Years)</th>
                <th className="py-2.5 px-3">Senior Citizen (60+ Years)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Section 194A TDS Threshold</td>
                <td className="py-2.5 px-3">₹40,000 per bank / FY</td>
                <td className="py-2.5 px-3 text-emerald-800 font-bold">₹50,000 per bank / FY</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">TDS Rate (with valid PAN)</td>
                <td className="py-2.5 px-3">10% on interest exceeding limit</td>
                <td className="py-2.5 px-3">10% on interest exceeding limit</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Exemption Form to Avoid TDS</td>
                <td className="py-2.5 px-3">Form 15G (Taxable income = Nil)</td>
                <td className="py-2.5 px-3 text-emerald-700 font-bold">Form 15H (Final tax liability = Nil)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Chapter VI-A Tax Exemption</td>
                <td className="py-2.5 px-3 text-slate-500">None (80TTA covers savings only)</td>
                <td className="py-2.5 px-3 text-emerald-800 font-bold">Section 80TTB: Up to ₹50,000 exempt</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs sm:text-sm text-amber-950 space-y-1.5">
          <p className="font-bold text-amber-900">
            Crucial Note on Accrual Basis Taxation
          </p>
          <p>
            Even in a 5-year cumulative FD where interest is not paid out annually, income tax is levied on an <strong>accrual basis each financial year</strong>. Banks report annual accrued interest to the Income Tax Department via Form 26AS and the Annual Information Statement (AIS). Ensure you declare accrued interest each year in your ITR to prevent severe interest mismatch notices upon final maturity.
          </p>
        </div>
      </section>

      {/* Section 5: Tax Saving 5-Year FDs */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">
          5. 5-Year Tax-Saving FDs vs. Regular Fixed Deposits
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Under Section 80C of the Income Tax Act, deposits made into designated <strong>5-Year Tax-Saving Fixed Deposits</strong> qualify for deductions up to <strong>₹1,50,000 per financial year</strong> under the Old Tax Regime.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          However, tax-saving deposits carry stringent conditions: they have a <strong>mandatory 5-year lock-in period</strong> with strictly zero premature withdrawals allowed, and they cannot be pledged as collateral or security for bank loans or overdraft facilities.
        </p>
      </section>
    </div>
  );
};

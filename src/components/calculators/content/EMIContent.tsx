import React from "react";

export const EMIContent: React.FC = () => {
  return (
    <div className="space-y-8 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs text-slate-700 leading-relaxed">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Comprehensive Guide to Equated Monthly Installments (EMIs) in India
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Understanding loan amortization, reducing balance interest calculations, prepayment acceleration strategies, and RBI regulatory norms.
        </p>
      </div>

      {/* Section 1: How EMI and Amortization Work */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">
          1. Understanding Loan Amortization: The Reducing Balance Principle
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          In India, commercial banks (such as SBI, HDFC, ICICI, and Axis Bank) and housing finance companies (HFCs) calculate loan repayments using the <strong>reducing balance method</strong>. Under this method, interest for any given calendar month is levied solely on the outstanding principal balance at that point in time, rather than the initial sanctioned loan quantum.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          Every Equated Monthly Installment (EMI) you pay comprises two distinct components:
        </p>
        <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5">
          <li>
            <strong>Interest Component:</strong> Computed as <code>(Outstanding Principal × Monthly Interest Rate)</code>. In the early years of a long-term loan (such as a 20-year or 30-year home loan), interest accounts for 70% to 85% of your total monthly installment.
          </li>
          <li>
            <strong>Principal Component:</strong> The residual portion of your EMI after interest is deducted. This amount directly settles your loan balance, reducing the principal on which subsequent interest cycles are calculated.
          </li>
        </ul>
        <p className="text-sm text-slate-600 leading-relaxed">
          As the principal gradually diminishes over the repayment tenure, the monthly interest portion shrinks proportionately, and an ever-larger share of each EMI goes toward eliminating the remaining debt.
        </p>
      </section>

      {/* Section 2: Reducing Balance vs Flat Rate Trap */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">
          2. The Flat Interest Rate Trap: Why Advertised Rates Can Be Deceptive
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Some NBFCs and retail lenders quote interest using a <strong>flat rate</strong>, especially for consumer durable and used car financing. In a flat-rate loan, interest is calculated on the full initial loan amount throughout the entire tenure, ignoring the fact that you are steadily repaying principal every month.
        </p>
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs sm:text-sm text-amber-950 space-y-2">
          <p className="font-bold text-amber-900">
            Crucial Comparison: Flat Rate vs. Reducing Balance Rate
          </p>
          <p>
            An advertised <strong>8.00% flat interest rate</strong> on a 5-year loan of ₹5,00,000 generates total interest of ₹2,00,000 (₹40,000 per year). On a reducing balance basis, an equivalent total interest cost corresponds to an effective annual rate (EIR) of approximately <strong>14.5% to 15.0%</strong>! Always confirm whether your sanction letter quotes an Effective Reducing Balance Rate or a flat rate before signing.
          </p>
        </div>
      </section>

      {/* Section 3: The True Cost of Loan Tenure */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">
          3. Tenure vs. Interest Burden: The Exponential Cost of 30-Year Mortgages
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Opting for a longer tenure lowers your monthly outflow, which can help meet bank debt-to-income (FOIR) eligibility criteria. However, extending the repayment period dramatically magnifies the aggregate interest paid to the lending institution:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3">Tenure</th>
                <th className="py-2.5 px-3 text-right">Monthly EMI (@ 8.5%)</th>
                <th className="py-2.5 px-3 text-right">Total Interest Paid</th>
                <th className="py-2.5 px-3 text-right">Interest as % of Loan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="py-2.5 px-3">15 Years</td>
                <td className="py-2.5 px-3 text-right">₹49,237</td>
                <td className="py-2.5 px-3 text-right text-amber-700">₹38,62,654</td>
                <td className="py-2.5 px-3 text-right">77.3%</td>
              </tr>
              <tr className="bg-emerald-50/50">
                <td className="py-2.5 px-3">20 Years</td>
                <td className="py-2.5 px-3 text-right">₹43,391</td>
                <td className="py-2.5 px-3 text-right text-amber-700">₹54,13,879</td>
                <td className="py-2.5 px-3 text-right">108.3%</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3">30 Years</td>
                <td className="py-2.5 px-3 text-right">₹38,446</td>
                <td className="py-2.5 px-3 text-right text-amber-700 font-bold">₹88,40,509</td>
                <td className="py-2.5 px-3 text-right font-bold text-red-600">176.8%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">
          *Calculated for a ₹50,00,000 principal at an illustrative benchmark rate of 8.50% p.a.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          Notice that stretching a ₹50 Lakh loan from 20 years to 30 years saves merely ₹4,945 per month in EMI, but forces you to pay an additional <strong>₹34.26 Lakhs in extra interest</strong>!
        </p>
      </section>

      {/* Section 4: Loan Prepayment Strategies & RBI Rules */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">
          4. Accelerating Debt Freedom: Prepayment Math & RBI Directives
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Pursuant to Reserve Bank of India (RBI) regulatory guidelines, commercial banks and regulated housing finance companies are prohibited from levying any <strong>foreclosure charges or prepayment penalties</strong> on floating-rate individual retail loans (including home loans and mortgage top-ups).
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          Two proven mathematical strategies help borrowers significantly truncate their debt timeline:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm">Strategy A: The "1 Extra EMI" Annual Top-Up</h4>
            <p className="text-xs text-slate-600">
              Paying just 1 additional EMI every calendar year directly towards the outstanding principal on a 20-year home loan can reduce your overall tenure by nearly <strong>4 to 4.5 years</strong> and save up to 20% of your total interest burden.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm">Strategy B: Annual 5% Step-Up in EMI</h4>
            <p className="text-xs text-slate-600">
              As your annual salary increases, instructing your bank to increase your monthly installment by 5% each year can compress a 20-year home loan into less than <strong>12 years</strong>, saving tens of lakhs of rupees.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Income Tax Benefits on Home Loans */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">
          5. Tax Deductions on Home Loan Repayment in India
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          For taxpayers filing under the <strong>Old Tax Regime</strong>, home loan installments qualify for substantial statutory deductions:
        </p>
        <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5">
          <li>
            <strong>Section 24(b) - Interest Deduction:</strong> Deduction up to <strong>₹2,00,000 per financial year</strong> on the interest component for a self-occupied residential property. For let-out (rented) properties, actual interest paid can be deducted against rental income, subject to standard set-off caps.
          </li>
          <li>
            <strong>Section 80C - Principal Repayment:</strong> Deduction up to <strong>₹1,50,000 per financial year</strong> for principal repayment, stamp duty, and registration charges (shared with EPF, PPF, and ELSS).
          </li>
          <li>
            <strong>New Tax Regime Note:</strong> Under the New Tax Regime (Section 115BAC), Section 24(b) deductions for self-occupied properties and Section 80C deductions are not available. Borrowers must evaluate their overall tax profile to determine if switching to the Old Regime yields greater net tax savings.
          </li>
        </ul>
      </section>
    </div>
  );
};

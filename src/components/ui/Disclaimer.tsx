import React from "react";
import { AlertCircle } from "lucide-react";

export interface DisclaimerProps {
  customText?: string;
  asOfDate?: string;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({
  customText,
  asOfDate,
}) => {
  return (
    <aside
      aria-label="Financial Disclaimer"
      className="w-full bg-slate-50/80 rounded-2xl p-5 sm:p-6 border border-slate-200/90 text-xs text-slate-600 space-y-2 shadow-xs"
    >
      <div className="flex items-center gap-2 font-bold text-slate-800">
        <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Important Disclaimer & Assumptions</span>
      </div>

      <p className="leading-relaxed">
        {customText ||
          "All calculations, estimates, and schedules shown on this page are illustrative and based solely on the assumptions and figures entered. Results do not constitute certified financial, tax, or investment advice. Mutual fund returns are subject to market risks, and actual bank loan terms, interest rates, processing charges, and taxes may vary by financial institution and applicant credit profile."}
      </p>

      {asOfDate && (
        <p className="text-[11px] text-slate-500 font-medium">
          Market benchmark parameters verified as of: {asOfDate}.
        </p>
      )}
    </aside>
  );
};

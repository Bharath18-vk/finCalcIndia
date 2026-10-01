import React from "react";
import { ExternalLink, ShieldCheck } from "lucide-react";

export interface AffiliateSlotProps {
  partnerName: string;
  category: "investment" | "loan" | "demat" | "insurance";
  headline: string;
  description: string;
  ctaText: string;
  affiliateUrl?: string; // If undefined or inactive, renders inactive fallback
  isActive?: boolean;
}

export const AffiliateSlot: React.FC<AffiliateSlotProps> = ({
  partnerName,
  category,
  headline,
  description,
  ctaText,
  affiliateUrl,
  isActive = false, // Inactive by default as required
}) => {
  if (!isActive || !affiliateUrl) {
    return null;
  }

  return (
    <div className="w-full my-6 p-5 sm:p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
            Sponsored
          </span>
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified Partner
          </span>
        </div>
        <h4 className="text-base font-bold text-slate-900">{headline}</h4>
        <p className="text-xs text-slate-600 max-w-xl">{description}</p>
      </div>

      <div className="shrink-0 flex flex-col items-start sm:items-end gap-1.5">
        <a
          href={affiliateUrl}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow transition-colors"
        >
          <span>{ctaText}</span>
          <ExternalLink className="w-4 h-4" />
        </a>
        <span className="text-[10px] text-slate-400">
          Partner: {partnerName}
        </span>
      </div>
    </div>
  );
};

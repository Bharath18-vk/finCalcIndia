"use client";

import React from "react";
import Link from "next/link";
import { trackRelatedCalculatorClicked } from "@/lib/analytics";
import { ArrowRight, Calculator } from "lucide-react";

export interface RelatedLink {
  title: string;
  description: string;
  href: string;
  badge?: string;
}

export interface RelatedCalculatorsProps {
  currentSlug?: string;
  title?: string;
  links: RelatedLink[];
}

export const RelatedCalculators: React.FC<RelatedCalculatorsProps> = ({
  currentSlug = "calculator",
  title = "Related Calculators & Scenarios",
  links,
}) => {
  if (!links || links.length === 0) return null;

  return (
    <section className="w-full bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
        <span className="text-xs font-semibold text-slate-400">Explore Alternatives</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => trackRelatedCalculatorClicked(currentSlug, link.href)}
            className="group p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 group-hover:text-emerald-800">
                  <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{link.title}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                    {link.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 group-hover:text-slate-600 line-clamp-2 leading-relaxed">
                {link.description}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-end text-xs font-semibold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
              <span className="mr-1">Calculate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

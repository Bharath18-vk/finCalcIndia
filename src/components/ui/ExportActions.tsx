"use client";

import React, { useState } from "react";
import { Download, Printer, Check, FileSpreadsheet } from "lucide-react";
import { triggerPrintReport } from "@/lib/export";

export interface ExportActionsProps {
  onExportCsv?: () => void;
  onPrint?: () => void;
  csvLabel?: string;
  printLabel?: string;
  className?: string;
}

export const ExportActions: React.FC<ExportActionsProps> = ({
  onExportCsv,
  onPrint = triggerPrintReport,
  csvLabel = "Download Schedule (CSV / Excel)",
  printLabel = "Print / Save PDF",
  className = "",
}) => {
  const [downloaded, setDownloaded] = useState(false);

  const handleCsvClick = () => {
    if (!onExportCsv) return;
    onExportCsv();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-2 print:hidden ${className}`}
      role="toolbar"
      aria-label="Export and Print Actions"
    >
      {onExportCsv && (
        <button
          type="button"
          onClick={handleCsvClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200/90 shadow-xs active:scale-95 transition-all cursor-pointer"
          title="Download complete schedule to Excel / CSV"
        >
          {downloaded ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-700" />
              <span>Downloaded!</span>
            </>
          ) : (
            <>
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>{csvLabel}</span>
            </>
          )}
        </button>
      )}

      {onPrint && (
        <button
          type="button"
          onClick={onPrint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-xs active:scale-95 transition-all cursor-pointer"
          title="Print or Save this calculation report as PDF"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
          <span>{printLabel}</span>
        </button>
      )}
    </div>
  );
};

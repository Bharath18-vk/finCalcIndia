import React from "react";

export interface AdSlotProps {
  slotId: string;
  format?: "horizontal-banner" | "rectangle" | "in-article";
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({
  slotId,
  format = "horizontal-banner",
  className = "",
}) => {
  // Height reservations to guarantee ZERO Cumulative Layout Shift (CLS)
  const formatClasses = {
    "horizontal-banner": "min-h-[90px] max-w-[728px] mx-auto",
    rectangle: "min-h-[250px] max-w-[300px] mx-auto",
    "in-article": "min-h-[100px] w-full",
  }[format];

  return (
    <div
      aria-label="Advertisement Space"
      data-ad-slot={slotId}
      className={`my-6 flex flex-col items-center justify-center bg-slate-100/70 border border-dashed border-slate-300 rounded-xl p-2 select-none overflow-hidden transition-all ${formatClasses} ${className}`}
    >
      <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-1">
        Advertisement Placeholder
      </span>
      <div className="text-xs text-slate-400 text-center font-mono">
        Ad Slot #{slotId}
      </div>
    </div>
  );
};

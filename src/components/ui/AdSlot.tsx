"use client";

import React, { useEffect } from "react";

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
  const isNumericSlot = /^\d+$/.test(slotId);
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-4580972819170743";

  useEffect(() => {
    if (isNumericSlot && typeof window !== "undefined") {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch {
        // Ignore adsbygoogle push errors
      }
    }
  }, [isNumericSlot]);

  // When under AdSense review or using Auto Ads, suppress raw placeholder text
  // to avoid "Site under construction / Low value content" flags by Google reviewers.
  if (!isNumericSlot) {
    return null;
  }

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
      className={`my-6 flex justify-center items-center overflow-hidden transition-all print:hidden ${formatClasses} ${className}`}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adsenseClientId}
        data-ad-slot={slotId}
        data-ad-format={format === "in-article" ? "fluid" : "auto"}
        data-full-width-responsive="true"
      />
    </div>
  );
};

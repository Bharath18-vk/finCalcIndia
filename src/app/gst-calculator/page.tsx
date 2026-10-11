import React from "react";
import type { Metadata } from "next";
import { gstEngine } from "@/lib/calculators/gst";
import { GstCalculatorView } from "@/components/calculators/GstCalculatorView";

export const metadata: Metadata = {
  title: "GST Calculator India - Add or Remove GST Online (Inclusive & Exclusive)",
  description:
    "Free online GST calculator for India. Calculate CGST, SGST, and IGST for 5%, 12%, 18%, and 28% slabs. Supports forward addition and reverse GST extraction.",
  alternates: {
    canonical: "/gst-calculator",
  },
  openGraph: {
    title: "GST Calculator India - Accurate CGST, SGST & IGST Slabs",
    description:
      "Calculate Goods and Services Tax in India: add GST to base price or reverse calculate pre-tax amounts with CGST, SGST, and IGST breakdowns.",
    url: "https://fincalcindia.in/gst-calculator",
    type: "website",
  },
};

export default function GstCalculatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: gstEngine.metadata.name,
    operatingSystem: "All",
    applicationCategory: "BusinessApplication",
    url: "https://fincalcindia.in/gst-calculator",
    description: gstEngine.metadata.shortDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    featureList: [
      "GST Exclusive calculation (add GST to net base)",
      "GST Inclusive calculation (reverse GST from gross MRP)",
      "Statutory slabs: 0%, 5%, 12%, 18%, 28%",
      "Equal intra-state split (CGST + SGST)",
      "Inter-state single levy (IGST)",
      "Multi-unit bulk quantity billing",
      "Itemized tax invoice table",
      "Shareable URL calculation links",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GstCalculatorView />
    </>
  );
}

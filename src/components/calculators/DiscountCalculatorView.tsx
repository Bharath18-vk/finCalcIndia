"use client";

import React, { useMemo } from "react";
import { GenericCalculatorView } from "@/components/calculators/GenericCalculatorView";
import { discountEngine, DiscountInput, DiscountResult } from "@/lib/calculators/discount";
import { BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { RelatedLink } from "@/components/ui/RelatedCalculators";

export interface DiscountCalculatorViewProps {
  breadcrumbs?: BreadcrumbItem[];
  relatedLinks?: RelatedLink[];
}

export const DiscountCalculatorView: React.FC<DiscountCalculatorViewProps> = ({
  breadcrumbs,
  relatedLinks,
}) => {
  const defaultBreadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Math & Everyday", href: "/math" },
      { label: "Discount Calculator", href: "/discount-calculator" },
    ],
    []
  );

  const defaultRelatedLinks: RelatedLink[] = useMemo(
    () => [
      {
        title: "Percentage Calculator",
        description: "Calculate percentage changes, increases, and proportions quickly.",
        href: "/percentage-calculator",
        badge: "Math",
      },
      {
        title: "Simple Interest Calculator",
        description: "Calculate standard simple interest yields and maturity returns.",
        href: "/simple-interest-calculator",
        badge: "Interest",
      },
      {
        title: "Salary Calculator",
        description: "Calculate monthly in-hand take-home salary after deductions.",
        href: "/salary-calculator",
        badge: "Income",
      },
    ],
    []
  );

  return (
    <GenericCalculatorView<DiscountInput, DiscountResult>
      engine={discountEngine}
      breadcrumbs={breadcrumbs || defaultBreadcrumbs}
      relatedLinks={relatedLinks || defaultRelatedLinks}
    />
  );
};

"use client";

import React, { useMemo } from "react";
import { GenericCalculatorView } from "@/components/calculators/GenericCalculatorView";
import { simpleInterestEngine, SimpleInterestInput, SimpleInterestResult } from "@/lib/calculators/simple-interest";
import { BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { RelatedLink } from "@/components/ui/RelatedCalculators";

export interface SimpleInterestCalculatorViewProps {
  breadcrumbs?: BreadcrumbItem[];
  relatedLinks?: RelatedLink[];
}

export const SimpleInterestCalculatorView: React.FC<SimpleInterestCalculatorViewProps> = ({
  breadcrumbs,
  relatedLinks,
}) => {
  const defaultBreadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Math & Everyday", href: "/math" },
      { label: "Simple Interest Calculator", href: "/simple-interest-calculator" },
    ],
    []
  );

  const defaultRelatedLinks: RelatedLink[] = useMemo(
    () => [
      {
        title: "Compound Interest Calculator",
        description: "Compare simple interest returns with compounding growth.",
        href: "/compound-interest-calculator",
        badge: "Compounding",
      },
      {
        title: "FD Calculator",
        description: "Calculate official RBI quarterly compounding fixed deposit maturity.",
        href: "/fd-calculator",
        badge: "Bank Deposit",
      },
      {
        title: "Percentage Calculator",
        description: "Quickly calculate percentages, discounts, and increases.",
        href: "/percentage-calculator",
        badge: "Math",
      },
    ],
    []
  );

  return (
    <GenericCalculatorView<SimpleInterestInput, SimpleInterestResult>
      engine={simpleInterestEngine}
      breadcrumbs={breadcrumbs || defaultBreadcrumbs}
      relatedLinks={relatedLinks || defaultRelatedLinks}
    />
  );
};

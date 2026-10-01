import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLongtailPage, getLiveLongtailPages } from "@/data/longtail-pages";
import { computeLongtailContent } from "@/lib/longtail-content";
import { EMICalculatorView } from "@/components/calculators/EMICalculatorView";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const livePages = getLiveLongtailPages().filter(
    (p) => p.calculator === "personal-loan-emi"
  );
  return livePages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getLongtailPage("personal-loan-emi", slug);
  if (!page) return {};

  const url = `https://fincalcindia.com${page.baseRoute}/${page.slug}`;

  return {
    title: page.title,
    description: page.metaDescription,
    alternates: {
      canonical: `${page.baseRoute}/${page.slug}`,
    },
    openGraph: {
      title: page.title,
      description: page.metaDescription,
      url,
    },
  };
}

export default async function PersonalLoanLongtailPage({ params }: Props) {
  const { slug } = await params;
  const page = getLongtailPage("personal-loan-emi", slug);
  if (!page) {
    notFound();
  }

  const computed = computeLongtailContent(page);
  const rate = page.params.rate || 11.0;

  const relatedLinks = page.relatedSlugs.map((rPath) => {
    if (rPath.includes("/personal-loan-emi-calculator")) {
      return {
        title: "Personal Loan EMI Calculator",
        description: "Explore custom amounts and tenures.",
        href: rPath,
        badge: "Parent Calculator",
      };
    }
    const matchingPage = getLiveLongtailPages().find(
      (p) => `${p.baseRoute}/${p.slug}` === rPath
    );
    return {
      title: matchingPage?.h1 || "Related Scenario",
      description: matchingPage?.metaDescription || "Alternative loan scenario.",
      href: rPath,
    };
  });

  return (
    <EMICalculatorView
      calculatorType="personal-loan-emi"
      title={page.h1}
      badge="Personal Loan Scenario"
      description={`${page.metaDescription} ${computed.disclosedRateNote}`}
      initialPrincipal={page.params.amount}
      initialAnnualRate={rate}
      initialTenureYears={page.params.tenureYears}
      benchmarkNote={`Illustrative Benchmark: ${rate}%`}
      breadcrumbs={[
        { label: "Loans", href: "/loans" },
        { label: "Personal Loan EMI", href: "/personal-loan-emi-calculator" },
        { label: page.h1, href: `${page.baseRoute}/${page.slug}` },
      ]}
      faqs={computed.faqs}
      relatedLinks={relatedLinks}
      customExplainerText={computed.analysisParagraphs.join("\n\n")}
    />
  );
}

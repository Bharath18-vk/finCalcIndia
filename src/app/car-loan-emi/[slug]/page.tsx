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
    (p) => p.calculator === "car-loan-emi"
  );
  return livePages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getLongtailPage("car-loan-emi", slug);
  if (!page) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fincalcindia.in";
  const url = `${siteUrl}${page.baseRoute}/${page.slug}`;

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

export default async function CarLoanLongtailPage({ params }: Props) {
  const { slug } = await params;
  const page = getLongtailPage("car-loan-emi", slug);
  if (!page) {
    notFound();
  }

  const computed = computeLongtailContent(page);
  const rate = page.params.rate || 8.85;

  const relatedLinks = page.relatedSlugs.map((rPath) => {
    if (rPath.includes("/car-loan-emi-calculator")) {
      return {
        title: "Car Loan EMI Calculator",
        description: "Explore custom vehicle loan terms.",
        href: rPath,
        badge: "Parent Calculator",
      };
    }
    const matchingPage = getLiveLongtailPages().find(
      (p) => `${p.baseRoute}/${p.slug}` === rPath
    );
    return {
      title: matchingPage?.h1 || "Related Scenario",
      description: matchingPage?.metaDescription || "Alternative auto financing scenario.",
      href: rPath,
    };
  });

  return (
    <EMICalculatorView
      calculatorType="car-loan-emi"
      title={page.h1}
      badge="Auto Loan Scenario"
      description={`${page.metaDescription} ${computed.disclosedRateNote}`}
      initialPrincipal={page.params.amount}
      initialAnnualRate={rate}
      initialTenureYears={page.params.tenureYears}
      benchmarkNote={`Auto Benchmark: ${rate}%`}
      breadcrumbs={[
        { label: "Loans", href: "/loans" },
        { label: "Car Loan EMI", href: "/car-loan-emi-calculator" },
        { label: page.h1, href: `${page.baseRoute}/${page.slug}` },
      ]}
      faqs={computed.faqs}
      relatedLinks={relatedLinks}
      customExplainerText={computed.analysisParagraphs.join("\n\n")}
    />
  );
}

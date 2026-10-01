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
    (p) => p.calculator === "home-loan-emi"
  );
  return livePages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getLongtailPage("home-loan-emi", slug);
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

export default async function HomeLoanLongtailPage({ params }: Props) {
  const { slug } = await params;
  const page = getLongtailPage("home-loan-emi", slug);
  if (!page) {
    notFound();
  }

  const computed = computeLongtailContent(page);
  const rate = page.params.rate || 8.5;

  const relatedLinks = page.relatedSlugs.map((rPath) => {
    if (rPath.includes("/home-loan-emi-calculator")) {
      return {
        title: "Home Loan EMI Calculator",
        description: "Explore custom loan amounts and tenures.",
        href: rPath,
        badge: "Parent Calculator",
      };
    }
    const matchingPage = getLiveLongtailPages().find(
      (p) => `${p.baseRoute}/${p.slug}` === rPath
    );
    return {
      title: matchingPage?.h1 || "Related Scenario",
      description: matchingPage?.metaDescription || "Alternative mortgage scenario.",
      href: rPath,
    };
  });

  return (
    <EMICalculatorView
      calculatorType="home-loan-emi"
      title={page.h1}
      badge="Home Loan Scenario"
      description={`${page.metaDescription} ${computed.disclosedRateNote}`}
      initialPrincipal={page.params.amount}
      initialAnnualRate={rate}
      initialTenureYears={page.params.tenureYears}
      benchmarkNote={`EBLR Benchmark: ${rate}%`}
      breadcrumbs={[
        { label: "Loans", href: "/loans" },
        { label: "Home Loan EMI", href: "/home-loan-emi-calculator" },
        { label: page.h1, href: `${page.baseRoute}/${page.slug}` },
      ]}
      faqs={computed.faqs}
      relatedLinks={relatedLinks}
      customExplainerText={computed.analysisParagraphs.join("\n\n")}
    />
  );
}

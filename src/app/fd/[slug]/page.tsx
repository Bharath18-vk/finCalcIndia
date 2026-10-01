import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLongtailPage, getLiveLongtailPages } from "@/data/longtail-pages";
import { computeLongtailContent } from "@/lib/longtail-content";
import { FDCalculatorView } from "@/components/calculators/FDCalculatorView";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const livePages = getLiveLongtailPages().filter(
    (p) => p.calculator === "fd"
  );
  return livePages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getLongtailPage("fd", slug);
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

export default async function FDLongtailPage({ params }: Props) {
  const { slug } = await params;
  const page = getLongtailPage("fd", slug);
  if (!page) {
    notFound();
  }

  const computed = computeLongtailContent(page);
  const rate = page.params.rate || 6.8;

  const relatedLinks = page.relatedSlugs.map((rPath) => {
    if (rPath.includes("/fd-calculator")) {
      return {
        title: "FD Calculator",
        description: "Calculate custom fixed deposits.",
        href: rPath,
        badge: "Parent Calculator",
      };
    }
    const matchingPage = getLiveLongtailPages().find(
      (p) => `${p.baseRoute}/${p.slug}` === rPath
    );
    return {
      title: matchingPage?.h1 || "Related Scenario",
      description: matchingPage?.metaDescription || "Alternative savings scenario.",
      href: rPath,
    };
  });

  return (
    <FDCalculatorView
      title={page.h1}
      badge="Fixed Deposit Scenario"
      description={`${page.metaDescription} ${computed.disclosedRateNote}`}
      initialPrincipal={page.params.amount}
      initialAnnualRate={rate}
      initialTenureYears={page.params.tenureYears}
      benchmarkNote={`Bank Benchmark: ${rate}%`}
      breadcrumbs={[
        { label: "Savings", href: "/savings" },
        { label: "FD Calculator", href: "/fd-calculator" },
        { label: page.h1, href: `${page.baseRoute}/${page.slug}` },
      ]}
      faqs={computed.faqs}
      relatedLinks={relatedLinks}
      customExplainerText={computed.analysisParagraphs.join("\n\n")}
    />
  );
}

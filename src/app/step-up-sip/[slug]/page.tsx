import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLongtailPage, getLiveLongtailPages } from "@/data/longtail-pages";
import { computeLongtailContent } from "@/lib/longtail-content";
import { StepUpSIPCalculatorView } from "@/components/calculators/StepUpSIPCalculatorView";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const livePages = getLiveLongtailPages().filter(
    (p) => p.calculator === "step-up-sip"
  );
  return livePages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getLongtailPage("step-up-sip", slug);
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

export default async function StepUpSIPLongtailPage({ params }: Props) {
  const { slug } = await params;
  const page = getLongtailPage("step-up-sip", slug);
  if (!page) {
    notFound();
  }

  const computed = computeLongtailContent(page);
  const rate = page.params.rate || 12.0;
  const stepUp = page.params.stepUpPercentage || 10;

  const relatedLinks = page.relatedSlugs.map((rPath) => {
    if (rPath.includes("/step-up-sip-calculator")) {
      return {
        title: "Step-Up SIP Calculator",
        description: "Test customizable annual increments.",
        href: rPath,
        badge: "Parent Calculator",
      };
    }
    const matchingPage = getLiveLongtailPages().find(
      (p) => `${p.baseRoute}/${p.slug}` === rPath
    );
    return {
      title: matchingPage?.h1 || "Related Scenario",
      description: matchingPage?.metaDescription || "Alternative investment scenario.",
      href: rPath,
    };
  });

  return (
    <StepUpSIPCalculatorView
      title={page.h1}
      badge="Top-Up SIP Scenario"
      description={`${page.metaDescription} ${computed.disclosedRateNote}`}
      initialMonthlyInvestment={page.params.amount}
      initialAnnualRate={rate}
      initialTenureYears={page.params.tenureYears}
      initialStepUpPercentage={stepUp}
      breadcrumbs={[
        { label: "Investments", href: "/investments" },
        { label: "Step-Up SIP", href: "/step-up-sip-calculator" },
        { label: page.h1, href: `${page.baseRoute}/${page.slug}` },
      ]}
      faqs={computed.faqs}
      relatedLinks={relatedLinks}
      customExplainerText={computed.analysisParagraphs.join("\n\n")}
    />
  );
}

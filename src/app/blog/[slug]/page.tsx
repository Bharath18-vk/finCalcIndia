import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS, getBlogPostBySlug } from "@/data/blog-posts";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FAQSection } from "@/components/ui/FAQSection";
import { AdSlot } from "@/components/ui/AdSlot";
import { Clock, Calendar, User, Calculator, ArrowRight } from "lucide-react";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Guide Not Found | FinCalc India",
    };
  }

  return {
    title: `${post.title} | FinCalc India`,
    description: post.metaDescription,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Article JSON-LD Schema
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fincalcindia.in";
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    author: {
      "@type": "Organization",
      name: post.author,
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "FinCalc India",
      url: siteUrl,
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${post.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Breadcrumbs
          items={[
            { label: "Guides", href: "/blog" },
            { label: post.title, href: `/blog/${post.slug}` },
          ]}
        />

        {/* Article Header */}
        <header className="space-y-4 border-b border-slate-200 pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {post.category} Guide
            </span>
            <span className="flex items-center text-xs text-slate-500 gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readTimeMinutes} min read
            </span>
            <span className="flex items-center text-xs text-slate-500 gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Updated {post.updatedAt}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center text-xs text-slate-600 gap-2">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Authored by {post.author}</span>
          </div>
        </header>

        {/* Interactive Tool Banner */}
        <aside className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-blue-800 text-white rounded-lg">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">
                Interactive Calculation Tool
              </span>
              <p className="text-sm font-semibold text-slate-800">
                Model your numbers directly in the {post.relatedCalculatorName}
              </p>
            </div>
          </div>
          <Link
            href={post.relatedCalculatorUrl}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap"
          >
            Open Calculator <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </aside>

        {/* Executive Summary */}
        <div className="p-4 bg-slate-50 border-l-4 border-blue-800 rounded-r-lg text-sm text-slate-700 leading-relaxed font-medium">
          {post.summary}
        </div>

        {/* Table of Contents */}
        <nav aria-label="Table of contents" className="p-5 bg-white border border-slate-200 rounded-xl space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            In This Guide
          </h2>
          <ul className="space-y-1.5 text-sm">
            {post.tableOfContents.map((item, idx) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="text-blue-800 hover:text-blue-900 hover:underline flex items-center gap-2"
                >
                  <span className="text-xs text-slate-400 font-mono">{idx + 1}.</span>
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <AdSlot slotId="blog-intro-ad" format="in-article" />

        {/* Main Content Sections */}
        <div className="space-y-8">
          {post.sections.map((section) => (
            <section key={section.id} id={section.id} className="space-y-3 scroll-mt-20">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {section.title}
              </h2>
              {section.paragraphs.map((p, pIdx) => (
                <p key={pIdx} className="text-sm sm:text-base text-slate-700 leading-relaxed">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        <AdSlot slotId="blog-content-ad" format="in-article" />

        {/* FAQs */}
        {post.faqs.length > 0 && (
          <section className="pt-4 border-t border-slate-200">
            <FAQSection faqs={post.faqs} />
          </section>
        )}

        {/* Final Call to Action */}
        <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-4 text-center">
          <h3 className="text-lg font-bold">Calculate Your Personal Numbers</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Use our free, client-side calculator to run exact projections for your loan, savings, or investment amount.
          </p>
          <Link
            href={post.relatedCalculatorUrl}
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-lg transition-colors"
          >
            Launch {post.relatedCalculatorName} <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>
      </article>
    </>
  );
}

import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { BLOG_POSTS } from "@/data/blog-posts";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { BookOpen, Clock, ArrowRight, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Financial Guides & Calculators | FinCalc India",
  description:
    "Authoritative, practical guides to Indian personal finance. Learn the mathematics of home loan prepayments, PPF vs SIP wealth creation, SWP retirement planning, and banking interest calculations.",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogHubPage() {
  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Breadcrumbs items={[{ label: "Guides & Articles", href: "/blog" }]} />

      <header className="space-y-3 max-w-3xl">
        <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
          Knowledge Base
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Financial Guides & Mathematical Insights
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          In-depth, mathematical guides designed to help Indian borrowers, savers, and investors optimize loan amortization, compounding returns, and tax-efficient wealth accumulation.
        </p>
      </header>

      {/* Guides Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BLOG_POSTS.map((post) => (
          <div
            key={post.slug}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                  {post.category}
                </span>
                <span className="flex items-center text-xs text-slate-500 gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readTimeMinutes} min read
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-800 transition-colors leading-snug">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>

              <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                {post.summary}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Tool: {post.relatedCalculatorName}
              </span>
              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center text-xs font-semibold text-blue-800 hover:text-blue-900 group-hover:translate-x-0.5 transition-transform"
              >
                Read Guide <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
        ))}
      </section>

      {/* Editorial Standards Note */}
      <footer className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-600">
        <div className="flex items-center gap-2 font-semibold text-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Editorial Independence & Accuracy
        </div>
        <p>
          All guides on FinCalc India are developed by our internal financial research team. Calculations strictly follow Reserve Bank of India (RBI), Indian Banks&apos; Association (IBA), and Ministry of Finance regulatory directives. We do not provide personalized financial or investment advice.
        </p>
      </footer>
    </article>
  );
}

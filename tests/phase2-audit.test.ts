import { describe, it, expect } from "vitest";
import { SITE_ROUTES, getRouteByPath } from "@/data/site-map";
import { KEYWORD_MAP } from "@/data/keyword-map";
import { BENCHMARK_RATES } from "@/data/rates/benchmarks";
import { BLOG_POSTS, getBlogPostBySlug } from "@/data/blog-posts";

describe("Phase 2 Final Audit - Calculators, Blog Framework & SEO Semantics", () => {
  const phase2CalculatorPaths = [
    "/rd-calculator",
    "/ppf-calculator",
    "/cagr-calculator",
    "/compound-interest-calculator",
    "/loan-prepayment-calculator",
    "/loan-eligibility-calculator",
    "/swp-calculator",
    "/amortization-calculator",
  ];

  const phase2GuideSlugs = [
    "home-loan-prepayment-guide",
    "how-rd-interest-calculated",
    "ppf-vs-mutual-fund-sip",
    "how-swp-works",
    "cagr-vs-xirr-vs-absolute-return",
  ];

  describe("Audit 1: Phase 2 Calculator Routes Presence & Metadata", () => {
    for (const path of phase2CalculatorPaths) {
      it(`verifies route registration and metadata for ${path}`, () => {
        const route = getRouteByPath(path);
        expect(route, `Missing route for ${path}`).toBeDefined();
        expect(route?.status).toBe("live");
        expect(route?.category).toBe("core-calculator");
        expect(route?.title.length).toBeGreaterThan(15);
        expect(route?.primaryKeyword.length).toBeGreaterThan(3);

        // Verify keyword entry
        const kwEntry = Object.values(KEYWORD_MAP).find(
          (k) => k.targetUrl === path || k.keyword === route?.primaryKeyword
        );
        expect(kwEntry, `Missing keyword entry for ${path}`).toBeDefined();
        expect(kwEntry?.status).toBe("quality-approved");
        expect(kwEntry?.searchDemandStatus).toBe("unvalidated");
        expect(kwEntry?.qualityReviewStatus).toBe("quality-approved");
      });
    }
  });

  describe("Audit 2: Blog Framework & 5 Core Financial Guides", () => {
    it("verifies the blog hub route exists and is live", () => {
      const blogHub = getRouteByPath("/blog");
      expect(blogHub).toBeDefined();
      expect(blogHub?.status).toBe("live");
      expect(blogHub?.category).toBe("hub");
    });

    it("verifies exactly 5 comprehensive guides exist in BLOG_POSTS", () => {
      expect(BLOG_POSTS.length).toBe(5);
    });

    for (const slug of phase2GuideSlugs) {
      it(`verifies content integrity for guide: ${slug}`, () => {
        const post = getBlogPostBySlug(slug);
        expect(post, `Missing post for slug: ${slug}`).toBeDefined();
        expect(post?.title.length).toBeGreaterThan(20);
        expect(post?.metaDescription.length).toBeGreaterThan(50);
        expect(post?.summary.length).toBeGreaterThan(50);
        expect(post?.author).toBeDefined();
        expect(post?.readTimeMinutes).toBeGreaterThan(3);
        expect(post?.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(post?.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);

        // Table of contents and sections
        expect(post?.tableOfContents.length).toBeGreaterThanOrEqual(3);
        expect(post?.sections.length).toBeGreaterThanOrEqual(3);
        expect(post?.sections.length).toBe(post?.tableOfContents.length);

        // Interactive tool link
        expect(post?.relatedCalculatorUrl.startsWith("/")).toBe(true);
        expect(post?.relatedCalculatorName.length).toBeGreaterThan(3);

        // FAQs
        expect(post?.faqs.length).toBeGreaterThanOrEqual(2);
        for (const faq of post!.faqs) {
          expect(faq.question.length).toBeGreaterThan(10);
          expect(faq.answer.length).toBeGreaterThan(20);
        }

        // Verify route in SITE_ROUTES
        const guideRoute = getRouteByPath(`/blog/${slug}`);
        expect(guideRoute, `Missing site route for /blog/${slug}`).toBeDefined();
        expect(guideRoute?.category).toBe("guide");
        expect(guideRoute?.status).toBe("live");
      });
    }
  });

  describe("Audit 3: Benchmark Rates for Phase 2", () => {
    it("verifies recurringDeposit benchmark configuration", () => {
      const rd = BENCHMARK_RATES.recurringDeposit;
      expect(rd).toBeDefined();
      expect(rd.rateClassification).toBe("illustrative-assumption");
      expect(rd.defaultRate).toBeGreaterThan(0);
      expect(rd.sourceUrl).toMatch(/^https?:\/\//);
      expect(rd.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("verifies swpReturn benchmark configuration", () => {
      const swp = BENCHMARK_RATES.swpReturn;
      expect(swp).toBeDefined();
      expect(swp.rateClassification).toBe("illustrative-assumption");
      expect(swp.defaultRate).toBeGreaterThan(0);
      expect(swp.sourceUrl).toMatch(/^https?:\/\//);
      expect(swp.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("verifies ppf benchmark configuration is externally sourced", () => {
      const ppf = BENCHMARK_RATES.ppf;
      expect(ppf).toBeDefined();
      expect(ppf.rateClassification).toBe("externally-sourced");
      expect(ppf.sourceName).toContain("Ministry of Finance");
      expect(ppf.defaultRate).toBe(7.1);
    });
  });
});

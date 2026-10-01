import { describe, it, expect } from "vitest";
import { SITE_ROUTES, getLiveRoutes } from "@/data/site-map";
import { KEYWORD_MAP } from "@/data/keyword-map";
import { BENCHMARK_RATES } from "@/data/rates/benchmarks";
import { LONGTAIL_PAGES, getLiveLongtailPages } from "@/data/longtail-pages";
import { computeLongtailContent } from "@/lib/longtail-content";

describe("SEO, URL Architecture & Rate Validation Standards", () => {
  it("ensures all live routes have a quality-approved primary keyword with distinct search demand tracking", () => {
    const liveRoutes = getLiveRoutes();
    expect(liveRoutes.length).toBeGreaterThan(0);

    for (const route of liveRoutes) {
      const keywordEntry = Object.values(KEYWORD_MAP).find(
        (k) => k.targetUrl === route.path || k.keyword === route.primaryKeyword
      );

      if (keywordEntry) {
        expect(
          keywordEntry.status,
          `Route ${route.path} has keyword "${route.primaryKeyword}" with status "${keywordEntry.status}", but live routes require "quality-approved"`
        ).toBe("quality-approved");

        // Verify technical quality approval is never conflated with unverified search demand data
        expect(keywordEntry.searchDemandStatus).toBe("unvalidated");
      }
    }
  });

  it("verifies no duplicate paths exist across SITE_ROUTES", () => {
    const paths = SITE_ROUTES.map((r) => r.path);
    const uniquePaths = new Set(paths);
    expect(paths.length).toBe(uniquePaths.size);
  });

  it("ensures every path starts with / and has no trailing slash", () => {
    for (const route of SITE_ROUTES) {
      expect(route.path.startsWith("/")).toBe(true);
      if (route.path !== "/") {
        expect(route.path.endsWith("/")).toBe(false);
      }
    }
  });

  it("verifies rate benchmarks have mandatory compliance metadata", () => {
    const benchmarks = Object.values(BENCHMARK_RATES);
    expect(benchmarks.length).toBeGreaterThan(0);

    for (const bm of benchmarks) {
      expect(bm.defaultRate).toBeGreaterThan(0);
      expect(bm.sourceName).toBeDefined();
      expect(bm.sourceName.length).toBeGreaterThan(0);
      expect(bm.sourceUrl.startsWith("http")).toBe(true);
      expect(bm.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(bm.effectiveFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(bm.notes.length).toBeGreaterThan(10);
    }
  });

  it("ensures Phase 1 long-tail page whitelist adheres to cap (max 30 pages)", () => {
    const livePages = getLiveLongtailPages();
    expect(livePages.length).toBeGreaterThan(0);
    expect(livePages.length).toBeLessThanOrEqual(30);
  });

  it("ensures every longtail page computes direct answers, valid paragraphs, and specific FAQs", () => {
    for (const page of LONGTAIL_PAGES) {
      const content = computeLongtailContent(page);

      // Direct answer within first 100 words
      expect(content.directAnswer).toBeDefined();
      expect(content.directAnswer.length).toBeGreaterThan(20);
      const wordCount = content.directAnswer.split(/\s+/).length;
      expect(wordCount).toBeLessThanOrEqual(100);

      // 2-3 analysis paragraphs
      expect(content.analysisParagraphs.length).toBeGreaterThanOrEqual(2);
      expect(content.analysisParagraphs.length).toBeLessThanOrEqual(4);

      // 4-5 specific FAQs
      expect(content.faqs.length).toBeGreaterThanOrEqual(4);
      expect(content.faqs.length).toBeLessThanOrEqual(5);

      // Disclosed rate note
      expect(content.disclosedRateNote).toBeDefined();
      expect(content.disclosedRateNote.length).toBeGreaterThan(10);
    }
  });

  it("verifies that all 8 core calculators are live in SITE_ROUTES", () => {
    const corePaths = [
      "/emi-calculator",
      "/home-loan-emi-calculator",
      "/personal-loan-emi-calculator",
      "/car-loan-emi-calculator",
      "/sip-calculator",
      "/step-up-sip-calculator",
      "/lumpsum-calculator",
      "/fd-calculator",
    ];

    for (const cp of corePaths) {
      const found = SITE_ROUTES.find((r) => r.path === cp && r.status === "live");
      expect(found, `Expected core calculator ${cp} to be live`).toBeDefined();
    }
  });
});

import { describe, it, expect } from "vitest";
import { LONGTAIL_PAGES, getLongtailPage } from "@/data/longtail-pages";
import { KEYWORD_MAP } from "@/data/keyword-map";
import { SITE_ROUTES, getRouteByPath } from "@/data/site-map";
import { BENCHMARK_RATES } from "@/data/rates/benchmarks";
import { computeLongtailContent } from "@/lib/longtail-content";

describe("Phase 1 Final Audit - Rendered Pages & SEO Integrity", () => {
  const auditTargetPaths = [
    "/emi-calculator",
    "/home-loan-emi-calculator",
    "/personal-loan-emi-calculator",
    "/sip-calculator",
    "/fd-calculator",
    "/personal-loan-emi/5-lakh-3-years",
    "/sip/5000-per-month-10-years",
  ];

  describe("Audit 1: Rate & Benchmark Architecture Integrity", () => {
    it("strictly separates externally-sourced rates from illustrative assumptions", () => {
      const homeLoan = BENCHMARK_RATES.homeLoan;
      expect(homeLoan.rateClassification).toBe("externally-sourced");
      expect(homeLoan.sourceName).toContain("State Bank of India");
      expect(homeLoan.sourceUrl).toContain("sbi.co.in");

      const ppf = BENCHMARK_RATES.ppf;
      expect(ppf.rateClassification).toBe("externally-sourced");
      expect(ppf.sourceName).toContain("Ministry of Finance");

      const sip = BENCHMARK_RATES.sipReturn;
      expect(sip.rateClassification).toBe("illustrative-assumption");
      // Must not falsely claim to be an AMFI rate
      expect(sip.sourceName).not.toContain("AMFI");
      expect(sip.notes).toContain("illustrative annual return assumption");

      const fd = BENCHMARK_RATES.fixedDeposit;
      expect(fd.rateClassification).toBe("illustrative-assumption");
      expect(fd.notes).toContain("Compounded quarterly");
    });

    it("verifies all benchmark configurations contain complete audit fields", () => {
      for (const [key, bm] of Object.entries(BENCHMARK_RATES)) {
        expect(bm.id, `Missing id for ${key}`).toBeDefined();
        expect(bm.value, `Missing value for ${key}`).toBeGreaterThan(0);
        expect(bm.defaultRate, `Missing defaultRate for ${key}`).toBeGreaterThan(0);
        expect(bm.effectiveFrom, `Missing effectiveFrom for ${key}`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(bm.sourceName, `Missing sourceName for ${key}`).toBeDefined();
        expect(bm.sourceUrl, `Missing sourceUrl for ${key}`).toMatch(/^https?:\/\//);
        expect(bm.verifiedAt, `Missing verifiedAt for ${key}`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(bm.notes, `Missing notes for ${key}`).toBeDefined();
        expect(bm.rateClassification, `Missing classification for ${key}`).toMatch(
          /^(externally-sourced|illustrative-assumption)$/
        );
      }
    });
  });

  describe("Audit 2: Target Audited Routes Presence & Metadata", () => {
    for (const targetPath of auditTargetPaths) {
      it(`verifies route configuration for ${targetPath}`, () => {
        const route = getRouteByPath(targetPath);
        expect(route, `Target path ${targetPath} not found in SITE_ROUTES`).toBeDefined();
        expect(route?.status).toBe("live");
        expect(route?.title.length).toBeGreaterThan(10);
        expect(route?.primaryKeyword.length).toBeGreaterThan(3);

        // Verify keyword is quality-approved in KEYWORD_MAP and distinct from search demand data
        const kwEntry = Object.values(KEYWORD_MAP).find(
          (k) => k.targetUrl === targetPath || k.keyword === route?.primaryKeyword
        );
        expect(kwEntry, `Keyword entry missing for ${targetPath}`).toBeDefined();
        expect(kwEntry?.status).toBe("quality-approved");
        expect(kwEntry?.searchDemandStatus).toBe("unvalidated");
      });
    }
  });

  describe("Audit 3: Long-Tail Pages Duplication & Quality Gate", () => {
    it("ensures exactly 14 live long-tail pages exist (capped at 30)", () => {
      expect(LONGTAIL_PAGES.length).toBe(14);
      const live = LONGTAIL_PAGES.filter((p) => p.status === "live");
      expect(live.length).toBe(14);
    });

    it("verifies no two long-tail pages share the same primary keyword or slug", () => {
      const keywords = LONGTAIL_PAGES.map((p) => p.primaryKeyword.toLowerCase().trim());
      const uniqueKeywords = new Set(keywords);
      expect(keywords.length).toBe(uniqueKeywords.size);

      const fullUrls = LONGTAIL_PAGES.map((p) => `${p.baseRoute}/${p.slug}`);
      const uniqueUrls = new Set(fullUrls);
      expect(fullUrls.length).toBe(uniqueUrls.size);
    });

    it("verifies all 14 long-tail pages have unique titles and meta descriptions", () => {
      const titles = LONGTAIL_PAGES.map((p) => p.title.trim());
      const uniqueTitles = new Set(titles);
      expect(titles.length).toBe(uniqueTitles.size);

      const metas = LONGTAIL_PAGES.map((p) => p.metaDescription.trim());
      const uniqueMetas = new Set(metas);
      expect(metas.length).toBe(uniqueMetas.size);
    });

    it("verifies all 14 long-tail pages generate distinct computed content", () => {
      const directAnswers = new Set<string>();

      for (const page of LONGTAIL_PAGES) {
        const content = computeLongtailContent(page);

        // Direct answer uniqueness
        expect(directAnswers.has(content.directAnswer)).toBe(false);
        directAnswers.add(content.directAnswer);

        // Word count under 100 words
        const words = content.directAnswer.split(/\s+/).length;
        expect(words).toBeLessThanOrEqual(100);

        // 4-5 specific FAQs
        expect(content.faqs.length).toBeGreaterThanOrEqual(4);
        expect(content.faqs.length).toBeLessThanOrEqual(5);

        // Distinct question texts
        const questions = content.faqs.map((f) => f.question);
        const uniqueQ = new Set(questions);
        expect(questions.length).toBe(uniqueQ.size);
      }
    });

    it("verifies illustrative rate disclosure convention on loan longtail pages", () => {
      const loanLongtails = LONGTAIL_PAGES.filter(
        (p) =>
          p.calculator === "personal-loan-emi" ||
          p.calculator === "home-loan-emi" ||
          p.calculator === "car-loan-emi"
      );

      for (const p of loanLongtails) {
        const content = computeLongtailContent(p);
        expect(content.disclosedRateNote).toContain("illustrative");
        expect(content.disclosedRateNote).toContain("annual interest rate");
      }
    });
  });

  describe("Audit 4: Structured Data & Schema Accuracy", () => {
    it("ensures each longtail page FAQs produce valid schema entities without null values", () => {
      for (const page of LONGTAIL_PAGES) {
        const content = computeLongtailContent(page);
        for (const faq of content.faqs) {
          expect(faq.question.length).toBeGreaterThan(5);
          expect(faq.answer.length).toBeGreaterThan(15);
          expect(faq.question).not.toContain("undefined");
          expect(faq.answer).not.toContain("undefined");
          expect(faq.question).not.toContain("NaN");
          expect(faq.answer).not.toContain("NaN");
        }
      }
    });
  });
});

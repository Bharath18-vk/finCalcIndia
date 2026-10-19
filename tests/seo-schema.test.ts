import { describe, it, expect } from "vitest";
import {
  generateWebsiteGraph,
  generateSoftwareSchema,
  generateCollectionSchema,
  getCanonicalUrl,
} from "@/lib/seo/schema";

describe("SEO Schema Structured Data Generators", () => {
  describe("getCanonicalUrl", () => {
    it("converts relative paths to canonical URLs", () => {
      expect(getCanonicalUrl("/sip-calculator")).toBe(
        "https://fincalcindia.in/sip-calculator"
      );
      expect(getCanonicalUrl("sip-calculator")).toBe(
        "https://fincalcindia.in/sip-calculator"
      );
    });

    it("preserves already fully-qualified absolute URLs", () => {
      expect(getCanonicalUrl("https://fincalcindia.in/fd-calculator")).toBe(
        "https://fincalcindia.in/fd-calculator"
      );
    });

    it("strips trailing slashes from pathnames except root", () => {
      expect(getCanonicalUrl("/loans/")).toBe("https://fincalcindia.in/loans");
      expect(getCanonicalUrl("https://fincalcindia.in/loans/")).toBe(
        "https://fincalcindia.in/loans"
      );
    });
  });

  describe("generateWebsiteGraph", () => {
    it("generates a valid schema.org @graph with Organization and WebSite", () => {
      const graph = generateWebsiteGraph();

      expect(graph["@context"]).toBe("https://schema.org");
      expect(Array.isArray(graph["@graph"])).toBe(true);
      expect(graph["@graph"].length).toBe(2);

      const org = graph["@graph"].find(
        (entry) => entry["@type"] === "Organization"
      );
      expect(org).toBeDefined();
      expect(org?.name).toBe("FinCalc India");
      expect(org?.url).toBe("https://fincalcindia.in");
      expect((org?.logo as any)?.url).toContain("logo.png");

      const site = graph["@graph"].find(
        (entry) => entry["@type"] === "WebSite"
      );
      expect(site).toBeDefined();
      expect(site?.name).toBe("FinCalc India");
      expect(site?.inLanguage).toBe("en-IN");
      expect(site?.publisher).toEqual({
        "@id": "https://fincalcindia.in/#organization",
      });

      // Verify serialization produces valid JSON without undefined
      const serialized = JSON.stringify(graph);
      expect(serialized).not.toContain("undefined");
      const parsed = JSON.parse(serialized);
      expect(parsed).toEqual(graph);
    });
  });

  describe("generateSoftwareSchema", () => {
    it("generates Google-compliant SoftwareApplication / WebApplication schema", () => {
      const schema = generateSoftwareSchema({
        name: "SIP Calculator - Systematic Investment Planning",
        description: "Calculate mutual fund compound growth.",
        url: "/sip-calculator",
        featureList: [
          "Monthly compounding engine",
          "Interactive slider controls",
        ],
      });

      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toEqual([
        "SoftwareApplication",
        "WebApplication",
      ]);
      expect(schema.name).toBe(
        "SIP Calculator - Systematic Investment Planning"
      );
      expect(schema.url).toBe("https://fincalcindia.in/sip-calculator");
      expect(schema.operatingSystem).toBe("All");
      expect(schema.browserRequirements).toBe(
        "Requires JavaScript. Requires HTML5."
      );
      expect(schema.applicationCategory).toBe("FinanceApplication");
      expect(schema.inLanguage).toBe("en-IN");
      expect(schema.offers).toEqual({
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
      });
      expect(schema.author).toEqual({
        "@type": "Organization",
        name: "FinCalc India",
        url: "https://fincalcindia.in",
        logo: "https://fincalcindia.in/logo.png",
      });
      expect(schema.featureList).toHaveLength(2);
      expect(schema.featureList).toContain("Monthly compounding engine");

      // Verify JSON serialization
      const jsonStr = JSON.stringify(schema);
      expect(jsonStr).not.toContain("undefined");
      expect(JSON.parse(jsonStr)).toEqual(schema);
    });

    it("falls back to default featureList when not provided", () => {
      const schema = generateSoftwareSchema({
        name: "Generic Calculator",
        description: "Test description.",
        url: "/test-calc",
      });

      expect(schema.featureList).toBeDefined();
      expect(schema.featureList.length).toBeGreaterThanOrEqual(3);
      expect(schema.featureList).toContain(
        "100% Client-side mathematical computation"
      );
    });
  });

  describe("generateCollectionSchema", () => {
    it("generates valid CollectionPage schema with ItemList for category hubs", () => {
      const collection = generateCollectionSchema({
        title: "Loan & EMI Calculators India",
        description: "All loan calculators suite.",
        url: "/loans",
        items: [
          {
            name: "Home Loan EMI Calculator",
            description: "Mortgage planning.",
            url: "/home-loan-emi-calculator",
          },
          {
            name: "Car Loan EMI Calculator",
            description: "Auto financing.",
            url: "/car-loan-emi-calculator",
          },
        ],
      });

      expect(collection["@context"]).toBe("https://schema.org");
      expect(collection["@type"]).toBe("CollectionPage");
      expect(collection.name).toBe("Loan & EMI Calculators India");
      expect(collection.url).toBe("https://fincalcindia.in/loans");
      expect(collection.mainEntity["@type"]).toBe("ItemList");
      expect(collection.mainEntity.numberOfItems).toBe(2);
      expect(collection.mainEntity.itemListElement).toHaveLength(2);

      const firstItem = collection.mainEntity.itemListElement[0];
      expect(firstItem.position).toBe(1);
      expect(firstItem.name).toBe("Home Loan EMI Calculator");
      expect(firstItem.url).toBe(
        "https://fincalcindia.in/home-loan-emi-calculator"
      );
      expect(firstItem.description).toBe("Mortgage planning.");

      const secondItem = collection.mainEntity.itemListElement[1];
      expect(secondItem.position).toBe(2);
      expect(secondItem.name).toBe("Car Loan EMI Calculator");
      expect(secondItem.url).toBe(
        "https://fincalcindia.in/car-loan-emi-calculator"
      );

      // Verify JSON round-trip
      const serialized = JSON.stringify(collection);
      expect(serialized).not.toContain("undefined");
      expect(JSON.parse(serialized)).toEqual(collection);
    });
  });
});

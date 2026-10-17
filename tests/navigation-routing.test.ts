import { describe, it, expect } from "vitest";
import { SITE_ROUTES, getRouteByPath } from "@/data/site-map";

// The links defined in HeaderNav
const HEADER_NAV_LINKS = [
  { href: "/loans", label: "Loans" },
  { href: "/investments", label: "Investments" },
  { href: "/savings", label: "Savings" },
  { href: "/income-tax-calculator", label: "Tax & Salary" },
  { href: "/math", label: "Math & Stats" },
  { href: "/blog", label: "Guides" },
];

const MOBILE_DRAWER_FEATURED_LINKS = [
  { href: "/fire-calculator", label: "FIRE Early Retirement Calculator" },
  { href: "/emi-calculator", label: "Loan EMI Calculator" },
];

describe("HeaderNav and Routing Integrity Suite", () => {
  it("ensures every desktop HeaderNav link points to a live registered route", () => {
    for (const link of HEADER_NAV_LINKS) {
      const route = getRouteByPath(link.href);
      expect(
        route,
        `HeaderNav link "${link.label}" (${link.href}) must exist in SITE_ROUTES`
      ).toBeDefined();
      expect(route?.status).toBe("live");
    }
  });

  it("ensures every mobile drawer featured link points to a live registered route", () => {
    for (const link of MOBILE_DRAWER_FEATURED_LINKS) {
      const route = getRouteByPath(link.href);
      expect(
        route,
        `Mobile drawer link "${link.label}" (${link.href}) must exist in SITE_ROUTES`
      ).toBeDefined();
      expect(route?.status).toBe("live");
    }
  });

  it("verifies that major category hub routes exist and are categorized properly", () => {
    const hubRoutes = ["/loans", "/investments", "/savings", "/math"];
    for (const path of hubRoutes) {
      const route = getRouteByPath(path);
      expect(route, `Hub route ${path} must exist`).toBeDefined();
      expect(route?.status).toBe("live");
      expect(route?.title.length).toBeGreaterThan(0);
      expect(route?.category).toBe("hub");
    }
  });

  it("verifies all core calculators belong to a valid category", () => {
    const coreCalculators = SITE_ROUTES.filter((r) => r.category === "core-calculator");
    expect(coreCalculators.length).toBeGreaterThanOrEqual(30);

    for (const calc of coreCalculators) {
      expect(calc.path.startsWith("/")).toBe(true);
      expect(calc.title).toBeDefined();
      expect(calc.primaryKeyword).toBeDefined();
      expect(calc.priority).toBeGreaterThanOrEqual(0.7);
    }
  });
});

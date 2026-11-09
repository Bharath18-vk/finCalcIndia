import { MetadataRoute } from "next";
import { getLiveRoutes } from "@/data/site-map";

/**
 * High-Quality Sitemap Generator
 * Filters out programmatic scenario pages and off-topic health tools to ensure
 * Google's review crawler only indexes authoritative, unique financial calculators and guides.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fincalcindia.in";
  const liveRoutes = getLiveRoutes().filter(
    (route) =>
      !route.category.startsWith("longtail") &&
      route.path !== "/calorie-calculator" &&
      route.path !== "/bmi-calculator"
  );

  return liveRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFreq,
    priority: route.priority,
  }));
}

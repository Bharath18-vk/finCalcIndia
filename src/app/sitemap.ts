import { MetadataRoute } from "next";
import { getLiveRoutes } from "@/data/site-map";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fincalcindia.in";
  const liveRoutes = getLiveRoutes();

  return liveRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFreq,
    priority: route.priority,
  }));
}

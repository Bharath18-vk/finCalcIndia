import { MetadataRoute } from "next";
import { getLiveRoutes } from "@/data/site-map";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://fincalcindia.com";
  const liveRoutes = getLiveRoutes();

  return liveRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFreq,
    priority: route.priority,
  }));
}

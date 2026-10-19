/**
 * FinCalc India — Unified Schema.org Structured Data Generator
 *
 * Conforms strictly to Google Search Central Rich Snippets & Structured Data guidelines:
 * - SoftwareApplication / WebApplication (Calculators)
 * - FAQPage (Structured Q&A)
 * - BreadcrumbList (Hierarchy navigation)
 * - CollectionPage / ItemList (Hub listings)
 * - WebSite & Organization (Global entity graph)
 */

export interface SoftwareSchemaOptions {
  name: string;
  url: string;
  description: string;
  applicationCategory?:
    | "FinanceApplication"
    | "EducationalApplication"
    | "HealthApplication"
    | "UtilityApplication"
    | "BusinessApplication";
  featureList?: string[];
  softwareVersion?: string;
  screenshot?: string;
}

export interface CollectionItem {
  name: string;
  url: string;
  description?: string;
}

export interface CollectionSchemaOptions {
  title: string;
  description: string;
  url: string;
  items: CollectionItem[];
}

const DEFAULT_SITE_URL = "https://fincalcindia.in";

export function getCanonicalUrl(pathOrUrl: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
  let fullUrl = pathOrUrl;
  if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
    const cleanPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
    fullUrl = `${siteUrl}${cleanPath}`;
  }

  try {
    const parsed = new URL(fullUrl);
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith("/")) {
      parsed.pathname = parsed.pathname.replace(/\/+$/, "");
    }
    return parsed.toString();
  } catch {
    // Fallback if URL constructor fails
    return fullUrl.replace(/\/+$/, "");
  }
}

/**
 * Generates Root WebSite and Organization entity graph for site-wide authority
 */
export function generateWebsiteGraph() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "FinCalc India",
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/logo.png`,
          width: 512,
          height: 512,
        },
        description:
          "Official, verified Indian financial and mathematical calculations suite conforming to RBI, CBDT, and ICMR standards.",
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "FinCalc India",
        alternateName: ["FinCalc", "FinCalcIndia", "FinCalc India Calculators"],
        description:
          "Clear, fast, and mathematically precise financial and math calculators for Indian salaried professionals, investors, and students.",
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
        inLanguage: "en-IN",
      },
    ],
  };
}

/**
 * Generates Google-compliant SoftwareApplication / WebApplication structured data
 */
export function generateSoftwareSchema(options: SoftwareSchemaOptions) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
  const canonicalUrl = getCanonicalUrl(options.url);

  return {
    "@context": "https://schema.org",
    "@type": ["SoftwareApplication", "WebApplication"],
    name: options.name,
    url: canonicalUrl,
    description: options.description,
    applicationCategory: options.applicationCategory || "FinanceApplication",
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    softwareVersion: options.softwareVersion || "2026.1",
    inLanguage: "en-IN",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    author: {
      "@type": "Organization",
      name: "FinCalc India",
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
    },
    publisher: {
      "@type": "Organization",
      name: "FinCalc India",
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
    },
    ...(options.screenshot ? { screenshot: options.screenshot } : {}),
    ...(options.featureList && options.featureList.length > 0
      ? { featureList: options.featureList }
      : {
          featureList: [
            "100% Client-side mathematical computation",
            "Indian currency formatting in Lakhs and Crores",
            "Instant URL calculation sharing",
            "Printable and PDF-ready financial summary",
          ],
        }),
  };
}

/**
 * Generates CollectionPage & ItemList structured data for category hub pages
 */
export function generateCollectionSchema(options: CollectionSchemaOptions) {
  const canonicalUrl = getCanonicalUrl(options.url);

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: options.title,
    description: options.description,
    url: canonicalUrl,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: options.items.length,
      itemListElement: options.items.map((item, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: item.name,
        url: getCanonicalUrl(item.url),
        ...(item.description ? { description: item.description } : {}),
      })),
    },
  };
}

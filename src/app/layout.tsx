import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Image from "next/image";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { HeaderNav } from "@/components/layout/HeaderNav";
import { generateWebsiteGraph } from "@/lib/seo/schema";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
});


const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-4580972819170743";

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://fincalcindia.in"),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  title: {
    default: "FinCalc India - Fast, Accurate Indian Financial Calculators",
    template: "%s | FinCalc India",
  },
  description:
    "Free, fast, and mathematically accurate Indian financial calculators for Loans (EMI, Home, Personal, Car), Investments (SIP, Step-Up SIP, Lumpsum), and Fixed Deposits.",
  applicationName: "FinCalc India",
  authors: [{ name: "FinCalc India Research & Engineering Team" }],
  keywords: [
    "financial calculator india",
    "emi calculator",
    "sip calculator",
    "home loan emi calculator",
    "fd calculator india",
    "personal loan emi calculator",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://fincalcindia.in",
    siteName: "FinCalc India",
    title: "FinCalc India - Fast, Accurate Indian Financial Calculators",
    description:
      "Accurate Indian financial calculators with full amortization schedules, sensitivity tables, and Indian rupee formatting.",
    images: [
      {
        url: "/images/logo.png",
        width: 1024,
        height: 1024,
        alt: "FinCalc India - Indian Financial Calculators",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "google-adsense-account": ADSENSE_CLIENT_ID,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const websiteGraph = generateWebsiteGraph();

  return (
    <html lang="en" className={`h-full antialiased ${plusJakarta.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* Google AdSense Verification & Auto Ads Script */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
        />
        {gaMeasurementId && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            />
            <script
              id="google-analytics"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaMeasurementId}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteGraph) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-200 selection:text-emerald-950 font-sans">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-extrabold text-lg sm:text-xl text-slate-900 hover:opacity-90 transition-opacity"
            >
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-xs border border-slate-200/90 bg-white shrink-0 flex items-center justify-center p-0.5">
                <Image
                  src="/logo.png"
                  alt="FinCalc India Logo"
                  width={34}
                  height={34}
                  className="w-full h-full object-contain rounded-lg"
                  priority
                />
              </div>
              <span className="tracking-tight">
                FinCalc<span className="text-emerald-600">India</span>
              </span>
            </Link>

            <HeaderNav />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1">{children}</main>

        {/* Global Footer */}
        <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/90 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              <div className="space-y-3 sm:col-span-2 md:col-span-3 lg:col-span-1">
                <div className="flex items-center gap-2.5 font-bold text-white text-base">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/10 p-0.5 border border-slate-700 shrink-0 flex items-center justify-center">
                    <Image
                      src="/logo.png"
                      alt="FinCalc India"
                      width={28}
                      height={28}
                      className="w-full h-full object-contain rounded-sm"
                    />
                  </div>
                  <span>FinCalc India</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  FinCalc India provides clear, fast, and mathematically accurate financial calculators formatted specifically for the Indian banking and tax ecosystem.
                </p>
                <div className="pt-2 text-[11px] text-slate-400 space-y-1 border-t border-slate-900">
                  <p>📍 Koramangala, Bengaluru, Karnataka, India</p>
                  <p>⚖️ Verified against RBI, CBDT & EPFO guidelines</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
                  Loan Calculators
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link href="/emi-calculator" className="hover:text-emerald-400 transition-colors">
                      EMI Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/home-loan-emi-calculator" className="hover:text-emerald-400 transition-colors">
                      Home Loan EMI
                    </Link>
                  </li>
                  <li>
                    <Link href="/loan-prepayment-calculator" className="hover:text-emerald-400 transition-colors">
                      Prepayment Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/loan-eligibility-calculator" className="hover:text-emerald-400 transition-colors">
                      Eligibility Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/amortization-calculator" className="hover:text-emerald-400 transition-colors">
                      Amortization Schedule
                    </Link>
                  </li>
                  <li>
                    <Link href="/personal-loan-emi-calculator" className="hover:text-emerald-400 transition-colors">
                      Personal Loan EMI
                    </Link>
                  </li>
                  <li>
                    <Link href="/car-loan-emi-calculator" className="hover:text-emerald-400 transition-colors">
                      Car Loan EMI
                    </Link>
                  </li>
                  <li>
                    <Link href="/loan-comparison-calculator" className="hover:text-emerald-400 transition-colors font-medium text-emerald-400">
                      Loan Comparison
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
                  Investments & Wealth
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link href="/sip-calculator" className="hover:text-emerald-400 transition-colors">
                      SIP Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/step-up-sip-calculator" className="hover:text-emerald-400 transition-colors">
                      Step-Up SIP Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/swp-calculator" className="hover:text-emerald-400 transition-colors">
                      SWP Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/step-up-swp-calculator" className="hover:text-emerald-400 transition-colors font-medium text-emerald-400">
                      Step-Up SWP
                    </Link>
                  </li>
                  <li>
                    <Link href="/lumpsum-calculator" className="hover:text-emerald-400 transition-colors">
                      Lumpsum Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/fire-calculator" className="hover:text-emerald-400 transition-colors font-medium text-emerald-400">
                      FIRE Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/cagr-calculator" className="hover:text-emerald-400 transition-colors">
                      CAGR Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/portfolio-rebalance-calculator" className="hover:text-emerald-400 transition-colors font-medium text-emerald-400">
                      Portfolio Rebalancing
                    </Link>
                  </li>
                  <li>
                    <Link href="/fd-calculator" className="hover:text-emerald-400 transition-colors">
                      Fixed Deposit (FD)
                    </Link>
                  </li>
                  <li>
                    <Link href="/rd-calculator" className="hover:text-emerald-400 transition-colors">
                      Recurring Deposit (RD)
                    </Link>
                  </li>
                  <li>
                    <Link href="/ppf-calculator" className="hover:text-emerald-400 transition-colors">
                      PPF Calculator
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
                  Tax, Salary & Govt
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link href="/income-tax-calculator" className="hover:text-emerald-400 transition-colors">
                      Income Tax (New vs Old)
                    </Link>
                  </li>
                  <li>
                    <Link href="/salary-calculator" className="hover:text-emerald-400 transition-colors">
                      Salary (CTC to In-Hand)
                    </Link>
                  </li>
                  <li>
                    <Link href="/capital-gains-tax-calculator" className="hover:text-emerald-400 transition-colors font-medium text-emerald-400">
                      Capital Gains Tax (Budget 2024)
                    </Link>
                  </li>
                  <li>
                    <Link href="/hra-calculator" className="hover:text-emerald-400 transition-colors">
                      HRA Exemption (Rule 2A)
                    </Link>
                  </li>
                  <li>
                    <Link href="/epf-calculator" className="hover:text-emerald-400 transition-colors">
                      EPF Calculator (8.25%)
                    </Link>
                  </li>
                  <li>
                    <Link href="/nps-calculator" className="hover:text-emerald-400 transition-colors">
                      NPS Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/nps-vs-epf-calculator" className="hover:text-emerald-400 transition-colors font-medium text-emerald-400">
                      NPS vs EPF Comparison
                    </Link>
                  </li>
                  <li>
                    <Link href="/gratuity-calculator" className="hover:text-emerald-400 transition-colors">
                      Gratuity Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/ssy-calculator" className="hover:text-emerald-400 transition-colors font-medium text-emerald-400">
                      Sukanya Samriddhi (SSY)
                    </Link>
                  </li>
                  <li>
                    <Link href="/scss-calculator" className="hover:text-emerald-400 transition-colors font-medium text-emerald-400">
                      Senior Citizens (SCSS)
                    </Link>
                  </li>
                  <li>
                    <Link href="/gst-calculator" className="hover:text-emerald-400 transition-colors font-medium text-emerald-400">
                      GST Calculator (CBIC)
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
                  Financial Guides
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link href="/blog" className="hover:text-blue-400 transition-colors font-semibold text-blue-400">
                      All Financial Guides (13) →
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog/home-loan-prepayment-guide" className="hover:text-emerald-400 transition-colors">
                      Home Loan Prepayment Guide
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog/ppf-vs-mutual-fund-sip" className="hover:text-emerald-400 transition-colors">
                      PPF vs Mutual Fund SIP
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog/new-vs-old-tax-regime-guide" className="hover:text-emerald-400 transition-colors">
                      New vs Old Tax Regime Guide
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog/how-swp-works" className="hover:text-emerald-400 transition-colors">
                      SWP Retirement Pension Guide
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog/cagr-vs-xirr-vs-absolute-return" className="hover:text-emerald-400 transition-colors">
                      CAGR vs XIRR Returns
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog/step-up-sip-1-crore-wealth-blueprint" className="hover:text-emerald-400 transition-colors">
                      Step-Up SIP 1 Crore Blueprint
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog/how-rd-interest-calculated" className="hover:text-emerald-400 transition-colors">
                      Bank RD Calculation Formula
                    </Link>
                  </li>
                  <li>
                    <Link href="/percentage-calculator" className="hover:text-emerald-400 transition-colors">
                      Percentage Calculator
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
                  Trust & Governance
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link href="/about" className="hover:text-emerald-400 transition-colors font-semibold text-emerald-400">
                      About Us & Team
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-emerald-400 transition-colors">
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
                      Privacy & Cookie Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-emerald-400 transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/disclaimer" className="hover:text-emerald-400 transition-colors">
                      Disclaimer & Assumptions
                    </Link>
                  </li>
                  <li className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    Client-side calculations. Zero lead forms.
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-400 space-y-2">
              <p>
                © {new Date().getFullYear()} FinCalc India. All calculations are illustrative and based on user assumptions.
              </p>
              <p className="text-[11px] text-slate-400">
                Not affiliated with or endorsed by the Reserve Bank of India (RBI) or any commercial bank.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

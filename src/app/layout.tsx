import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { Calculator } from "lucide-react";

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://fincalcindia.in"),
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fincalcindia.in";
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "FinCalc India",
    url: siteUrl,
    applicationCategory: "FinanceApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    description:
      "Accurate Indian financial calculators for EMI, Home Loans, SIP, Step-Up SIP, and Fixed Deposits.",
  };

  return (
    <html lang="en" className="h-full antialiased">
      <head>
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
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
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                <Calculator className="w-5 h-5" />
              </div>
              <span className="tracking-tight">
                FinCalc<span className="text-emerald-600">India</span>
              </span>
            </Link>

              <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/loans"
                className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-700 hover:bg-slate-100/70 rounded-lg transition-colors"
              >
                Loans
              </Link>
              <Link
                href="/investments"
                className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-700 hover:bg-slate-100/70 rounded-lg transition-colors"
              >
                Investments
              </Link>
              <Link
                href="/savings"
                className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-700 hover:bg-slate-100/70 rounded-lg transition-colors"
              >
                Savings
              </Link>
              <Link
                href="/income-tax-calculator"
                className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-700 hover:bg-slate-100/70 rounded-lg transition-colors"
              >
                Tax & Salary
              </Link>
              <Link
                href="/blog"
                className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-700 hover:bg-slate-100/70 rounded-lg transition-colors"
              >
                Guides
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1">{children}</main>

        {/* Global Footer */}
        <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
              <div className="space-y-3 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 font-bold text-white text-base">
                  <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center text-white text-xs">
                    ₹
                  </div>
                  <span>FinCalc India</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  FinCalc India provides clear, fast, and independent financial calculators formatted specifically for the Indian currency system.
                </p>
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
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
                  Investments & Savings
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
                    <Link href="/lumpsum-calculator" className="hover:text-emerald-400 transition-colors">
                      Lumpsum Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/cagr-calculator" className="hover:text-emerald-400 transition-colors">
                      CAGR Calculator
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
                  <li>
                    <Link href="/compound-interest-calculator" className="hover:text-emerald-400 transition-colors">
                      Compound Interest
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
                  Tax, Salary & Retirement
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
                    <Link href="/hra-calculator" className="hover:text-emerald-400 transition-colors">
                      HRA Exemption (Rule 2A)
                    </Link>
                  </li>
                  <li>
                    <Link href="/gratuity-calculator" className="hover:text-emerald-400 transition-colors">
                      Gratuity Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/nps-calculator" className="hover:text-emerald-400 transition-colors">
                      NPS Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/epf-calculator" className="hover:text-emerald-400 transition-colors">
                      EPF Calculator (8.25%)
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
                  Guides & Legal
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link href="/blog" className="hover:text-emerald-400 transition-colors font-medium">
                      All Financial Guides
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
                    <Link href="/blog/how-rd-interest-calculated" className="hover:text-emerald-400 transition-colors">
                      How RD Interest is Calculated
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="hover:text-emerald-400 transition-colors">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-emerald-400 transition-colors">
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-emerald-400 transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/disclaimer" className="hover:text-emerald-400 transition-colors">
                      Disclaimer
                    </Link>
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

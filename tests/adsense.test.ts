import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Google AdSense Verification & Compliance Standards", () => {
  const rootDir = process.cwd();

  it("verifies public/ads.txt exists and contains valid AdSense credentials", () => {
    const adsTxtPath = path.join(rootDir, "public", "ads.txt");
    expect(fs.existsSync(adsTxtPath), "public/ads.txt must exist").toBe(true);

    const content = fs.readFileSync(adsTxtPath, "utf-8").trim();
    expect(content).toContain("google.com, pub-4580972819170743, DIRECT, f08c47fec0942fa0");
  });

  it("verifies src/app/layout.tsx embeds the Google AdSense script tag", () => {
    const layoutPath = path.join(rootDir, "src", "app", "layout.tsx");
    const content = fs.readFileSync(layoutPath, "utf-8");

    // Must include the AdSense script URL with ca-pub-4580972819170743
    expect(content).toContain("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js");
    expect(content).toContain("ca-pub-4580972819170743");
    expect(content).toContain('crossOrigin="anonymous"');
  });

  it("verifies src/app/layout.tsx contains the google-adsense-account meta tag", () => {
    const layoutPath = path.join(rootDir, "src", "app", "layout.tsx");
    const content = fs.readFileSync(layoutPath, "utf-8");

    expect(content).toContain('"google-adsense-account"');
  });

  it("verifies .env and .env.example contain NEXT_PUBLIC_ADSENSE_CLIENT_ID", () => {
    const envPath = path.join(rootDir, ".env");
    const envExamplePath = path.join(rootDir, ".env.example");

    const envContent = fs.readFileSync(envPath, "utf-8");
    expect(envContent).toContain("NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-4580972819170743");

    const envExampleContent = fs.readFileSync(envExamplePath, "utf-8");
    expect(envExampleContent).toContain("NEXT_PUBLIC_ADSENSE_CLIENT_ID=");
  });

  it("verifies robots.txt permits search engines and AdSense crawlers", () => {
    const robotsPath = path.join(rootDir, "src", "app", "robots.ts");
    const content = fs.readFileSync(robotsPath, "utf-8");

    expect(content).toContain('allow: "/"');
  });
});

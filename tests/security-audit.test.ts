import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Production Security & Code Hygiene Audit", () => {
  const rootDir = process.cwd();

  it("ensures ads.txt exists and matches Google AdSense IAB requirements", () => {
    const adsTxtPath = path.join(rootDir, "public", "ads.txt");
    expect(fs.existsSync(adsTxtPath), "public/ads.txt must exist").toBe(true);

    const content = fs.readFileSync(adsTxtPath, "utf-8").trim();
    // IAB specification format: google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
    expect(content).toContain("google.com");
    expect(content).toContain("pub-4580972819170743");
    expect(content).toContain("DIRECT");
    expect(content).toContain("f08c47fec0942fa0");
  });

  it("ensures robots.txt allows search engine crawlers and points to sitemap", () => {
    const robotsPath = path.join(rootDir, "src", "app", "robots.ts");
    expect(fs.existsSync(robotsPath), "src/app/robots.ts must exist").toBe(true);

    const content = fs.readFileSync(robotsPath, "utf-8");
    expect(content).not.toContain("Disallow: '/'");
    expect(content).toContain("sitemap.xml");
  });

  it("ensures sitemap.ts generates canonical absolute URLs for fincalcindia.in", () => {
    const sitemapPath = path.join(rootDir, "src", "app", "sitemap.ts");
    expect(fs.existsSync(sitemapPath), "src/app/sitemap.ts must exist").toBe(true);

    const content = fs.readFileSync(sitemapPath, "utf-8");
    expect(content).toContain("https://fincalcindia.in");
  });

  it("verifies no dangerous eval(), new Function(), or document.write() calls exist in src/", () => {
    function scanDir(dir: string): string[] {
      const results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          results.push(...scanDir(fullPath));
        } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
          results.push(fullPath);
        }
      }
      return results;
    }

    const srcFiles = scanDir(path.join(rootDir, "src"));
    const dangerousPatterns = [
      /\beval\s*\(/,
      /\bnew\s+Function\s*\(/,
      /document\.write\s*\(/,
    ];

    for (const filePath of srcFiles) {
      const code = fs.readFileSync(filePath, "utf-8");
      for (const pattern of dangerousPatterns) {
        expect(
          pattern.test(code),
          `Dangerous pattern ${pattern} found in ${path.relative(rootDir, filePath)}`
        ).toBe(false);
      }
    }
  });

  it("verifies no hardcoded private keys or backend database credentials exist in client code", () => {
    function scanDir(dir: string): string[] {
      const results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          results.push(...scanDir(fullPath));
        } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
          results.push(fullPath);
        }
      }
      return results;
    }

    const srcFiles = scanDir(path.join(rootDir, "src"));
    const secretPatterns = [
      /BEGIN RSA PRIVATE KEY/,
      /BEGIN OPENSSH PRIVATE KEY/,
      /mongodb\+srv:\/\//,
      /postgres:\/\/[^:]+:[^@]+@/,
    ];

    for (const filePath of srcFiles) {
      const code = fs.readFileSync(filePath, "utf-8");
      for (const pattern of secretPatterns) {
        expect(
          pattern.test(code),
          `Leaked credential pattern ${pattern} in ${path.relative(rootDir, filePath)}`
        ).toBe(false);
      }
    }
  });
});

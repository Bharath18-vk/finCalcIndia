"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Landmark, TrendingUp, PiggyBank, ReceiptText, Calculator, BookOpen } from "lucide-react";

const NAV_LINKS = [
  { href: "/loans", label: "Loans", icon: Landmark },
  { href: "/investments", label: "Investments", icon: TrendingUp },
  { href: "/savings", label: "Savings", icon: PiggyBank },
  { href: "/income-tax-calculator", label: "Tax & Salary", icon: ReceiptText },
  { href: "/math", label: "Math & Stats", icon: Calculator },
  { href: "/blog", label: "Guides", icon: BookOpen },
];

export const HeaderNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu whenever route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-1 lg:gap-1.5" aria-label="Main Navigation">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-all ${
                isActive
                  ? "text-emerald-800 bg-emerald-50/90 border border-emerald-200/80 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile Hamburger Toggle Button */}
      <div className="flex md:hidden items-center">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Toggle navigation menu"
          className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        >
          {isOpen ? <X className="w-6 h-6 text-slate-900" /> : <Menu className="w-6 h-6 text-slate-900" />}
        </button>
      </div>

      {/* Mobile Full-Screen Overlay & Drawer */}
      {isOpen && (
        <div className="fixed inset-0 top-16 z-50 md:hidden bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in">
          <div className="w-full bg-white border-b border-slate-200 shadow-xl px-5 py-6 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">
              Calculator Categories
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {NAV_LINKS.map((link) => {
                const IconComponent = link.icon;
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80"
                        : "text-slate-800 hover:bg-slate-100 border border-transparent"
                    }`}
                  >
                    <IconComponent className={`w-5 h-5 ${isActive ? "text-emerald-600" : "text-slate-500"}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/fire-calculator"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 transition-colors"
              >
                FIRE Early Retirement Calculator
              </Link>
              <Link
                href="/emi-calculator"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
              >
                Loan EMI Calculator
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

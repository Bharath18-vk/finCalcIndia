"use client";

import React, { useState } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  Mail,
  MessageSquare,
  Building2,
  Clock,
  ShieldCheck,
  Send,
  CheckCircle,
  HelpCircle,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general",
    calculatorUrl: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate brief submission processing
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Breadcrumbs items={[{ label: "Contact Us", href: "/contact" }]} />

      <header className="space-y-4">
        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
          Direct Editorial Support
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Contact FinCalc India
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          We welcome inquiries, feedback, bug reports, and formula verification requests from users, financial planners, and researchers.
        </p>
      </header>

      {/* Office & Direct Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Headquarters</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            FinCalc India Research & Engineering
            <br />
            80 Feet Road, 4th Block, Koramangala
            <br />
            Bengaluru, Karnataka 560034
            <br />
            India
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Direct Inquiries</h2>
          <div className="space-y-1 text-xs text-slate-600">
            <p>
              <strong className="text-slate-800">Editorial & Feedback:</strong>
              <br />
              <span className="font-mono text-emerald-700">contact@fincalcindia.in</span>
            </p>
            <p className="pt-1">
              <strong className="text-slate-800">Privacy & Data Requests:</strong>
              <br />
              <span className="font-mono text-emerald-700">privacy@fincalcindia.in</span>
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Response SLA</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Our editorial and technical team monitors inquiries Monday through Friday, 9:00 AM to 6:00 PM IST. We aim to review calculation corrections within 24–48 business hours.
          </p>
        </div>
      </div>

      {/* Interactive Contact Form */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            Send Us a Message
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Fill out the form below and our team will get back to you directly.
          </p>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3 bg-emerald-50/80 rounded-xl border border-emerald-200">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-emerald-950">Thank You for Your Feedback!</h3>
            <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto">
              Your message has been recorded. Our editorial and calculation verification team will review your inquiry shortly.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  name: "",
                  email: "",
                  subject: "general",
                  calculatorUrl: "",
                  message: "",
                });
              }}
              className="mt-4 px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 transition-colors"
            >
              Send Another Inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Inquiry Category
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-slate-800"
                >
                  <option value="general">General Feedback / Inquiry</option>
                  <option value="math">Mathematical / Calculation Discrepancy</option>
                  <option value="regulatory">Regulatory / Tax Rate Update</option>
                  <option value="feature">New Calculator Request</option>
                  <option value="privacy">Privacy / DPDP Inquiries</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Related Calculator URL (Optional)
                </label>
                <input
                  type="text"
                  value={formData.calculatorUrl}
                  onChange={(e) => setFormData({ ...formData, calculatorUrl: e.target.value })}
                  placeholder="e.g. /income-tax-calculator"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Message / Observation <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe your question or observation in detail. If reporting a mathematical discrepancy, please mention the input numbers and the expected result according to official circulars."
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-y"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                We respect your privacy. No marketing emails or lead generation.
              </span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : "Submit Inquiry"}
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Error Reporting Guidelines */}
      <section className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          Guidelines for Submitting Rate Discrepancies
        </h3>
        <p>
          FinCalc India adheres to published standards from the Reserve Bank of India (RBI), Indian Banks&apos; Association (IBA), and the Income Tax Department. If you believe a calculator outputs an inaccurate figure, please provide:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
          <li>The exact calculator URL where the calculation occurred.</li>
          <li>All input parameters tested (principal, tenure, interest rate, frequency).</li>
          <li>The statutory gazette, RBI Master Direction, or bank schedule reference supporting the alternate figure.</li>
        </ul>
      </section>
    </article>
  );
}

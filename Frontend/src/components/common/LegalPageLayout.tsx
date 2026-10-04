"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Lock, FileText, Cookie, Activity } from "lucide-react";
import BrandLogo from "@/components/common/BrandLogo";

interface LegalPageLayoutProps {
  title: string;
  subtitle: string;
  badge: string;
  lastUpdated?: string;
  iconType?: "shield" | "lock" | "file" | "cookie";
  children: React.ReactNode;
}

export function LegalPageLayout({
  title,
  subtitle,
  badge,
  lastUpdated = "September 1, 2026",
  iconType = "shield",
  children,
}: LegalPageLayoutProps) {
  const renderIcon = () => {
    switch (iconType) {
      case "lock":
        return <Lock size={12} className="text-[#006766]" />;
      case "file":
        return <FileText size={12} className="text-[#006766]" />;
      case "cookie":
        return <Cookie size={12} className="text-[#006766]" />;
      default:
        return <Shield size={12} className="text-[#006766]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F7F6] text-[#082827] font-sans selection:bg-[#006766] selection:text-white antialiased">
      {/* Minimal Header */}
      <header className="fixed top-0 inset-x-0 z-50 px-6 lg:px-12 h-20 flex items-center justify-between border-b border-[#DFEBE8] bg-white/85 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Link
            href="/home"
            className="flex items-center gap-2 text-[#5A7470] hover:text-[#082827] transition-colors p-2 -ml-2 rounded-xl hover:bg-[#F2F7F6]"
            aria-label="Back to Home Dashboard"
          >
            <ArrowLeft size={18} />
          </Link>
          <Link href="/home" className="flex items-center gap-2.5 group">
            <BrandLogo size="sm" showBadge={false} />
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#5A7470] hidden sm:inline-block border-l border-[#DFEBE8] pl-2.5 ml-1">
              Legal &amp; Compliance
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/predict"
            className="rounded-full px-4 py-2 text-xs font-mono uppercase tracking-wider text-[#006766] border border-[#006766]/20 bg-[#E6F7F4]/60 hover:bg-[#E6F7F4] transition-all hidden sm:inline-flex items-center gap-1.5 font-semibold"
          >
            <Activity size={12} className="text-[#00B489]" />
            Screening
          </Link>
          <Link
            href="/login"
            className="rounded-full px-5 py-2 bg-[#006766] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#0D4F46] transition-all shadow-xs"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-24 px-6 lg:px-12 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10.5px] font-mono font-semibold uppercase tracking-[0.2em] bg-[#E6F7F4] text-[#006766] border border-[#00B489]/30 mb-6 shadow-2xs">
            {renderIcon()}
            {badge}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#082827] mb-4 font-sans">
            {title}
          </h1>

          <p className="text-base sm:text-lg text-[#5A7470] font-normal leading-relaxed mb-6 max-w-2xl">
            {subtitle}
          </p>

          <div className="flex items-center gap-4 text-xs font-mono text-[#5A7470]/80 uppercase tracking-widest pb-8 border-b border-[#DFEBE8] mb-10">
            <span>Last Updated: {lastUpdated}</span>
            <span>•</span>
            <span>Document ID: QS-POL-2026</span>
          </div>

          {/* Legal Prose Content Card */}
          <div className="bg-white rounded-3xl border border-[#DFEBE8] p-7 sm:p-12 shadow-[0_10px_30px_-12px_rgba(0,103,102,0.06)] space-y-10 text-[#5A7470] text-[15px] leading-[1.8] font-normal">
            {children}
          </div>

          {/* Bottom Card */}
          <div className="mt-12 rounded-2xl border border-[#DFEBE8] bg-[#E6F7F4]/60 p-7 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#006766] font-bold mb-1">
                <Lock size={13} className="text-[#00B489]" />
                <span>Cryptographic Provenance</span>
              </div>
              <p className="text-xs text-[#5A7470] leading-relaxed max-w-lg">
                All QureSight diagnostic executions produce immutable, SHA-256 hashed provenance receipts linking the exact input tensor, VQC state, and gate ablation metrics.
              </p>
            </div>
            <Link
              href="/predict"
              className="shrink-0 px-6 py-2.5 rounded-full bg-[#006766] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#0D4F46] transition-all shadow-xs"
            >
              Diagnostic Studios
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Minimal Footer with Medical Disclaimer */}
      <footer className="border-t border-[#DFEBE8] bg-white py-8 px-6 lg:px-12 font-mono text-[10.5px] text-[#5A7470]">
        <div className="max-w-4xl mx-auto space-y-4">
          <p className="leading-relaxed text-[#5A7470] tracking-wider">
            <strong className="text-[#082827] font-semibold">INVESTIGATIONAL RESEARCH DISCLAIMER:</strong> This platform is a clinical research prototype. It is not intended for primary autonomous medical diagnosis or clinical classification without licensed medical professional oversight. Delivered &ldquo;AS IS&rdquo; for translational research protocols.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#DFEBE8] uppercase tracking-[0.2em]">
            <span>© 2026 QURESIGHT RESEARCH PLATFORM</span>
            <div className="flex items-center gap-6 font-semibold">
              <Link href="/terms" className="hover:text-[#006766] transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-[#006766] transition-colors">Privacy</Link>
              <Link href="/disclaimer" className="hover:text-[#006766] transition-colors">Disclaimer</Link>
              <Link href="/cookies" className="hover:text-[#006766] transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

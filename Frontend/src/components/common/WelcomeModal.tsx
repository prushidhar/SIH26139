"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Sparkles,
  Cpu,
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { AuthService } from "@/services/auth.service";
import { NotificationService } from "@/services/notification.service";

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("Investigator");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isNewReg = localStorage.getItem("quresight_is_new_registration");
      const dismissed = localStorage.getItem("quresight_welcome_modal_dismissed");
      const storedName = localStorage.getItem("quresight_user_name");
      const cached = AuthService.getCachedUser();

      let resolvedName = storedName || cached?.fullName || cached?.username || "";
      resolvedName = resolvedName.replace(/_/g, " ").trim();
      if (!resolvedName || resolvedName.toLowerCase() === "anonymous" || resolvedName === "") {
        resolvedName = "Doctor";
      }

      setUserName(resolvedName);

      // Show modal ONLY for newly registered accounts on their very 1st arrival
      if (isNewReg === "true" && !dismissed) {
        setIsOpen(true);
        NotificationService.createNotification({
          title: "Welcome to QureSight Workbench",
          category: "system",
          message: "Your quantum medical workspace is active and ready to use.",
          actionUrl: "/predict",
        }).catch(() => {});
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("quresight_is_new_registration");
      localStorage.setItem("quresight_welcome_modal_dismissed", "true");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-sans">
          {/* Backdrop Blur with Subtle Vignette */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-black/50 backdrop-blur-md transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-white border border-[#DFEBE8] rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
          >
            {/* Ambient Radial Accent */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#00B489]/10 rounded-full blur-3xl -mr-28 -mt-28 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#006766]/5 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none" />

            {/* Top Close Button */}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Close welcome message"
              title="Close"
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/80 hover:bg-[#F2F7F6] text-[#5A7470] hover:text-[#082827] border border-[#DFEBE8] flex items-center justify-center transition-all cursor-pointer z-20 group shadow-xs"
            >
              <X size={16} className="group-hover:rotate-90 transition-transform duration-200" />
            </button>

            {/* Header Banner */}
            <div className="p-6 sm:p-8 pb-5 border-b border-[#DFEBE8] bg-[#F8FBFA]/90 backdrop-blur-sm relative z-10">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="flex h-2 w-2 rounded-full bg-[#00B489] animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#006766] bg-[#E6F7F4] border border-[#00B489]/30 px-2 py-0.5 rounded-full font-bold">
                  Account Verified &bull; System Ready
                </span>
              </div>
              <h2 className="font-sans text-2xl sm:text-3xl font-bold text-[#082827] tracking-tight">
                Welcome to QureSight, {userName}
              </h2>
              <p className="text-xs sm:text-sm text-[#5A7470] mt-1.5 leading-relaxed max-w-xl">
                Your medical research workspace is active and ready to run quantum screenings and AI diagnostics.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="p-6 sm:p-8 space-y-4 overflow-y-auto relative z-10 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#5A7470] font-semibold">
                  Workspace Capabilities
                </span>
                <span className="text-[10px] font-mono text-[#006766] font-semibold bg-[#E6F7F4] px-2 py-0.5 rounded-full border border-[#00B489]/25">
                  Dual-Engine Core
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Feature 1 */}
                <Link
                  href="/predict"
                  onClick={handleDismiss}
                  className="p-4 rounded-2xl bg-[#FAFDFD] hover:bg-white border border-[#DFEBE8] hover:border-[#006766]/40 transition-all group flex flex-col justify-between shadow-2xs hover:shadow-md cursor-pointer"
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-[#E6F7F4] text-[#006766] border border-[#00B489]/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-2xs">
                      <Sparkles size={16} />
                    </div>
                    <h3 className="font-sans text-sm font-bold text-[#082827] group-hover:text-[#006766] transition-colors">
                      Clinical Predictor
                    </h3>
                    <p className="text-[11px] text-[#5A7470] mt-1 leading-relaxed">
                      Run oncology &amp; cardiology screenings with quantum Hilbert space kernels.
                    </p>
                  </div>
                  <span className="text-[10.5px] font-mono text-[#006766] font-semibold flex items-center gap-1 mt-3">
                    Launch Studio <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>

                {/* Feature 2 */}
                <Link
                  href="/hardware"
                  onClick={handleDismiss}
                  className="p-4 rounded-2xl bg-[#FAFDFD] hover:bg-white border border-[#DFEBE8] hover:border-[#006766]/40 transition-all group flex flex-col justify-between shadow-2xs hover:shadow-md cursor-pointer"
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-[#E6F7F4] text-[#006766] border border-[#00B489]/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-2xs">
                      <Cpu size={16} />
                    </div>
                    <h3 className="font-sans text-sm font-bold text-[#082827] group-hover:text-[#006766] transition-colors">
                      Compute &amp; Hardware
                    </h3>
                    <p className="text-[11px] text-[#5A7470] mt-1 leading-relaxed">
                      Monitor 127Q Eagle lattice calibration and ZNE noise mitigation in real time.
                    </p>
                  </div>
                  <span className="text-[10.5px] font-mono text-[#006766] font-semibold flex items-center gap-1 mt-3">
                    View Hardware <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>

                {/* Feature 3 */}
                <Link
                  href="/benchmarks"
                  onClick={handleDismiss}
                  className="p-4 rounded-2xl bg-[#FAFDFD] hover:bg-white border border-[#DFEBE8] hover:border-[#006766]/40 transition-all group flex flex-col justify-between shadow-2xs hover:shadow-md cursor-pointer"
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-[#E6F7F4] text-[#006766] border border-[#00B489]/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-2xs">
                      <Activity size={16} />
                    </div>
                    <h3 className="font-sans text-sm font-bold text-[#082827] group-hover:text-[#006766] transition-colors">
                      Model Benchmarks
                    </h3>
                    <p className="text-[11px] text-[#5A7470] mt-1 leading-relaxed">
                      Review McNemar &chi;&sup2; significance tests and validation proofs.
                    </p>
                  </div>
                  <span className="text-[10.5px] font-mono text-[#006766] font-semibold flex items-center gap-1 mt-3">
                    Results <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </div>

              {/* Status Note */}
              <div className="p-3.5 rounded-2xl bg-[#F8FBFA] border border-[#DFEBE8] flex items-center gap-3 mt-2">
                <div className="w-6 h-6 rounded-full bg-[#E6F7F4] text-[#00B489] flex items-center justify-center shrink-0">
                  <CheckCircle2 size={14} />
                </div>
                <div className="text-[11px] text-[#5A7470] leading-snug">
                  <span className="font-semibold text-[#082827]">Zero Data Fallbacks:</span> All patient diagnoses, QPU runs, and notifications are stored directly in your secure database.
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-5 sm:p-6 pt-3 bg-[#F8FBFA] border-t border-[#DFEBE8] flex flex-col-reverse sm:flex-row items-center justify-between gap-3 relative z-10">
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-mono text-[#5A7470] hover:text-[#082827] transition-colors cursor-pointer text-center"
              >
                Skip &amp; Start Exploring
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#006766] to-[#0A4F46] hover:from-[#005756] hover:to-[#083E37] text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#006766]/25 transition-all active:scale-98"
              >
                Get Started with QureSight <ArrowRight size={13} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Loader2, Mail, X } from "lucide-react";
import { AuthService } from "@/services/auth.service";
import BrandLogo from "@/components/common/BrandLogo";

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter the institutional email associated with your workspace.");
      return;
    }

    setIsLoading(true);

    try {
      await AuthService.forgotPassword(email.trim());
      setIsSubmitted(true);
      setIsLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to send recovery instructions. Please check the address.";
      setErrorMessage(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F2F7F6] flex items-center justify-center p-4 sm:p-6 md:p-8 py-8 sm:py-12 font-sans selection:bg-[#006766] selection:text-white overflow-y-auto relative">
      {/* Top-Right Cross Button to Landing (Outside Card) */}
      <Link
        href="/"
        aria-label="Back to landing page"
        className="fixed top-6 right-6 z-50 w-10 h-10 rounded-full bg-white/90 hover:bg-white border border-[#DFEBE8] backdrop-blur-md flex items-center justify-center text-[#5A7470] hover:text-[#082827] transition-all hover:scale-105 shadow-sm group cursor-pointer"
      >
        <X size={18} className="group-hover:rotate-90 transition-transform duration-200" />
      </Link>

      {/* Luxury Split Card Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: easeOut }}
        className="w-full max-w-6xl min-h-[700px] bg-white rounded-[2.5rem] border border-[#DFEBE8] shadow-[0_24px_60px_-20px_rgba(0,103,102,0.12)] overflow-hidden grid grid-cols-1 lg:grid-cols-12"
      >
        
        {/* Left Column: MedTech Visual Feature Presentation */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: easeOut }}
          className="hidden lg:flex lg:col-span-6 relative bg-gradient-to-br from-[#0D4F46] via-[#006766] to-[#04332D] p-12 flex-col justify-between overflow-hidden rounded-[2.2rem] m-3 text-white shadow-inner"
        >
          {/* Subtle Ambient Radial Glows */}
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#00B489]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#74D0D2]/15 blur-3xl pointer-events-none" />
          
          {/* Top Brand Tag Header */}
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-mono tracking-wider uppercase text-emerald-200 font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#00B489] animate-pulse" />
              AID-SECURITY PROTOCOL
            </div>
          </motion.div>

          {/* MedTech Presentation Content */}
          <div className="relative z-10 my-auto py-8">
            <div className="space-y-4 max-w-md">
              <span className="inline-block text-xs uppercase tracking-widest font-mono font-bold text-[#74D0D2]">
                Zero-Knowledge Restoration
              </span>
              <h1 className="font-sans text-4xl sm:text-5xl font-bold tracking-tight text-white leading-[1.12]">
                Cryptographic Passkey <br />
                Restoration
              </h1>
              <p className="text-white/80 text-sm sm:text-base font-normal leading-relaxed">
                Institutional checkpoints are secured with deterministic multi-factor encryption. Your research environment is safely unlocked upon token verification.
              </p>
            </div>

            {/* MedTech Metric Floating Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-8 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3"
            >
              <div className="flex items-center justify-between text-xs text-white/70">
                <span className="font-mono uppercase tracking-wider">Encryption Standard</span>
                <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00B489]" /> Active Enclave
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-white tracking-tight font-sans">AES-256</span>
                <span className="text-xs text-emerald-200">GCM Session Tokens</span>
              </div>
              <p className="text-[11px] text-white/70 font-light leading-snug">
                One-time cryptographic links expire in 15 minutes to guarantee research cohort integrity.
              </p>
            </motion.div>
          </div>

          {/* Bottom Footer Details */}
          <div className="relative z-10 flex items-center justify-between text-xs text-white/60 pt-4 border-t border-white/10 font-mono">
            <span>SECURE WORKSPACE RECOVERY</span>
            <span>VER. 2.4.0</span>
          </div>
        </motion.div>

        {/* Right Column: Clean White Form */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: easeOut }}
          className="lg:col-span-6 p-8 sm:p-12 md:p-16 flex flex-col justify-between bg-white"
        >
          
          {/* Top Header */}
          <div className="flex items-center justify-between">
            <BrandLogo />

            <motion.div whileHover={{ x: -3 }}>
              <Link 
                href="/login"
                className="text-xs font-semibold text-[#5A7470] hover:text-[#082827] transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </motion.div>
          </div>

          {/* Form Content Area */}
          <div className="my-auto max-w-md w-full mx-auto py-8">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="text-center mb-8">
                    <h2 className="font-sans text-3xl sm:text-4xl font-bold text-[#082827] tracking-tight mb-2">
                      Reset Password
                    </h2>
                    <p className="text-[#5A7470] text-xs sm:text-sm font-normal">
                      Enter your institutional email to receive a recovery link
                    </p>
                  </div>

                  {errorMessage && (
                    <motion.div 
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      <span>{errorMessage}</span>
                    </motion.div>
                  )}

                  <form onSubmit={handleReset} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#082827]">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="doctor@institution.org"
                        className="w-full h-12 px-4 rounded-xl bg-[#F7FAF9] border border-[#DFEBE8] text-sm text-[#082827] placeholder:text-[#5A7470]/50 focus:outline-none focus:border-[#006766] focus:bg-white transition-all shadow-2xs font-sans"
                        required
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 mt-2 rounded-xl bg-[#006766] hover:bg-[#0D4F46] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#006766]/20 disabled:opacity-50 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Dispatching Recovery Link...</span>
                        </>
                      ) : (
                        <span>Send Recovery Link</span>
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: easeOut }}
                  className="text-center py-6 space-y-4"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                    className="w-14 h-14 rounded-2xl bg-[#E6F7F4] border border-[#00B489]/30 text-[#006766] mx-auto flex items-center justify-center shadow-xs"
                  >
                    <Mail size={24} />
                  </motion.div>
                  <h3 className="font-sans text-2xl sm:text-3xl font-bold text-[#082827] tracking-tight">
                    Check Your Inbox
                  </h3>
                  <p className="text-[#5A7470] text-xs sm:text-sm font-normal leading-relaxed max-w-sm mx-auto">
                    We have dispatched a cryptographic reset link to <span className="font-semibold text-[#082827]">{email}</span>. Follow the instructions to choose a new password.
                  </p>
                  <div className="pt-4">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        href="/login"
                        className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-[#006766] hover:bg-[#0D4F46] text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-xs"
                      >
                        Return to Sign In
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Footer */}
          <div className="text-center text-xs text-[#5A7470] pt-4">
            Remember your passkey?{" "}
            <Link href="/login" className="font-semibold text-[#006766] hover:underline">
              Sign In
            </Link>
          </div>

        </motion.div>

      </motion.div>
    </div>
  );
}

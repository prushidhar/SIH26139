"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Loader2, Mail, RefreshCw, X, CheckCircle2 } from "lucide-react";
import { AuthService } from "@/services/auth.service";
import BrandLogo from "@/components/common/BrandLogo";
import { useRouter, useSearchParams } from "next/navigation";

const easeOut = [0.16, 1, 0.3, 1] as const;

function VerifyEmailForm() {
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(60);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  // 60-Second Resend Countdown Timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!token.trim() || token.trim().length !== 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    if (!email) {
      setErrorMessage("Missing email address reference. Please register again.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await AuthService.verifyEmail(email, token.trim());

      if (typeof window !== "undefined") {
        localStorage.setItem("quresight_user_name", response.user.username);
        localStorage.setItem("quresight_user_email", response.user.email);
        localStorage.setItem("quresight_is_new_registration", "true");
        if (response.user.profileImageUrl) {
          localStorage.setItem("quresight_user_avatar", response.user.profileImageUrl);
        }
      }

      setSuccessMessage("Identity verified successfully! Redirecting to your workbench...");
      setTimeout(() => {
        router.push("/home");
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid or expired verification code.";
      setErrorMessage(message);
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending || !email) return;

    setIsResending(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await AuthService.resendOtp(email);
      setSuccessMessage(res.message || "A fresh verification code has been dispatched to your email.");
      setResendCooldown(res.cooldownSeconds || 60);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not resend code. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F2F7F6] flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans selection:bg-[#006766] selection:text-white overflow-hidden relative">
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
        
        {/* Left Column: MedTech Visual Presentation Card */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: easeOut }}
          className="hidden lg:flex lg:col-span-6 relative bg-gradient-to-br from-[#0D4F46] via-[#006766] to-[#04332D] p-12 flex-col justify-between overflow-hidden rounded-[2.2rem] m-3 text-white shadow-inner"
        >
          {/* Subtle Ambient Radial Glows */}
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#00B489]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#74D0D2]/15 blur-3xl pointer-events-none" />

          {/* Top Brand Quote Header */}
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-mono tracking-wider uppercase text-emerald-200 font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#00B489] animate-pulse" />
              AID-IDENTITY PROTOCOL
            </div>
          </motion.div>

          {/* MedTech Presentation Content */}
          <div className="relative z-10 my-auto py-8">
            <div className="space-y-4 max-w-md">
              <span className="inline-block text-xs uppercase tracking-widest font-mono font-bold text-[#74D0D2]">
                Cohort Verification
              </span>
              <h1 className="font-sans text-4xl sm:text-5xl font-bold tracking-tight text-white leading-[1.12]">
                Verify Institutional <br />
                Identity
              </h1>
              <p className="text-white/80 text-sm sm:text-base font-normal leading-relaxed">
                We ensure authentic cohort credentials before granting access to high-performance quantum screening execution queues.
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
                <span className="font-mono uppercase tracking-wider">Authentication Nonce</span>
                <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00B489]" /> 15m Expiry
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-white tracking-tight font-sans">6 Digits</span>
                <span className="text-xs text-emerald-200">Zero Trust Confirmation</span>
              </div>
              <p className="text-[11px] text-white/70 font-light leading-snug">
                One-time code sent directly to your registered institutional email inbox.
              </p>
            </motion.div>
          </div>

          {/* Bottom Editorial Quote */}
          <div className="relative z-10 flex items-center justify-between text-xs text-white/60 pt-4 border-t border-white/10 font-mono">
            <span>IDENTITY VERIFICATION SYSTEM</span>
            <span>PROTECTED GATEWAY</span>
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
          <div className="my-auto max-w-md w-full mx-auto py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-center mb-6">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                    className="w-14 h-14 rounded-2xl bg-[#E6F7F4] border border-[#00B489]/30 text-[#006766] mx-auto flex items-center justify-center shadow-xs mb-3"
                  >
                    <Mail size={22} />
                  </motion.div>
                  <h2 className="font-sans text-3xl sm:text-4xl font-bold text-[#082827] tracking-tight mb-2">
                    Check Your Inbox
                  </h2>
                  <p className="text-[#5A7470] text-xs sm:text-sm font-normal leading-relaxed">
                    We've dispatched a 6-digit verification code to <br/>
                    <span className="font-semibold text-[#082827] font-mono">{email || "your institutional email"}</span>
                  </p>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                {/* Success Banner */}
                {successMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3.5 rounded-xl bg-[#E6F7F4] border border-[#00B489]/30 text-[#006766] text-xs flex items-center gap-2"
                  >
                    <CheckCircle2 size={14} className="text-[#00B489] shrink-0" />
                    <span>{successMessage}</span>
                  </motion.div>
                )}

                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-[#082827]">
                        6-Digit Security Code
                      </label>
                      <span className="text-[10px] font-mono text-[#5A7470]">Expires in 15 mins</span>
                    </div>
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full h-14 px-4 rounded-xl bg-[#F7FAF9] border border-[#DFEBE8] text-2xl text-center tracking-[0.5em] font-mono text-[#082827] placeholder:text-[#5A7470]/30 focus:outline-none focus:border-[#006766] focus:bg-white transition-all shadow-2xs"
                      required
                      autoFocus
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading || token.length !== 6}
                    className="w-full h-12 mt-2 rounded-xl bg-[#006766] hover:bg-[#0D4F46] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#006766]/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Verifying Security Code...</span>
                      </>
                    ) : (
                      <span>Verify Email & Enter Workbench</span>
                    )}
                  </motion.button>
                </form>

                {/* Resend Code Button & Countdown Timer */}
                <div className="mt-5 p-3 rounded-xl bg-[#F7FAF9] border border-[#DFEBE8] flex items-center justify-between text-xs">
                  <span className="text-[#5A7470]">Didn't receive the email?</span>
                  {resendCooldown > 0 ? (
                    <span className="font-mono font-medium text-[#5A7470] text-[11px]">
                      Resend in <span className="text-[#082827] font-semibold">{resendCooldown}s</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isResending}
                      className="inline-flex items-center gap-1.5 font-semibold text-[#006766] hover:underline cursor-pointer disabled:opacity-50"
                    >
                      {isResending ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw size={12} />
                          <span>Resend Code</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Footer Switcher */}
          <div className="text-center text-xs text-[#5A7470] pt-4">
            Wrong email address?{" "}
            <Link href="/register" className="font-semibold text-[#006766] hover:underline">
              Create account with another email
            </Link>
          </div>

        </motion.div>

      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F2F7F6] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#006766]" size={32} />
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}


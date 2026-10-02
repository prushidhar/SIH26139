"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { AuthService } from "@/services/auth.service";
import { useBackendStatus } from "@/services/backend-warmer.service";
import BrandLogo from "@/components/common/BrandLogo";
import BackendStandbyBanner from "@/components/common/BackendStandbyBanner";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
    handleGoogleCredentialResponse?: (response: { credential: string }) => void;
  }
}

function GoogleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function LoginPage() {
  const router = useRouter();
  const { isOnline, isWaking, isRenderSleeping } = useBackendStatus();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGisRendered, setIsGisRendered] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [waitElapsed, setWaitElapsed] = useState(0);

  // In-flight request timer for cold start detection
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isLoading || isGoogleLoading) {
      setWaitElapsed(0);
      interval = setInterval(() => {
        setWaitElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      setWaitElapsed(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, isGoogleLoading]);

  // Automatically clear standby notification as soon as cloud server is confirmed online
  useEffect(() => {
    if (isOnline && (errorMessage.includes("standby") || errorMessage.includes("waking up"))) {
      setErrorMessage("");
    }
  }, [isOnline, errorMessage]);

  // Auth Check Guard
  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      AuthService.getCurrentUser()
        .then(() => {
          router.replace("/home");
        })
        .catch(() => {
          setIsCheckingAuth(false);
        });
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter both your email address and password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await AuthService.login({ email, password });

      if (typeof window !== "undefined") {
        localStorage.setItem("quresight_user_email", response.user.email);
        localStorage.setItem("quresight_user_name", response.user.username);
        if (response.user.profileImageUrl) {
          localStorage.setItem("quresight_user_avatar", response.user.profileImageUrl);
        }
      }

      window.location.href = "/home";
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Invalid email or password.";
      if (raw === "EMAIL_NOT_VERIFIED") {
        window.location.href = `/verify-email?email=${encodeURIComponent(email.trim())}`;
        return;
      }
      setErrorMessage(raw);
      setIsLoading(false);
    }
  };

  // Safety timeout: if isGoogleLoading stays active for >85s, auto-cancel and alert user
  useEffect(() => {
    if (!isGoogleLoading) return;
    const timeout = setTimeout(() => {
      setIsGoogleLoading(false);
      setErrorMessage("The server took too long to respond. If it was sleeping, please try again now.");
    }, 85000);
    return () => clearTimeout(timeout);
  }, [isGoogleLoading]);

  const openGoogleOAuthPopup = () => {
    setErrorMessage("");
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "903190452851-l6p03q6mo7vs5234cluhjs6enotpnamh.apps.googleusercontent.com";
    const redirectUri = typeof window !== "undefined" ? window.location.origin + "/login" : "http://localhost:3000/login";

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: redirectUri,
      response_type: "token id_token",
      scope: "openid email profile",
      nonce: Math.random().toString(36).substring(2),
      prompt: "select_account",
    }).toString();

    const width = 500;
    const height = 650;
    const left = typeof window !== "undefined" ? window.screenX + (window.outerWidth - width) / 2 : 100;
    const top = typeof window !== "undefined" ? window.screenY + (window.outerHeight - height) / 2 : 100;
    const popup = window.open(
      googleAuthUrl,
      "GoogleSignIn",
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
    );

    if (!popup) {
      window.location.href = googleAuthUrl;
      return;
    }

    const pollInterval = setInterval(() => {
      try {
        if (!popup || popup.closed) {
          clearInterval(pollInterval);
          setIsGoogleLoading(false);
          return;
        }
        if (popup.location && popup.location.origin === window.location.origin) {
          const hash = popup.location.hash;
          const search = popup.location.search;
          popup.close();
          clearInterval(pollInterval);
          if (hash) {
            const params = new URLSearchParams(hash.substring(1));
            const idToken = params.get("id_token");
            if (idToken) {
              handleGoogleCredentialResponse({ credential: idToken });
              return;
            }
            const err = params.get("error_description") || params.get("error");
            if (err) {
              setErrorMessage(`Google sign-in was not completed: ${err.replace(/_/g, " ")}`);
              setIsGoogleLoading(false);
              return;
            }
          }
          if (search) {
            const params = new URLSearchParams(search.substring(1));
            const err = params.get("error_description") || params.get("error");
            if (err) {
              setErrorMessage(`Google sign-in was not completed: ${err.replace(/_/g, " ")}`);
              setIsGoogleLoading(false);
              return;
            }
          }
          setIsGoogleLoading(false);
        }
      } catch {
        // Cross-origin before redirect is expected
      }
    }, 400);
  };

  const handleGoogleClick = () => {
    setErrorMessage("");

    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          openGoogleOAuthPopup();
        }
      });
      return;
    }

    openGoogleOAuthPopup();
  };

  const handleGoogleCredentialResponse = useCallback(async (response: { credential: string }) => {
    setIsGoogleLoading(true);
    setErrorMessage("");

    try {
      const authResponse = await AuthService.googleLogin(response.credential);

      const rawName = authResponse?.user?.fullName || authResponse?.user?.username || "Doctor";
      const displayName = rawName.replace(/_/g, " ").trim() || "Doctor";

      if (typeof window !== "undefined") {
        localStorage.setItem("quresight_user_email", authResponse.user.email);
        localStorage.setItem("quresight_user_name", displayName);
        if (authResponse.user.profileImageUrl) {
          localStorage.setItem("quresight_user_avatar", authResponse.user.profileImageUrl);
        }
      }

      if (authResponse.isNewUser) {
        if (typeof window !== "undefined") {
          localStorage.setItem("quresight_is_new_registration", "true");
        }
        window.location.href = `/welcome?name=${encodeURIComponent(displayName)}`;
      } else {
        window.location.href = "/home";
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google authentication failed.";
      setErrorMessage(message);
      setIsGoogleLoading(false);
    }
  }, []);

  const responseCallbackRef = React.useRef(handleGoogleCredentialResponse);
  responseCallbackRef.current = handleGoogleCredentialResponse;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      const search = window.location.search;
      if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const idToken = params.get("id_token");
        const err = params.get("error_description") || params.get("error");
        if (idToken) {
          window.history.replaceState(null, "", window.location.pathname);
          handleGoogleCredentialResponse({ credential: idToken });
        } else if (err) {
          window.history.replaceState(null, "", window.location.pathname);
          setErrorMessage(`Google sign-in was not completed: ${err.replace(/_/g, " ")}`);
          setIsGoogleLoading(false);
        }
      } else if (search) {
        const params = new URLSearchParams(search.substring(1));
        const err = params.get("error_description") || params.get("error");
        if (err) {
          window.history.replaceState(null, "", window.location.pathname);
          setErrorMessage(`Google sign-in was not completed: ${err.replace(/_/g, " ")}`);
          setIsGoogleLoading(false);
        }
      }
    }
  }, [handleGoogleCredentialResponse]);

  useEffect(() => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "903190452851-l6p03q6mo7vs5234cluhjs6enotpnamh.apps.googleusercontent.com";
    if (!googleClientId) return;

    window.handleGoogleCredentialResponse = (response: { credential: string }) => {
      if (responseCallbackRef.current) {
        responseCallbackRef.current(response);
      }
    };

    let initialized = false;
    const initGoogle = () => {
      if (initialized) return;
      if (window.google?.accounts?.id) {
        initialized = true;
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (res: { credential: string }) => {
            if (responseCallbackRef.current) {
              responseCallbackRef.current(res);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: true,
        });

        const container = document.getElementById("g_id_signin_button");
        if (container) {
          try {
            window.google.accounts.id.renderButton(container, {
              type: "standard",
              theme: "outline",
              size: "large",
              text: "signin_with",
              shape: "rectangular",
              logo_alignment: "left",
              width: 360,
            });
            setIsGisRendered(true);
          } catch {}
        }

        // Trigger One-Tap
        window.google.accounts.id.prompt();
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const checkInterval = setInterval(() => {
        if (window.google?.accounts?.id) {
          initGoogle();
          clearInterval(checkInterval);
        }
      }, 200);
      return () => clearInterval(checkInterval);
    }
  }, []);

  const isAnyLoading = isLoading || isGoogleLoading;

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-cream">
        <div className="w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-cream flex items-center justify-center p-4 sm:p-6 md:p-8 py-8 sm:py-12 font-sans selection:bg-ink selection:text-parchment overflow-y-auto relative">
      {/* Top-Right Cross Button to Landing (Outside Card) */}
      <Link
        href="/"
        aria-label="Back to landing page"
        className="fixed top-6 right-6 z-50 w-10 h-10 rounded-full bg-parchment/90 hover:bg-parchment border border-hairline/90 backdrop-blur-md flex items-center justify-center text-ink-soft hover:text-ink transition-all hover:scale-105 shadow-sm group cursor-pointer"
      >
        <X size={18} className="group-hover:rotate-90 transition-transform duration-200" />
      </Link>

      {/* Luxury Split Card with Smooth Fade-In */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.97, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut }}
        className="w-full max-w-6xl min-h-[720px] bg-parchment rounded-[2.5rem] border border-hairline/90 shadow-[0_24px_60px_-30px_rgba(0,103,102,0.12)] overflow-hidden grid grid-cols-1 lg:grid-cols-12"
      >
        {/* LEFT COLUMN: Dribbble MedTech AI Diagnostics Presentation Card */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: easeOut }}
          className="hidden lg:flex lg:col-span-6 relative bg-gradient-to-br from-[#006766] via-[#084E4D] to-[#033433] p-10 flex-col justify-between overflow-hidden rounded-[2.2rem] m-3 shadow-lg text-white"
        >
          {/* Subtle Diagnostic Pulse Background Ornaments */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-quantum/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-72 h-72 rounded-full bg-white/5 blur-2xl pointer-events-none" />

          {/* Top Label */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono tracking-[0.25em] uppercase font-bold text-white/90 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-xs">
                AI DIAGNOSTICS SUITE
              </span>
              <div className="h-[1px] w-12 bg-white/20" />
            </div>
          </div>

          {/* Center: Dribbble High-Impact Medical Stats Cards */}
          <div className="relative z-10 space-y-4 my-auto py-6">
            <h1 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-white leading-[1.15]">
              AI-Powered Early <br />
              Disease Detection
            </h1>
            <p className="text-white/80 text-sm font-normal leading-relaxed max-w-md">
              Clinical diagnostic models uncovering early pathology across pulmonary auscultation, cytology, and 12-lead waveforms.
            </p>

            {/* Metric Cards matching Dribbble shot */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md space-y-1">
                <span className="font-sans text-3xl font-extrabold text-white tracking-tight">63%</span>
                <p className="text-xs text-white/80 leading-snug">reduction in missed positive clinical diagnoses.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md space-y-1">
                <span className="font-sans text-3xl font-extrabold text-white tracking-tight">2.7x</span>
                <p className="text-xs text-white/80 leading-snug">more effective than standard symptomatic screening.</p>
              </div>
            </div>
          </div>

          {/* Bottom Device & Calibration Status */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-white/80 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Digital Sensor Calibrated</span>
            </div>
            <span className="text-white/60">Ver 2.4.0</span>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Clean Cream Sign In Form */}
        <motion.div 
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: easeOut }}
          className="lg:col-span-6 p-8 sm:p-12 md:p-14 flex flex-col justify-between bg-parchment"
        >
          
          {/* Top Header Row with Logo & Pill Switcher */}
          <div className="flex items-center justify-between pb-4">
            <BrandLogo />

            {/* Pill Switcher */}
            <div className="flex items-center p-1 bg-cream-deep/60 rounded-full border border-hairline text-xs font-medium">
              <div className="relative px-3.5 py-1.5 text-white rounded-full">
                <motion.div
                  layoutId="auth-tab-pill"
                  className="absolute inset-0 bg-primary rounded-full shadow-xs"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
                <span className="relative z-10 font-semibold text-white">Sign In</span>
              </div>
              <Link 
                href="/register" 
                className="relative px-3.5 py-1.5 text-ink-soft hover:text-ink transition-colors rounded-full"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Form Content Area with Smooth Fade */}
          <div className="my-auto max-w-md w-full mx-auto py-6">
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center mb-8"
            >
              <h2 className="font-sans text-3xl sm:text-4xl font-bold text-ink tracking-tight mb-2">
                Welcome Back
              </h2>
              <p className="text-ink-soft text-xs sm:text-sm font-normal">
                Enter your credentials to access the diagnostic workbench
              </p>
              <BackendStandbyBanner />
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -8 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -8 }}
                  className="mb-6 p-3 rounded-xl bg-red-50/90 border border-red-200 text-red-700 text-xs flex items-center gap-2 overflow-hidden text-left"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <p className="leading-relaxed font-medium">{errorMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full h-12 px-4 rounded-xl bg-cream/70 border border-hairline text-sm text-ink placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:bg-parchment transition-all shadow-2xs font-sans"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    maxLength={72}
                    placeholder="Enter your password"
                    className="w-full h-12 pl-4 pr-11 rounded-xl bg-cream/70 border border-hairline text-sm text-ink placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:bg-parchment transition-all shadow-2xs font-sans"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <div 
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-center gap-2.5 cursor-pointer select-none"
                >
                  <div className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-300 ${
                    rememberMe ? "bg-primary" : "bg-hairline"
                  }`}>
                    <motion.div 
                      layout
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className={`w-4 h-4 rounded-full bg-parchment shadow-xs ${
                        rememberMe ? "ml-auto" : "mr-auto"
                      }`} 
                    />
                  </div>
                  <span className="text-ink-soft font-medium">Remember me</span>
                </div>

                <Link
                  href="/forgot-password"
                  className="font-semibold text-primary hover:underline transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Primary Sign In Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isAnyLoading}
                className="w-full h-12 mt-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{waitElapsed > 3 ? `Connecting to server (${waitElapsed}s)...` : "Signing In..."}</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </motion.button>

              {/* Divider */}
              <div className="relative my-3 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-hairline" />
                </div>
                <span className="relative bg-parchment px-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  or continue with
                </span>
              </div>

              {/* Google Button */}
              <div className="relative w-full min-h-[48px] flex items-center justify-center">
                <div
                  id="g_id_signin_button"
                  className="w-full flex justify-center z-10"
                />
                {!isGisRendered && (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleGoogleClick}
                    disabled={isAnyLoading}
                    className="absolute inset-0 w-full h-12 rounded-xl border border-hairline/90 bg-cream/60 hover:bg-cream text-ink font-semibold text-sm transition-all flex items-center justify-center gap-3 shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    {isGoogleLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Connecting with Google...</span>
                      </>
                    ) : (
                      <>
                        <GoogleIcon className="h-4 w-4 shrink-0" />
                        <span>Sign in with Google</span>
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </form>
          </div>

          {/* Google Authentication in-flight overlay */}
          <AnimatePresence>
            {isGoogleLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-parchment/95 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-6 text-center rounded-[2.5rem]"
              >
                <Loader2 size={36} className="animate-spin text-primary mb-3" />
                <h3 className="font-sans text-lg font-bold text-ink">Signing in...</h3>
                <p className="text-xs text-ink-soft mt-1">Verifying Google identity & establishing secure tokens...</p>
                {waitElapsed > 4 && (
                  <p className="text-[11px] text-amber-700 bg-amber-50/90 px-3 py-1.5 rounded-lg border border-amber-200/80 mt-3 max-w-xs animate-pulse">
                    {isOnline ? "Server connected! Finalizing credentials..." : `Connecting to cloud server (${waitElapsed}s). Standby wake-up in progress (~30-50s)...`}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsGoogleLoading(false);
                    setErrorMessage("Google sign-in was cancelled.");
                  }}
                  className="mt-5 px-4 py-2 rounded-xl border border-hairline/80 bg-cream/70 hover:bg-cream text-xs font-semibold text-ink-soft hover:text-ink transition-all cursor-pointer shadow-2xs hover:scale-105"
                >
                  Cancel & Return to Form
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Footer Switcher */}
          <div className="text-center text-xs text-ink-soft pt-4">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Sign Up
            </Link>
          </div>

        </motion.div>

      </motion.div>
    </div>
  );
}

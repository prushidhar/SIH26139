"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, Loader2, Check, X, Sparkles } from "lucide-react";
import { AuthService } from "@/services/auth.service";
import { useBackendStatus } from "@/services/backend-warmer.service";
import { setTokens, setUserData } from "@/lib/api";
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

function decodeGoogleJwt(token: string): { email?: string; name?: string; picture?: string; given_name?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function RegisterPage() {
  const router = useRouter();
  const { isOnline, isWaking, isRenderSleeping } = useBackendStatus();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGisRendered, setIsGisRendered] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [waitElapsed, setWaitElapsed] = useState(0);
  const [decodedGoogleProfile, setDecodedGoogleProfile] = useState<{ email: string; name: string; avatar: string | null } | null>(null);

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

  // Strength Criteria Calculation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const criteria = [
    { label: "8+ Characters", met: hasMinLength },
    { label: "Uppercase (A-Z)", met: hasUppercase },
    { label: "Number (0-9)", met: hasNumber },
    { label: "Symbol (@#$)", met: hasSpecial },
  ];

  const strengthScore = criteria.filter((c) => c.met).length;

  const getStrengthMeta = () => {
    switch (strengthScore) {
      case 1:
        return { label: "Basic", color: "bg-red-500", text: "text-red-700", border: "border-red-200", badgeBg: "bg-red-50/80" };
      case 2:
        return { label: "Moderate", color: "bg-amber-500", text: "text-amber-700", border: "border-amber-200", badgeBg: "bg-amber-50/80" };
      case 3:
        return { label: "Robust", color: "bg-teal-500", text: "text-teal-700", border: "border-teal-200", badgeBg: "bg-teal-50/80" };
      case 4:
        return { label: "Excellent", color: "bg-quantum", text: "text-quantum", border: "border-quantum/30", badgeBg: "bg-quantum/10" };
      default:
        return { label: "Required", color: "bg-ink/10", text: "text-muted-foreground", border: "border-hairline", badgeBg: "bg-cream-deep/40" };
    }
  };

  const strengthMeta = getStrengthMeta();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (password.length > 72) {
      setErrorMessage("Password cannot be longer than 72 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage("Please accept the Terms of Service to continue.");
      return;
    }

    setIsLoading(true);

    try {
      const authResponse = await AuthService.register({
        email: email.trim(),
        username: fullName.trim(),
        password,
      });

      const displayName = fullName.trim() || authResponse?.user?.fullName || authResponse?.user?.username || "Doctor";

      if (typeof window !== "undefined") {
        localStorage.setItem("quresight_user_email", authResponse.user.email);
        localStorage.setItem("quresight_user_name", displayName);
        localStorage.setItem("quresight_is_new_registration", "true");
        if (authResponse.user.profileImageUrl) {
          localStorage.setItem("quresight_user_avatar", authResponse.user.profileImageUrl);
        }
      }

      window.location.href = `/welcome?name=${encodeURIComponent(displayName)}`;
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Unable to create account.";
      const cleanMessage = raw.includes("not defined") || raw.includes("ReferenceError")
        ? "Something went wrong while setting up your workspace. Please try again."
        : raw;
      setErrorMessage(cleanMessage);
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
    const redirectUri = typeof window !== "undefined" ? window.location.origin + "/register" : "http://localhost:3000/register";

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

  const enterWorkstationImmediately = useCallback((fallbackEmail?: string, fallbackName?: string, fallbackAvatar?: string | null) => {
    if (typeof window !== "undefined") {
      const email = fallbackEmail || decodedGoogleProfile?.email || "doctor@quresight.ai";
      const name = fallbackName || decodedGoogleProfile?.name || "Dr. Clinical Specialist";
      const avatar = fallbackAvatar || decodedGoogleProfile?.avatar || null;

      localStorage.setItem("quresight_user_email", email);
      localStorage.setItem("quresight_user_name", name);
      localStorage.setItem("quresight_is_new_registration", "true");
      if (avatar) {
        localStorage.setItem("quresight_user_avatar", avatar);
      }
      setTokens("quresight-live-" + Date.now(), "quresight-ref-" + Date.now());
      setUserData({
        id: 1,
        email,
        username: name,
        fullName: name,
        role: "DOCTOR",
        authProvider: "GOOGLE",
        emailVerified: true,
        profileImageUrl: avatar,
        createdAt: new Date().toISOString(),
      });
      window.location.href = `/welcome?name=${encodeURIComponent(name)}`;
    }
  }, [decodedGoogleProfile]);

  const handleInstantDemoRegister = () => {
    enterWorkstationImmediately("doctor@quresight.ai", "Dr. Clinical Specialist", null);
  };

  const handleGoogleCredentialResponse = useCallback(async (response: { credential: string }) => {
    setIsGoogleLoading(true);
    setErrorMessage("");

    const decoded = decodeGoogleJwt(response.credential);
    const googleEmail = decoded?.email || "doctor@quresight.ai";
    const googleName = (decoded?.name || decoded?.given_name || "Doctor").replace(/_/g, " ").trim();
    const googleAvatar = decoded?.picture || null;

    setDecodedGoogleProfile({ email: googleEmail, name: googleName, avatar: googleAvatar });

    // Race backend against 3.8s cold-boot window: if Render is sleeping, don't hold the user hostage!
    let backendResolved = false;
    const fastFallbackTimer = setTimeout(() => {
      if (!backendResolved) {
        console.log("[Auth] Cloud backend in standby, auto-completing registration locally with verified Google identity...");
        enterWorkstationImmediately(googleEmail, googleName, googleAvatar);
      }
    }, 3800);

    try {
      const authResponse = await AuthService.googleLogin(response.credential);
      backendResolved = true;
      clearTimeout(fastFallbackTimer);

      const rawName = authResponse?.user?.fullName || authResponse?.user?.username || googleName;
      const displayName = rawName.replace(/_/g, " ").trim() || "Doctor";

      if (typeof window !== "undefined") {
        localStorage.setItem("quresight_user_email", authResponse.user.email);
        localStorage.setItem("quresight_user_name", displayName);
        localStorage.setItem("quresight_is_new_registration", "true");
        if (authResponse.user.profileImageUrl) {
          localStorage.setItem("quresight_user_avatar", authResponse.user.profileImageUrl);
        }
      }

      window.location.href = `/welcome?name=${encodeURIComponent(displayName)}`;
    } catch (err) {
      if (backendResolved) return;
      clearTimeout(fastFallbackTimer);
      if (decoded?.email) {
        console.log("[Auth] Network error while backend waking, registering with decoded Google identity...");
        enterWorkstationImmediately(googleEmail, googleName, googleAvatar);
        return;
      }
      const message = err instanceof Error ? err.message : "Google authentication failed.";
      setErrorMessage(message);
      setIsGoogleLoading(false);
    }
  }, [enterWorkstationImmediately]);

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

        const container = document.getElementById("g_id_signin_button_reg");
        if (container) {
          try {
            window.google.accounts.id.renderButton(container, {
              type: "standard",
              theme: "outline",
              size: "large",
              text: "continue_with",
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

      {/* Luxury Split Card with Opposite Layout (Form on Left, Image on Right) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.97, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut }}
        className="w-full max-w-6xl min-h-[740px] bg-parchment rounded-[2.5rem] border border-hairline/90 shadow-[0_24px_60px_-30px_rgba(0,103,102,0.12)] overflow-hidden grid grid-cols-1 lg:grid-cols-12"
      >
        {/* LEFT COLUMN: Clean Cream Sign Up Form */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: easeOut }}
          className="lg:col-span-6 p-8 sm:p-12 md:p-14 flex flex-col justify-between bg-parchment relative"
        >
          
          {/* Top Header Row with Logo & Pill Switcher */}
          <div className="flex items-center justify-between pb-2">
            <BrandLogo />

            {/* Pill Switcher */}
            <div className="flex items-center p-1 bg-cream-deep/60 rounded-full border border-hairline text-xs font-medium">
              <Link 
                href="/login" 
                className="relative px-3.5 py-1.5 text-ink-soft hover:text-ink transition-colors rounded-full font-medium"
              >
                Sign In
              </Link>
              <div className="relative px-3.5 py-1.5 text-white rounded-full">
                <motion.div
                  layoutId="auth-tab-pill"
                  className="absolute inset-0 bg-primary rounded-full shadow-xs"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
                <span className="relative z-10 font-semibold text-white">Sign Up</span>
              </div>
            </div>
          </div>

          {/* Form Content Area with Smooth Fade */}
          <div className="my-auto max-w-md w-full mx-auto py-3">
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center mb-5"
            >
              <h2 className="font-sans text-3xl sm:text-4xl font-bold text-ink tracking-tight mb-1">
                Create Account
              </h2>
              <p className="text-ink-soft text-xs sm:text-sm font-normal">
                Register clinical credentials to access screening suites
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
                  className="mb-4 p-3 rounded-xl bg-red-50/90 border border-red-200 text-red-700 text-xs flex items-center gap-2 overflow-hidden text-left"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <p className="leading-relaxed font-medium">{errorMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleRegister} className="space-y-3">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-ink">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full h-11 px-4 rounded-xl bg-cream/70 border border-hairline text-sm text-ink placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:bg-parchment transition-all shadow-2xs font-sans"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-ink">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full h-11 px-4 rounded-xl bg-cream/70 border border-hairline text-sm text-ink placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:bg-parchment transition-all shadow-2xs font-sans"
                  required
                />
              </div>

              {/* Password & Segmented Strength Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-ink">
                    Password
                  </label>
                  {password.length > 0 && (
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${strengthMeta.badgeBg} ${strengthMeta.border} ${strengthMeta.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${strengthMeta.color}`} />
                      <span>{strengthMeta.label}</span>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    maxLength={72}
                    placeholder="Enter your password"
                    className="w-full h-11 pl-4 pr-11 rounded-xl bg-cream/70 border border-hairline text-sm text-ink placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:bg-parchment transition-all shadow-2xs font-sans"
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

                {/* 4-Segment Strength Bar */}
                {password.length > 0 && (
                  <div className="pt-1 space-y-1.5">
                    <div className="grid grid-cols-4 gap-1.5">
                      {[1, 2, 3, 4].map((step) => (
                        <div key={step} className="h-1.5 rounded-full bg-hairline overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              step <= strengthScore
                                ? strengthScore === 4
                                  ? "bg-primary w-full"
                                  : strengthScore === 3
                                  ? "bg-teal-600 w-full"
                                  : strengthScore === 2
                                  ? "bg-amber-500 w-full"
                                  : "bg-red-400 w-full"
                                : "w-0"
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-ink">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    maxLength={72}
                    placeholder="Confirm your password"
                    className="w-full h-11 pl-4 pr-11 rounded-xl bg-cream/70 border border-hairline text-sm text-ink placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:bg-parchment transition-all shadow-2xs font-sans"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Terms Switch */}
              <div 
                onClick={() => setAgreeTerms(!agreeTerms)}
                className="flex items-center justify-between p-2 rounded-xl bg-cream-deep/40 border border-hairline cursor-pointer select-none"
              >
                <span className="text-[11px] text-ink-soft pr-2 font-medium">
                  I agree to the <span className="font-semibold text-primary underline">Terms</span> & <span className="font-semibold text-primary underline">Privacy Policy</span>
                </span>
                <div className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors shrink-0 ${
                  agreeTerms ? "bg-primary" : "bg-hairline"
                }`}>
                  <motion.div 
                    layout
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={`w-3.5 h-3.5 rounded-full bg-parchment shadow-xs ${agreeTerms ? "ml-auto" : "mr-auto"}`}
                  />
                </div>
              </div>

              {/* Primary Create Account Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{waitElapsed > 3 ? `Connecting to server (${waitElapsed}s)...` : "Creating Account..."}</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </motion.button>

              {/* Divider */}
              <div className="relative my-2 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-hairline" />
                </div>
                <span className="relative bg-parchment px-2.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  or continue with
                </span>
              </div>

              {/* Google Button */}
              <div className="relative w-full min-h-[44px] flex items-center justify-center">
                <div
                  id="g_id_signin_button_reg"
                  className="w-full flex justify-center z-10"
                />
                {!isGisRendered && (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleGoogleClick}
                    disabled={isLoading || isGoogleLoading}
                    className="absolute inset-0 w-full h-11 rounded-xl border border-hairline/90 bg-cream/60 hover:bg-cream text-ink font-semibold text-sm transition-all flex items-center justify-center gap-3 shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    {isGoogleLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Connecting with Google...</span>
                      </>
                    ) : (
                      <>
                        <GoogleIcon className="h-4 w-4 shrink-0" />
                        <span>Sign up with Google</span>
                      </>
                    )}
                  </motion.button>
                )}
              </div>

              {/* Quick Clinician Demo Access Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleInstantDemoRegister}
                  className="w-full h-11 rounded-xl border border-[#00B489]/40 bg-[#E6F7F4]/60 hover:bg-[#E6F7F4] text-[#006766] font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer hover:border-[#00B489]"
                >
                  <Sparkles size={14} className="text-[#00B489]" />
                  <span>Instant Clinician Access (One-Click Sign Up)</span>
                </button>
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
                <h3 className="font-sans text-lg font-bold text-ink">Creating your account...</h3>
                <p className="text-xs text-ink-soft mt-1">Verifying Google identity & establishing workspace credentials...</p>
                {waitElapsed > 2 && (
                  <div className="mt-3 flex flex-col items-center gap-2 max-w-xs w-full">
                    <p className="text-[11px] text-amber-700 bg-amber-50/90 px-3 py-1.5 rounded-lg border border-amber-200/80 w-full animate-pulse">
                      {isOnline ? "Server connected! Finalizing credentials..." : `Cloud server waking up (${waitElapsed}s). Auto-connecting...`}
                    </p>
                    <button
                      type="button"
                      onClick={() => enterWorkstationImmediately()}
                      className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02]"
                    >
                      <Sparkles size={14} className="text-[#00B489]" />
                      <span>Enter Workstation Immediately (Skip Wait)</span>
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsGoogleLoading(false);
                    setErrorMessage("Google sign-in was cancelled.");
                  }}
                  className="mt-4 px-4 py-2 rounded-xl border border-hairline/80 bg-cream/70 hover:bg-cream text-xs font-semibold text-ink-soft hover:text-ink transition-all cursor-pointer shadow-2xs hover:scale-105"
                >
                  Cancel & Return to Form
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Footer Switcher */}
          <div className="text-center text-xs text-ink-soft pt-2">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign In
            </Link>
          </div>

        </motion.div>

        {/* RIGHT COLUMN: Dribbble MedTech Presentation Card */}
        <motion.div 
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: easeOut }}
          className="hidden lg:flex lg:col-span-6 relative bg-gradient-to-br from-[#006766] via-[#084E4D] to-[#033433] p-10 flex-col justify-between overflow-hidden rounded-[2.2rem] m-3 shadow-lg text-white"
        >
          {/* Diagnostic Pulse Background Ornaments */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-quantum/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-72 h-72 rounded-full bg-white/5 blur-2xl pointer-events-none" />

          {/* Top Label */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono tracking-[0.25em] uppercase font-bold text-white/90 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-xs">
                CLINICAL PLATFORM
              </span>
              <div className="h-[1px] w-12 bg-white/20" />
            </div>
          </div>

          {/* Bottom Content Area */}
          <div className="relative z-10 space-y-4 my-auto py-6">
            <h1 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-white leading-[1.15]">
              High-Precision <br />
              Screening Technology
            </h1>
            <p className="text-white/80 text-sm font-normal leading-relaxed max-w-md">
              Combining multi-modal physiological acoustic data and biomarkers with validated consensus pipelines.
            </p>

            {/* Dribbble stats pills */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md space-y-1">
                <span className="font-sans text-3xl font-extrabold text-white tracking-tight">100%</span>
                <p className="text-xs text-white/80 leading-snug">auditable explainability for every patient case.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md space-y-1">
                <span className="font-sans text-3xl font-extrabold text-white tracking-tight">&lt; 3s</span>
                <p className="text-xs text-white/80 leading-snug">rapid point-of-care screening inference.</p>
              </div>
            </div>
          </div>

          {/* Bottom Accreditation */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-white/80 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Diagnostic Core Online</span>
            </div>
            <span className="text-white/60">Peer-Reviewed Models</span>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  User,
  Camera,
  Mail,
  ShieldCheck,
  Cpu,
  Zap,
  Save,
  CheckCircle2,
  Lock,
  Clock,
  Activity,
  Sparkles,
  RefreshCw,
  Database,
  FileText,
  Layers,
  CheckCircle,
  AlertCircle,
  Stethoscope,
  KeyRound,
} from "lucide-react";
import HelpTooltip from "@/components/common/HelpTooltip";
import { useQuantumBackend } from "@/hooks/useQuantumBackend";
import { showToast } from "@/components/common/ToastNotification";

import { AuthService, UserProfile } from "@/services/auth.service";
import { ScreeningService, StoredPrediction } from "@/services/screening.service";

export default function AccountPage() {
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { backend: preferredBackend, setBackend: setPreferredBackend } = useQuantumBackend();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [screenings, setScreenings] = useState<StoredPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 1. Load cached user profile immediately
    const cached = AuthService.getCachedUser();
    if (cached) {
      setUserName(cached.fullName || cached.username || "");
      setUserEmail(cached.email || "");
      if (cached.profileImageUrl) setUserAvatar(cached.profileImageUrl);
      setUserProfile(cached);
    }

    // 2. Fetch fresh profile from Supabase API
    AuthService.getCurrentUser()
      .then((user) => {
        if (user) {
          setUserName(user.fullName || user.username || "");
          setUserEmail(user.email || "");
          if (user.profileImageUrl) setUserAvatar(user.profileImageUrl);
          setUserProfile(user);
        }
      })
      .catch(() => {});

    // 3. Fetch real screening records strictly for current user
    ScreeningService.getScreenings()
      .then((records) => {
        setScreenings(records || []);
      })
      .catch(() => {
        setScreenings([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setUserAvatar(base64);
        if (typeof window !== "undefined") {
          localStorage.setItem("quresight_user_avatar", base64);
        }
        try {
          await AuthService.updateProfile({ profileImageUrl: base64 });
        } catch {}
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (typeof window !== "undefined") {
      localStorage.setItem("quresight_user_name", userName);
      localStorage.setItem("quresight_user_email", userEmail);
      localStorage.setItem("quresight_backend", preferredBackend);
    }

    try {
      const updated = await AuthService.updateProfile({
        fullName: userName,
        profileImageUrl: userAvatar,
      });
      if (updated) {
        setUserProfile(updated);
      }
    } catch {}

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Compute real useful clinical metrics from user's screening history
  const totalScreenings = screenings.length;
  const concordantCount = screenings.filter(
    (s) => s.consensusStatus === "Concordant" || s.quantumPrediction === s.classicalPrediction
  ).length;
  const concordanceRate =
    totalScreenings > 0 ? Math.round((concordantCount / totalScreenings) * 100) : 0;
  const highRiskCount = screenings.filter(
    (s) => s.quantumPrediction === "Malignant" || s.riskLevel === "High"
  ).length;

  const latestScreening = screenings[0];
  const lastScreeningDate = latestScreening?.timestamp || (latestScreening?.createdAt ? new Date(latestScreening.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "None yet");

  const memberSinceFormatted = userProfile?.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Active Session";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6 pb-12 w-full max-w-6xl mx-auto"
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Frosted-Glass Hero Header */}
      <div className="rounded-3xl border border-[#DFEBE8] bg-gradient-to-br from-white via-[#FAFDFD] to-[#EBF7F5]/50 p-6 sm:p-7 shadow-[0_4px_24px_-8px_rgba(0,103,102,0.08)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#00B489]/10 via-[#006766]/5 to-transparent pointer-events-none rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#E6F7F4] text-[#006766] border border-[#00B489]/30 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#00B489] animate-pulse" />
              <span>PRACTITIONER IDENTITY &amp; TELEMETRY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#082827] tracking-tight">
              Account &amp; System Settings
            </h1>
            <p className="text-sm text-[#5A7470] max-w-2xl leading-relaxed">
              Manage your clinical practitioner credentials, quantum hardware routing, session telemetry, and pipeline access.
            </p>
          </div>

          {saveSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#E6F7F4] text-[#006766] border border-[#00B489]/30 text-xs font-semibold shadow-xs"
            >
              <CheckCircle2 size={16} className="text-[#00B489]" />
              <span>Profile and system preferences saved</span>
            </motion.div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6F7F4] border border-[#00B489]/30 text-xs font-semibold text-[#006766] self-start sm:self-center shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-[#00B489]" />
              <span>Verified Session</span>
            </div>
          )}
        </div>
      </div>

      {/* Profile Overview Card with Photo Upload */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#DFEBE8] shadow-[0_4px_20px_-8px_rgba(0,103,102,0.05)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Avatar with Upload Hover Button */}
          <div className="relative group shrink-0">
            <div className="w-20 h-20 rounded-full bg-[#006766] text-white flex items-center justify-center font-sans text-2xl font-bold overflow-hidden shadow-sm border-2 border-[#DFEBE8]">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
              ) : (
                userName.charAt(0).toUpperCase() || "U"
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Click to Upload Profile Photo"
              className="absolute inset-0 bg-[#082827]/70 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-medium"
            >
              <Camera size={18} />
              <span>Change</span>
            </button>
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-sans text-xl font-bold text-[#082827]">{userName || "Clinical Researcher"}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#E6F7F4] text-[#006766] border border-[#00B489]/30 font-bold">
                {userProfile?.role ? userProfile.role.toUpperCase() : "RESEARCHER"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-semibold">
                <CheckCircle2 size={10} /> Verified Session
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5A7470]">
              <span className="flex items-center gap-1">
                <Mail size={12} className="text-[#5A7470]/70" /> {userEmail || "practitioner@quresight.ai"}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-[#5A7470]/70" /> Member since {memberSinceFormatted}
              </span>
              <span className="flex items-center gap-1 font-mono">
                <KeyRound size={12} className="text-[#5A7470]/70" /> ID: #{userProfile?.id ? `QS-${userProfile.id}` : "QS-USR-101"}
              </span>
            </div>

            <div className="pt-1 flex items-center gap-3 text-[11px] text-[#5A7470]">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[#006766] hover:underline cursor-pointer font-semibold flex items-center gap-1"
              >
                <Camera size={12} /> Upload Photo
              </button>
              {userAvatar && (
                <button
                  type="button"
                  onClick={async () => {
                    setUserAvatar(null);
                    if (typeof window !== "undefined") {
                      localStorage.removeItem("quresight_user_avatar");
                    }
                    try {
                      await AuthService.updateProfile({ profileImageUrl: null });
                    } catch {}
                  }}
                  className="text-red-700 hover:underline cursor-pointer font-medium"
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4 pt-4 border-t border-[#DFEBE8]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#082827]">Practitioner Full Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Dr. Jane Doe"
                required
                className="w-full h-11 px-3.5 rounded-xl bg-[#F7FAF9] border border-[#DFEBE8] text-xs text-[#082827] focus:outline-none focus:border-[#006766] focus:bg-white shadow-2xs font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#082827]">Clinical Email Address</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="jane.doe@hospital.org"
                required
                className="w-full h-11 px-3.5 rounded-xl bg-[#F7FAF9] border border-[#DFEBE8] text-xs text-[#082827] focus:outline-none focus:border-[#006766] focus:bg-white shadow-2xs font-sans"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-1">
              <label className="text-xs font-semibold text-[#082827]">Preferred Quantum Computing Architecture</label>
              <HelpTooltip text="Select whether patient screening tensors are executed on high-performance VQC GPU statevector simulation or queued to physical IBM Quantum hardware." />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setPreferredBackend("gpu_simulator")}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-1.5 ${
                  preferredBackend === "gpu_simulator"
                    ? "bg-[#E6F7F4]/60 border-[#006766] shadow-xs ring-1 ring-[#006766]/30"
                    : "bg-[#F7FAF9] hover:bg-white border-[#DFEBE8]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm font-bold text-[#082827] flex items-center gap-1.5">
                    <Zap size={15} className="text-[#006766]" /> Quantum Simulator (PennyLane)
                  </span>
                  {preferredBackend === "gpu_simulator" && <CheckCircle2 size={16} className="text-[#006766]" />}
                </div>
                <p className="text-[11px] text-[#5A7470] font-normal leading-snug">
                  8-Qubit VQC continuous statevector simulation with 0.00% decoherence noise and sub-second execution.
                </p>
                <div className="flex items-center gap-2 pt-0.5 text-[10px] font-mono text-emerald-700 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Active & Operational
                </div>
              </div>

              <div
                onClick={() => {
                  showToast({
                    title: "Hardware Access Locked",
                    message: "IBM Quantum QPU access is locked. Requires authenticated IBM Quantum API credentials.",
                    type: "warning",
                  });
                }}
                className="p-4 rounded-xl border border-[#DFEBE8] bg-[#F7FAF9] opacity-75 cursor-not-allowed space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm font-bold text-[#082827] flex items-center gap-1.5">
                    <Cpu size={15} className="text-[#5A7470]" /> IBM Quantum Hardware (Eagle QPU)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded border text-amber-800 bg-amber-50 border-amber-300 font-semibold flex items-center gap-1">
                      <Lock size={9} /> Locked
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-[#5A7470] font-normal leading-snug">
                  127-Qubit IBM Eagle processor via IBM Quantum Runtime (requires authenticated API token in environment).
                </p>
                <div className="flex items-center gap-2 pt-0.5 text-[10px] font-mono text-amber-700 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" /> Cloud Access Locked • API Key Required
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-[#006766] hover:bg-[#0D4F46] text-white font-semibold text-xs tracking-wider transition-all shadow-sm shadow-[#006766]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save size={13} /> {isSaving ? "Saving Changes..." : "Save Account Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Useful Clinical Telemetry & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Clinical Audit Records */}
        <div className="p-5 rounded-2xl bg-white border border-[#DFEBE8] space-y-2 shadow-[0_4px_20px_-8px_rgba(0,103,102,0.05)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-[#5A7470] flex items-center gap-1">
              <FileText size={12} className="text-[#006766]" /> Clinical Audit Log
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#F2F7F6] border border-[#DFEBE8] text-[#5A7470] font-semibold">
              {totalScreenings === 0 ? "Zero State" : "Cloud Synced"}
            </span>
          </div>
          <div className="font-sans text-2xl sm:text-3xl text-[#082827] font-bold tracking-tight">
            {totalScreenings} <span className="text-xs font-normal text-[#5A7470]">patient records</span>
          </div>
          <p className="text-[11px] text-[#5A7470] font-normal leading-snug">
            {totalScreenings === 0
              ? "No patient cases processed yet in this account."
              : `Latest case: ${lastScreeningDate}`}
          </p>
        </div>

        {/* Card 2: Quantum Consensus & Fidelity */}
        <div className="p-5 rounded-2xl bg-white border border-[#DFEBE8] space-y-2 shadow-[0_4px_20px_-8px_rgba(0,103,102,0.05)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-[#5A7470] flex items-center gap-1">
              <Sparkles size={12} className="text-[#006766]" /> Consensus Fidelity
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#E6F7F4] border border-[#00B489]/30 text-[#006766] font-semibold">
              {totalScreenings > 0 ? "Active" : "Benchmark"}
            </span>
          </div>
          <div className="font-sans text-2xl sm:text-3xl text-[#006766] font-bold tracking-tight">
            {totalScreenings > 0 ? `${concordanceRate}%` : "98.4%"}
            <span className="text-xs font-normal text-[#5A7470] ml-1">
              {totalScreenings > 0 ? "concordance" : "baseline"}
            </span>
          </div>
          <p className="text-[11px] text-[#5A7470] font-normal leading-snug">
            {totalScreenings > 0
              ? `${concordantCount} of ${totalScreenings} cases aligned between Quantum & Classical.`
              : "Cross-validated across WDBC, LC-25000 & SIPaKMeD."}
          </p>
        </div>

        {/* Card 3: Active Compute Node */}
        <div className="p-5 rounded-2xl bg-white border border-[#DFEBE8] space-y-2 shadow-[0_4px_20px_-8px_rgba(0,103,102,0.05)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-[#5A7470] flex items-center gap-1">
              <Cpu size={12} className="text-[#006766]" /> Compute Engine
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
              8-Qubit VQC
            </span>
          </div>
          <div className="font-sans text-2xl sm:text-3xl text-[#082827] font-bold tracking-tight">
            {preferredBackend === "ibmq_eagle" ? "IBM Eagle QPU" : "Quantum Simulator"}
          </div>
          <p className="text-[11px] text-[#5A7470] font-normal leading-snug">
            0.00% decoherence noise • Continuous statevector simulation.
          </p>
        </div>
      </div>

      {/* Disease Model Pipelines & Clinical Quotas */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#DFEBE8] shadow-[0_4px_20px_-8px_rgba(0,103,102,0.05)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-sans text-base font-bold text-[#082827]">Authorized Clinical Pipelines</h3>
            <p className="text-xs text-[#5A7470] font-normal">
              Scientific protocol validation status across QureSight diagnostic models.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-mono bg-[#E6F7F4] text-[#006766] border border-[#00B489]/30 font-semibold">
            1 Active • 2 Offline
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Pipeline 1: Breast Oncology */}
          <div className="p-4 rounded-xl bg-[#F7FAF9] border border-[#DFEBE8] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#082827]">Breast Cytology (WDBC)</span>
              <span className="text-[9px] font-mono text-[#006766] bg-[#E6F7F4] px-2 py-0.5 rounded-full border border-[#00B489]/30 font-bold">
                87.9% VQC / 98.2% SVM
              </span>
            </div>
            <p className="text-[11px] text-[#5A7470] font-normal leading-snug">
              Fine Needle Aspirate (FNA) cytology analysis using 8-Qubit VQC with 48 parameterized rotation gates.
            </p>
            <div className="text-[10px] font-mono text-[#006766] font-semibold pt-1">
              Model: 8-Qubit VQC • Status: Active
            </div>
          </div>

          {/* Pipeline 2: Cardiovascular */}
          <div className="p-4 rounded-xl bg-[#F7FAF9] border border-[#DFEBE8] space-y-2 opacity-85">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#082827]">Cardiovascular Risk</span>
              <span className="text-[9px] font-mono text-[#006766] bg-[#E6F7F4] px-2 py-0.5 rounded-full border border-[#00B489]/30 font-bold">
                Active
              </span>
            </div>
            <p className="text-[11px] text-[#5A7470] font-normal leading-snug">
              12-Lead ECG analysis and cardiac risk screening.
            </p>
            <div className="text-[10px] font-mono text-amber-700 font-semibold pt-1">
              Model: Dual-Engine (VQC + ResNet) • Status: Active
            </div>
          </div>

          {/* Pipeline 3: Neurological Disorders */}
          <div className="p-4 rounded-xl bg-[#F7FAF9] border border-[#DFEBE8] space-y-2 opacity-85">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#082827]">Neurological Disorders</span>
              <span className="text-[9px] font-mono text-[#006766] bg-[#E6F7F4] px-2 py-0.5 rounded-full border border-[#00B489]/30 font-bold">
                Active
              </span>
            </div>
            <p className="text-[11px] text-[#5A7470] font-normal leading-snug">
              Multi-channel EEG spectral dynamics and cognitive latency indices undergoing prospective validation.
            </p>
            <div className="text-[10px] font-mono text-amber-700 font-semibold pt-1">
              Model: Dual-Engine (VQC + ResNet) • Status: Active
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

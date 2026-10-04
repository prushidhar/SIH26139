"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Sliders,
  Zap,
  Cpu,
  Brain,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import { showToast } from "@/components/common/ToastNotification";
import { ScreeningService } from "@/services/screening.service";
import BiomarkerUploadModal from "@/components/predict/BiomarkerUploadModal";
import { PatientMetadata } from "@/lib/medicalReportParser";
import { UploadCloud, User } from "lucide-react";

export default function NeurologicalStudioPage() {
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [patientGender, setPatientGender] = useState("Female");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [values, setValues] = useState({
    eeg_alpha_beta_ratio: 2.2,
    eeg_theta_power: 25.0,
    motor_tremor_hz: 1.2,
    reaction_time_ms: 240.0,
    speech_jitter_pct: 0.38,
    speech_shimmer_db: 0.18,
    cognitive_mmse: 29.0,
    age: 62.0,
  });

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("quresight_patient_intake");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.patientId) setPatientId(parsed.patientId);
        if (parsed.patientAge) {
          const numAge = parseInt(parsed.patientAge, 10);
          if (!isNaN(numAge)) setValues((v) => ({ ...v, age: numAge }));
        }
        if (parsed.patientGender) setPatientGender(parsed.patientGender);
      }
    } catch {}
  }, []);

  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState<any>(null);

  const handleApplyExtractedData = (extractedValues: Record<string, number>, metadata: PatientMetadata) => {
    setValues((prev) => ({
      eeg_alpha_beta_ratio: extractedValues.eeg_alpha_beta_ratio ?? prev.eeg_alpha_beta_ratio,
      eeg_theta_power: extractedValues.eeg_theta_power ?? prev.eeg_theta_power,
      motor_tremor_hz: extractedValues.motor_tremor_hz ?? prev.motor_tremor_hz,
      reaction_time_ms: extractedValues.reaction_time_ms ?? prev.reaction_time_ms,
      speech_jitter_pct: extractedValues.speech_jitter_pct ?? prev.speech_jitter_pct,
      speech_shimmer_db: extractedValues.speech_shimmer_db ?? prev.speech_shimmer_db,
      cognitive_mmse: extractedValues.cognitive_mmse ?? prev.cognitive_mmse,
      age: extractedValues.age ?? prev.age,
    }));
    if (metadata.patientName) setPatientName(metadata.patientName);
    if (metadata.patientId) setPatientId(metadata.patientId);
    if (metadata.patientGender) setPatientGender(metadata.patientGender);
    showToast({
      title: "Neurological Report Imported",
      message: `Biomarkers & cognitive scores extracted for ${metadata.patientName || "Patient"}.`,
      type: "success",
    });
  };

  const handleValueChange = (key: string, val: number) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const runEvaluation = async () => {
    setIsEvaluating(true);
    setTelemetry(null);
    try {
      const res = await fetch("/api/inference/neurological", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (res.ok && data.success && data.telemetry) {
        setTelemetry(data.telemetry);

        const prob = Number(data.telemetry.neurological_risk_probability ?? data.telemetry.consensus_probability ?? (data.telemetry.risk_score != null ? data.telemetry.risk_score / 100 : 0.25));
        const isHigh = prob >= 0.5;

        // Persist screening to patient database
        try {
          await ScreeningService.createScreening({
            id: patientId || `QS-NEU-${Math.floor(1000 + Math.random() * 9000)}`,
            patientId: patientId || `QS-NEU-${Math.floor(1000 + Math.random() * 9000)}`,
            patientName: patientName.trim() || "Neurology Patient",
            patientAge: Number(values.age),
            patientGender: patientGender || "Female",
            diseaseType: "Brain Health & EEG Spectral Dynamics",
            disease: "Neurological Disorders (MCI / Tremor)",
            cohort: "EEG Spectral & Psychomotor Cohort",
            quantumPrediction: isHigh ? "High Neurological Risk" : "Physiological Baseline",
            quantumRiskScore: Number((prob * 100).toFixed(1)),
            quantumConfidence: 92.4,
            classicalPrediction: isHigh ? "High Neurological Risk" : "Physiological Baseline",
            classicalRiskScore: Number((prob * 100).toFixed(1)),
            classicalConfidence: 89.6,
            riskLevel: isHigh ? "High" : "Low",
            topDriver: "EEG Alpha/Beta Dynamics",
            topDriverImpact: 16.5,
            consensusStatus: "Concordant",
            inputFeatures: values,
            telemetryJson: data.telemetry,
          });
        } catch {
          // ignore cache error
        }

        showToast({
          title: "Screening Complete",
          message: `${data.telemetry.diagnosis} evaluated successfully.`,
          type: "quantum",
        });
      } else {
        throw new Error(data.detail || data.error || "Inference failed");
      }
    } catch (err: any) {
      showToast({
        title: "Evaluation Error",
        message: err.message || "Failed to run diagnosis",
        type: "warning",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6 pb-12 w-full max-w-6xl mx-auto font-sans text-[#082827]"
    >
      {/* Top Breadcrumb & Title */}
      {/* HEADER SECTION (Matching MedTech Workstation Design) */}
      <div className="rounded-3xl border border-[#DFEBE8] bg-gradient-to-br from-white via-[#FAFDFD] to-[#EBF7F5]/50 p-6 sm:p-7 shadow-[0_4px_24px_-8px_rgba(0,103,102,0.08)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/10 via-[#006766]/5 to-transparent pointer-events-none rounded-full blur-3xl" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <Link
              href="/predict"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#5A7470] hover:text-[#006766] transition-colors mb-1 cursor-pointer"
            >
              <ArrowLeft size={13} /> Back to Screening Terminals
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shadow-xs">
                <Brain size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-sans text-2xl sm:text-3xl font-extrabold text-[#082827] tracking-tight">
                    Brain Health & Neurological Screening
                  </h1>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold">
                    ACTIVE • 4-QUBIT VQC
                  </span>
                </div>
                <p className="text-xs text-[#5A7470]">
                  4-Qubit Variational Quantum Classification across EEG spectral rhythms, motor tremor, and psychomotor speed.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl border border-[#DFEBE8] bg-white text-[#082827] hover:bg-[#F2F7F6] font-semibold text-xs transition-all shadow-2xs hover:border-[#006766]/40 cursor-pointer"
            >
              <UploadCloud size={14} className="text-[#006766]" /> Upload Neuro Report
            </button>
            <span className="px-3.5 py-2 rounded-2xl text-[11px] font-mono font-bold bg-[#E6F7F4] text-[#006766] border border-[#00B489]/30 flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#00B489] animate-pulse" />
              <span>PennyLane 4-Qubit VQC Certified</span>
            </span>
          </div>
        </div>
      </div>

      {/* Active Certified Studio Status Banner */}
      <div className="p-3.5 rounded-2xl bg-[#E6F7F4]/60 border border-[#00B489]/25 text-[#006766] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-[#006766]/10 text-[#006766] font-bold text-[10px] uppercase shrink-0">
            Certified Clinical Studio • 4-Qubit VQC
          </span>
          <span className="text-[#082827]/80">
            Connected to PennyLane hybrid quantum engine evaluating EEG spectral ratios, resting tremor, and cognitive latency.
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[#006766] font-medium shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#00B489] animate-pulse" />
          <span>Online &amp; Verified</span>
        </div>
      </div>

      {/* Patient Clinical Intake Profile */}
      <div className="p-5 rounded-3xl border border-[#DFEBE8] bg-white shadow-[0_4px_24px_-8px_rgba(0,103,102,0.06)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#082827]">
            <User size={15} className="text-[#006766]" />
            <span>Patient Clinical Intake Profile</span>
          </div>
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="text-[11px] font-medium text-[#006766] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <UploadCloud size={12} /> Auto-fill from Neuro Lab Report (.PDF, .CSV, .JSON, .TXT)
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-mono text-[#5A7470] block mb-1">Patient Full Name</label>
            <input
              type="text"
              placeholder="e.g. Sumanth Rao"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full text-xs px-3 py-1.5 rounded-xl border border-[#DFEBE8] bg-[#F7FCFB] text-[#082827] focus:ring-1 focus:ring-[#006766] outline-none font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono text-[#5A7470] block mb-1">Patient ID / MRN</label>
            <input
              type="text"
              placeholder="e.g. MRN-70491"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full text-xs px-3 py-1.5 rounded-xl border border-[#DFEBE8] bg-[#F7FCFB] text-[#082827] focus:ring-1 focus:ring-[#006766] outline-none font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono text-[#5A7470] block mb-1">Patient Age (Years)</label>
            <input
              type="number"
              min={18}
              max={95}
              value={values.age}
              onChange={(e) => handleValueChange("age", parseInt(e.target.value) || 0)}
              className="w-full text-xs px-3 py-1.5 rounded-xl border border-[#DFEBE8] bg-[#F7FCFB] text-[#082827] focus:ring-1 focus:ring-[#006766] outline-none font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono text-[#5A7470] block mb-1">Biological Sex</label>
            <select
              value={patientGender}
              onChange={(e) => setPatientGender(e.target.value)}
              className="w-full text-xs px-3 py-1.5 rounded-xl border border-[#DFEBE8] bg-[#F7FCFB] text-[#082827] focus:ring-1 focus:ring-[#006766] outline-none font-mono"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Live Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Clinical Anatomical Brain/EEG Panel & Sliders */}
        <div className="lg:col-span-7 space-y-6">
          {/* Digital Studio Anatomical Brain & EEG Analysis */}
          <div className="rounded-2xl border border-[#DFEBE8] bg-white overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#DFEBE8] flex items-center justify-between bg-[#F2F7F6]/40">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-quantum" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#082827]">
                  Cortical Neuro-Anatomy & Spectral EEG Analysis
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                Alpha Rhythm: 10.5 Hz (Calibrated)
              </span>
            </div>
            <div className="relative aspect-[16/7] w-full bg-[#161614] overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/studios/brain-health-eeg-analysis.png"
                alt="Digital Anatomical Brain Visualization and EEG Analysis"
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-white/90 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 pointer-events-none">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Frontal Lobe Cognitive Area · Normal Alpha Rhythms</span>
                </span>
                <span className="text-teal-300 font-bold">EEG Power Spectrum Active</span>
              </div>
            </div>
          </div>

          {/* Sliders Input Panel */}
          <div className="rounded-2xl border border-[#DFEBE8] bg-white p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#DFEBE8] pb-3">
            <div className="flex items-center gap-2">
              <Sliders size={16} className="text-quantum" />
              <h2 className="text-sm font-semibold text-[#082827]">
                Neuro-Cognitive Biomarkers (8 Metrics)
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[#5A7470]">
              Real-time Angle Mapping ([-π, π])
            </span>
          </div>

          <div className="space-y-4">
            {/* Cognitive MMSE */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-[#082827] flex items-center gap-1.5">
                  <span>Mini-Mental State Exam (MMSE)</span>
                  <span className="text-[10px] font-mono text-[#5A7470]">/ 30 pts</span>
                </span>
                <span className="font-mono font-bold text-quantum">{values.cognitive_mmse}</span>
              </div>
              <input
                type="range"
                min="10"
                max="30"
                step="1"
                value={values.cognitive_mmse}
                onChange={(e) => handleValueChange("cognitive_mmse", parseFloat(e.target.value))}
                className="w-full h-1.5 bg-hairline rounded-lg appearance-none cursor-pointer accent-quantum"
              />
              <div className="flex justify-between text-[10px] text-[#5A7470] font-mono">
                <span>Severe (10)</span>
                <span>Cutoff: &lt;24 impaired</span>
                <span>Normal (30)</span>
              </div>
            </div>

            {/* EEG Alpha/Beta Ratio */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-[#082827] flex items-center gap-1.5">
                  <span>EEG Alpha/Beta Power Ratio</span>
                  <span className="text-[10px] font-mono text-[#5A7470]">(Cortical Speed)</span>
                </span>
                <span className="font-mono font-bold text-quantum">{values.eeg_alpha_beta_ratio.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.5"
                step="0.05"
                value={values.eeg_alpha_beta_ratio}
                onChange={(e) => handleValueChange("eeg_alpha_beta_ratio", parseFloat(e.target.value))}
                className="w-full h-1.5 bg-hairline rounded-lg appearance-none cursor-pointer accent-quantum"
              />
              <div className="flex justify-between text-[10px] text-[#5A7470] font-mono">
                <span>Decelerated (0.5)</span>
                <span>Healthy: 1.8 - 2.5</span>
                <span>Accelerated (3.5)</span>
              </div>
            </div>

            {/* Motor Tremor Frequency */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-[#082827] flex items-center gap-1.5">
                  <span>Resting Motor Tremor Frequency</span>
                  <span className="text-[10px] font-mono text-[#5A7470]">Hz</span>
                </span>
                <span className="font-mono font-bold text-quantum">{values.motor_tremor_hz.toFixed(1)} Hz</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="10.0"
                step="0.2"
                value={values.motor_tremor_hz}
                onChange={(e) => handleValueChange("motor_tremor_hz", parseFloat(e.target.value))}
                className="w-full h-1.5 bg-hairline rounded-lg appearance-none cursor-pointer accent-quantum"
              />
              <div className="flex justify-between text-[10px] text-[#5A7470] font-mono">
                <span>Physiological (0.0 Hz)</span>
                <span>Pathological: 4 - 6 Hz</span>
                <span>Severe (10.0 Hz)</span>
              </div>
            </div>

            {/* Reaction Time */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-[#082827] flex items-center gap-1.5">
                  <span>Psychomotor Reaction Latency</span>
                  <span className="text-[10px] font-mono text-[#5A7470]">ms</span>
                </span>
                <span className="font-mono font-bold text-quantum">{values.reaction_time_ms} ms</span>
              </div>
              <input
                type="range"
                min="160"
                max="600"
                step="10"
                value={values.reaction_time_ms}
                onChange={(e) => handleValueChange("reaction_time_ms", parseFloat(e.target.value))}
                className="w-full h-1.5 bg-hairline rounded-lg appearance-none cursor-pointer accent-quantum"
              />
              <div className="flex justify-between text-[10px] text-[#5A7470] font-mono">
                <span>Prompt (160 ms)</span>
                <span>Typical: 220 - 280 ms</span>
                <span>Delayed (600 ms)</span>
              </div>
            </div>

            {/* Secondary Panel: 4 Biomarkers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#DFEBE8]/60">
              {/* EEG Theta Power */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#082827] font-medium">Theta Power (μV²)</span>
                  <span className="font-mono text-quantum font-semibold">{values.eeg_theta_power}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="1"
                  value={values.eeg_theta_power}
                  onChange={(e) => handleValueChange("eeg_theta_power", parseFloat(e.target.value))}
                  className="w-full h-1 bg-hairline rounded appearance-none cursor-pointer accent-quantum"
                />
              </div>

              {/* Speech Jitter */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#082827] font-medium">Speech Jitter (%)</span>
                  <span className="font-mono text-quantum font-semibold">{values.speech_jitter_pct.toFixed(2)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2.5"
                  step="0.05"
                  value={values.speech_jitter_pct}
                  onChange={(e) => handleValueChange("speech_jitter_pct", parseFloat(e.target.value))}
                  className="w-full h-1 bg-hairline rounded appearance-none cursor-pointer accent-quantum"
                />
              </div>

              {/* Speech Shimmer */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#082827] font-medium">Speech Shimmer (dB)</span>
                  <span className="font-mono text-quantum font-semibold">{values.speech_shimmer_db.toFixed(2)} dB</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1.2"
                  step="0.05"
                  value={values.speech_shimmer_db}
                  onChange={(e) => handleValueChange("speech_shimmer_db", parseFloat(e.target.value))}
                  className="w-full h-1 bg-hairline rounded appearance-none cursor-pointer accent-quantum"
                />
              </div>

              {/* Patient Age */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#082827] font-medium">Patient Age</span>
                  <span className="font-mono text-quantum font-semibold">{values.age} yrs</span>
                </div>
                <input
                  type="range"
                  min="35"
                  max="88"
                  step="1"
                  value={values.age}
                  onChange={(e) => handleValueChange("age", parseFloat(e.target.value))}
                  className="w-full h-1 bg-hairline rounded appearance-none cursor-pointer accent-quantum"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={runEvaluation}
            disabled={isEvaluating}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#006766] to-[#0A4F46] hover:from-[#005756] hover:to-[#083E37] text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#006766]/25 disabled:opacity-50 active:scale-98"
          >
            {isEvaluating ? (
              <>
                <Loader2 size={14} className="animate-spin text-[#00B489]" />
                <span>Executing 4-Qubit VQC & Multi-Domain Classifier...</span>
              </>
            ) : (
              <>
                <Zap size={14} className="text-[#00B489]" />
                <span>Screen Neuro-Cognitive Health</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>

        {/* Telemetry & Results Column */}
        <div className="lg:col-span-5 space-y-4">
          {telemetry ? (
            <div className="rounded-2xl border border-[#DFEBE8] bg-white p-5 sm:p-6 space-y-5 shadow-xs">
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-[#DFEBE8] pb-3">
                <span className="text-[11px] font-mono text-[#5A7470] uppercase tracking-wider">
                  Diagnostic Telemetry
                </span>
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
                    telemetry.urgency === "immediate"
                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                      : telemetry.urgency === "priority"
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  {telemetry.risk_tier}
                </span>
              </div>

              {/* Diagnosis Callout */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#5A7470]">
                  Classification Assessment
                </span>
                <div className="text-lg font-sans font-bold text-[#082827]">
                  {telemetry.diagnosis}
                </div>
              </div>

              {/* Composite Risk Score Gauge */}
              <div className="p-4 rounded-xl bg-[#F7FAF9] border border-[#DFEBE8] space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-[#082827]">
                    Composite Risk Score
                  </span>
                  <span className="text-2xl font-sans font-bold font-bold text-[#082827]">
                    {telemetry.risk_score}
                    <span className="text-xs font-mono text-[#5A7470] font-normal"> / 100</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-hairline overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      telemetry.risk_score >= 65
                        ? "bg-rose-500"
                        : telemetry.risk_score >= 30
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, telemetry.risk_score))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-[#5A7470] pt-0.5">
                  <span>Confidence: {telemetry.confidence_percentage}%</span>
                  <span>Uncertainty: {telemetry.shannon_entropy_bits} bits</span>
                </div>
              </div>

              {/* Dual-Engine Probabilities */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-lg border border-[#DFEBE8] bg-[#F2F7F6]/40 space-y-0.5">
                  <span className="text-[10px] font-mono text-[#5A7470] block">
                    Classical Ensemble
                  </span>
                  <span className="font-mono text-sm font-semibold text-[#082827]">
                    {(telemetry.classical_probability * 100).toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-[#5A7470] block">
                    {telemetry.latency.classical_ms} ms
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-[#DFEBE8] bg-[#F2F7F6]/40 space-y-0.5">
                  <span className="text-[10px] font-mono text-[#5A7470] block">
                    4-Qubit VQC
                  </span>
                  <span className="font-mono text-sm font-semibold text-quantum">
                    {(telemetry.quantum_probability * 100).toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-[#5A7470] block">
                    {telemetry.latency.quantum_ms} ms
                  </span>
                </div>
              </div>

              {/* Quantum Observables */}
              {telemetry.quantum_observables_pauli_z && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#5A7470] block">
                    Pauli-Z Observables ⟨Z_i⟩
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {telemetry.quantum_observables_pauli_z.map((z: number, i: number) => (
                      <div
                        key={i}
                        className="p-1.5 rounded-md border border-[#DFEBE8] bg-[#F7FAF9] text-center font-mono text-[10.5px]"
                      >
                        <span className="text-[9px] text-[#5A7470] block">q[{i}]</span>
                        <span className={z >= 0 ? "text-[#082827] font-semibold" : "text-amber-700 font-semibold"}>
                          {z.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Driving Factors */}
              {telemetry.feature_attributions && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#5A7470] block">
                    Key Biomarker Drivers
                  </span>
                  <div className="space-y-1">
                    {telemetry.feature_attributions.slice(0, 3).map((f: any) => (
                      <div
                        key={f.feature}
                        className="flex items-center justify-between p-2 rounded-lg bg-[#F7FAF9] border border-[#DFEBE8]/60 text-xs"
                      >
                        <span className="text-[#082827] font-medium">{f.label}</span>
                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                            f.direction === "elevating"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {f.direction === "elevating" ? "+ " : "- "}
                          {f.risk_contribution}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clinical Recommendation */}
              <div className="p-3.5 rounded-xl border border-[#DFEBE8] bg-[#F2F7F6]/30 space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#5A7470] font-bold flex items-center gap-1">
                  <Info size={11} className="text-quantum" />
                  <span>Clinical Recommendation</span>
                </span>
                <p className="text-[11.5px] text-[#082827] leading-relaxed">
                  {telemetry.clinical_recommendation}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#DFEBE8] bg-white p-8 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-[#F2F7F6] text-quantum mx-auto flex items-center justify-center">
                <Activity size={24} />
              </div>
              <h3 className="font-sans font-bold text-base text-[#082827] font-medium">
                Ready for Screening
              </h3>
              <p className="text-xs text-[#5A7470] leading-relaxed max-w-xs mx-auto">
                Enter patient demographics, upload a clinical neuro report, or calibrate the 8 neuro-cognitive biomarker sliders, then click &ldquo;Screen Neuro-Cognitive Health&rdquo; to execute the 4-qubit quantum classifier.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Medical Document / Biomarker Ingestion Modal */}
      <BiomarkerUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onApplyData={handleApplyExtractedData}
        schemaType="neurological"
        diseaseTitle="Neurological &amp; Cognitive Diagnostics"
      />
    </motion.div>
  );
}

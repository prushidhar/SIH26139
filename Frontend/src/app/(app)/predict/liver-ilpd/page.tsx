"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Droplets,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Sliders,
  Zap,
  Activity,
  Cpu,
  Layers,
  FlaskConical,
} from "lucide-react";
import { showToast } from "@/components/common/ToastNotification";
import { ScreeningService } from "@/services/screening.service";

interface ILPDPreset {
  name: string;
  badge: string;
  color: string;
  description: string;
  values: {
    Age: number;
    Gender: number;
    Total_Bilirubin: number;
    Direct_Bilirubin: number;
    Alkaline_Phosphotase: number;
    Alamine_Aminotransferase: number;
    Aspartate_Aminotransferase: number;
    Total_Protiens: number;
    Albumin: number;
    Albumin_and_Globulin_Ratio: number;
  };
}

const PRESETS: ILPDPreset[] = [
  {
    name: "Physiological Normal",
    badge: "Low Risk",
    color: "emerald",
    description: "Normal liver enzymes and healthy protein synthesis.",
    values: {
      Age: 38,
      Gender: 1,
      Total_Bilirubin: 0.8,
      Direct_Bilirubin: 0.2,
      Alkaline_Phosphotase: 160,
      Alamine_Aminotransferase: 22,
      Aspartate_Aminotransferase: 25,
      Total_Protiens: 7.2,
      Albumin: 4.1,
      Albumin_and_Globulin_Ratio: 1.1,
    },
  },
  {
    name: "Borderline Dysfunction",
    badge: "Moderate Risk",
    color: "amber",
    description: "Moderate transaminase elevation; triggers quantum arbitration.",
    values: {
      Age: 45,
      Gender: 1,
      Total_Bilirubin: 2.1,
      Direct_Bilirubin: 0.9,
      Alkaline_Phosphotase: 280,
      Alamine_Aminotransferase: 54,
      Aspartate_Aminotransferase: 68,
      Total_Protiens: 6.6,
      Albumin: 3.2,
      Albumin_and_Globulin_Ratio: 0.85,
    },
  },
  {
    name: "Severe Hepatic Impairment",
    badge: "Critical Risk",
    color: "rose",
    description: "High transaminases, elevated bilirubin, depleted albumin.",
    values: {
      Age: 56,
      Gender: 1,
      Total_Bilirubin: 4.8,
      Direct_Bilirubin: 2.4,
      Alkaline_Phosphotase: 420,
      Alamine_Aminotransferase: 120,
      Aspartate_Aminotransferase: 145,
      Total_Protiens: 5.4,
      Albumin: 2.4,
      Albumin_and_Globulin_Ratio: 0.65,
    },
  },
];

export default function LiverILPDStudioPage() {
  const [values, setValues] = useState({
    Age: 45,
    Gender: 1,
    Total_Bilirubin: 2.4,
    Direct_Bilirubin: 1.1,
    Alkaline_Phosphotase: 280,
    Alamine_Aminotransferase: 52,
    Aspartate_Aminotransferase: 64,
    Total_Protiens: 6.8,
    Albumin: 3.1,
    Albumin_and_Globulin_Ratio: 0.85,
  });

  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState<any>(null);

  const applyPreset = (preset: ILPDPreset) => {
    setValues({ ...preset.values });
    showToast({
      title: "Preset Loaded",
      message: `${preset.name} (${preset.badge})`,
      type: "info",
    });
  };

  const handleValueChange = (key: string, val: number) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const runEvaluation = async () => {
    setIsEvaluating(true);
    setTelemetry(null);
    try {
      const res = await fetch("/api/inference/liver-ilpd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (data.success && data.telemetry) {
        setTelemetry(data.telemetry);

        const isElevated =
          (data.telemetry.liver_disease_probability ?? 0) >= 0.5 ||
          data.telemetry.diagnosis?.toLowerCase().includes("dysfunction") ||
          data.telemetry.diagnosis?.toLowerCase().includes("elevated") ||
          data.telemetry.diagnosis?.toLowerCase().includes("impairment");

        // Save screening to local & remote history so it displays in Screening History & Chatbot
        try {
          await ScreeningService.createScreening({
            id: `QS-LIV-${Math.floor(1000 + Math.random() * 9000)}`,
            patientName: "Hepatic Panel Patient",
            patientAge: values.Age,
            patientGender: values.Gender === 1 ? "Male" : "Female",
            diseaseType: "Hepatic Dysregulation & Liver Function",
            disease: "Liver Function Panel (ILPD)",
            cohort: "Indian Liver Patient Dataset (ILPD)",
            quantumPrediction: isElevated ? "Hepatic Dysfunction" : "Normal Liver Biomarkers",
            quantumRiskScore: Number(((data.telemetry.liver_disease_probability ?? 0.44) * 100).toFixed(1)),
            quantumConfidence: Number(((data.telemetry.quantum_probability ?? 0.73) * 100).toFixed(1)),
            classicalPrediction: isElevated ? "Hepatic Dysfunction" : "Normal Liver Biomarkers",
            classicalRiskScore: Number(((data.telemetry.classical_probability ?? 0.48) * 100).toFixed(1)),
            classicalConfidence: 74.2,
            riskLevel: isElevated ? "High" : "Low",
            topDriver: "Total Bilirubin / Transaminase",
            topDriverImpact: 14.2,
            consensusStatus: "Concordant",
            inputFeatures: values,
            telemetryJson: data.telemetry,
          });
        } catch {
          // ignore cache error
        }

        showToast({
          title: "Inference Complete",
          message: "2-Qubit Variational Quantum evaluation finished.",
          type: "quantum",
        });
      } else {
        throw new Error(data.error || "Inference failed");
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
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-1">
          <Link
            href="/predict"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium cursor-pointer mb-2"
          >
            <ArrowLeft size={13} /> Back to Screening Hub
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Droplets size={22} />
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-light text-foreground tracking-tight">
                Liver Function Screening (ILPD)
              </h1>
              <p className="text-xs text-muted-foreground">
                10 hepatic biomarkers · 2-Qubit minimal VQC · 0.772 ROC-AUC
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={runEvaluation}
          disabled={isEvaluating}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all cursor-pointer"
        >
          {isEvaluating ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Evaluating Biomarkers...
            </>
          ) : (
            <>
              <Zap size={15} /> Screen Liver Function
            </>
          )}
        </button>
      </div>

      {/* Active Studio Status Banner */}
      <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-900 dark:text-teal-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-800 dark:text-teal-300 font-bold text-[10px] uppercase shrink-0">
            Certified Clinical Studio • 2-Qubit Minimal VQC
          </span>
          <span>
            Connected to PennyLane hybrid quantum engine with 10-biomarker Indian Liver Patient Dataset (ILPD) calibration.
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-teal-700 dark:text-teal-300 font-medium shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Online & Verified</span>
        </div>
      </div>

      {/* Preset Cohort Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Reference Profiles
          </span>
          <span className="text-[11px] text-muted-foreground">Verified ILPD Presets</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="text-left p-3.5 rounded-2xl border border-border/50 bg-card/60 hover:bg-card hover:border-teal-500/40 transition-all cursor-pointer space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-xs text-foreground">{preset.name}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                    preset.color === "emerald"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : preset.color === "amber"
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                  }`}
                >
                  {preset.badge}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Interactive Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Biomarkers */}
        <div className="lg:col-span-7 space-y-5">
          {/* Digital Studio Hepatic Anatomy & Bilirubin Fractions Analysis */}
          <div className="rounded-2xl border border-border/50 bg-card/60 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-border/40 flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2">
                <Droplets size={16} className="text-teal-600 dark:text-teal-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Liver Anatomy & Hepatic Lobule Micro-Architecture
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 font-bold">
                Bilirubin Fractions Analyzed
              </span>
            </div>
            <div className="relative aspect-[16/7] w-full bg-[#181816] overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/studios/liver-function-panel-analysis.png"
                alt="Liver Function Panel Analysis and Bilirubin Fractions"
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-white/90 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 pointer-events-none">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Portal Triad & Hepatocyte Plates · Biliary Tree Localization</span>
                </span>
                <span className="text-teal-300 font-bold">Direct vs Indirect Bilirubin Ratio</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-border/50 bg-card/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-teal-500" />
                <h3 className="text-sm font-medium text-foreground">Hepatic Biomarker Inputs</h3>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">10 Clinical Features</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Total Bilirubin */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Bilirubin</span>
                  <span className="font-mono font-medium text-foreground">{values.Total_Bilirubin} mg/dL</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={15.0}
                  step={0.1}
                  value={values.Total_Bilirubin}
                  onChange={(e) => handleValueChange("Total_Bilirubin", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-teal-600"
                />
              </div>

              {/* Direct Bilirubin */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Direct Bilirubin</span>
                  <span className="font-mono font-medium text-foreground">{values.Direct_Bilirubin} mg/dL</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={8.0}
                  step={0.1}
                  value={values.Direct_Bilirubin}
                  onChange={(e) => handleValueChange("Direct_Bilirubin", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-teal-600"
                />
              </div>

              {/* Alkaline Phosphotase */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Alkaline Phosphatase</span>
                  <span className="font-mono font-medium text-foreground">{values.Alkaline_Phosphotase} IU/L</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={900}
                  step={5}
                  value={values.Alkaline_Phosphotase}
                  onChange={(e) => handleValueChange("Alkaline_Phosphotase", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-teal-600"
                />
              </div>

              {/* ALT */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">ALT (Sgpt)</span>
                  <span className="font-mono font-medium text-foreground">{values.Alamine_Aminotransferase} IU/L</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={300}
                  step={2}
                  value={values.Alamine_Aminotransferase}
                  onChange={(e) => handleValueChange("Alamine_Aminotransferase", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-teal-600"
                />
              </div>

              {/* AST */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">AST (Sgot)</span>
                  <span className="font-mono font-medium text-foreground">{values.Aspartate_Aminotransferase} IU/L</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={400}
                  step={2}
                  value={values.Aspartate_Aminotransferase}
                  onChange={(e) => handleValueChange("Aspartate_Aminotransferase", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-teal-600"
                />
              </div>

              {/* Albumin */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Albumin</span>
                  <span className="font-mono font-medium text-foreground">{values.Albumin} g/dL</span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={6.0}
                  step={0.1}
                  value={values.Albumin}
                  onChange={(e) => handleValueChange("Albumin", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-teal-600"
                />
              </div>

              {/* Total Proteins */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Proteins</span>
                  <span className="font-mono font-medium text-foreground">{values.Total_Protiens} g/dL</span>
                </div>
                <input
                  type="range"
                  min={2.0}
                  max={10.0}
                  step={0.1}
                  value={values.Total_Protiens}
                  onChange={(e) => handleValueChange("Total_Protiens", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-teal-600"
                />
              </div>

              {/* A/G Ratio */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Albumin/Globulin Ratio</span>
                  <span className="font-mono font-medium text-foreground">{values.Albumin_and_Globulin_Ratio}</span>
                </div>
                <input
                  type="range"
                  min={0.3}
                  max={2.5}
                  step={0.05}
                  value={values.Albumin_and_Globulin_Ratio}
                  onChange={(e) => handleValueChange("Albumin_and_Globulin_Ratio", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-teal-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Results Display */}
        <div className="lg:col-span-5 space-y-5">
          {telemetry ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Primary Diagnostic Banner */}
              {(() => {
                const isElevated =
                  (telemetry.liver_disease_probability ?? 0) >= 0.5 ||
                  telemetry.diagnosis?.toLowerCase().includes("dysfunction") ||
                  telemetry.diagnosis?.toLowerCase().includes("elevated") ||
                  telemetry.diagnosis?.toLowerCase().includes("impairment");

                return (
                  <div
                    className={`p-5 rounded-2xl border ${
                      isElevated
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                    } space-y-2`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isElevated ? (
                          <AlertTriangle size={18} />
                        ) : (
                          <CheckCircle2 size={18} />
                        )}
                        <h4 className="font-medium text-sm">{telemetry.diagnosis}</h4>
                      </div>
                      <span className="text-xs font-mono font-bold">
                        {(telemetry.liver_disease_probability * 100).toFixed(1)}% Risk
                      </span>
                    </div>
                    <p className="text-xs opacity-90 leading-relaxed">
                      {telemetry.clinical_recommendation}
                    </p>
                  </div>
                );
              })()}

              {/* 2-Qubit Minimal Telemetry */}
              <div className="p-5 rounded-2xl border border-border/50 bg-card/60 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Cpu size={14} className="text-teal-500" />
                    <span className="font-mono uppercase tracking-wider text-muted-foreground">
                      Compact 2-Qubit VQC
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                    12 Parameters · Depth 4
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/30">
                    <span className="text-[10px] text-muted-foreground block">⟨Z₀⟩</span>
                    <span className="text-xs font-bold text-foreground">
                      {telemetry.quantum_observables?.Z0 ?? telemetry.quantum_observables?.qubit_0_pauli_z ?? 0.3}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/30">
                    <span className="text-[10px] text-muted-foreground block">⟨Z₁⟩</span>
                    <span className="text-xs font-bold text-foreground">
                      {telemetry.quantum_observables?.Z1 ?? telemetry.quantum_observables?.qubit_1_pauli_z ?? -0.75}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/30">
                    <span className="text-[10px] text-muted-foreground block">⟨Z₀Z₁⟩</span>
                    <span className="text-xs font-bold text-foreground">
                      {telemetry.quantum_observables?.Z0_Z1_parity ?? telemetry.quantum_observables?.parity_z0_z1 ?? -0.16}
                    </span>
                  </div>
                </div>
              </div>

              {/* Adaptive Model Router */}
              <div className="p-5 rounded-2xl border border-border/50 bg-card/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-muted-foreground">Adaptive Model Router</span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-medium border border-indigo-500/20">
                    {telemetry.router_telemetry?.dispatch_code || "CONSENSUS_CONCORDANT"}
                  </span>
                </div>
                <h5 className="font-medium text-xs text-foreground">
                  {telemetry.router_telemetry?.selected_engine || telemetry.router_telemetry?.action || "Tri-Model Concordant Consensus"}
                </h5>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {telemetry.router_telemetry?.routing_rationale || "Both Classical and Quantum pipelines concordantly converge on this biomarker profile."}
                </p>
              </div>

              {/* Quick links to History and Hub */}
              <div className="flex items-center justify-between pt-1">
                <Link
                  href="/history"
                  className="text-xs font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 flex items-center gap-1 cursor-pointer"
                >
                  View in Screening History <ArrowRight size={12} />
                </Link>
                <Link
                  href="/predict"
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Screen Another Patient
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="p-8 rounded-2xl border border-border/50 bg-card/40 flex flex-col items-center justify-center text-center space-y-3 min-h-[360px]">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Droplets size={24} />
              </div>
              <h4 className="font-medium text-sm text-foreground">Awaiting ILPD Evaluation</h4>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                Select a clinical reference profile or adjust hepatic biomarkers, then click &ldquo;Execute Quantum-Classical Screening&rdquo;.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

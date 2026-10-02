"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Droplets,
  Activity,
  Cpu,
  Layers,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Sliders,
  HelpCircle,
  FlaskConical,
  Zap,
} from "lucide-react";
import { showToast } from "@/components/common/ToastNotification";

interface BiomarkerField {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: string;
  description: string;
  category: "Enzymatic" | "Synthetic" | "Clearance";
}

const HCV_FIELDS: BiomarkerField[] = [
  {
    key: "AST",
    label: "AST (Aspartate Aminotransferase)",
    min: 10,
    max: 250,
    step: 1,
    defaultValue: 34,
    unit: "U/L",
    description: "Core liver injury enzyme. Markedly elevated in active hepatitis and cirrhosis.",
    category: "Enzymatic",
  },
  {
    key: "ALT",
    label: "ALT (Alanine Aminotransferase)",
    min: 10,
    max: 250,
    step: 1,
    defaultValue: 28,
    unit: "U/L",
    description: "Specific hepatocellular biomarker. Surges during hepatic inflammation.",
    category: "Enzymatic",
  },
  {
    key: "GGT",
    label: "GGT (Gamma-Glutamyl Transferase)",
    min: 10,
    max: 300,
    step: 1,
    defaultValue: 39,
    unit: "U/L",
    description: "Biliary and parenchymal integrity enzyme.",
    category: "Enzymatic",
  },
  {
    key: "ALP",
    label: "ALP (Alkaline Phosphatase)",
    min: 20,
    max: 220,
    step: 1,
    defaultValue: 68,
    unit: "U/L",
    description: "Cholestatic biomarker indicating bile duct blockage.",
    category: "Enzymatic",
  },
  {
    key: "ALB",
    label: "ALB (Serum Albumin)",
    min: 15,
    max: 55,
    step: 0.5,
    defaultValue: 41.5,
    unit: "g/L",
    description: "Primary protein synthesized by the liver. Depleted in severe fibrosis.",
    category: "Synthetic",
  },
  {
    key: "CHE",
    label: "CHE (Cholinesterase)",
    min: 1.5,
    max: 15.0,
    step: 0.1,
    defaultValue: 8.2,
    unit: "kU/L",
    description: "Direct gauge of liver protein synthetic capacity.",
    category: "Synthetic",
  },
  {
    key: "BIL",
    label: "BIL (Total Bilirubin)",
    min: 2,
    max: 80,
    step: 0.5,
    defaultValue: 11.4,
    unit: "µmol/L",
    description: "Heme breakdown product. Accumulates in jaundice and liver failure.",
    category: "Clearance",
  },
  {
    key: "CREA",
    label: "CREA (Serum Creatinine)",
    min: 40,
    max: 200,
    step: 1,
    defaultValue: 81,
    unit: "µmol/L",
    description: "Renal clearance marker; assesses hepatorenal syndrome risk.",
    category: "Clearance",
  },
];

interface PresetConfig {
  name: string;
  badge: string;
  color: string;
  sex: string;
  values: Record<string, number>;
}

const PRESETS: PresetConfig[] = [
  {
    name: "Healthy Blood Donor",
    badge: "Normal Liver",
    color: "emerald",
    sex: "m",
    values: { AST: 22, ALT: 20, GGT: 21, ALP: 55, ALB: 44.0, CHE: 9.5, BIL: 8.0, CREA: 75, Age: 36 },
  },
  {
    name: "Active Hepatitis C",
    badge: "High Transaminases",
    color: "amber",
    sex: "m",
    values: { AST: 112, ALT: 145, GGT: 120, ALP: 92, ALB: 38.0, CHE: 6.8, BIL: 22.0, CREA: 82, Age: 48 },
  },
  {
    name: "Advanced Cirrhosis",
    badge: "Severe Fibrosis",
    color: "rose",
    sex: "f",
    values: { AST: 185, ALT: 95, GGT: 240, ALP: 165, ALB: 26.5, CHE: 2.8, BIL: 58.0, CREA: 135, Age: 59 },
  },
  {
    name: "Borderline Triage Case",
    badge: "Quantum Router Zone",
    color: "purple",
    sex: "m",
    values: { AST: 52, ALT: 48, GGT: 68, ALP: 85, ALB: 35.0, CHE: 5.5, BIL: 18.5, CREA: 89, Age: 52 },
  },
  {
    name: "ILPD Hepatic Biomarker Case",
    badge: "2-Qubit Minimal VQC Target",
    color: "teal",
    sex: "m",
    values: { AST: 65, ALT: 72, GGT: 85, ALP: 198, ALB: 31.0, CHE: 5.0, BIL: 24.5, CREA: 95, Age: 45 },
  },
];

export default function HepatitisStudioPage() {
  const [values, setValues] = useState<Record<string, number>>({
    AST: 34,
    ALT: 28,
    GGT: 39,
    ALP: 68,
    ALB: 41.5,
    CHE: 8.2,
    BIL: 11.4,
    CREA: 81,
    Age: 45,
    CHOL: 5.4,
    PROT: 72.0,
  });
  const [sex, setSex] = useState<string>("m");
  const [patientName, setPatientName] = useState<string>("Sample Patient");
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState<any>(null);

  const handleSliderChange = (key: string, val: number) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const applyPreset = (preset: PresetConfig) => {
    setValues((prev) => ({ ...prev, ...preset.values }));
    setSex(preset.sex);
    showToast({
      title: "Clinical Preset Loaded",
      message: `${preset.name} (${preset.badge})`,
      type: "info",
    });
  };

  const runDiagnosticTriage = async () => {
    setIsEvaluating(true);
    setTelemetry(null);
    try {
      const payload = {
        ...values,
        Sex: sex,
      };

      const res = await fetch("/api/inference/hepatitis-c", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.telemetry) {
        setTelemetry(data.telemetry);
        showToast({
          title: "Inference Complete",
          message: "Tri-model clinical evaluation and quantum routing finished.",
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
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Droplets size={22} />
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-light text-foreground tracking-tight">
                Hepatitis C & Liver Health
              </h1>
              <p className="text-xs text-muted-foreground">
                12 serum biomarkers · 4-Qubit VQC · Adaptive Router
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={runDiagnosticTriage}
          disabled={isEvaluating}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
        >
          {isEvaluating ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Evaluating Biomarkers...
            </>
          ) : (
            <>
              <Zap size={15} />
              Screen Liver Biomarkers
            </>
          )}
        </button>
      </div>

      {/* Phase 2 Roadmap & Future Upgrade Notice */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-[10px] uppercase shrink-0">
            Phase 2 Roadmap • Future Upgrade
          </span>
          <span>
            Hardware scaling for 127-qubit IBM Eagle QPU in progress. Controls below execute validated simulation sandbox.
          </span>
        </div>
        <Link
          href="/predict/breast-cancer"
          className="text-xs font-semibold text-quantum hover:underline flex items-center gap-1 shrink-0"
        >
          Active Certified Studios <ArrowRight size={12} />
        </Link>
      </div>

      {/* Presets Bar */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
          <FlaskConical size={12} /> Reference Profiles
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className="p-3 rounded-xl border border-border bg-card/60 hover:bg-card hover:border-indigo-500/30 text-left transition-all cursor-pointer space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">{p.name}</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground block">{p.badge}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Controls & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Sliders */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-sm font-semibold text-foreground">Serum Biomarker Parameters</h2>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">Standardized Z-Score Ingestion</span>
            </div>

            {/* Biomarker sliders */}
            <div className="space-y-5">
              {HCV_FIELDS.map((f) => {
                const val = values[f.key] ?? f.defaultValue;
                return (
                  <div key={f.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-medium text-foreground">{f.label}</span>
                        <span className="text-[10px] text-muted-foreground ml-2">({f.category})</span>
                      </div>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {val} {f.unit}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={f.min}
                      max={f.max}
                      step={f.step}
                      value={val}
                      onChange={(e) => handleSliderChange(f.key, parseFloat(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-muted rounded-lg"
                    />
                    <p className="text-[10px] text-muted-foreground leading-tight">{f.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry & Adaptive Router */}
        <div className="lg:col-span-5 space-y-6">
          {telemetry ? (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Router Decision Card */}
                <div className="rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent p-6 shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                      Adaptive Model Router
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Δ = {(telemetry.router_decision.discordance_delta * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-serif font-light text-foreground">
                      {telemetry.router_decision.selected_engine}
                    </h3>
                    <p className="text-xs text-muted-foreground pt-1 leading-relaxed">
                      {telemetry.router_decision.routing_rationale}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-card border border-border space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Calibrated Risk Consensus:</span>
                      <span className="font-mono font-bold text-foreground">
                        {(telemetry.router_decision.final_calibrated_probability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          telemetry.router_decision.final_calibrated_probability >= 0.5
                            ? "bg-rose-500"
                            : "bg-emerald-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(5, telemetry.router_decision.final_calibrated_probability * 100)
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                      <span>Low Risk</span>
                      <span>50% Decision Threshold</span>
                      <span>High Risk</span>
                    </div>
                  </div>
                </div>

                {/* Model Breakdown: Classical vs Quantum */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Classical Card */}
                  <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Cpu size={14} className="text-blue-500" />
                      <span className="text-xs font-semibold text-foreground">Classical Ensemble</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xl font-mono font-bold text-foreground">
                        {(telemetry.classical_results.probability * 100).toFixed(1)}%
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {telemetry.classical_results.prediction}
                      </p>
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground pt-1 border-t border-border/40">
                      Top Driver: {telemetry.classical_results.top_driver}
                    </div>
                  </div>

                  {/* Quantum Card */}
                  <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Activity size={14} className="text-purple-500" />
                      <span className="text-xs font-semibold text-foreground">4-Qubit VQC</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xl font-mono font-bold text-foreground">
                        {(telemetry.quantum_results.probability * 100).toFixed(1)}%
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {telemetry.quantum_results.prediction}
                      </p>
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground pt-1 border-t border-border/40">
                      Ansatz: Ring-CNOT
                    </div>
                  </div>
                </div>

                {/* QML Feature Sensitivity Attribution */}
                {telemetry.quantum_results.qml_sensitivity_analysis && (
                  <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Layers size={14} className="text-indigo-600 dark:text-indigo-400" />
                        <h4 className="text-xs font-semibold text-foreground">
                          QML Latent-Space Sensitivity
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">Finite-Difference</span>
                    </div>
                    <div className="space-y-2">
                      {telemetry.quantum_results.qml_sensitivity_analysis.map((s: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">{s.component}</span>
                          <span className="font-mono font-semibold text-foreground">
                            {s.sensitivity_gradient} grad
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                <Sparkles size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">Awaiting Execution</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Adjust patient serum biomarkers or select a clinical preset, then click Execute Adaptive Triage.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

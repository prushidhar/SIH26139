"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
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
  Activity,
  Heart,
  Cpu,
  TrendingUp,
} from "lucide-react";
import { showToast } from "@/components/common/ToastNotification";

interface CXRPreset {
  name: string;
  badge: string;
  color: string;
  ctr: number;
  description: string;
  features: number[];
}

const CXR_PRESETS: CXRPreset[] = [
  {
    name: "Normal Chest Radiograph",
    badge: "CTR 0.43 (Normal)",
    color: "emerald",
    ctr: 0.43,
    description: "Cardiac silhouette within normal limits. Clear costophrenic angles.",
    features: [0.12, -0.45, 0.22, -0.18, 0.05, -0.31],
  },
  {
    name: "Borderline Triage Zone",
    badge: "CTR 0.52 (Ambiguous)",
    color: "amber",
    ctr: 0.52,
    description: "Near the 0.50 clinical cutoff — quantum arbitration activated.",
    features: [0.48, 0.35, -0.12, 0.55, 0.28, 0.41],
  },
  {
    name: "Severe Biventricular Cardiomegaly",
    badge: "CTR 0.65 (Enlarged)",
    color: "rose",
    ctr: 0.65,
    description: "Marked biventricular dilatation with lateral apex displacement.",
    features: [0.92, 0.84, 0.78, 0.88, 0.64, 0.72],
  },
];

export default function CardiomegalyStudioPage() {
  const [ctr, setCtr] = useState<number>(0.52);
  const [patientName, setPatientName] = useState<string>("CheXpert CXR Patient");
  const [features, setFeatures] = useState<number[]>([0.48, 0.35, -0.12, 0.55, 0.28, 0.41]);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState<any>(null);

  const applyPreset = (preset: CXRPreset) => {
    setCtr(preset.ctr);
    setFeatures([...preset.features]);
    setPatientName(preset.name);
    showToast({
      title: "CXR Preset Loaded",
      message: `${preset.name} (${preset.badge})`,
      type: "info",
    });
  };

  const handleFeatureChange = (index: number, val: number) => {
    const updated = [...features];
    updated[index] = val;
    setFeatures(updated);
  };

  const runEvaluation = async () => {
    setIsEvaluating(true);
    setTelemetry(null);
    try {
      const res = await fetch("/api/inference/cardiomegaly-cxr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          measured_ctr: ctr,
          sample_label: patientName,
          dense_features: features,
        }),
      });

      const data = await res.json();
      if (data.success && data.telemetry) {
        setTelemetry(data.telemetry);
        showToast({
          title: "Inference Complete",
          message: "Decoodt et al. Transfer Learning & 6Q VQC evaluation finished.",
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
              <Layers size={22} />
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-light text-foreground tracking-tight">
                Cardiomegaly Chest Radiography
              </h1>
              <p className="text-xs text-muted-foreground">
                CheXpert frontal radiographs · 6-Qubit transfer learning · 0.930 ROC-AUC
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={runEvaluation}
          disabled={isEvaluating}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all cursor-pointer"
        >
          {isEvaluating ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Analyzing Radiograph...
            </>
          ) : (
            <>
              <Zap size={15} /> Analyze Radiograph
            </>
          )}
        </button>
      </div>

      {/* Preset Cohort Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Reference Cases
          </span>
          <span className="text-[11px] text-muted-foreground">Verified CheXpert Presets</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CXR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="text-left p-3.5 rounded-2xl border border-border/50 bg-card/60 hover:bg-card hover:border-teal-500/40 transition-all cursor-pointer space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-xs text-foreground">{preset.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                  preset.color === "emerald"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : preset.color === "amber"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                }`}>
                  {preset.badge}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Interactive Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Radiographic Anatomy & Feature Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Anatomical CTR Card */}
          <div className="p-5 rounded-2xl border border-border/50 bg-card/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-teal-500" />
                <h3 className="text-sm font-medium text-foreground">Cardiothoracic Ratio (CTR) Calibration</h3>
              </div>
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                ctr > 0.50
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              }`}>
                CTR: {ctr.toFixed(2)} ({ctr > 0.50 ? "Cardiomegaly" : "Normal < 0.50"})
              </span>
            </div>


            {/* CTR Slider */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-mono text-muted-foreground">
                <span>0.35 (Microcardia)</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold">0.50 (Clinical Cutoff)</span>
                <span>0.75 (Severe Dilation)</span>
              </div>
              <input
                type="range"
                min={0.35}
                max={0.75}
                step={0.01}
                value={ctr}
                onChange={(e) => setCtr(parseFloat(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
            </div>
          </div>

          {/* DenseNet-121 Latent Projections */}
          <div className="p-5 rounded-2xl border border-border/50 bg-card/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-teal-500" />
                <h3 className="text-sm font-medium text-foreground">DenseNet-121 Latent Embedding (6 Wires)</h3>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">1024-d → 6-d Latent Space</span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              {features.map((fVal, idx) => (
                <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-muted/30 border border-border/30">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-muted-foreground">Wire {idx} (PC_{idx + 1})</span>
                    <span className="font-mono font-medium text-foreground">{fVal.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={-1.5}
                    max={1.5}
                    step={0.05}
                    value={fVal}
                    onChange={(e) => handleFeatureChange(idx, parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-teal-600"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Telemetry & Clinical Readout */}
        <div className="lg:col-span-5 space-y-6">
          {telemetry ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Primary Diagnostic Banner */}
              <div className={`p-5 rounded-2xl border ${
                telemetry.diagnosis.includes("Cardiomegaly")
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
              } space-y-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {telemetry.diagnosis.includes("Cardiomegaly") ? (
                      <AlertTriangle size={18} />
                    ) : (
                      <CheckCircle2 size={18} />
                    )}
                    <h4 className="font-medium text-sm">{telemetry.diagnosis}</h4>
                  </div>
                  <span className="text-xs font-mono font-bold">
                    {(telemetry.cardiomegaly_probability * 100).toFixed(1)}% Prob
                  </span>
                </div>
                <p className="text-xs leading-relaxed opacity-90">
                  {telemetry.clinical_recommendation}
                </p>
              </div>

              {/* Transfer Learning Comparison */}
              <div className="p-5 rounded-2xl border border-border/50 bg-card/60 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  <Cpu size={14} className="text-indigo-500" />
                  <span>Transfer Learning Efficiency</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/30">
                    <span className="text-muted-foreground block text-[11px]">Classical Head</span>
                    <span className="font-mono font-medium text-foreground block text-sm">1,025 params</span>
                    <span className="text-[10px] text-muted-foreground">AUROC 0.918</span>
                  </div>
                  <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30">
                    <span className="text-teal-600 dark:text-teal-400 block text-[11px]">6-Qubit VQC</span>
                    <span className="font-mono font-medium text-teal-700 dark:text-teal-300 block text-sm">36 params</span>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">AUROC 0.930 (+1.3%)</span>
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground block text-center pt-1 font-mono">
                  {telemetry.transfer_learning_telemetry.parameter_reduction}
                </span>
              </div>

              {/* Shannon Entropy Router Decision */}
              <div className="p-5 rounded-2xl border border-border/50 bg-card/60 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-muted-foreground">Quantara Adaptive Router</span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-medium border border-indigo-500/20">
                    {telemetry.router_telemetry.dispatch_code}
                  </span>
                </div>
                <h5 className="font-medium text-xs text-foreground">
                  {telemetry.router_telemetry.selected_engine}
                </h5>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {telemetry.router_telemetry.routing_rationale}
                </p>
              </div>

              {/* Quantum Wire Observables */}
              <div className="p-5 rounded-2xl border border-border/50 bg-card/60 space-y-3">
                <span className="text-xs font-mono text-muted-foreground block">
                  6-Qubit Pauli-Z Expectation Values
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {telemetry.quantum_observables.map((zVal: number, i: number) => (
                    <div key={i} className="p-2 rounded-lg bg-muted/40 border border-border/30 text-center">
                      <span className="text-[10px] font-mono text-muted-foreground block">⟨Z{i}⟩</span>
                      <span className="text-xs font-mono font-medium text-foreground">{zVal.toFixed(3)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="p-8 rounded-2xl border border-border/50 bg-card/40 flex flex-col items-center justify-center text-center space-y-3 min-h-[360px]">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Layers size={24} />
              </div>
              <h4 className="font-medium text-sm text-foreground">Awaiting CXR Evaluation</h4>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                Select a CheXpert clinical reference case or adjust the cardiothoracic ratio slider, then click &ldquo;Execute Classical-Quantum Screening&rdquo;.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

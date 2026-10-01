"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart,
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

interface TabularPreset {
  name: string;
  badge: string;
  color: string;
  description: string;
  values: {
    age: number;
    sex: number;
    cp: number;
    trestbps: number;
    chol: number;
    fbs: number;
    restecg: number;
    thalach: number;
    exang: number;
    oldpeak: number;
    slope: number;
    ca: number;
    thal: number;
  };
}

const PRESETS: TabularPreset[] = [
  {
    name: "Physiological Normal",
    badge: "Low Risk",
    color: "emerald",
    description: "Normal resting blood pressure, no exercise-induced ischemia.",
    values: {
      age: 44,
      sex: 1,
      cp: 0,
      trestbps: 120,
      chol: 210,
      fbs: 0,
      restecg: 0,
      thalach: 168,
      exang: 0,
      oldpeak: 0.0,
      slope: 1,
      ca: 0,
      thal: 2,
    },
  },
  {
    name: "Atypical Ischemic Stress",
    badge: "Ambiguity Zone",
    color: "amber",
    description: "Moderate ST depression with elevated cholesterol; triggers quantum routing.",
    values: {
      age: 56,
      sex: 1,
      cp: 1,
      trestbps: 135,
      chol: 260,
      fbs: 0,
      restecg: 1,
      thalach: 142,
      exang: 1,
      oldpeak: 1.4,
      slope: 2,
      ca: 1,
      thal: 2,
    },
  },
  {
    name: "Obstructive Coronary Artery Disease",
    badge: "Critical Risk",
    color: "rose",
    description: "High resting BP, severe ST depression, multivessel fluoroscopy defect.",
    values: {
      age: 63,
      sex: 1,
      cp: 3,
      trestbps: 155,
      chol: 310,
      fbs: 1,
      restecg: 2,
      thalach: 118,
      exang: 1,
      oldpeak: 2.8,
      slope: 2,
      ca: 2,
      thal: 3,
    },
  },
];

export default function HeartTabularStudioPage() {
  const [values, setValues] = useState({
    age: 55,
    sex: 1,
    cp: 1,
    trestbps: 130,
    chol: 240,
    fbs: 0,
    restecg: 0,
    thalach: 150,
    exang: 0,
    oldpeak: 1.0,
    slope: 1,
    ca: 0,
    thal: 2,
  });

  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState<any>(null);

  const applyPreset = (preset: TabularPreset) => {
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
      const res = await fetch("/api/inference/heart-disease-tabular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (data.success && data.telemetry) {
        setTelemetry(data.telemetry);
        showToast({
          title: "Inference Complete",
          message: "AstroVall02 4-Qubit VQC evaluation finished.",
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
              <Heart size={22} />
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-light text-foreground tracking-tight">
                Cardiovascular Vitals (CAD)
              </h1>
              <p className="text-xs text-muted-foreground">
                13 hemodynamic vitals · 4-Qubit VQC · 0.918 ROC-AUC
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={runEvaluation}
          disabled={isEvaluating}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
        >
          {isEvaluating ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Evaluating Vitals...
            </>
          ) : (
            <>
              <Zap size={15} /> Evaluate Cardiovascular Risk
            </>
          )}
        </button>
      </div>

      {/* Preset Cohort Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Reference Profiles
          </span>
          <span className="text-[11px] text-muted-foreground">Verified Cleveland Presets</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="text-left p-3.5 rounded-2xl border border-border/50 bg-card/60 hover:bg-card hover:border-indigo-500/40 transition-all cursor-pointer space-y-1.5"
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
        {/* Left: Input Hemodynamics */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-5 rounded-2xl border border-border/50 bg-card/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-indigo-500" />
                <h3 className="text-sm font-medium text-foreground">Hemodynamic Parameters</h3>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">13 Clinical Vitals</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Age */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Age</span>
                  <span className="font-mono font-medium text-foreground">{values.age} years</span>
                </div>
                <input
                  type="range"
                  min={25}
                  max={85}
                  step={1}
                  value={values.age}
                  onChange={(e) => handleValueChange("age", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Resting Blood Pressure */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Resting Blood Pressure</span>
                  <span className="font-mono font-medium text-foreground">{values.trestbps} mm Hg</span>
                </div>
                <input
                  type="range"
                  min={90}
                  max={200}
                  step={2}
                  value={values.trestbps}
                  onChange={(e) => handleValueChange("trestbps", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Cholesterol */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Serum Cholesterol</span>
                  <span className="font-mono font-medium text-foreground">{values.chol} mg/dL</span>
                </div>
                <input
                  type="range"
                  min={120}
                  max={450}
                  step={5}
                  value={values.chol}
                  onChange={(e) => handleValueChange("chol", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Maximum Heart Rate */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Max Heart Rate (thalach)</span>
                  <span className="font-mono font-medium text-foreground">{values.thalach} bpm</span>
                </div>
                <input
                  type="range"
                  min={70}
                  max={210}
                  step={2}
                  value={values.thalach}
                  onChange={(e) => handleValueChange("thalach", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* ST Depression */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">ST Depression (oldpeak)</span>
                  <span className="font-mono font-medium text-foreground">{values.oldpeak.toFixed(1)} mm</span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={5.0}
                  step={0.1}
                  value={values.oldpeak}
                  onChange={(e) => handleValueChange("oldpeak", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Chest Pain Type */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Chest Pain Type</span>
                  <span className="font-mono font-medium text-foreground">
                    {["Typical", "Atypical", "Non-Anginal", "Asymptomatic"][values.cp]}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={1}
                  value={values.cp}
                  onChange={(e) => handleValueChange("cp", parseInt(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Exercise Angina */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Exercise Induced Angina</span>
                  <span className="font-mono font-medium text-foreground">{values.exang === 1 ? "Yes" : "No"}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={1}
                  value={values.exang}
                  onChange={(e) => handleValueChange("exang", parseInt(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Colored Vessels */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Fluoroscopy Major Vessels</span>
                  <span className="font-mono font-medium text-foreground">{values.ca}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={1}
                  value={values.ca}
                  onChange={(e) => handleValueChange("ca", parseInt(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-indigo-600"
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
              <div
                className={`p-5 rounded-2xl border ${
                  telemetry.cad_presence
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                } space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {telemetry.cad_presence ? (
                      <AlertTriangle size={18} />
                    ) : (
                      <CheckCircle2 size={18} />
                    )}
                    <h4 className="font-medium text-sm">{telemetry.prediction_label}</h4>
                  </div>
                  <span className="text-xs font-mono font-bold">
                    {(telemetry.calibrated_cad_probability * 100).toFixed(1)}% CAD Prob
                  </span>
                </div>
                <p className="text-xs opacity-90 leading-relaxed">
                  {telemetry.risk_stratification.clinical_recommendation}
                </p>
              </div>

              {/* 4-Qubit Pauli-Z Observables */}
              <div className="p-5 rounded-2xl border border-border/50 bg-card/60 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Cpu size={14} className="text-indigo-500" />
                    <span className="font-mono uppercase tracking-wider text-muted-foreground">
                      Transfinite-4Q Observables
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    AstroVall02 Architecture
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-1 text-center font-mono">
                  {telemetry.quantum_results.pauli_z_expvals.map((z: number, i: number) => (
                    <div key={i} className="p-2 rounded-xl bg-muted/40 border border-border/30">
                      <span className="text-[10px] text-muted-foreground block">⟨Z{i}⟩</span>
                      <span className="text-xs font-bold text-foreground">{z}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quantara Adaptive Router */}
              <div className="p-5 rounded-2xl border border-border/50 bg-card/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-muted-foreground">Adaptive Model Router</span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-medium border border-indigo-500/20">
                    {telemetry.router_decision.dispatch_code}
                  </span>
                </div>
                <h5 className="font-medium text-xs text-foreground">
                  {telemetry.router_decision.selected_engine}
                </h5>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {telemetry.router_decision.routing_rationale}
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="p-8 rounded-2xl border border-border/50 bg-card/40 flex flex-col items-center justify-center text-center space-y-3 min-h-[360px]">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Heart size={24} />
              </div>
              <h4 className="font-medium text-sm text-foreground">Awaiting Hemodynamic Screening</h4>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                Select a clinical reference profile or calibrate hemodynamic parameters, then click &ldquo;Execute Classical-Quantum Screening&rdquo;.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

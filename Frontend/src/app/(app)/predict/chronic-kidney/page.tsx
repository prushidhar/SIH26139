"use client";

import React, { useState } from "react";
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
  Layers,
  FlaskConical,
  HeartPulse,
} from "lucide-react";
import { showToast } from "@/components/common/ToastNotification";

interface CKDPreset {
  name: string;
  badge: string;
  color: string;
  description: string;
  values: {
    age: number;
    blood_pressure: number;
    specific_gravity: number;
    albumin: number;
    blood_glucose_random: number;
    blood_urea: number;
    serum_creatinine: number;
    hemoglobin: number;
  };
}

const PRESETS: CKDPreset[] = [
  {
    name: "Physiological Normal",
    badge: "Stage G1 • Low Risk",
    color: "emerald",
    description: "Intact glomerular filtration, normoalbuminuria, and normal creatinine.",
    values: {
      age: 36,
      blood_pressure: 75,
      specific_gravity: 1.025,
      albumin: 0,
      blood_glucose_random: 95,
      blood_urea: 24,
      serum_creatinine: 0.9,
      hemoglobin: 15.2,
    },
  },
  {
    name: "Borderline Impairment",
    badge: "Stage G3a • Moderate Risk",
    color: "amber",
    description: "Early diabetic glomerulosclerosis, microalbuminuria, and mild azotemia.",
    values: {
      age: 58,
      blood_pressure: 135,
      specific_gravity: 1.015,
      albumin: 1,
      blood_glucose_random: 165,
      blood_urea: 48,
      serum_creatinine: 1.6,
      hemoglobin: 11.8,
    },
  },
  {
    name: "Severe Renal Failure",
    badge: "Stage G5 • Critical ESRD",
    color: "rose",
    description: "Advanced uremic syndrome, severe proteinuria, and severe anemia.",
    values: {
      age: 67,
      blood_pressure: 165,
      specific_gravity: 1.010,
      albumin: 3,
      blood_glucose_random: 240,
      blood_urea: 125,
      serum_creatinine: 5.8,
      hemoglobin: 8.2,
    },
  },
];

export default function ChronicKidneyStudioPage() {
  const [values, setValues] = useState({
    age: 52,
    blood_pressure: 80,
    specific_gravity: 1.020,
    albumin: 0,
    blood_glucose_random: 115,
    blood_urea: 36,
    serum_creatinine: 1.1,
    hemoglobin: 14.8,
  });

  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState<any>(null);

  const applyPreset = (preset: CKDPreset) => {
    setValues({ ...preset.values });
    showToast({
      title: "Preset Loaded",
      message: `${preset.name} (${preset.badge})`,
      type: "success",
    });
  };

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    setTelemetry(null);
    try {
      const res = await fetch("/api/inference/chronic-kidney", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        throw new Error(`Inference returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.telemetry) {
        setTelemetry(data.telemetry);
        showToast({
          title: "Screening Complete",
          message: `${data.telemetry.prediction_label} (Risk: ${data.telemetry.risk_score}/100)`,
          type: data.telemetry.risk_score >= 50 ? "warning" : "success",
        });
      } else {
        throw new Error(data.error || "Inference response missing telemetry");
      }
    } catch (err: any) {
      showToast({
        title: "Screening Error",
        message: err.message || "Failed to reach renal inference service",
        type: "warning",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-ink-soft mb-1">
            <Link href="/predict" className="hover:text-quantum transition-colors flex items-center gap-1">
              <ArrowLeft size={12} /> Screening Studios
            </Link>
            <span>/</span>
            <span className="text-quantum font-semibold">Nephrology & Renal Health</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif text-ink font-light">
            Chronic Kidney Disease (CKD) Studio
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            4-Qubit Variational Quantum Classifier (VQC) with KDIGO 2024 Glomerular Staging and eGFR estimation.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p)}
              className="text-xs font-mono px-3 py-1.5 rounded-lg border border-hairline bg-cream hover:bg-cream-deep text-ink transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  p.color === "emerald"
                    ? "bg-emerald-500"
                    : p.color === "amber"
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
              />
              {p.name}
            </button>
          ))}
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-hairline p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-ink flex items-center gap-2">
                <Sliders size={16} className="text-quantum" />
                Renal Biomarker Panel (8 Inputs)
              </h2>
              <span className="text-[11px] font-mono text-ink-soft bg-cream px-2 py-0.5 rounded border border-hairline">
                KDIGO Standard
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1">
                  Age (years)
                </label>
                <input
                  type="number"
                  min="18"
                  max="95"
                  value={values.age}
                  onChange={(e) => setValues({ ...values, age: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-cream/40 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1">
                  Systolic BP (mmHg)
                </label>
                <input
                  type="number"
                  min="60"
                  max="200"
                  value={values.blood_pressure}
                  onChange={(e) => setValues({ ...values, blood_pressure: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-cream/40 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1">
                  Specific Gravity
                </label>
                <input
                  type="number"
                  step="0.005"
                  min="1.005"
                  max="1.035"
                  value={values.specific_gravity}
                  onChange={(e) => setValues({ ...values, specific_gravity: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-cream/40 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1">
                  Albuminuria (0-5)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={values.albumin}
                  onChange={(e) => setValues({ ...values, albumin: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-cream/40 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1">
                  Blood Glucose (mg/dL)
                </label>
                <input
                  type="number"
                  min="60"
                  max="450"
                  value={values.blood_glucose_random}
                  onChange={(e) => setValues({ ...values, blood_glucose_random: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-cream/40 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1">
                  Blood Urea (mg/dL)
                </label>
                <input
                  type="number"
                  min="10"
                  max="250"
                  value={values.blood_urea}
                  onChange={(e) => setValues({ ...values, blood_urea: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-cream/40 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1">
                  Serum Creatinine (mg/dL)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.4"
                  max="15.0"
                  value={values.serum_creatinine}
                  onChange={(e) => setValues({ ...values, serum_creatinine: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-cream/40 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1">
                  Hemoglobin (g/dL)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="4.0"
                  max="20.0"
                  value={values.hemoglobin}
                  onChange={(e) => setValues({ ...values, hemoglobin: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-hairline bg-cream/40 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum font-mono"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleEvaluate}
              disabled={isEvaluating}
              className="w-full mt-4 py-3 rounded-xl bg-quantum hover:bg-quantum-deep text-white font-medium text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isEvaluating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Running 4-Qubit Quantum & Classical Analysis...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Evaluate Renal Panel
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Telemetry & Results (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {telemetry ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Primary Verdict Card */}
              <div
                className={`p-6 rounded-2xl border ${
                  telemetry.risk_score >= 50
                    ? "bg-rose-500/5 border-rose-300"
                    : "bg-emerald-500/5 border-emerald-300"
                } shadow-xs space-y-4`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
                        telemetry.risk_score >= 50
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {telemetry.risk_category}
                    </span>
                    <h3 className="text-xl font-serif text-ink mt-2 font-medium">
                      {telemetry.prediction_label}
                    </h3>
                    <p className="text-xs font-mono text-ink-soft mt-1">
                      {telemetry.kdigo_stage} • {telemetry.proteinuria_tier}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-serif text-ink font-light">
                      {telemetry.risk_score}
                      <span className="text-sm font-sans text-ink-soft"> / 100</span>
                    </div>
                    <span className="text-[11px] font-mono text-ink-soft">
                      Confidence: {telemetry.confidence_percentage}%
                    </span>
                  </div>
                </div>

                {/* eGFR Callout */}
                <div className="bg-white/80 p-3.5 rounded-xl border border-hairline flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HeartPulse size={18} className="text-quantum" />
                    <div>
                      <div className="text-xs font-semibold text-ink">Estimated GFR (CKD-EPI 2021)</div>
                      <div className="text-[11px] text-ink-soft">Standardized filtration index</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-mono font-bold text-ink">
                      {telemetry.egfr_value}{" "}
                      <span className="text-xs font-normal text-ink-soft">{telemetry.egfr_unit}</span>
                    </div>
                  </div>
                </div>

                {/* Clinical Guidance */}
                <div className="bg-cream/60 p-3.5 rounded-xl border border-hairline text-xs text-ink space-y-1">
                  <div className="font-semibold text-ink flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-quantum" />
                    Clinical Recommendation:
                  </div>
                  <p className="text-ink-soft leading-relaxed">{telemetry.clinical_action}</p>
                </div>
              </div>

              {/* Dual-Engine Comparison */}
              <div className="bg-white rounded-2xl border border-hairline p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-hairline pb-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-ink flex items-center gap-2">
                    <Layers size={16} className="text-quantum" />
                    Dual-Engine Comparison
                  </h3>
                  <span className="text-xs font-mono text-ink-soft">
                    Consensus: <span className="font-bold text-quantum">{telemetry.consensus_status}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Classical Card */}
                  <div className="p-4 rounded-xl border border-hairline bg-cream/30 space-y-2">
                    <div className="text-[11px] font-mono text-ink-soft uppercase tracking-wider">
                      Classical Baseline
                    </div>
                    <div className="text-base font-semibold text-ink">
                      {telemetry.classical_results?.prediction}
                    </div>
                    <div className="text-xs font-mono text-ink-soft">
                      Probability: {(telemetry.classical_results?.probability * 100).toFixed(1)}%
                    </div>
                    <div className="text-[11px] font-mono text-ink-soft">
                      Latency: {telemetry.classical_results?.latency_ms} ms
                    </div>
                  </div>

                  {/* Quantum Card */}
                  <div className="p-4 rounded-xl border border-quantum/30 bg-quantum/5 space-y-2">
                    <div className="text-[11px] font-mono text-quantum uppercase tracking-wider font-bold">
                      Quantum VQC (4-Qubit)
                    </div>
                    <div className="text-base font-semibold text-quantum">
                      {telemetry.quantum_results?.prediction}
                    </div>
                    <div className="text-xs font-mono text-ink-soft">
                      Probability: {(telemetry.quantum_results?.probability * 100).toFixed(1)}%
                    </div>
                    <div className="text-[11px] font-mono text-ink-soft">
                      Latency: {telemetry.quantum_results?.latency_ms} ms
                    </div>
                  </div>
                </div>

                {/* Pauli-Z Expectation Telemetry */}
                {telemetry.quantum_results?.pauli_z_expvals && (
                  <div className="bg-cream/40 p-3.5 rounded-xl border border-hairline space-y-2">
                    <div className="text-xs font-medium text-ink flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Cpu size={14} className="text-quantum" />
                        4-Qubit Expectation Telemetry ⟨Z_i⟩
                      </span>
                      <span className="font-mono text-[11px] text-ink-soft">Hilbert Space: 2⁴ = 16</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {telemetry.quantum_results.pauli_z_expvals.map((v: number, idx: number) => (
                        <div key={idx} className="bg-white p-2 rounded-lg border border-hairline text-center">
                          <div className="text-[10px] font-mono text-ink-soft">q[{idx}]</div>
                          <div className="text-xs font-mono font-bold text-quantum">{v.toFixed(3)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Feature Attributions */}
              {telemetry.feature_attributions && (
                <div className="bg-white rounded-2xl border border-hairline p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-ink flex items-center gap-2">
                    <FlaskConical size={16} className="text-quantum" />
                    Biomarker Risk Drivers & Attributions
                  </h3>
                  <div className="space-y-2.5">
                    {telemetry.feature_attributions.map((attr: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-hairline bg-cream/20 text-xs"
                      >
                        <div>
                          <span className="font-medium text-ink">{attr.feature}</span>
                          <span className="text-ink-soft font-mono ml-2">({attr.measured})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-ink-soft">{attr.status}</span>
                          <span className="font-mono font-bold text-quantum">
                            +{attr.impact_pct}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-hairline p-12 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-quantum/10 text-quantum flex items-center justify-center mx-auto border border-quantum/20">
                <Activity size={28} />
              </div>
              <div>
                <h3 className="text-lg font-serif text-ink font-light">Renal Telemetry Awaiting Input</h3>
                <p className="text-xs text-ink-soft max-w-md mx-auto mt-1">
                  Adjust patient biomarker levels on the left panel or click any preset profile above, then click &quot;Evaluate Renal Panel&quot; to execute quantum-classical screening.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

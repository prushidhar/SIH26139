"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Zap,
  Activity,
  Heart,
  Droplets,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Cpu,
  RefreshCw,
} from "lucide-react";
import { showToast } from "@/components/common/ToastNotification";

interface DemoCase {
  id: string;
  repo: string;
  provenance: string;
  title: string;
  disease: string;
  circuitInfo: string;
  sampleDescription: string;
  endpoint: string;
  payload: any;
  icon: any;
  color: string;
  targetStudio: string;
}

const DEMO_CASES: DemoCase[] = [
  {
    id: "cxr-cardiomegaly",
    repo: "quresight/cardiac-radiography-vqc",
    provenance: "CheXpert Radiography Benchmark",
    title: "CheXpert Cardiomegaly Radiography",
    disease: "Cardiomegaly / Heart Enlargement",
    circuitInfo: "DenseNet-121 + 6-Qubit PennyLane VQC",
    sampleDescription: "CheXpert CXR with CTR = 0.58 (Borderline Cardiomegaly)",
    endpoint: "/api/inference/cardiomegaly-cxr",
    payload: {
      measured_ctr: 0.58,
      sample_label: "CheXpert CXR Patient Study #412",
      dense_features: [0.65, 0.42, 0.18, 0.55, 0.32, 0.48],
    },
    icon: Layers,
    color: "teal",
    targetStudio: "/predict/cardiomegaly",
  },
  {
    id: "ilpd-liver",
    repo: "quresight/liver-ilpd-vqc",
    provenance: "Indian Liver Patient Dataset Benchmark",
    title: "Indian Liver Patient Screening",
    disease: "Hepatic Dysregulation & Fibrosis",
    circuitInfo: "2-Qubit Minimal VQC (12 Params, Depth 4)",
    sampleDescription: "ILPD Patient #104: Bilirubin 3.2 mg/dL, AST 84 IU/L",
    endpoint: "/api/inference/liver-ilpd",
    payload: {
      Age: 48,
      Gender: 1,
      Total_Bilirubin: 3.2,
      Direct_Bilirubin: 1.4,
      Alkaline_Phosphotase: 310,
      Alamine_Aminotransferase: 62,
      Aspartate_Aminotransferase: 84,
      Total_Protiens: 6.2,
      Albumin: 2.8,
      Albumin_and_Globulin_Ratio: 0.82,
    },
    icon: Droplets,
    color: "emerald",
    targetStudio: "/predict/liver-ilpd",
  },
  {
    id: "cleveland-heart",
    repo: "quresight/cardiovascular-vqc",
    provenance: "UCI Cleveland Cardiology Benchmark",
    title: "Cleveland Cardiovascular Panel",
    disease: "Coronary Artery Disease (CAD)",
    circuitInfo: "4-Qubit StronglyEntangling VQC",
    sampleDescription: "Patient #87: Resting BP 145, ST depression 1.8mm",
    endpoint: "/api/inference/heart-disease-tabular",
    payload: {
      age: 58,
      sex: 1,
      cp: 2,
      trestbps: 145,
      chol: 265,
      fbs: 0,
      restecg: 1,
      thalach: 138,
      exang: 1,
      oldpeak: 1.8,
      slope: 2,
      ca: 1,
      thal: 2,
    },
    icon: Heart,
    color: "rose",
    targetStudio: "/predict/heart-tabular",
  },
  {
    id: "breast-cancer-wdbc",
    repo: "PennyLaneAI/pennylane & Qiskit ML",
    provenance: "PennyLane VQC & IBM Eagle Profiler",
    title: "Breast Cytopathology Biopsy",
    disease: "Cellular Nuclear Malignancy",
    circuitInfo: "8-Qubit Transfinite-1 VQC + Classical Ensemble",
    sampleDescription: "WDBC Margin Sample: Radius 17.95 µm, Area 1040 µm²",
    endpoint: "/api/inference/breast-cancer",
    payload: {
      model_name: "adaptive",
      biomarkers: {
        radius_mean: 17.95,
        texture_mean: 20.35,
        perimeter_mean: 119.5,
        area_mean: 1040.0,
        smoothness_mean: 0.108,
        compactness_mean: 0.165,
        concavity_mean: 0.198,
        concave_points_mean: 0.087,
      },
    },
    icon: Activity,
    color: "indigo",
    targetStudio: "/predict/breast-cancer",
  },
  {
    id: "ecg-acute-mi",
    repo: "quresight/ml/quantum/vqc.py",
    provenance: "ResNet-18 + 8Q Transfinite-1 Grad-CAM",
    title: "12-Lead ECG Acute Infarct",
    disease: "Myocardial Infarction / Arrhythmia",
    circuitInfo: "Dual-Engine CX-01 + Transfinite-1",
    sampleDescription: "Clinical 12-lead strip: Acute Anterolateral MI",
    endpoint: "/api/inference/cardiac-demo",
    payload: {
      sample_type: "mi",
    },
    icon: Zap,
    color: "amber",
    targetStudio: "/predict/heart-disease",
  },
];

export default function DemoSandboxPage() {
  const [runningId, setRunningId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});

  const runDetection = async (demo: DemoCase) => {
    try {
      setRunningId(demo.id);
      const res = await fetch(demo.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(demo.payload),
      });

      const data = await res.json();
      if (res.ok && (data.success || data.prediction || data.telemetry)) {
        const telemetry = data.telemetry || data;
        setResults((prev) => ({ ...prev, [demo.id]: telemetry }));
        showToast({
          title: "Detection Completed",
          message: `${demo.title} screened successfully.`,
          type: "quantum",
        });
      } else {
        throw new Error(data.detail || data.error || "Inference failed");
      }
    } catch (err: any) {
      showToast({
        title: "Evaluation Error",
        message: err.message || "Failed to run detection",
        type: "warning",
      });
    } finally {
      setRunningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-cream px-4 sm:px-6 py-8 font-sans text-ink">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-5">
          <div className="space-y-1">
            <Link
              href="/predict"
              className="inline-flex items-center gap-1.5 text-xs text-ink-soft hover:text-ink transition-colors font-medium mb-1"
            >
              <ArrowLeft size={13} /> Back to Screening Hub
            </Link>
            <h1 className="text-2xl sm:text-3xl font-serif font-light tracking-tight text-ink">
              Instant Detection Sandbox
            </h1>
            <p className="text-xs text-ink-soft">
              One-click screening across verified clinical cohorts.
            </p>
          </div>

          <Link
            href="/predict"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-ink text-parchment text-xs font-medium hover:bg-ink/90 transition-all self-start sm:self-center"
          >
            <span>Screening Hub</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Demo Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEMO_CASES.map((demo) => {
            const IconComp = demo.icon;
            const isRunning = runningId === demo.id;
            const result = results[demo.id];

            return (
              <div
                key={demo.id}
                className="p-5 rounded-2xl border border-hairline bg-white shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-quantum/10 text-quantum flex items-center justify-center shrink-0">
                        <IconComp size={16} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-ink leading-tight">{demo.title}</h3>
                        <span className="text-[11px] font-mono text-ink-soft block">{demo.disease}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cream text-ink-soft border border-hairline">
                      {demo.circuitInfo}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-cream/40 border border-hairline text-xs space-y-1">
                    <span className="text-[10px] font-mono uppercase text-ink-soft block">Reference Benchmark</span>
                    <p className="text-ink font-mono text-[11px] font-medium">{demo.sampleDescription}</p>
                    <span className="text-[10px] text-ink-soft block italic">{demo.provenance}</span>
                  </div>

                  {/* Inline Result If Available */}
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-quantum/5 border border-quantum/20 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-quantum flex items-center gap-1.5">
                          <CheckCircle2 size={13} />
                          {result.diagnosis ||
                            result.prediction_label ||
                            result.prediction?.clinical_title ||
                            "Analysis Complete"}
                        </span>
                        <span className="font-mono font-bold text-ink">
                          {result.cardiomegaly_probability
                            ? `${(result.cardiomegaly_probability * 100).toFixed(1)}% Prob`
                            : result.liver_disease_probability
                            ? `${(result.liver_disease_probability * 100).toFixed(1)}% Risk`
                            : result.calibrated_cad_probability
                            ? `${(result.calibrated_cad_probability * 100).toFixed(1)}% CAD`
                            : result.calibrated_malignancy_prob
                            ? `${(result.calibrated_malignancy_prob * 100).toFixed(1)}% Malignancy`
                            : result.risk_stratification?.cardiac_risk_score
                            ? `Score ${result.risk_stratification.cardiac_risk_score}/100`
                            : "Verified"}
                        </span>
                      </div>

                      {/* Small Router or Observation note */}
                      {result.router_telemetry?.selected_engine && (
                        <span className="text-[10px] font-mono text-ink-soft block">
                          Engine: {result.router_telemetry.selected_engine}
                        </span>
                      )}
                    </motion.div>
                  )}
                </div>

                <div className="pt-2 border-t border-hairline flex items-center justify-between gap-3">
                  <Link
                    href={demo.targetStudio}
                    className="text-xs text-ink-soft hover:text-quantum font-medium flex items-center gap-1"
                  >
                    <span>Full Studio</span>
                    <ArrowRight size={11} />
                  </Link>

                  <button
                    type="button"
                    onClick={() => runDetection(demo)}
                    disabled={isRunning}
                    className="px-4 py-2 rounded-xl bg-ink text-parchment hover:bg-ink/90 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <Zap size={13} className="text-quantum" />
                        <span>Run Detection</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

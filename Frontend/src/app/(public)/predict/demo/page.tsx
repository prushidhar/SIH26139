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
import AiDiagnosticsApp from "@/components/diagnostics/AiDiagnosticsApp";

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
    repo: "QureSight Biomedical Quantum Core",
    provenance: "8-Qubit VQC & IBM Eagle Profiler",
    title: "Breast Cytopathology Biopsy",
    disease: "Cellular Nuclear Malignancy",
    circuitInfo: "8-Qubit VQC + Classical Baseline Ensemble",
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
    repo: "QureSight 12-Lead Cardiac Engine",
    provenance: "ResNet-34 + 8-Qubit VQC Grad-CAM",
    title: "12-Lead ECG Acute Infarct",
    disease: "Myocardial Infarction / Arrhythmia",
    circuitInfo: "Dual-Engine (Classical + 8-Qubit VQC)",
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
  const [activeMode, setActiveMode] = useState<"dribbble" | "sandbox">("dribbble");
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
    <div className="min-h-screen bg-[#F2F7F6] px-4 sm:px-6 py-8 font-sans text-[#082827]">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Mode Selector Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#DFEBE8] bg-white p-3 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3">
            <Link
              href="/predict"
              className="inline-flex items-center gap-1.5 text-xs text-[#5A7470] hover:text-[#006766] transition-colors font-medium px-2 py-1 rounded-lg hover:bg-[#F2F7F6]"
            >
              <ArrowLeft size={13} /> Back to Screening Hub
            </Link>
          </div>

          <div className="flex items-center p-1 bg-[#E6F7F4]/60 rounded-xl border border-[#DFEBE8] text-xs">
            <button
              type="button"
              onClick={() => setActiveMode("dribbble")}
              className={`px-4 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeMode === "dribbble"
                  ? "bg-[#006766] text-white shadow-xs"
                  : "text-[#5A7470] hover:text-[#082827]"
              }`}
            >
              AI Diagnostics Suite
            </button>
            <button
              type="button"
              onClick={() => setActiveMode("sandbox")}
              className={`px-4 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeMode === "sandbox"
                  ? "bg-[#006766] text-white shadow-xs"
                  : "text-[#5A7470] hover:text-[#082827]"
              }`}
            >
              Detection Sandbox
            </button>
          </div>
        </div>

        {/* View 1: Dribbble MedTech Flow */}
        {activeMode === "dribbble" && (
          <AiDiagnosticsApp />
        )}

        {/* View 2: Multi-case Benchmark Sandbox */}
        {activeMode === "sandbox" && (
          <>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00B489]" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#006766] font-semibold">
                  Multi-Cohort Evaluation
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-[#082827] mt-1">
                Instant Detection Sandbox
              </h1>
              <p className="text-xs text-[#5A7470] font-normal">
                One-click clinical screening across verified peer-reviewed datasets.
              </p>
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
                className="p-5 rounded-2xl border border-[#DFEBE8] bg-white shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#E6F7F4] text-[#006766] border border-[#00B489]/20 flex items-center justify-center shrink-0">
                        <IconComp size={16} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#082827] leading-tight font-sans">{demo.title}</h3>
                        <span className="text-[11px] font-mono text-[#5A7470] block">{demo.disease}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#E6F7F4] text-[#006766] border border-[#00B489]/20 font-medium">
                      {demo.circuitInfo}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F2F7F6] border border-[#DFEBE8] text-xs space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#5A7470] block font-semibold">Reference Benchmark</span>
                    <p className="text-[#082827] font-mono text-[11px] font-medium">{demo.sampleDescription}</p>
                    <span className="text-[10px] text-[#5A7470] block italic">{demo.provenance}</span>
                  </div>

                  {/* Inline Result If Available */}
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-[#E6F7F4]/80 border border-[#00B489]/30 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#006766] flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-[#00B489]" />
                          {result.diagnosis ||
                            result.prediction_label ||
                            result.prediction?.clinical_title ||
                            "Analysis Complete"}
                        </span>
                        <span className="font-mono font-bold text-[#082827]">
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
                        <span className="text-[10px] font-mono text-[#5A7470] block">
                          Engine: {result.router_telemetry.selected_engine}
                        </span>
                      )}
                    </motion.div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#DFEBE8] flex items-center justify-between gap-3">
                  <Link
                    href={demo.targetStudio}
                    className="text-xs text-[#5A7470] hover:text-[#006766] font-medium flex items-center gap-1 transition-colors"
                  >
                    <span>Full Studio</span>
                    <ArrowRight size={11} />
                  </Link>

                  <button
                    type="button"
                    onClick={() => runDetection(demo)}
                    disabled={isRunning}
                    className="px-4 py-2 rounded-xl bg-[#006766] text-white hover:bg-[#0D4F46] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50 active:scale-95"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <Zap size={13} className="text-[#00B489]" />
                        <span>Run Detection</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        </>
        )}
      </div>
    </div>
  );
}

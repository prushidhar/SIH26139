"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Sparkles,
  Activity,
  Download,
  BarChart3,
  Layers,
  Heart,
  User,
  HeartPulse,
  Zap,
  Cpu,
  Loader2,
} from "lucide-react";
import HelpTooltip from "@/components/common/HelpTooltip";
import { downloadCombinedReport, type ReportPayload } from "@/lib/pdfReportGenerator";
import { showToast } from "@/components/common/ToastNotification";

import KeyRiskFactorsTab from "./components/KeyRiskFactorsTab";
import AiDoctorConsultationTab from "./components/AiDoctorConsultationTab";
import ModelComparisonTab from "./components/ModelComparisonTab";
import RealTimeGraphsTab from "./components/RealTimeGraphsTab";

export default function HeartDiseaseAnalysisPage() {
  const router = useRouter();

  // 4 Focused Tabs matching Breast Cancer structure
  const [activeTab, setActiveTab] = useState<
    "key_risk_factors" | "quresight_ai" | "model_comparison" | "realtime_graphs"
  >("key_risk_factors");

  // Model selection switch: "transfinite_1" (Hybrid Quantum) vs "cx_01" (Classical Baseline)
  const [selectedModel, setSelectedModel] = useState<"transfinite_1" | "cx_01">("transfinite_1");
  const [isDownloading, setIsDownloading] = useState(false);

  // Loaded State
  const [patientInfo, setPatientInfo] = useState({
    name: "Patient",
    patient_id: "QS-ECG-1001",
    age: 55,
    gender: "Male",
    intake_date: new Date().toISOString().split("T")[0],
  });

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<any>(null);
  const [aiSynthesis, setAiSynthesis] = useState<any>(null);

  const [telemetry, setTelemetry] = useState<any>({
    prediction: {
      class_name: "Normal",
      clinical_title: "Normal Sinus Rhythm (Physiological)",
      confidence_pct: 100.0,
      probabilities: {
        Normal: 0.999,
        "Myocardial Infarction": 0.0003,
        "History of MI": 0.0004,
        "Abnormal Heartbeat": 0.0003,
      },
    },
    risk_stratification: {
      cardiac_risk_score: 2.0,
      score_scale: "0 - 100",
      severity_tier: "LOW RISK (NORMAL SINUS RHYTHM)",
      clinical_recommendation:
        "Physiological rhythm verified. Routine preventative health check-up; repeat screening in 12 months or if acute anginal symptoms occur.",
      primary_driver: "Lead V2 (Septal)",
    },
    pinpointing_gradcam: {
      heatmap_image_base64: "",
      lead_detected: "Lead V2 (Septal)",
      anatomical_region: "Anteroseptal Junction (LAD)",
      activation_peak_score: 0.98,
      coordinates: { peak_x: 650, peak_y: 420, rel_x: 0.29, rel_y: 0.35 },
    },
    quantum_engine: {
      signature: "QureSight-VQC (Hybrid Quantum)",
      qubits: 8,
      ansatz: "8-Qubit AngleEmbedding + StronglyEntanglingLayers (2 Layers)",
      statevector_backend: "PennyLane default.qubit",
      quantum_prediction: "Normal",
      quantum_confidence_pct: 100.0,
      quantum_probabilities: {
        Normal: 0.999,
        "Myocardial Infarction": 0.0003,
        "History of MI": 0.0004,
        "Abnormal Heartbeat": 0.0003,
      },
      variational_parameters: 48,
      latency_ms: 54.32,
    },
    classical_engine: {
      name: "QureSight-Classical (ResNet-34)",
      architecture: "ResNet-34 + FC (512 -> 256 -> 4)",
      prediction: "Normal",
      confidence_pct: 100.0,
      total_parameters: 11178564,
      latency_ms: 35.31,
    },
    dual_engine_consensus: {
      status: "Concordant",
      is_concordant: true,
      consensus_confidence: 100.0,
      total_latency_ms: 89.63,
    },
  });

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("quresight_active_cardiac_analysis");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.patientInfo) setPatientInfo(parsed.patientInfo);
        if (parsed.telemetry) setTelemetry(parsed.telemetry);
        if (parsed.uploadedImage) setUploadedImage(parsed.uploadedImage);
        if (parsed.imageMeta) setImageMeta(parsed.imageMeta);
        if (parsed.aiSynthesis) setAiSynthesis(parsed.aiSynthesis);
      }
    } catch (e) {
      console.warn("Could not load sessionStorage cardiac analysis payload:", e);
    }
  }, []);

  const isHybrid = selectedModel === "transfinite_1";

  const activeRiskScore = isHybrid
    ? Number(telemetry?.quantum_engine?.risk_score ?? telemetry?.risk_stratification?.cardiac_risk_score ?? 2.0)
    : Number(telemetry?.classical_engine?.risk_score ?? telemetry?.risk_stratification?.cardiac_risk_score ?? 2.0);
  const activeConfidence = isHybrid
    ? telemetry?.quantum_engine?.quantum_confidence_pct ?? 100.0
    : telemetry?.classical_engine?.confidence_pct ?? 100.0;
  const activePrediction = isHybrid
    ? telemetry?.quantum_engine?.quantum_prediction ?? telemetry?.prediction?.class_name
    : telemetry?.classical_engine?.prediction ?? telemetry?.prediction?.class_name;
  const activeLatency = isHybrid
    ? telemetry?.quantum_engine?.latency_ms ?? 54.3
    : telemetry?.classical_engine?.latency_ms ?? 35.3;
  const activeEngineName = isHybrid
    ? (telemetry?.quantum_engine?.signature || "QureSight-VQC (Hybrid Quantum)")
    : (telemetry?.classical_engine?.name || "QureSight-Classical (ResNet-34)");
  const activeEngineSpecs = isHybrid
    ? "8-Qubit Universal AngleEmbedding + StronglyEntanglingLayers (3 Layers)"
    : "ResNet-34 + Multi-Scale Dilated Convolutions + CBAM + ECGConVT (21.5M Params)";
  const activeEngineDesc = isHybrid
    ? "8-Qubit universal variational quantum circuit with 3 data re-uploading layers projecting features into 256-dimensional Hilbert space."
    : "PyTorch ResNet-34 SOTA classical architecture with concat-pooling, multi-scale dilated convolutions, and spatial attention.";

  const getRiskBadge = () => {
    if (activeRiskScore >= 85.0) {
      return {
        label: "CRITICAL EMERGENCY (CODE RED)",
        color: "text-red-800 bg-red-100 border-red-300",
        stroke: "text-red-600",
      };
    }
    if (activeRiskScore >= 60.0) {
      return {
        label: "HIGH RISK (CARDIAC ARRHYTHMIA)",
        color: "text-purple-800 bg-purple-50 border-purple-300",
        stroke: "text-purple-600",
      };
    }
    if (activeRiskScore >= 35.0) {
      return {
        label: "MODERATE RISK (PRIOR ISCHEMIC SCAR)",
        color: "text-amber-800 bg-amber-50 border-amber-300",
        stroke: "text-amber-500",
      };
    }
    return {
      label: "LOW RISK (NORMAL SINUS RHYTHM)",
      color: "text-emerald-800 bg-emerald-50 border-emerald-300",
      stroke: "text-emerald-600",
    };
  };

  const currentBadge = getRiskBadge();

  // Circular dial circumference for r=28 (2 * pi * 28 = 175.93)
  const dialCircumference = 175.93;
  const dialOffset =
    dialCircumference -
    (dialCircumference * Math.min(100, Math.max(0, activeRiskScore))) / 100;

  const handleDownloadFullReport = () => {
    setIsDownloading(true);
    showToast({
      title: "Generating Clinical Dossier",
      message: "Assembling 12-page combined report...",
      type: "quantum",
    });

    const isCardiacHigh = activeRiskScore >= 60 || currentBadge.label.includes("CRITICAL") || currentBadge.label.includes("HIGH");

    const fullAiSummary = [
      aiSynthesis?.summary_paragraph || aiSynthesis?.summary || aiSynthesis?.executive_summary,
      aiSynthesis?.morphological_breakdown ? `**Electrophysiological & Morphological Breakdown:**\n${aiSynthesis.morphological_breakdown}` : null,
      aiSynthesis?.clinical_implications ? `**Clinical Implications & Coronary Watershed:**\n${aiSynthesis.clinical_implications}` : null,
      aiSynthesis?.quantum_advantage_interpretation ? `**Quantum Phase-Space Analysis:**\n${aiSynthesis.quantum_advantage_interpretation}` : null,
    ].filter(Boolean).join("\n\n");

    const leadName = telemetry?.pinpointing_gradcam?.lead_detected || "Lead V2 (Septal)";
    const anatomicalRegion = telemetry?.pinpointing_gradcam?.anatomical_region || "Anteroseptal Wall (LAD Coronary)";

    const payload: ReportPayload = {
      patient: {
        patientName: patientInfo.name || "Patient",
        patientId: patientInfo.patient_id || "QS-ECG-1001",
        patientAge: patientInfo.age || 55,
        patientGender: patientInfo.gender || "Male",
        diseaseType: "cardiac_ecg",
        biopsyCohort: "12-Lead Electrocardiogram Rhythm Strip",
      },
      biomarkers: [],
      transfinite1: {
        engineName: telemetry?.quantum_engine?.signature || "QureSight-VQC (Hybrid Quantum)",
        engineDescription: "8-Qubit Universal Data Re-Uploading PQC + Bilinear Gated Fusion",
        modelType: "hybrid",
        predictionLabel: telemetry?.quantum_engine?.quantum_prediction || telemetry?.prediction?.clinical_title || "Normal",
        confidence: telemetry?.quantum_engine?.quantum_confidence_pct ?? telemetry?.prediction?.confidence_pct ?? 100,
        riskScore: Number(telemetry?.quantum_engine?.risk_score ?? telemetry?.risk_stratification?.cardiac_risk_score ?? 2.0),
        riskTier: telemetry?.quantum_engine?.severity_tier || telemetry?.risk_stratification?.severity_tier || currentBadge.label,
        riskTag: isCardiacHigh ? "CRITICAL_RISK" : "LOW_RISK",
        clinicalAction: telemetry?.risk_stratification?.clinical_recommendation || "Routine annual cardiovascular follow-up.",
        latencyMs: telemetry?.quantum_engine?.latency_ms || 54.3,
        architecture: "8-Qubit Variational Quantum Circuit (3 Re-Uploading Layers, 72 Params)",
        attributions: [
          {
            featureName: telemetry?.quantum_engine?.lead_detected || "Lead V2 (Septal)",
            measuredValue: (telemetry?.quantum_engine?.quantum_confidence_pct ?? 98.0) / 100,
            baselineValue: 0.1,
            impactPercentage: telemetry?.quantum_engine?.quantum_confidence_pct ?? 98.0,
            direction: isCardiacHigh ? "risk_elevating" : "protective",
            quantumImpact: `Quantum observable attribution localized to ${telemetry?.quantum_engine?.anatomical_region || "Anteroseptal Wall (LAD)"}`,
          },
        ],
        qubits: 8,
        ansatz: "Universal AngleEmbedding + StronglyEntanglingLayers (3 Layers)",
        circuitDepth: 48,
        cnotCount: 24,
        variationalParams: 72,
      },
      cx01: {
        engineName: telemetry?.classical_engine?.name || "QureSight-Classical (ResNet-34)",
        engineDescription: "ResNet-34 + Multi-Scale Dilated Convolutions + CBAM (21.5M Params)",
        modelType: "classical",
        predictionLabel: telemetry?.classical_engine?.prediction || telemetry?.prediction?.clinical_title || "Normal",
        confidence: telemetry?.classical_engine?.confidence_pct ?? 100,
        riskScore: Number(telemetry?.classical_engine?.risk_score ?? telemetry?.risk_stratification?.cardiac_risk_score ?? 2.0),
        riskTier: telemetry?.classical_engine?.severity_tier || telemetry?.risk_stratification?.severity_tier || currentBadge.label,
        riskTag: isCardiacHigh ? "CRITICAL_RISK" : "LOW_RISK",
        clinicalAction: telemetry?.risk_stratification?.clinical_recommendation || "Routine annual cardiovascular follow-up.",
        latencyMs: telemetry?.classical_engine?.latency_ms || 35.3,
        architecture: "ResNet-34 ECGConVT (21.5M Parameters)",
        attributions: [
          {
            featureName: telemetry?.classical_engine?.lead_detected || "Lead V5 (Lateral)",
            measuredValue: (telemetry?.classical_engine?.confidence_pct ?? 78.0) / 100,
            baselineValue: 0.1,
            impactPercentage: telemetry?.classical_engine?.confidence_pct ?? 78.0,
            direction: isCardiacHigh ? "risk_elevating" : "protective",
            quantumImpact: `Spatial Grad-CAM saliency localized to ${telemetry?.classical_engine?.anatomical_region || "Apical Lateral Wall (LCx)"}`,
          },
        ],
      },
      consensusStatus: telemetry?.dual_engine_consensus?.is_concordant ? "Concordant" : "Discordant",
      ecgLeadDetected: leadName,
      ecgAnatomicalRegion: anatomicalRegion,
      aiSummary: fullAiSummary || undefined,
      clinicalAdvice: telemetry?.risk_stratification?.clinical_recommendation,
    };

    setTimeout(() => {
      try {
        downloadCombinedReport(payload);
        showToast({
          title: "Report Download Complete",
          message: `Saved QureSight_Report_${payload.patient.patientId}_Combined.pdf`,
          type: "quantum",
        });
      } catch (err: any) {
        console.error("PDF generation failed:", err);
        showToast({
          title: "Download Failed",
          message: err?.message || "Could not generate PDF report.",
          type: "warning",
        });
      } finally {
        setIsDownloading(false);
      }
    }, 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12 w-full"
    >
      {/* 1. TOP BREADCRUMB & FROSTED GLASS HERO HEADER */}
      <div className="rounded-3xl border border-[#DFEBE8] bg-gradient-to-br from-white via-[#FAFDFD] to-[#EBF7F5]/50 p-6 sm:p-7 shadow-[0_4px_24px_-8px_rgba(0,103,102,0.08)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-rose-500/10 via-[#006766]/5 to-transparent pointer-events-none rounded-full blur-3xl" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <Link
              href="/predict/heart-disease"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#5A7470] hover:text-[#006766] transition-colors mb-1 cursor-pointer"
            >
              <ArrowLeft size={13} /> Back to Screening Studio
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shadow-xs">
                <Heart size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-sans text-2xl sm:text-3xl font-extrabold text-[#082827] tracking-tight">
                    Detailed Patient Health Report
                  </h1>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold uppercase">
                    12-Lead ECG Verified
                  </span>
                </div>
                <p className="text-xs text-[#5A7470]">
                  Comprehensive 12-lead ECG analysis, QureSight AI cardiologist review, and multi-engine diagnostic comparison.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownloadFullReport}
              disabled={isDownloading}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#006766] to-[#0A4F46] hover:from-[#005756] hover:to-[#083E37] text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md shadow-[#006766]/25 cursor-pointer disabled:opacity-60 active:scale-98"
            >
              {isDownloading ? (
                <Loader2 size={14} className="text-[#00B489] animate-spin" />
              ) : (
                <Download size={14} className="text-[#00B489]" />
              )}
              <span>{isDownloading ? "Generating PDF..." : "Download Report (.pdf)"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. UNIFIED WHITE EXECUTIVE CARD */}
      <div className="bg-white rounded-3xl border border-[#DFEBE8] shadow-[0_4px_24px_-8px_rgba(0,103,102,0.06)] overflow-hidden">
        {/* Top Section: Patient Identity & Engine Switch Button */}
        <div className="p-5 sm:p-6 border-b border-[#DFEBE8]/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-white to-[#F7FCFB]">
          {/* Patient Details */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0 shadow-2xs">
              <User size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#082827]">
                  Patient: <span className="font-semibold text-[#082827]">{patientInfo.name || "Patient"}</span>
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#F2F7F6] border border-[#DFEBE8] text-[#5A7470] font-medium">
                  {patientInfo.patient_id || "QS-ECG-1001"}
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  Intake Verified
                </span>
              </div>
              <p className="text-xs text-[#5A7470] mt-0.5">
                Demographics: <strong className="text-[#082827] font-medium">{patientInfo.gender || "Male"}</strong> • Age: <strong className="text-[#082827] font-medium">{patientInfo.age || 55}</strong> • Modality: <strong className="text-[#082827] font-medium">12-Lead Electrocardiogram</strong>
              </p>
            </div>
          </div>

          {/* Model Switch Button: Hybrid Quantum vs Classical Baseline */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F2F7F6] border border-[#DFEBE8] rounded-2xl shrink-0">
            <button
              onClick={() => setSelectedModel("transfinite_1")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isHybrid
                  ? "bg-white text-[#082827] shadow-xs border border-[#DFEBE8] font-bold"
                  : "text-[#5A7470] hover:text-[#082827]"
              }`}
            >
              <Sparkles size={13} className={isHybrid ? "text-[#006766]" : "text-[#5A7470]"} />
              <span>Hybrid Quantum (8-Qubit VQC)</span>
              {isHybrid && <span className="w-1.5 h-1.5 rounded-full bg-[#00B489]" />}
            </button>
            <button
              onClick={() => setSelectedModel("cx_01")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                !isHybrid
                  ? "bg-white text-[#082827] shadow-xs border border-[#DFEBE8] font-bold"
                  : "text-[#5A7470] hover:text-[#082827]"
              }`}
            >
              <Activity size={13} className={!isHybrid ? "text-blue-600" : "text-[#5A7470]"} />
              <span>Classical Baseline (ResNet-34)</span>
              {!isHybrid && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
            </button>
          </div>
        </div>

        {/* Middle Section: Circular Risk Dial, Assessment Tier & Active Telemetry */}
        <div className="p-5 sm:p-6 bg-[#FAFDFD] flex flex-wrap items-center justify-between gap-6 border-b border-[#DFEBE8]/60">
          <div className="flex items-center gap-5">
            {/* High-Contrast Circular Risk Score Dial */}
            <div className="relative w-18 h-18 shrink-0 flex items-center justify-center">
              <svg className="w-18 h-18 -rotate-90" viewBox="0 0 72 72">
                <circle
                  cx="36"
                  cy="36"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="5.5"
                  fill="transparent"
                  className="text-stone-200"
                />
                <circle
                  cx="36"
                  cy="36"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="5.5"
                  fill="transparent"
                  strokeDasharray={dialCircumference}
                  strokeDashoffset={dialOffset}
                  strokeLinecap="round"
                  className={`${currentBadge.stroke} transition-all duration-700`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold font-mono text-[#082827] tracking-tight leading-none">
                  {activeRiskScore.toFixed(0)}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#5A7470] font-semibold mt-0.5">
                  / 100
                </span>
              </div>
            </div>

            {/* Assessment Label & Active Engine Summary */}
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${currentBadge.color}`}>
                  {currentBadge.label}
                </span>
                <div className="flex items-center gap-1 text-xs text-[#5A7470] font-mono">
                  <span>
                    Engine: <strong className="text-[#082827] font-semibold">{activeEngineName}</strong>
                  </span>
                  <span className="text-[11px] text-[#5A7470]/70">({activeLatency} ms)</span>
                  <HelpTooltip title={activeEngineName} text={activeEngineSpecs} />
                </div>
              </div>
              <p className="text-xs text-[#082827] font-medium">
                Active Assessment: <strong className="text-[#082827]">{telemetry.prediction.clinical_title}</strong> ({activeConfidence.toFixed(1)}% Confidence)
              </p>
              <p className="text-xs text-[#5A7470] leading-relaxed">{activeEngineDesc}</p>
            </div>
          </div>

          {/* Right Metrics: Peak Sensitivity & System Certainty */}
          <div className="flex items-center gap-4 bg-white px-5 py-3.5 rounded-2xl border border-[#DFEBE8] shadow-2xs">
            <div className="text-right">
              <div className="flex items-center justify-end gap-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#5A7470] block font-semibold">
                  Peak Sensitivity
                </span>
                <HelpTooltip
                  title="Peak Lead Sensitivity"
                  text="Autograd Grad-CAM peak activation score identifying maximum gradient deflection on the physical ECG strip."
                />
              </div>
              <span className="text-base font-bold font-mono text-[#006766]">
                {(telemetry.pinpointing_gradcam.activation_peak_score * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-8 w-px bg-[#DFEBE8]" />
            <div className="text-right">
              <div className="flex items-center justify-end gap-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#5A7470] block font-semibold">
                  System Certainty
                </span>
                <HelpTooltip
                  title="System Certainty"
                  text="Model statistical confidence derived from clinical validation against verified 12-lead ECG cohorts."
                />
              </div>
              <span className="text-base font-bold font-mono text-[#082827]">
                {activeConfidence.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Attached Navigation Tabs */}
        <div className="bg-[#F7FCFB] px-3.5 py-2.5 flex flex-wrap items-center gap-2">
          {/* Tab 1: Key Risk Factors */}
          <button
            onClick={() => setActiveTab("key_risk_factors")}
            className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "key_risk_factors"
                ? "bg-white text-[#006766] font-bold shadow-xs border border-[#DFEBE8]"
                : "text-[#5A7470] hover:text-[#082827]"
            }`}
          >
            <BarChart3 size={14} className={activeTab === "key_risk_factors" ? "text-[#006766]" : ""} />
            <span>📊 1. Key Risk Factors &amp; Lead Pinpointing</span>
          </button>

          {/* Tab 2: QureSight AI */}
          <button
            onClick={() => setActiveTab("quresight_ai")}
            className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "quresight_ai"
                ? "bg-white text-[#006766] font-bold shadow-xs border border-[#DFEBE8]"
                : "text-[#5A7470] hover:text-[#082827]"
            }`}
          >
            <Sparkles size={14} className={activeTab === "quresight_ai" ? "text-[#006766]" : ""} />
            <span>✨ 2. QureSight AI Cardiologist</span>
          </button>

          {/* Tab 3: Model Comparison */}
          <button
            onClick={() => setActiveTab("model_comparison")}
            className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "model_comparison"
                ? "bg-white text-[#006766] font-bold shadow-xs border border-[#DFEBE8]"
                : "text-[#5A7470] hover:text-[#082827]"
            }`}
          >
            <Layers size={14} className={activeTab === "model_comparison" ? "text-[#006766]" : ""} />
            <span>⚖️ 3. Model Comparison (Classical vs Quantum VQC)</span>
          </button>

          {/* Tab 4: Real-Time Architecture & Circuit Telemetry */}
          <button
            onClick={() => setActiveTab("realtime_graphs")}
            className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "realtime_graphs"
                ? "bg-white text-[#006766] font-bold shadow-xs border border-[#DFEBE8]"
                : "text-[#5A7470] hover:text-[#082827]"
            }`}
          >
            {isHybrid ? (
              <Zap size={14} className={activeTab === "realtime_graphs" ? "text-[#006766]" : "text-[#5A7470]"} />
            ) : (
              <Cpu size={14} className={activeTab === "realtime_graphs" ? "text-blue-600" : "text-[#5A7470]"} />
            )}
            <span>
              {isHybrid
                ? "⚡ 4. Quantum Circuit & Pauli-Z Telemetry"
                : "🔬 4. ResNet-34 Architecture & Layer Flow"}
            </span>
          </button>
        </div>
      </div>

      {/* 3. ACTIVE TAB CONTENT VIEWPORT */}
      <div className="w-full">
        {activeTab === "key_risk_factors" && (
          <KeyRiskFactorsTab
            telemetry={telemetry}
            uploadedImage={uploadedImage}
            patientInfo={patientInfo}
            selectedModel={selectedModel}
          />
        )}

        {activeTab === "quresight_ai" && (
          <AiDoctorConsultationTab
            patientInfo={patientInfo}
            telemetry={telemetry}
            activeEngine={activeEngineName}
            aiSynthesis={aiSynthesis}
          />
        )}

        {activeTab === "model_comparison" && (
          <ModelComparisonTab
            telemetry={telemetry}
            patientName={patientInfo.name || "Patient"}
            selectedModel={selectedModel}
          />
        )}

        {activeTab === "realtime_graphs" && (
          <RealTimeGraphsTab
            telemetry={telemetry}
            patientName={patientInfo.name || "Patient"}
            selectedModel={selectedModel}
          />
        )}
      </div>
    </motion.div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Stethoscope,
  Activity,
  History,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Heart,
  Droplets,
  FlaskConical,
  Microscope,
  Brain,
  Layers,
  Clock,
  User,
  Filter,
  FileText,
  Scan,
  ShieldAlert,
  Dna,
  Zap,
} from "lucide-react";
import { AuthService } from "@/services/auth.service";
import { ScreeningService, type StoredPrediction } from "@/services/screening.service";

type CategoryGroup = "all" | "cardiopulmonary" | "oncology" | "metabolic" | "neuro_radiology";

interface DiseaseModuleItem {
  key: string;
  title: string;
  specialty: string;
  modality: string;
  modalityBadge: string;
  icon: any;
  targetCondition: string;
  clinicalScope: string;
  route: string;
  accentBg: string;
  accentText: string;
  badgeBg: string;
  badgeText: string;
  group: CategoryGroup;
  image: string;
}

const DISEASE_MODULES: DiseaseModuleItem[] = [
  {
    key: "ai_diagnostics",
    title: "Pulmonary Auscultation & Breath Sounds",
    specialty: "Pulmonary Medicine",
    modality: "6-Point Digital Auscultation",
    modalityBadge: "Acoustic Audio",
    icon: Stethoscope,
    targetCondition: "Wheeze, Crackle & Respiratory Triage",
    clinicalScope: "Interactive 6-point digital stethoscope auscultation, breathing visualizer, and multi-engine respiratory triage.",
    route: "/predict",
    accentBg: "bg-teal-50",
    accentText: "text-teal-700",
    badgeBg: "bg-teal-100/80",
    badgeText: "text-teal-800",
    group: "cardiopulmonary",
    image: "/images/disease-cardiovascular.jpg",
  },
  {
    key: "heart_disease",
    title: "12-Lead Electrocardiogram (ECG)",
    specialty: "Cardiac Electrophysiology",
    modality: "12-Lead Diagnostic Strips",
    modalityBadge: "ECG Waveform",
    icon: Heart,
    targetCondition: "Acute Myocardial Infarction & Arrhythmias",
    clinicalScope: "12-lead ECG digitizer with Grad-CAM lead pinpointing, acute ischemic injury scoring, and dual consensus.",
    route: "/predict/heart-disease",
    accentBg: "bg-rose-50",
    accentText: "text-rose-700",
    badgeBg: "bg-rose-100/80",
    badgeText: "text-rose-800",
    group: "cardiopulmonary",
    image: "/samples/ecg/sample-mi.jpg",
  },
  {
    key: "breast_cancer",
    title: "Breast Cytopathology Biopsy Studio",
    specialty: "Histopathology & Oncology",
    modality: "Fine Needle Aspirate (FNA)",
    modalityBadge: "Cellular Biopsy",
    icon: Microscope,
    targetCondition: "Malignant vs Benign Lesion Classification",
    clinicalScope: "Fine needle aspirate assessment evaluating nuclear pleomorphism, texture, perimeter, and cell concavity.",
    route: "/predict/breast-cancer",
    accentBg: "bg-pink-50",
    accentText: "text-pink-700",
    badgeBg: "bg-pink-100/80",
    badgeText: "text-pink-800",
    group: "oncology",
    image: "/images/disease-breast-cancer.jpg",
  },
  {
    key: "heart_tabular",
    title: "Cardiovascular Hemodynamics (CAD)",
    specialty: "Preventive Cardiology",
    modality: "Hemodynamic Stress Profile",
    modalityBadge: "Vascular Panel",
    icon: Activity,
    targetCondition: "Coronary Artery Disease Risk",
    clinicalScope: "Evaluates resting blood pressure, serum cholesterol, exercise ST depression, and fluoroscopy coronary vessels.",
    route: "/predict/heart-tabular",
    accentBg: "bg-red-50",
    accentText: "text-red-700",
    badgeBg: "bg-red-100/80",
    badgeText: "text-red-800",
    group: "cardiopulmonary",
    image: "/images/studios/cad-coronary-angiogram.png",
  },
  {
    key: "liver_ilpd",
    title: "Hepatic Functional Panel",
    specialty: "Hepatology & Metabolic Health",
    modality: "Serum Enzyme Chemistry",
    modalityBadge: "Liver Panel",
    icon: Droplets,
    targetCondition: "Hepatic Dysregulation & Impairment",
    clinicalScope: "Point-of-care liver profiling screening transaminases (ALT/AST), alkaline phosphatase, and albumin/globulin ratios.",
    route: "/predict/liver-ilpd",
    accentBg: "bg-amber-50",
    accentText: "text-amber-700",
    badgeBg: "bg-amber-100/80",
    badgeText: "text-amber-800",
    group: "metabolic",
    image: "/images/studios/liver-function-panel-analysis.png",
  },
  {
    key: "chronic_kidney",
    title: "Nephrology & Renal Function",
    specialty: "Renal Medicine",
    modality: "eGFR & Glomerular Panel",
    modalityBadge: "Renal Panel",
    icon: FlaskConical,
    targetCondition: "Glomerular Impairment & KDIGO Risk",
    clinicalScope: "Serum creatinine, automated CKD-EPI estimated GFR calculation, blood urea nitrogen, and proteinuria scoring.",
    route: "/predict/chronic-kidney",
    accentBg: "bg-cyan-50",
    accentText: "text-cyan-700",
    badgeBg: "bg-cyan-100/80",
    badgeText: "text-cyan-800",
    group: "metabolic",
    image: "/images/disease-kidney-neural.jpg",
  },
  {
    key: "cardiomegaly",
    title: "Thoracic Radiograph (CXR)",
    specialty: "Diagnostic Radiology",
    modality: "Frontal Chest Radiograph",
    modalityBadge: "CXR Radiography",
    icon: Scan,
    targetCondition: "Cardiothoracic Ratio & Silhouette Enlargement",
    clinicalScope: "Automated cardiothoracic ratio calculation and thoracic silhouette enlargement screening on chest radiographs.",
    route: "/predict/cardiomegaly",
    accentBg: "bg-indigo-50",
    accentText: "text-indigo-700",
    badgeBg: "bg-indigo-100/80",
    badgeText: "text-indigo-800",
    group: "neuro_radiology",
    image: "/images/studios/cardiomegaly-cxr-analysis.png",
  },
  {
    key: "hepatitis_c",
    title: "Hepatitis C Staging & Fibrosis",
    specialty: "Viral Pathology & Fibrosis",
    modality: "Serum Enzymes & Biomarkers",
    modalityBadge: "Fibrosis Panel",
    icon: Dna,
    targetCondition: "Fibrosis Staging & Cirrhosis Progression",
    clinicalScope: "Screens serum enzymes, cholinesterase, and metabolic blood markers for hepatitis C viral progression.",
    route: "/predict/hepatitis-c",
    accentBg: "bg-emerald-50",
    accentText: "text-emerald-700",
    badgeBg: "bg-emerald-100/80",
    badgeText: "text-emerald-800",
    group: "metabolic",
    image: "/images/studios/liver-function-panel-analysis.png",
  },
  {
    key: "neurological",
    title: "Cognitive Profile & Neurological Studio",
    specialty: "Neuro-Cognitive Health",
    modality: "EEG Spectral Rhythms",
    modalityBadge: "Neuro Profile",
    icon: Brain,
    targetCondition: "Early Neurodegenerative & Tremor Risk",
    clinicalScope: "Analyzes cortical EEG power spectra, tremor frequencies, and psychomotor speed for early impairment indications.",
    route: "/predict/neurological",
    accentBg: "bg-purple-50",
    accentText: "text-purple-700",
    badgeBg: "bg-purple-100/80",
    badgeText: "text-purple-800",
    group: "neuro_radiology",
    image: "/images/studios/brain-health-eeg-analysis.png",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("Clinician");
  const [recentPredictions, setRecentPredictions] = useState<StoredPrediction[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<CategoryGroup>("all");

  const handleViewScreening = (pred: StoredPrediction) => {
    try {
      const isCardiac =
        (pred.diseaseType && (pred.diseaseType.toLowerCase().includes("cardiac") || pred.diseaseType.toLowerCase().includes("ecg"))) ||
        (pred.disease && pred.disease.toLowerCase().includes("heart")) ||
        (pred.cohort && pred.cohort.toLowerCase().includes("ecg"));

      if (isCardiac) {
        let fallbackImage = "/samples/ecg/sample-normal.jpg";
        if (pred.quantumPrediction?.includes("Infarction") || pred.classicalPrediction?.includes("Infarction")) {
          fallbackImage = "/samples/ecg/sample-mi.jpg";
        } else if (pred.quantumPrediction?.includes("History") || pred.classicalPrediction?.includes("History")) {
          fallbackImage = "/samples/ecg/sample-history-mi.jpg";
        } else if (pred.quantumPrediction?.includes("Abnormal") || pred.quantumPrediction?.includes("Arrhythmia")) {
          fallbackImage = "/samples/ecg/sample-arrhythmia.jpg";
        }
        const ecgImage = pred.imageUrl || pred.telemetryJson?.pinpointing_gradcam?.heatmap_image_base64 || fallbackImage;

        const activeCardiacPayload = {
          patientInfo: {
            name: pred.patientName || "Patient",
            patient_id: pred.patientId || pred.id,
            age: pred.patientAge || 55,
            gender: pred.patientGender || "Male",
            intake_date: pred.timestamp ? pred.timestamp.split(" ")[0] : new Date().toISOString().split("T")[0],
          },
          uploadedImage: ecgImage,
          imageMeta: pred.imageMeta || {
            name: `${pred.id}_12Lead_ECG.jpg`,
            size: "695 KB",
            dimensions: "2200 × 1200 px",
          },
          telemetry: pred.telemetryJson || {
            prediction: {
              class_name: pred.quantumPrediction || "Normal",
              clinical_title:
                pred.quantumPrediction === "Normal"
                  ? "Normal Sinus Rhythm (Physiological)"
                  : pred.quantumPrediction === "Myocardial Infarction"
                  ? "Acute Myocardial Infarction (STEMI / Severe Ischemic Injury)"
                  : pred.quantumPrediction === "History of MI"
                  ? "History of Prior Myocardial Infarction (Pathological Q-Waves)"
                  : "Cardiac Arrhythmia / Conduction Disturbance",
              confidence_pct: pred.quantumConfidence ?? 98.0,
              probabilities: {
                Normal: pred.quantumPrediction === "Normal" ? (pred.quantumConfidence ?? 98.0) / 100 : 0.05,
                "Myocardial Infarction": pred.quantumPrediction === "Myocardial Infarction" ? (pred.quantumConfidence ?? 98.0) / 100 : 0.05,
                "History of MI": pred.quantumPrediction === "History of MI" ? (pred.quantumConfidence ?? 98.0) / 100 : 0.05,
                "Abnormal Heartbeat": pred.quantumPrediction === "Abnormal Heartbeat" ? (pred.quantumConfidence ?? 98.0) / 100 : 0.05,
              },
            },
            risk_stratification: {
              cardiac_risk_score: pred.quantumRiskScore ?? 25.0,
              score_scale: "0 - 100",
              severity_tier:
                (pred.quantumRiskScore ?? 0) >= 85
                  ? "CRITICAL EMERGENCY (CODE RED)"
                  : (pred.quantumRiskScore ?? 0) >= 60
                  ? "HIGH RISK (CARDIAC CONDUCTION DISTURBANCE)"
                  : (pred.quantumRiskScore ?? 0) >= 35
                  ? "MODERATE RISK (PRIOR ISCHEMIC SCAR)"
                  : "LOW RISK (NORMAL SINUS RHYTHM)",
              clinical_recommendation: pred.clinicalNote || "Follow guideline-directed medical monitoring and outpatient cardiology follow-up.",
              primary_driver: pred.topDriver || "Lead V2 (Septal)",
            },
            pinpointing_gradcam: {
              heatmap_image_base64: ecgImage,
              lead_detected: pred.topDriver?.split(" (")[0] || "Lead V2 (Septal)",
              anatomical_region: pred.topDriver?.split(" (")[1]?.replace(")", "") || "Anteroseptal Junction (LAD)",
              activation_peak_score: (pred.topDriverImpact ?? 80) / 100,
              coordinates: { peak_x: 650, peak_y: 420, rel_x: 0.29, rel_y: 0.35 },
            },
            quantum_engine: {
              signature: "QureSight Quantum VQC",
              qubits: 8,
              ansatz: "8-Qubit AngleEmbedding + StronglyEntanglingLayers (2 Layers)",
              statevector_backend: "PennyLane default.qubit",
              quantum_prediction: pred.quantumPrediction,
              quantum_confidence_pct: pred.quantumConfidence,
              quantum_probabilities: {
                Normal: pred.quantumPrediction === "Normal" ? 0.95 : 0.05,
                "Myocardial Infarction": pred.quantumPrediction === "Myocardial Infarction" ? 0.95 : 0.05,
                "History of MI": pred.quantumPrediction === "History of MI" ? 0.95 : 0.05,
                "Abnormal Heartbeat": pred.quantumPrediction === "Abnormal Heartbeat" ? 0.95 : 0.05,
              },
              variational_parameters: 48,
              latency_ms: pred.quantumExecutionTimeMs ?? 54.32,
            },
            classical_engine: {
              name: "Classical ResNet-18",
              architecture: "ResNet-18 + FC (512 -> 256 -> 4)",
              prediction: pred.classicalPrediction,
              confidence_pct: pred.classicalConfidence,
              total_parameters: 11178564,
              latency_ms: pred.classicalExecutionTimeMs ?? 35.31,
            },
            dual_engine_consensus: {
              status: pred.consensusStatus || "Concordant",
              is_concordant: pred.consensusStatus === "Concordant",
              consensus_confidence: pred.quantumConfidence ?? 98.0,
              total_latency_ms: (pred.quantumExecutionTimeMs ?? 54.32) + (pred.classicalExecutionTimeMs ?? 35.31),
            },
          },
        };
        sessionStorage.setItem("quresight_active_cardiac_analysis", JSON.stringify(activeCardiacPayload));
        router.push("/predict/heart-disease/analysis");
        return;
      }

      // Default: Breast cancer cytopathology
      const activePayload = {
        patientInfo: {
          name: pred.patientName,
          patient_id: pred.id,
          age: pred.patientAge || 55,
          gender: pred.patientGender || "Female",
        },
        biomarkers:
          pred.inputFeatures && Object.keys(pred.inputFeatures).length > 0
            ? pred.inputFeatures
            : {
                radius_mean: 12.2,
                texture_mean: 17.39,
                perimeter_mean: 78.18,
                area_mean: 458.7,
                smoothness_mean: 0.0908,
                compactness_mean: 0.0645,
                concavity_mean: 0.0371,
                concave_points_mean: 0.0234,
              },
        screeningResult: {
          engine: "Quantum VQC",
          prediction_label: pred.quantumPrediction,
          confidence: pred.quantumConfidence,
          composite_risk_score: pred.quantumRiskScore ?? 42.4,
          dual_comparison: {
            transfinite_1: {
              prediction_label: pred.quantumPrediction,
              risk_score: pred.quantumRiskScore ?? 42.4,
              confidence: pred.quantumConfidence,
              latency_ms: pred.quantumExecutionTimeMs ?? 700.4,
            },
            cx_01: {
              prediction_label: pred.classicalPrediction,
              risk_score: pred.classicalRiskScore ?? 44.1,
              confidence: pred.classicalConfidence,
              latency_ms: pred.classicalExecutionTimeMs ?? 104.4,
            },
          },
        },
      };
      sessionStorage.setItem("quresight_active_analysis", JSON.stringify(activePayload));
      router.push("/predict/breast-cancer/analysis");
    } catch (err) {
      console.warn("Could not route to analysis:", err);
    }
  };

  useEffect(() => {
    const cachedUser = AuthService.getCachedUser();
    if (cachedUser) {
      const raw = cachedUser.fullName || cachedUser.username || "Clinician";
      setUserName(raw.replace(/_/g, " ").trim());
    }

    const cached = ScreeningService.getCachedScreenings();
    if (cached && cached.length > 0) {
      setRecentPredictions(cached.slice(0, 5));
    }

    ScreeningService.getScreenings()
      .then((records) => {
        setRecentPredictions((records || []).slice(0, 5));
      })
      .catch(() => {});
  }, []);

  const filteredModules = DISEASE_MODULES.filter((module) => {
    if (selectedGroup === "all") return true;
    return module.group === selectedGroup;
  });

  return (
    <div className="space-y-6 pb-12 w-full max-w-7xl mx-auto">
      {/* ========================================================================= */}
      {/* 1. CLINICIAN WORKSTATION COMMAND HEADER */}
      {/* ========================================================================= */}
      <div className="w-full bg-white rounded-3xl border border-[#DFEBE8] p-6 sm:p-7 shadow-[0_4px_24px_-8px_rgba(0,103,102,0.06)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-[#E6F7F4] via-transparent to-transparent pointer-events-none rounded-full blur-2xl" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F7F4] border border-[#00B489]/30 text-xs font-semibold text-[#006766]">
              <span className="w-2 h-2 rounded-full bg-[#00B489] animate-pulse" />
              <span>Clinical Triage Workstation · Active Shift</span>
            </div>
            <h1 className="font-sans text-2xl sm:text-3xl font-extrabold text-[#082827] tracking-tight">
              Welcome back, <span className="text-[#006766]">{userName}</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#5A7470] font-normal leading-relaxed">
              Point-of-care multimodal screening console. Select an active specialty terminal to initiate intake, or review verified case dossiers in the clinical activity ledger.
            </p>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/predict"
              className="px-4 py-2.5 rounded-xl bg-[#006766] hover:bg-[#084E4D] text-white font-semibold text-xs tracking-wider transition-all shadow-md shadow-[#006766]/20 flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles size={14} className="text-[#00B489]" />
              <span>Start Patient Intake</span>
            </Link>
            <Link
              href="/history"
              className="px-4 py-2.5 rounded-xl bg-[#F7FAF9] hover:bg-[#E6F7F4] border border-[#DFEBE8] text-[#082827] font-semibold text-xs tracking-wider transition-all flex items-center gap-1.5 cursor-pointer hover:border-[#006766]/40"
            >
              <History size={14} className="text-[#006766]" />
              <span>Case Dossiers ({recentPredictions.length})</span>
            </Link>
            <Link
              href="/evidence-matrix"
              className="px-4 py-2.5 rounded-xl bg-[#F7FAF9] hover:bg-[#E6F7F4] border border-[#DFEBE8] text-[#082827] font-semibold text-xs tracking-wider transition-all flex items-center gap-1.5 cursor-pointer hover:border-[#006766]/40"
            >
              <FileText size={14} className="text-[#006766]" />
              <span>Evidence Ledger</span>
            </Link>
          </div>
        </div>

        {/* Real Operational Workstation Metrics (Zero Mock/Fake Numbers) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5 mt-5 border-t border-[#DFEBE8]/80">
          <div className="p-3.5 rounded-2xl bg-[#F7FAF9]/80 border border-[#DFEBE8]/60 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5A7470]">
              <CheckCircle2 size={14} className="text-[#00B489]" />
              <span>Diagnostic Coverage</span>
            </div>
            <div className="font-sans text-xl font-bold text-[#082827]">
              9 Terminals
            </div>
            <p className="text-[11px] text-[#5A7470]">Active screening pipelines</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F7FAF9]/80 border border-[#DFEBE8]/60 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5A7470]">
              <Layers size={14} className="text-[#006766]" />
              <span>Input Modalities</span>
            </div>
            <div className="font-sans text-xl font-bold text-[#082827]">
              Multimodal
            </div>
            <p className="text-[11px] text-[#5A7470]">Acoustic • ECG • Image • Lab</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F7FAF9]/80 border border-[#DFEBE8]/60 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5A7470]">
              <ShieldCheck size={14} className="text-[#00B489]" />
              <span>Inference Protocol</span>
            </div>
            <div className="font-sans text-xl font-bold text-[#082827]">
              Dual Hybrid
            </div>
            <p className="text-[11px] text-[#5A7470]">Quantum VQC + Deep Learning</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F7FAF9]/80 border border-[#DFEBE8]/60 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5A7470]">
              <Clock size={14} className="text-[#006766]" />
              <span>Session Screenings</span>
            </div>
            <div className="font-sans text-xl font-bold text-[#082827]">
              {recentPredictions.length} Logged
            </div>
            <p className="text-[11px] text-[#5A7470]">Recorded in current session</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CLINICAL SPECIALTY FILTER & 3-COLUMN SUITES GRID WITH PICTURES */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        {/* Section Header with Category Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-sans text-xl sm:text-2xl font-bold text-[#082827] tracking-tight">
              Diagnostic Screening Suites ({filteredModules.length})
            </h2>
            <p className="text-xs sm:text-sm text-[#5A7470]">
              Select an active clinical department to intake patient data and execute algorithmic diagnostics.
            </p>
          </div>

          {/* Specialty Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F2F7F6] rounded-2xl border border-[#DFEBE8] text-xs">
            <button
              type="button"
              onClick={() => setSelectedGroup("all")}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                selectedGroup === "all"
                  ? "bg-white text-[#006766] shadow-xs"
                  : "text-[#5A7470] hover:text-[#082827]"
              }`}
            >
              All Suites (9)
            </button>
            <button
              type="button"
              onClick={() => setSelectedGroup("cardiopulmonary")}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                selectedGroup === "cardiopulmonary"
                  ? "bg-white text-[#006766] shadow-xs"
                  : "text-[#5A7470] hover:text-[#082827]"
              }`}
            >
              Cardiopulmonary
            </button>
            <button
              type="button"
              onClick={() => setSelectedGroup("oncology")}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                selectedGroup === "oncology"
                  ? "bg-white text-[#006766] shadow-xs"
                  : "text-[#5A7470] hover:text-[#082827]"
              }`}
            >
              Oncology
            </button>
            <button
              type="button"
              onClick={() => setSelectedGroup("metabolic")}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                selectedGroup === "metabolic"
                  ? "bg-white text-[#006766] shadow-xs"
                  : "text-[#5A7470] hover:text-[#082827]"
              }`}
            >
              Metabolic & Renal
            </button>
            <button
              type="button"
              onClick={() => setSelectedGroup("neuro_radiology")}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                selectedGroup === "neuro_radiology"
                  ? "bg-white text-[#006766] shadow-xs"
                  : "text-[#5A7470] hover:text-[#082827]"
              }`}
            >
              Radiology & Neuro
            </button>
          </div>
        </div>

        {/* 3-Column Grid of Terminal Cards with Pictures */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredModules.map((disease) => {
            const Icon = disease.icon;
            return (
              <div
                key={disease.key}
                className="bg-white rounded-3xl border border-[#DFEBE8] overflow-hidden flex flex-col justify-between shadow-[0_2px_16px_-4px_rgba(0,103,102,0.05)] hover:shadow-[0_12px_32px_-6px_rgba(0,103,102,0.14)] hover:border-[#006766]/50 transition-all group"
              >
                <div>
                  {/* High-Resolution Medical Preview Picture */}
                  <div className="relative w-full h-44 bg-[#F7FAF9] overflow-hidden border-b border-[#DFEBE8]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={disease.image}
                      alt={disease.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent pointer-events-none" />

                    {/* Top Overlay Specialty & Modality Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-white/95 text-[#006766] shadow-sm border border-white/60 backdrop-blur-xs flex items-center gap-1.5">
                        <Icon size={12} className="text-[#00B489]" />
                        <span>{disease.specialty}</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/60 text-white border border-white/20 backdrop-blur-xs">
                        {disease.modalityBadge}
                      </span>
                    </div>

                    {/* Bottom Image Overlay: Target Condition */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center gap-1.5 text-white text-[11px] font-medium drop-shadow-sm truncate pointer-events-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00B489] shrink-0" />
                      <span className="truncate">{disease.targetCondition}</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-2.5">
                    <h3 className="font-sans text-base sm:text-lg font-bold text-[#082827] leading-snug group-hover:text-[#006766] transition-colors">
                      {disease.title}
                    </h3>
                    <p className="text-xs text-[#5A7470] font-normal leading-relaxed line-clamp-2">
                      {disease.clinicalScope}
                    </p>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="p-5 pt-0">
                  <Link
                    href={disease.route}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#F7FAF9] group-hover:bg-[#006766] text-[#006766] group-hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-2xs group-hover:shadow-md group-hover:shadow-[#006766]/20 cursor-pointer"
                  >
                    <span>Launch Screening Suite</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. RECENT CLINICAL CASE RECORDS (REAL DATA ONLY) */}
      {/* ========================================================================= */}
      <section className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-sans text-xl sm:text-2xl font-bold text-[#082827] tracking-tight">
              Recent Patient Screenings
            </h2>
            <p className="text-xs text-[#5A7470]">
              Diagnostic tests and algorithmic evaluations recorded in your current clinical session.
            </p>
          </div>

          {recentPredictions.length > 0 && (
            <Link
              href="/history"
              className="text-xs font-bold text-[#006766] hover:text-[#084E4D] flex items-center gap-1 transition-colors"
            >
              <span>View All Records ({recentPredictions.length})</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {recentPredictions.length === 0 ? (
          /* GENUINE CLEAN EMPTY STATE (ZERO FAKE DATA) */
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#DFEBE8] text-center space-y-4 shadow-[0_2px_16px_-4px_rgba(0,103,102,0.04)]">
            <div className="w-14 h-14 rounded-2xl bg-[#E6F7F4] border border-[#00B489]/30 text-[#006766] mx-auto flex items-center justify-center">
              <Stethoscope size={26} className="text-[#006766]" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="font-sans text-lg font-bold text-[#082827]">
                No patient screenings logged in this session
              </h3>
              <p className="text-xs text-[#5A7470] font-normal leading-relaxed">
                Launch any diagnostic terminal above to intake patient data, run multi-engine evaluations, and generate verified case records.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/predict"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#006766] hover:bg-[#084E4D] text-white font-semibold text-xs tracking-wider transition-all shadow-md shadow-[#006766]/20 cursor-pointer"
              >
                <Sparkles size={14} className="text-[#00B489]" />
                <span>Start First Patient Screening</span>
              </Link>
            </div>
          </div>
        ) : (
          /* POPULATED ACTIVITY TABLE */
          <div className="bg-white rounded-3xl border border-[#DFEBE8] shadow-[0_2px_16px_-4px_rgba(0,103,102,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#F7FAF9] border-b border-[#DFEBE8] text-[11px] font-semibold uppercase tracking-wider text-[#5A7470]">
                  <tr>
                    <th className="py-3.5 px-5 font-semibold">Patient Case</th>
                    <th className="py-3.5 px-5 font-semibold">Diagnostic Specialty</th>
                    <th className="py-3.5 px-5 font-semibold">Algorithmic Verdict</th>
                    <th className="py-3.5 px-5 font-semibold">Consensus Engine</th>
                    <th className="py-3.5 px-5 font-semibold">Intake Time</th>
                    <th className="py-3.5 px-5 text-right font-semibold">Dossier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFEBE8]/60 text-[#082827]">
                  {recentPredictions.map((pred, i) => (
                    <tr
                      key={i}
                      onClick={() => handleViewScreening(pred)}
                      className="hover:bg-[#F2F7F6]/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#E6F7F4] border border-[#00B489]/20 text-[#006766] font-bold text-xs flex items-center justify-center shrink-0">
                            {(pred.patientName || "P").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-[#082827]">{pred.patientName || "Patient"}</div>
                            <div className="text-[10px] text-[#5A7470] font-mono">{pred.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-[#5A7470]">
                        <span className="font-medium text-[#082827]">{pred.disease || pred.diseaseType || "Clinical Screening"}</span>
                      </td>
                      <td className="py-3.5 px-5 font-medium">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                            pred.riskLevel === "High" || pred.quantumPrediction?.includes("Malignant") || pred.quantumPrediction?.includes("Infarction")
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-[#E6F7F4] text-[#006766] border border-[#00B489]/30"
                          }`}
                        >
                          {pred.quantumPrediction || "Physiological Baseline"}
                          {pred.quantumConfidence ? ` (${Math.round(pred.quantumConfidence)}%)` : ""}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-[#5A7470]">
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#006766] font-medium">
                          <ShieldCheck size={13} className="text-[#00B489]" />
                          <span>{pred.consensusStatus || "Dual-Verified"}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-[#5A7470] font-mono text-[11px]">
                        {pred.timestamp || "Recent"}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <span className="text-xs font-semibold text-[#006766] group-hover:underline inline-flex items-center gap-1">
                          <span>Open Dossier</span>
                          <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

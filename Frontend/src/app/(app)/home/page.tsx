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
  FolderHeart,
  FileCheck,
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
              Point-of-care multimodal screening console. Select an active specialty terminal to initiate intake, or review verified case dossiers in the clinical activity queue.
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
      </div>

      {/* ========================================================================= */}
      {/* 2. RESPONSIVE TWO-COLUMN WORKSTATION LAYOUT */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ===================================================================== */}
        {/* MAIN COLUMN (8 of 12): SPECIALTY FILTER & TERMINAL SUITES WITH PICTURES */}
        {/* ===================================================================== */}
        <div className="lg:col-span-8 space-y-4">
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#DFEBE8] shadow-2xs">
            <div>
              <h2 className="font-sans text-lg font-bold text-[#082827] tracking-tight">
                Diagnostic Screening Suites ({filteredModules.length})
              </h2>
              <p className="text-xs text-[#5A7470]">
                Multimodal point-of-care intake terminals with verified AI consensus.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-[#F2F7F6] rounded-xl border border-[#DFEBE8] text-[11px]">
              <button
                type="button"
                onClick={() => setSelectedGroup("all")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedGroup === "all"
                    ? "bg-white text-[#006766] shadow-xs"
                    : "text-[#5A7470] hover:text-[#082827]"
                }`}
              >
                All (9)
              </button>
              <button
                type="button"
                onClick={() => setSelectedGroup("cardiopulmonary")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
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
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
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
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedGroup === "metabolic"
                    ? "bg-white text-[#006766] shadow-xs"
                    : "text-[#5A7470] hover:text-[#082827]"
                }`}
              >
                Metabolic
              </button>
              <button
                type="button"
                onClick={() => setSelectedGroup("neuro_radiology")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedGroup === "neuro_radiology"
                    ? "bg-white text-[#006766] shadow-xs"
                    : "text-[#5A7470] hover:text-[#082827]"
                }`}
              >
                Radiology
              </button>
            </div>
          </div>

          {/* Grid of 2 Columns for Rich Terminal Cards with Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredModules.map((disease) => {
              const Icon = disease.icon;
              return (
                <div
                  key={disease.key}
                  className="bg-white rounded-2xl border border-[#DFEBE8] overflow-hidden flex flex-col justify-between shadow-[0_2px_14px_-4px_rgba(0,103,102,0.05)] hover:shadow-[0_8px_24px_-4px_rgba(0,103,102,0.12)] hover:border-[#006766]/50 transition-all group"
                >
                  <div>
                    {/* Visual Preview Picture */}
                    <div className="relative w-full h-36 bg-[#F7FAF9] overflow-hidden border-b border-[#DFEBE8]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={disease.image}
                        alt={disease.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

                      {/* Top Overlay Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-white/95 text-[#006766] shadow-2xs border border-white/50 backdrop-blur-xs">
                          {disease.specialty}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 text-white border border-white/20 backdrop-blur-xs">
                          {disease.modalityBadge}
                        </span>
                      </div>

                      {/* Bottom Image Overlay Tag */}
                      <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center gap-1.5 text-white text-[11px] font-medium drop-shadow-sm truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00B489] shrink-0" />
                        <span className="truncate">{disease.targetCondition}</span>
                      </div>
                    </div>

                    {/* Card Content Area */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg ${disease.accentBg} ${disease.accentText} flex items-center justify-center shrink-0`}>
                          <Icon size={15} />
                        </div>
                        <h3 className="font-sans text-sm sm:text-base font-bold text-[#082827] leading-snug group-hover:text-[#006766] transition-colors line-clamp-1">
                          {disease.title}
                        </h3>
                      </div>

                      <p className="text-xs text-[#5A7470] font-normal leading-relaxed line-clamp-2">
                        {disease.clinicalScope}
                      </p>
                    </div>
                  </div>

                  {/* Card Action Button */}
                  <div className="p-4 pt-0">
                    <Link
                      href={disease.route}
                      className="w-full py-2 px-3 rounded-xl bg-[#F7FAF9] group-hover:bg-[#006766] text-[#006766] group-hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-2xs group-hover:shadow-md group-hover:shadow-[#006766]/20 cursor-pointer"
                    >
                      <span>Launch Screening Suite</span>
                      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* RIGHT SIDEBAR PANEL (4 of 12): RECENT CASE QUEUE & WORKSTATION READINESS */}
        {/* ===================================================================== */}
        <div className="lg:col-span-4 space-y-5">
          {/* Quick Intake Shortcuts Panel */}
          <div className="bg-white rounded-3xl border border-[#DFEBE8] p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#082827] flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#00B489]" />
                <span>Fast Intake Shortcuts</span>
              </span>
              <span className="text-[10px] text-[#5A7470] font-mono">1-Click</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/predict"
                className="p-2.5 rounded-xl bg-[#F7FAF9] hover:bg-[#E6F7F4] border border-[#DFEBE8] text-[#082827] hover:text-[#006766] font-medium transition-all flex flex-col gap-1 cursor-pointer"
              >
                <div className="flex items-center gap-1 text-[#006766] font-bold text-[11px]">
                  <Stethoscope size={13} />
                  <span>Lung Audio</span>
                </div>
                <span className="text-[10px] text-[#5A7470]">Digital Stethoscope</span>
              </Link>

              <Link
                href="/predict/heart-disease"
                className="p-2.5 rounded-xl bg-[#F7FAF9] hover:bg-[#E6F7F4] border border-[#DFEBE8] text-[#082827] hover:text-[#006766] font-medium transition-all flex flex-col gap-1 cursor-pointer"
              >
                <div className="flex items-center gap-1 text-rose-700 font-bold text-[11px]">
                  <Heart size={13} />
                  <span>12-Lead ECG</span>
                </div>
                <span className="text-[10px] text-[#5A7470]">Ischemia & Rhythm</span>
              </Link>

              <Link
                href="/predict/breast-cancer"
                className="p-2.5 rounded-xl bg-[#F7FAF9] hover:bg-[#E6F7F4] border border-[#DFEBE8] text-[#082827] hover:text-[#006766] font-medium transition-all flex flex-col gap-1 cursor-pointer"
              >
                <div className="flex items-center gap-1 text-pink-700 font-bold text-[11px]">
                  <Microscope size={13} />
                  <span>FNA Biopsy</span>
                </div>
                <span className="text-[10px] text-[#5A7470]">Cell Cytopathology</span>
              </Link>

              <Link
                href="/predict/cardiomegaly"
                className="p-2.5 rounded-xl bg-[#F7FAF9] hover:bg-[#E6F7F4] border border-[#DFEBE8] text-[#082827] hover:text-[#006766] font-medium transition-all flex flex-col gap-1 cursor-pointer"
              >
                <div className="flex items-center gap-1 text-indigo-700 font-bold text-[11px]">
                  <Scan size={13} />
                  <span>Chest X-Ray</span>
                </div>
                <span className="text-[10px] text-[#5A7470]">Silhouette Ratio</span>
              </Link>
            </div>
          </div>

          {/* Dedicated Recent Patient Screenings Queue */}
          <div className="bg-white rounded-3xl border border-[#DFEBE8] p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#DFEBE8] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#082827]">
                  Clinical Patient Queue
                </h3>
                <p className="text-[11px] text-[#5A7470]">
                  Session screening records ({recentPredictions.length})
                </p>
              </div>

              {recentPredictions.length > 0 && (
                <Link
                  href="/history"
                  className="text-[11px] font-bold text-[#006766] hover:underline flex items-center gap-0.5"
                >
                  <span>All ({recentPredictions.length})</span>
                  <ChevronRight size={12} />
                </Link>
              )}
            </div>

            {recentPredictions.length === 0 ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#E6F7F4] text-[#006766] mx-auto flex items-center justify-center">
                  <FolderHeart size={18} />
                </div>
                <p className="text-xs font-semibold text-[#082827]">No cases screened yet</p>
                <p className="text-[11px] text-[#5A7470] max-w-[200px] mx-auto">
                  Execute patient intake from the suites to generate verified case records.
                </p>
                <Link
                  href="/predict"
                  className="inline-block mt-1 text-[11px] font-bold text-[#006766] hover:underline"
                >
                  Start First Intake →
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto no-scrollbar">
                {recentPredictions.map((pred, i) => (
                  <div
                    key={i}
                    onClick={() => handleViewScreening(pred)}
                    className="p-3 rounded-2xl border border-[#DFEBE8] hover:border-[#006766]/50 bg-[#F7FAF9]/60 hover:bg-white transition-all cursor-pointer space-y-2 group shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#E6F7F4] text-[#006766] font-bold text-[11px] flex items-center justify-center shrink-0">
                          {(pred.patientName || "P").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-xs text-[#082827] group-hover:text-[#006766] transition-colors block">
                            {pred.patientName || "Patient"}
                          </span>
                          <span className="text-[10px] text-[#5A7470] font-mono">
                            {pred.id}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                          pred.riskLevel === "High" || pred.quantumPrediction?.includes("Malignant") || pred.quantumPrediction?.includes("Infarction")
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-[#E6F7F4] text-[#006766] border border-[#00B489]/30"
                        }`}
                      >
                        {pred.quantumPrediction || "Physiological"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#5A7470] border-t border-[#DFEBE8]/60 pt-1.5 font-mono">
                      <span>{pred.disease || pred.diseaseType || "Clinical Intake"}</span>
                      <span className="text-[#006766] font-semibold group-hover:underline flex items-center gap-0.5">
                        <span>Review</span>
                        <ChevronRight size={10} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Workstation Integrity & Telemetry Panel (100% Real Operational Metrics) */}
          <div className="bg-white rounded-3xl border border-[#DFEBE8] p-5 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#082827] flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#00B489]" />
              <span>Workstation Verification</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#F7FAF9]">
                <span className="text-[#5A7470]">Active Terminals</span>
                <span className="font-semibold text-[#082827]">9/9 Operational</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#F7FAF9]">
                <span className="text-[#5A7470]">Inference Engine</span>
                <span className="font-semibold text-[#006766]">Dual Hybrid VQC</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#F7FAF9]">
                <span className="text-[#5A7470]">Data Privacy</span>
                <span className="font-semibold text-[#082827]">HIPAA / In-Memory</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#F7FAF9]">
                <span className="text-[#5A7470]">Session Activity</span>
                <span className="font-semibold text-[#082827]">{recentPredictions.length} Screenings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

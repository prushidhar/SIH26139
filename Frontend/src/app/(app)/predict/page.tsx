"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Heart,
  Droplets,
  Lock,
  ArrowRight,
  X,
  Microscope,
  Layers,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Activity,
  History,
  CheckCircle2,
  AlertCircle,
  Zap,
  FlaskConical,
} from "lucide-react";
import HelpTooltip from "@/components/common/HelpTooltip";
import AiDiagnosticsApp from "@/components/diagnostics/AiDiagnosticsApp";

interface DiseaseModule {
  key: string;
  title: string;
  category: string;
  datasetName: string;
  status: "active" | "beta_locked";
  statusLabel: string;
  icon: any;
  image: string;
  description: string;
  targetUrl?: string;
  metrics: {
    cohortSize: string;
    engine: string;
    accuracy: string;
  };
}

const DISEASE_MODULES: DiseaseModule[] = [
  {
    key: "breast_cancer",
    title: "Breast Cancer Screening",
    category: "Oncology",
    datasetName: "569 Biopsy Records",
    status: "active",
    statusLabel: "Active Studio",
    icon: Microscope,
    image: "/images/disease-breast-cancer.jpg",
    description: "Evaluates cell biopsy markers to assess tissue malignancy with dual classical-quantum pipelines.",
    targetUrl: "/predict/breast-cancer",
    metrics: {
      cohortSize: "569 Cases",
      engine: "Dual Quantum-Classical",
      accuracy: "98.2% Consensus"
    }
  },
  {
    key: "heart_disease",
    title: "Cardiac ECG Analysis",
    category: "Cardiology",
    datasetName: "12-Lead ECG Strips",
    status: "active",
    statusLabel: "Active Studio",
    icon: Heart,
    image: "/images/disease-cardiovascular.jpg",
    description: "Analyzes 12-lead ECGs for acute heart attack, myocardial ischemia, and arrhythmia.",
    targetUrl: "/predict/heart-disease",
    metrics: {
      cohortSize: "Clinical Cohort",
      engine: "ResNet-18 + 8Q VQC",
      accuracy: "98.8% Consensus"
    }
  },
  {
    key: "cardiomegaly",
    title: "Chest X-Ray Cardiomegaly",
    category: "Radiology",
    datasetName: "CheXpert CXR",
    status: "active",
    statusLabel: "Active Studio",
    icon: Layers,
    image: "/images/disease-cardiovascular.jpg",
    description: "Detects heart enlargement from frontal chest radiographs via DenseNet-121 + 6-Qubit VQC.",
    targetUrl: "/predict/cardiomegaly",
    metrics: {
      cohortSize: "1,200 Radiographs",
      engine: "6-Qubit Transfer VQC",
      accuracy: "0.930 ROC-AUC"
    }
  },
  {
    key: "heart_tabular",
    title: "Cardiovascular Vitals (CAD)",
    category: "Cardiology",
    datasetName: "Cleveland Cohort",
    status: "active",
    statusLabel: "Active Studio",
    icon: Heart,
    image: "/images/disease-cardiovascular.jpg",
    description: "Assesses coronary artery disease risk from hemodynamic clinical vitals.",
    targetUrl: "/predict/heart-tabular",
    metrics: {
      cohortSize: "303 Cases",
      engine: "4-Qubit VQC",
      accuracy: "0.918 ROC-AUC"
    }
  },
  {
    key: "liver_ilpd",
    title: "Liver Function Panel (ILPD)",
    category: "Hepatology",
    datasetName: "ILPD Cohort",
    status: "active",
    statusLabel: "Active Studio",
    icon: Droplets,
    image: "/images/disease-breast-cancer.jpg",
    description: "Evaluates 10 liver enzyme markers for early hepatic impairment via 2-qubit minimal VQC.",
    targetUrl: "/predict/liver-ilpd",
    metrics: {
      cohortSize: "583 Records",
      engine: "2-Qubit Minimal VQC",
      accuracy: "0.772 ROC-AUC"
    }
  },
  {
    key: "neurological",
    title: "Brain Health & EEG",
    category: "Neurology",
    datasetName: "EEG & Psychomotor",
    status: "active",
    statusLabel: "Active Studio",
    icon: Activity,
    image: "/images/disease-neurological.jpg",
    description: "Evaluates EEG spectral power and motor tremor for early neuro-cognitive risk.",
    targetUrl: "/predict/neurological",
    metrics: {
      cohortSize: "400 Profiles",
      engine: "4-Qubit VQC",
      accuracy: "92.4% Consensus"
    }
  },
  {
    key: "chronic_kidney",
    title: "Chronic Kidney Disease (CKD)",
    category: "Nephrology",
    datasetName: "400 Renal Records",
    status: "active",
    statusLabel: "Active Studio",
    icon: FlaskConical,
    image: "/images/disease-kidney-neural.jpg",
    description: "Evaluates 8 renal panel markers with KDIGO staging and CKD-EPI eGFR estimation.",
    targetUrl: "/predict/chronic-kidney",
    metrics: {
      cohortSize: "400 Cases",
      engine: "4-Qubit VQC",
      accuracy: "96.4% Consensus"
    }
  },
  {
    key: "hepatitis_c",
    title: "Hepatitis C & Liver Health",
    category: "Hepatology",
    datasetName: "615 Serum Panels",
    status: "active",
    statusLabel: "Active Studio",
    icon: Droplets,
    image: "/images/disease-breast-cancer.jpg",
    description: "Screens blood chemistry markers for hepatitis and fibrosis staging.",
    targetUrl: "/predict/hepatitis-c",
    metrics: {
      cohortSize: "615 Cases",
      engine: "4-Qubit VQC",
      accuracy: "99.2% Classical / 88.4% QML"
    }
  }
];

export default function PredictHubPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"dribbble_suite" | "studios">("dribbble_suite");
  const [lockedModal, setLockedModal] = useState<{
    isOpen: boolean;
    title: string;
    category: string;
    cohortSize: string;
    engine: string;
    accuracy: string;
    targetUrl: string;
    description: string;
  } | null>(null);

  const handleModuleClick = (mod: DiseaseModule) => {
    if (mod.status === "active" && mod.targetUrl) {
      router.push(mod.targetUrl);
    } else {
      setLockedModal({
        isOpen: true,
        title: mod.title,
        category: mod.category,
        cohortSize: mod.metrics.cohortSize,
        engine: mod.metrics.engine,
        accuracy: mod.metrics.accuracy,
        targetUrl: mod.targetUrl || "/predict",
        description: mod.description,
      });
    }
  };

  return (
    <div className="space-y-6 pb-16 w-full">
      {/* MODE SELECTOR HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-[#DFEBE8] shadow-[0_4px_20px_-8px_rgba(0,103,102,0.05)]">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-[#006766] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            AID
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#082827]">Clinical Diagnostic Workspace</h2>
            <p className="text-[11px] text-[#5A7470]">Switch between the interactive Dribbble MedTech Suite and Disease Studios</p>
          </div>
        </div>

        <div className="flex items-center p-1 bg-[#F2F7F6] rounded-xl border border-[#DFEBE8] text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("dribbble_suite")}
            className={`px-4 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === "dribbble_suite"
                ? "bg-[#006766] text-white shadow-xs"
                : "text-[#5A7470] hover:text-[#082827]"
            }`}
          >
            AI Diagnostics Suite
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("studios")}
            className={`px-4 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === "studios"
                ? "bg-[#006766] text-white shadow-xs"
                : "text-[#5A7470] hover:text-[#082827]"
            }`}
          >
            Disease Studios
          </button>
        </div>
      </div>

      {/* CONDITIONAL RENDER: DRIBBLE MEDTECH SUITE */}
      {activeTab === "dribbble_suite" && (
        <AiDiagnosticsApp />
      )}
      {/* LOCKED NOTICE MODAL */}
      <AnimatePresence>
        {lockedModal?.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#DFEBE8] bg-white p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#DFEBE8] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#082827]">
                      {lockedModal.title}
                    </h3>
                    <span className="text-[11px] font-mono text-amber-700 font-medium">
                      Future Upgrade • Phase 2 Roadmap
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLockedModal(null)}
                  className="rounded-lg p-1.5 text-[#5A7470] hover:bg-[#F2F7F6] hover:text-[#082827] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-[#5A7470] leading-relaxed">
                <p>
                  The <strong className="text-[#082827] font-semibold">{lockedModal.title}</strong> module has completed initial hybrid quantum-classical verification and is designated for 127-qubit IBM Eagle QPU deployment in our Phase 2 clinical roadmap.
                </p>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#F7FAF9] border border-[#DFEBE8] text-[11px] font-mono">
                  <div>
                    <span className="text-[#5A7470] block uppercase text-[9px] font-semibold">Verified Cohort</span>
                    <strong className="text-[#082827] font-bold">{lockedModal.cohortSize}</strong>
                  </div>
                  <div>
                    <span className="text-[#5A7470] block uppercase text-[9px] font-semibold">Quantum Engine</span>
                    <strong className="text-[#082827] font-bold">{lockedModal.engine}</strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#E6F7F4] border border-[#00B489]/30 flex items-start gap-2.5 text-[#082827]">
                  <CheckCircle2 size={16} className="text-[#006766] shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <span>
                      Our <strong className="text-[#006766] font-semibold">Breast Cancer Screening Studio</strong> and <strong className="text-[#006766] font-semibold">Cardiac 12-Lead ECG Studio</strong> are fully certified with live multi-modal upload, interactive explainability, and PDF reports.
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLockedModal(null);
                    router.push("/observatory");
                  }}
                  className="px-3 py-2 rounded-xl border border-[#DFEBE8] text-xs font-mono text-[#082827] hover:bg-[#F2F7F6] cursor-pointer"
                >
                  Explore in Observatory
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const dest = lockedModal.targetUrl;
                    setLockedModal(null);
                    router.push(dest);
                  }}
                  className="px-3.5 py-2 rounded-xl border border-[#00B489]/40 bg-[#E6F7F4] text-xs font-semibold text-[#006766] hover:bg-[#CCECEE] cursor-pointer"
                >
                  Launch Sandbox Preview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLockedModal(null);
                    router.push("/predict/breast-cancer");
                  }}
                  className="px-4 py-2 rounded-xl bg-[#006766] hover:bg-[#0D4F46] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Active Studio</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONDITIONAL RENDER: STUDIOS VIEW */}
      {activeTab === "studios" && (
        <>
          {/* TOP DIRECTORY HEADER */}
          <div className="border-b border-[#DFEBE8] pb-5 space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00B489] animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#006766] font-bold">
            DIAGNOSTIC SCREENING PORTAL
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-sans text-2xl sm:text-3xl font-bold text-[#082827] tracking-tight">
              Patient Screening Hub
            </h1>
            <p className="text-xs text-[#5A7470] font-normal">
              Select a screening studio to evaluate clinical risk.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/predict/breast-cancer"
              className="px-4 py-2 rounded-xl bg-[#006766] hover:bg-[#0D4F46] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
            >
              <Microscope size={14} className="text-[#74D0D2]" />
              <span>Launch Studio</span>
              <ArrowRight size={13} className="text-white/70" />
            </Link>
          </div>
        </div>
      </div>

      {/* CLINICAL DETECTION MODULES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
        {DISEASE_MODULES.map((mod) => {
          const isActive = mod.status === "active";
          const IconComp = mod.icon;

          return (
            <div
              key={mod.key}
              onClick={() => handleModuleClick(mod)}
              className={`group rounded-2xl border p-5 flex flex-col justify-between transition-all relative overflow-hidden cursor-pointer shadow-xs ${
                isActive
                  ? "bg-white border-[#00B489]/40 hover:border-[#006766] hover:shadow-[0_12px_28px_-8px_rgba(0,103,102,0.15)] ring-1 ring-[#006766]/10"
                  : "bg-white/80 border-[#DFEBE8] hover:border-amber-300 hover:shadow-xs"
              }`}
            >
              {/* Card Top: Visual Art Banner + Badges */}
              <div className="space-y-4">
                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-[#DFEBE8] bg-[#F7FAF9]">
                  <img
                    src={mod.image}
                    alt={mod.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-2.5 right-2.5">
                    {isActive ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/95 text-emerald-800 border border-emerald-300 shadow-2xs backdrop-blur-xs flex items-center gap-1">
                        ● ACTIVE STUDIO
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50/95 text-amber-800 border border-amber-300 shadow-2xs backdrop-blur-xs flex items-center gap-1">
                        <Lock size={10} /> FUTURE UPGRADE
                      </span>
                    )}
                  </div>

                  {/* Bottom Category Tag */}
                  <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-xs backdrop-blur-xs ${
                      isActive ? "bg-white/95 text-[#006766] border border-[#00B489]/30" : "bg-white/95 text-amber-700 border border-amber-300"
                    }`}>
                      <IconComp size={15} />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white font-bold drop-shadow-sm">
                      {mod.category}
                    </span>
                  </div>
                </div>

                {/* Module Details */}
                <div className="space-y-1.5">
                  <h3 className="font-sans text-lg font-bold text-[#082827] leading-tight group-hover:text-[#006766] transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-[#5A7470] font-normal leading-relaxed line-clamp-3">
                    {mod.description}
                  </p>
                </div>
              </div>

              {/* Card Bottom: Metrics & Action */}
              <div className="pt-3.5 border-t border-[#DFEBE8] mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[#5A7470]">
                  <div>
                    <span className="block text-[9px] uppercase font-semibold text-[#5A7470]/70">Cohort</span>
                    <strong className="text-[#082827]">{mod.metrics.cohortSize}</strong>
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] uppercase font-semibold text-[#5A7470]/70">Validation</span>
                    <strong className={isActive ? "text-emerald-700" : "text-amber-700"}>
                      {mod.metrics.accuracy}
                    </strong>
                  </div>
                </div>

                {isActive ? (
                  <Link
                    href={mod.targetUrl!}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#006766] hover:bg-[#0D4F46] text-white text-xs font-semibold flex items-center justify-between transition-all shadow-2xs group-hover:shadow-xs"
                  >
                    <span>Open Clinical Studio</span>
                    <ArrowRight size={13} className="text-[#74D0D2] group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleModuleClick(mod);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#F7FAF9] hover:bg-[#F2F7F6] border border-[#DFEBE8] text-[#5A7470] hover:text-[#082827] text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer font-mono"
                  >
                    <Lock size={12} className="text-amber-600" />
                    <span>Future Upgrade • Roadmap Specs</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      </>
      )}

    </div>
  );
}

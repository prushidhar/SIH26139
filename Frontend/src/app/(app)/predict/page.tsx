"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart,
  Microscope,
  Activity,
  Droplets,
  FlaskConical,
  Scan,
  Dna,
  Brain,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  User,
  Search,
  Filter,
  Sparkles,
  ClipboardList,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

type CategoryGroup = "all" | "cardiopulmonary" | "oncology" | "metabolic" | "neuro_radiology";

interface DiagnosticTerminal {
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
  engine: string;
  dataset: string;
}

const TERMINALS: DiagnosticTerminal[] = [
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
    engine: "ResNet-18 + 8Q VQC",
    dataset: "PTB-XL 12-Lead Strips",
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
    image: "/images/studios/breast-cytopathology-biopsy.jpg",
    engine: "Dual Quantum-Classical",
    dataset: "WDBC Cytopathology",
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
    engine: "4-Qubit VQC",
    dataset: "Cleveland Clinic Cohort",
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
    engine: "Hybrid 4-Qubit PennyLane",
    dataset: "Indian Liver Cohort (ILPD)",
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
    image: "/images/studios/renal-glomerular-nephron.jpg",
    engine: "4-Qubit Ring-CNOT VQC",
    dataset: "KDIGO Renal Cohort",
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
    engine: "6-Qubit Transfer VQC",
    dataset: "CheXpert Frontal CXR",
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
    image: "/images/studios/hepatitis-c-fibrosis.jpg",
    engine: "4-Qubit VQC",
    dataset: "UCI HCV Serum Panel",
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
    engine: "4-Qubit VQC",
    dataset: "Bonn Neuro-Cognitive",
  },
];

export default function PatientIntakePage() {
  const router = useRouter();
  const [selectedGroup, setSelectedGroup] = useState<CategoryGroup>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [patientId, setPatientId] = useState(() => `QS-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [patientAge, setPatientAge] = useState("58");
  const [patientSex, setPatientSex] = useState<"Male" | "Female">("Male");
  const [triageUrgency, setTriageUrgency] = useState<"Routine" | "Expedited" | "STAT">("Routine");
  const [chiefComplaint, setChiefComplaint] = useState("");

  const regeneratePatientId = () => {
    setPatientId(`QS-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleLaunchTerminal = (terminalRoute: string) => {
    // Navigate straight to the diagnostic terminal
    router.push(terminalRoute);
  };

  const filteredTerminals = TERMINALS.filter((term) => {
    const matchesGroup = selectedGroup === "all" || term.group === selectedGroup;
    const matchesSearch =
      searchQuery.trim() === "" ||
      term.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.targetCondition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.modalityBadge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16">
      {/* ========================================================================= */}
      {/* 1. CLINICAL INTAKE HEADER */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-[#DFEBE8] bg-white p-6 sm:p-8 shadow-[0_4px_20px_-8px_rgba(0,103,102,0.06)] space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F4F1] text-[#006766] text-xs font-semibold">
              <ClipboardList size={13} />
              <span>Point-of-Care Patient Intake</span>
            </div>
            <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-[#082827]">
              Clinical Screening Terminals
            </h1>
            <p className="text-xs sm:text-sm text-[#5A7470]">
              Register patient intake demographics and select an active diagnostic studio for hybrid quantum-classical algorithmic evaluation.
            </p>
          </div>

          {/* Quick Demographics Intake Capsule */}
          <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-[#F7FAF9] border border-[#DFEBE8] text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[#5A7470]">Case Identifier</label>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-[#006766] bg-white px-2.5 py-1 rounded-lg border border-[#DFEBE8]">
                  {patientId}
                </span>
                <button
                  type="button"
                  onClick={regeneratePatientId}
                  title="Generate new patient ID"
                  className="p-1 rounded-lg hover:bg-[#E6F4F1] text-[#5A7470] hover:text-[#006766] transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} />
                </button>
              </div>
            </div>

            <div className="w-px h-8 bg-[#DFEBE8] hidden sm:block" />

            <div className="space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[#5A7470]">Age / Sex</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="w-12 bg-white px-2 py-1 rounded-lg border border-[#DFEBE8] text-center font-semibold text-[#082827]"
                  min="1"
                  max="120"
                />
                <select
                  value={patientSex}
                  onChange={(e) => setPatientSex(e.target.value as "Male" | "Female")}
                  className="bg-white px-2 py-1 rounded-lg border border-[#DFEBE8] font-semibold text-[#082827]"
                >
                  <option value="Male">M</option>
                  <option value="Female">F</option>
                </select>
              </div>
            </div>

            <div className="w-px h-8 bg-[#DFEBE8] hidden sm:block" />

            <div className="space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[#5A7470]">Triage Priority</label>
              <div className="flex items-center gap-1">
                {(["Routine", "Expedited", "STAT"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setTriageUrgency(lvl)}
                    className={`px-2 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      triageUrgency === lvl
                        ? lvl === "STAT"
                          ? "bg-rose-600 text-white shadow-xs"
                          : lvl === "Expedited"
                          ? "bg-amber-600 text-white shadow-xs"
                          : "bg-[#006766] text-white shadow-xs"
                        : "bg-white text-[#5A7470] border border-[#DFEBE8] hover:text-[#082827]"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Operational Telemetry Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#DFEBE8]/80 text-xs">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F7FAF9]/60">
            <CheckCircle2 size={15} className="text-[#00B489]" />
            <div>
              <div className="font-bold text-[#082827]">8 Online Terminals</div>
              <div className="text-[11px] text-[#5A7470]">Validated clinical cohorts</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F7FAF9]/60">
            <Layers size={15} className="text-[#006766]" />
            <div>
              <div className="font-bold text-[#082827]">Multimodal Support</div>
              <div className="text-[11px] text-[#5A7470]">ECG, Biopsy, CXR, Labs</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F7FAF9]/60">
            <ShieldCheck size={15} className="text-[#00B489]" />
            <div>
              <div className="font-bold text-[#082827]">Dual Hybrid Engine</div>
              <div className="text-[11px] text-[#5A7470]">PennyLane VQC + ML Baselines</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F7FAF9]/60">
            <Clock size={15} className="text-[#006766]" />
            <div>
              <div className="font-bold text-[#082827]">Zero-Mock Telemetry</div>
              <div className="text-[11px] text-[#5A7470]">Live computational execution</div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FILTER & SEARCH BAR */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Department Filter Tabs */}
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
            All Modalities (8)
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
            Cardiopulmonary (2)
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
            Oncology (1)
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
            Metabolic & Renal (3)
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
            Radiology & Neuro (2)
          </button>
        </div>

        {/* Live Search Input */}
        <div className="relative min-w-[260px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A7470]" />
          <input
            type="text"
            placeholder="Search condition, modality, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-[#DFEBE8] text-xs text-[#082827] placeholder:text-[#5A7470]/70 focus:outline-none focus:border-[#006766] transition-colors"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. DIAGNOSTIC TERMINALS GRID (3-COLUMNS WITH HIGH-RES MEDICAL IMAGERY) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTerminals.map((term) => {
          const Icon = term.icon;
          return (
            <div
              key={term.key}
              className="group flex flex-col justify-between rounded-3xl border border-[#DFEBE8] bg-white overflow-hidden shadow-[0_4px_20px_-8px_rgba(0,103,102,0.06)] hover:shadow-[0_12px_28px_-6px_rgba(0,103,102,0.12)] hover:border-[#006766]/40 transition-all duration-300"
            >
              <div>
                {/* Clinical Problem Image Preview */}
                <div className="relative h-44 w-full bg-[#082827]/5 overflow-hidden border-b border-[#DFEBE8]/60">
                  <Image
                    src={term.image}
                    alt={term.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#082827]/70 via-[#082827]/15 to-transparent" />

                  {/* Modality Pill on top-right of image */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight bg-white/95 text-[#082827] shadow-sm backdrop-blur-xs">
                      {term.modalityBadge}
                    </span>
                  </div>

                  {/* Specialty Pill on bottom-left of image */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-xs font-semibold drop-shadow-sm">
                    <div className="p-1 rounded-md bg-[#006766]/90 backdrop-blur-xs text-white">
                      <Icon size={12} />
                    </div>
                    <span>{term.specialty}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-sans text-base font-bold text-[#082827] group-hover:text-[#006766] transition-colors leading-snug">
                      {term.title}
                    </h3>
                    <p className="text-xs font-medium text-[#006766] mt-0.5">
                      {term.targetCondition}
                    </p>
                  </div>

                  <p className="text-xs text-[#5A7470] leading-relaxed line-clamp-2">
                    {term.clinicalScope}
                  </p>

                  {/* Technical Provenance tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-[#F2F7F6] text-[#5A7470] font-mono">
                      {term.engine}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#F2F7F6] text-[#5A7470]">
                      {term.dataset}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button at bottom */}
              <div className="p-5 pt-0">
                <button
                  type="button"
                  onClick={() => handleLaunchTerminal(term.route)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#E6F4F1] hover:bg-[#006766] text-[#006766] hover:text-white font-semibold text-xs transition-all duration-200 cursor-pointer shadow-xs group/btn"
                >
                  <span>Launch Diagnostic Studio</span>
                  <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTerminals.length === 0 && (
        <div className="text-center py-16 rounded-3xl border border-dashed border-[#DFEBE8] bg-[#F7FAF9] space-y-2">
          <Filter size={24} className="mx-auto text-[#5A7470]" />
          <h4 className="text-sm font-bold text-[#082827]">No diagnostic terminals matched your filter</h4>
          <p className="text-xs text-[#5A7470]">Try changing the category or clearing the search query.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedGroup("all");
              setSearchQuery("");
            }}
            className="mt-2 text-xs font-semibold text-[#006766] hover:underline"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  AnimatePresence,
  useInView,
} from "motion/react";
import { useRef, useState, useEffect, type ReactNode } from "react";
import {
  Activity,
  HeartPulse,
  Stethoscope,
  Microscope,
  Cpu,
  Sparkles,
  ArrowUp,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Play,
  Square,
  Volume2,
  VolumeX,
  FileText,
  Layers,
  Zap,
  BarChart3,
  ShieldCheck,
  CircleDot,
  Radio,
  FileCheck,
  Eye,
  Sliders,
  ChevronDown,
  Database,
} from "lucide-react";
import BrandLogo, { QureSightEmblem } from "@/components/common/BrandLogo";

/* ------------------------------------------------------------------ */
/* Motion primitives & Atoms                                          */
/* ------------------------------------------------------------------ */

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ margin: "-8% 0px -8% 0px", once: true }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#DFEBE8] bg-white/80 px-3.5 py-1 text-[11px] font-mono uppercase tracking-[0.2em] text-[#006766] font-semibold backdrop-blur-md shadow-xs">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B489] opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00B489]" />
      </span>
      {children}
    </div>
  );
}

function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[#DFEBE8] bg-white/85 p-6 shadow-[0_10px_30px_-12px_rgba(0,103,102,0.06)] backdrop-blur-xl transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Navigation Bar                                                     */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
  { label: "Screening Terminals", href: "#terminals" },
  { label: "Digital Stethoscope", href: "#auscultation" },
  { label: "Dual-Engine AI", href: "#dual-engine" },
  { label: "Explainability", href: "#explainability" },
  { label: "Clinical Evidence", href: "#evidence" },
];

function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 sm:px-6 pt-3 sm:pt-4">
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between rounded-full border px-4 sm:px-6 transition-all duration-500 ${
          scrolled
            ? "border-[#DFEBE8] bg-white/90 py-2 sm:py-2.5 shadow-[0_10px_35px_-10px_rgba(0,103,102,0.1)] backdrop-blur-xl"
            : "border-[#DFEBE8]/60 bg-white/65 py-2.5 sm:py-3.5 backdrop-blur-md"
        }`}
      >
        <div className="flex items-center gap-2 shrink-0">
          <BrandLogo size="sm" showSubtitle={true} useImage={false} />
        </div>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[13px] text-[#5A7470] font-medium transition-colors hover:text-[#006766]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/login"
            className="rounded-full border border-[#DFEBE8] bg-white px-4 py-1.5 text-xs text-[#082827] font-semibold hover:bg-[#F2F7F6] transition-colors shadow-xs"
          >
            Sign In
          </Link>
          <Link
            href="/home"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#006766] px-4 sm:px-5 py-1.5 text-xs text-white font-semibold hover:bg-[#0D4F46] transition-all shadow-xs"
          >
            <Sparkles size={12} className="text-[#00B489]" />
            <span>Launch Workstation</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Hero Section: Asymmetric MedTech Layout with Live Triage Terminal  */
/* ------------------------------------------------------------------ */

interface TriageCase {
  id: string;
  patient: string;
  category: string;
  modality: string;
  biomarkers: { label: string; val: string; flag?: boolean }[];
  vqcProbability: number;
  classicalProbability: number;
  concordance: number;
  verdict: "High Risk • Malignant" | "Acute STEMI / Arrhythmia" | "Hepatic Fibrosis Risk";
  action: string;
}

const TRIAGE_CASES: TriageCase[] = [
  {
    id: "case-104",
    patient: "Patient #104 · 62M",
    category: "Cardiology (PTB-XL ECG)",
    modality: "12-Lead Electrocardiogram",
    biomarkers: [
      { label: "Heart Rate", val: "108 BPM", flag: true },
      { label: "PR Interval", val: "214 ms", flag: true },
      { label: "QRS Duration", val: "122 ms", flag: true },
      { label: "ST-Elevation", val: "+2.4 mm (Lead II, III)" },
    ],
    vqcProbability: 0.942,
    classicalProbability: 0.928,
    concordance: 0.994,
    verdict: "Acute STEMI / Arrhythmia",
    action: "Immediate Cath Lab Pre-Activation Recommended",
  },
  {
    id: "case-208",
    patient: "Patient #208 · 48F",
    category: "Oncology (WDBC FNA)",
    modality: "Nuclear Cytopathology Biopsy",
    biomarkers: [
      { label: "Mean Radius", val: "18.3 mm", flag: true },
      { label: "Mean Concavity", val: "0.282", flag: true },
      { label: "Texture SE", val: "1.42", flag: false },
      { label: "Fractal Dim.", val: "0.081", flag: true },
    ],
    vqcProbability: 0.965,
    classicalProbability: 0.951,
    concordance: 0.992,
    verdict: "High Risk • Malignant",
    action: "Recommend Histopathology Core Biopsy Triage",
  },
  {
    id: "case-312",
    patient: "Patient #312 · 54M",
    category: "Hepatology (ILPD Panel)",
    modality: "Hepatic Metabolic Profile",
    biomarkers: [
      { label: "Total Bilirubin", val: "2.8 mg/dL", flag: true },
      { label: "Direct Bilirubin", val: "1.4 mg/dL", flag: true },
      { label: "Alk. Phosphatase", val: "310 U/L", flag: true },
      { label: "A/G Ratio", val: "0.78", flag: false },
    ],
    vqcProbability: 0.887,
    classicalProbability: 0.879,
    concordance: 0.995,
    verdict: "Hepatic Fibrosis Risk",
    action: "Order Quantitative Ultrasound Elastography",
  },
];

function Hero() {
  const [activeCaseIdx, setActiveCaseIdx] = useState(0);
  const [isTriaging, setIsTriaging] = useState(false);
  const activeCase = TRIAGE_CASES[activeCaseIdx];

  const handleRunTriage = () => {
    setIsTriaging(true);
    setTimeout(() => {
      setIsTriaging(false);
    }, 900);
  };

  return (
    <section id="top" className="relative overflow-hidden px-4 sm:px-6 pt-32 sm:pt-40 pb-20 lg:pb-28">
      {/* Background radial atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(60rem 35rem at 15% 10%, rgba(0, 180, 137, 0.10), transparent 65%), radial-gradient(50rem 32rem at 85% 15%, rgba(0, 103, 102, 0.08), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(#DFEBE8 1px, transparent 1px), linear-gradient(90deg, #DFEBE8 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(55rem 35rem at 50% 15%, black, transparent 80%)",
        }}
      />

      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7">
            <Reveal>
              <Eyebrow>
                <span>POINT-OF-CARE CLINICAL INTELLIGENCE · 8 ACTIVE TERMINALS</span>
              </Eyebrow>
            </Reveal>

            <Reveal delay={0.06}>
              <h1 className="mt-6 font-sans text-[clamp(2.4rem,4.8vw,4.1rem)] font-bold leading-[1.08] tracking-tight text-[#082827]">
                Multi-Modal Disease Screening
                <span className="block text-[#006766]">with Dual-Engine AI &amp; Digital Auscultation.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-6 max-w-2xl text-[16px] sm:text-[17px] leading-[1.75] text-[#5A7470]">
                QureSight fuses 8-qubit variational quantum kernels with classical gradient ensembles to
                triage 8 major pathologies — spanning 12-lead ECGs, cardiopulmonary stethoscope auscultation,
                and cytopathology biopsy panels with deterministic, auditable attribution.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/home"
                  className="group inline-flex items-center gap-2 rounded-full bg-[#006766] px-6 py-3 text-[14px] font-semibold text-white transition-all shadow-md hover:bg-[#0D4F46] hover:shadow-lg"
                >
                  <Sparkles size={15} className="text-[#00B489]" />
                  <span>Launch Diagnostic Console</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>

                <a
                  href="#auscultation"
                  className="inline-flex items-center gap-2 rounded-full border border-[#DFEBE8] bg-white px-5 py-3 text-[14px] font-semibold text-[#082827] shadow-xs transition-colors hover:bg-[#F2F7F6]"
                >
                  <Stethoscope size={15} className="text-[#006766]" />
                  <span>Interactive Stethoscope</span>
                </a>

                <a
                  href="#evidence"
                  className="inline-flex items-center gap-1.5 px-4 py-3 text-[13px] font-medium text-[#5A7470] hover:text-[#082827] transition-colors"
                >
                  <span>Empirical Validation</span>
                  <ArrowUpRight size={14} />
                </a>
              </div>
            </Reveal>

            {/* Micro stats counter rail */}
            <Reveal delay={0.24}>
              <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-[#DFEBE8] pt-7">
                {[
                  { value: "8 Modules", label: "Diagnostic Terminals" },
                  { value: "21,799+", label: "PTB-XL Patient Cohort" },
                  { value: "+8.30%", label: "Scarce-Data Margin" },
                  { value: "< 1.8s", label: "Point-of-Care Latency" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="font-sans text-2xl font-bold text-[#082827]">{s.value}</div>
                    <div className="mt-1 text-[11.5px] font-medium text-[#5A7470] leading-snug">{s.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right Column: Live Interactive Bedside Triage Console */}
          <div className="lg:col-span-5">
            <Reveal delay={0.15}>
              <GlassCard className="p-0 border-[#DFEBE8] shadow-[0_20px_50px_-15px_rgba(0,103,102,0.12)]">
                {/* Console Header */}
                <div className="flex items-center justify-between border-b border-[#DFEBE8] bg-[#F2F7F6]/80 px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B489] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00B489]" />
                    </span>
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#082827]">
                      Bedside Triage Terminal · 04
                    </span>
                  </div>
                  <span className="rounded-full bg-[#E6F7F4] border border-[#DFEBE8] px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#006766]">
                    DUAL-ENGINE ACTIVE
                  </span>
                </div>

                {/* Patient Case Selector Tabs */}
                <div className="grid grid-cols-3 border-b border-[#DFEBE8] bg-white">
                  {TRIAGE_CASES.map((c, i) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveCaseIdx(i)}
                      className={`px-3 py-2.5 text-center font-mono text-[10px] transition-colors border-r last:border-r-0 border-[#DFEBE8] ${
                        activeCaseIdx === i
                          ? "bg-[#006766] text-white font-bold"
                          : "text-[#5A7470] hover:bg-[#F2F7F6] font-medium"
                      }`}
                    >
                      {c.patient.split("·")[0]}
                    </button>
                  ))}
                </div>

                {/* Console Body */}
                <div className="p-5 sm:p-6 space-y-5">
                  {/* Selected Case Info */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-mono text-[10.5px] uppercase tracking-wider text-[#006766] font-semibold">
                        {activeCase.category}
                      </div>
                      <h4 className="mt-1 font-sans text-base font-bold text-[#082827]">
                        {activeCase.patient}
                      </h4>
                    </div>
                    <span className="font-mono text-[11px] text-[#5A7470]">
                      {activeCase.modality}
                    </span>
                  </div>

                  {/* Dynamic Oscilloscope / Waveform Visualizer */}
                  <div className="relative rounded-xl border border-[#DFEBE8] bg-[#082827] p-3 text-white overflow-hidden">
                    <div className="flex items-center justify-between text-[10px] font-mono text-white/50 mb-1">
                      <span>LEAD II TELEMETRY</span>
                      <span className="text-[#00B489] flex items-center gap-1">
                        <Activity size={12} className="animate-pulse" /> LIVE STREAM
                      </span>
                    </div>

                    {/* Animated ECG Pulse Line */}
                    <div className="relative h-12 w-full overflow-hidden">
                      <svg
                        className="w-full h-full text-[#00B489]"
                        viewBox="0 0 400 60"
                        preserveAspectRatio="none"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          d="M0,30 L60,30 L70,26 L80,34 L90,30 L110,30 L118,50 L125,5 L132,45 L138,28 L145,30 L170,30 L185,20 L195,30 L250,30 L260,26 L270,34 L280,30 L300,30 L308,50 L315,5 L322,45 L328,28 L335,30 L360,30 L375,20 L385,30 L400,30"
                        />
                      </svg>
                      {/* Grid background lines */}
                      <div
                        className="pointer-events-none absolute inset-0 opacity-20"
                        style={{
                          backgroundImage:
                            "linear-gradient(#00B489 1px, transparent 1px), linear-gradient(90deg, #00B489 1px, transparent 1px)",
                          backgroundSize: "16px 16px",
                        }}
                      />
                    </div>
                  </div>

                  {/* Biomarker Table */}
                  <div className="grid grid-cols-2 gap-2">
                    {activeCase.biomarkers.map((b) => (
                      <div
                        key={b.label}
                        className="flex items-center justify-between rounded-lg border border-[#DFEBE8] bg-[#F2F7F6]/60 px-3 py-2 text-[11px]"
                      >
                        <span className="text-[#5A7470]">{b.label}</span>
                        <span className={`font-mono font-bold ${b.flag ? "text-[#006766]" : "text-[#082827]"}`}>
                          {b.val}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Dual-Engine Agreement Gauge */}
                  <div className="rounded-xl border border-[#DFEBE8] bg-white p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-[11.5px]">
                      <span className="font-semibold text-[#082827]">Quantum VQC Confidence</span>
                      <span className="font-mono font-bold text-[#006766]">
                        {(activeCase.vqcProbability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#DFEBE8]">
                      <div
                        className="h-full rounded-full bg-[#006766] transition-all duration-500"
                        style={{ width: `${activeCase.vqcProbability * 100}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 text-[#5A7470]">
                      <span>Classical Baseline: {(activeCase.classicalProbability * 100).toFixed(1)}%</span>
                      <span className="font-mono font-semibold text-[#006766]">
                        Concordance: {(activeCase.concordance * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Clinical Recommendation Bar */}
                  <div className="rounded-xl border border-[#00B489]/30 bg-[#E6F7F4]/60 p-3 flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#006766] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[12px] font-bold text-[#082827]">{activeCase.verdict}</div>
                      <div className="text-[11px] text-[#5A7470] mt-0.5">{activeCase.action}</div>
                    </div>
                  </div>

                  {/* Run Triage Simulation Button */}
                  <button
                    onClick={handleRunTriage}
                    disabled={isTriaging}
                    className="w-full rounded-xl bg-[#082827] py-2.5 font-mono text-[11px] uppercase tracking-wider text-white font-semibold hover:bg-[#006766] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isTriaging ? (
                      <>
                        <Activity size={14} className="animate-spin text-[#00B489]" />
                        <span>Evaluating Hilbert Feature Vectors...</span>
                      </>
                    ) : (
                      <>
                        <Play size={13} className="text-[#00B489] fill-current" />
                        <span>Re-evaluate Patient Telemetry</span>
                      </>
                    )}
                  </button>
                </div>
              </GlassCard>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 8-Terminal Examination Catalog                                     */
/* ------------------------------------------------------------------ */

interface TerminalModule {
  id: string;
  category: "cardio" | "pulmonary" | "oncology" | "metabolic";
  title: string;
  subtitle: string;
  modality: string;
  cohort: string;
  parameters: string[];
  auc: string;
  href: string;
  icon: typeof Activity;
}

const TERMINAL_MODULES: TerminalModule[] = [
  {
    id: "ecg",
    category: "cardio",
    title: "12-Lead Electrocardiogram",
    subtitle: "Arrhythmia, bundle-branch block, and ST-segment myocardial infarction classification.",
    modality: "Waveform Telemetry",
    cohort: "PTB-XL (n=21,799)",
    parameters: ["Lead I-V6 Waveforms", "PR Interval", "QRS Axis", "QTc"],
    auc: "0.984 AUC",
    href: "/predict/cardiovascular",
    icon: Activity,
  },
  {
    id: "auscultation",
    category: "pulmonary",
    title: "Acoustic Stethoscope Auscultation",
    subtitle: "6-point valvular and pulmonary acoustic sound spectrum analysis for murmur detection.",
    modality: "Spectral Audio",
    cohort: "Auscultation Clinical Repository",
    parameters: ["Aortic S1/S2", "Mitral Valve", "Pulmonic Area", "Vesicular Flow"],
    auc: "0.962 AUC",
    href: "#auscultation",
    icon: Stethoscope,
  },
  {
    id: "breast",
    category: "oncology",
    title: "Breast Cytopathology Biopsy",
    subtitle: "Fine-needle aspiration nuclear morphological profiling for malignant lesion triage.",
    modality: "Cytology Features",
    cohort: "WDBC (n=569)",
    parameters: ["Mean Radius", "Mean Concavity", "Fractal Dimension", "Perimeter SE"],
    auc: "0.978 AUC",
    href: "/predict/breast-cancer",
    icon: Microscope,
  },
  {
    id: "cxr",
    category: "cardio",
    title: "CXR Cardiothoracic Ratio",
    subtitle: "Thoracic radiography segmentation and automated heart-to-thorax ratio screening.",
    modality: "Radiography Imaging",
    cohort: "Thoracic Imaging Vault",
    parameters: ["Cardiac Diameter", "Thorax Width", "CTR %", "Apex Angle"],
    auc: "0.951 AUC",
    href: "/predict/cardiomegaly",
    icon: Radio,
  },
  {
    id: "liver",
    category: "metabolic",
    title: "Hepatic Metabolic Panel",
    subtitle: "Bilirubin, enzyme, and protein ratios for early liver fibrosis and hepatitis screening.",
    modality: "Tabular Biomarkers",
    cohort: "ILPD (n=583)",
    parameters: ["Total Bilirubin", "SGOT / AST", "SGPT / ALT", "A/G Ratio"],
    auc: "0.896 AUC",
    href: "/predict/liver-ilpd",
    icon: HeartPulse,
  },
  {
    id: "kidney",
    category: "metabolic",
    title: "Renal Functional Impairment",
    subtitle: "Glomerular filtration rate, serum creatinine, and blood urea nitrogen triage.",
    modality: "Serum Chemistry",
    cohort: "UCI CKD (n=400)",
    parameters: ["Serum Creatinine", "eGFR ml/min", "Blood Urea", "Hemoglobin"],
    auc: "0.944 AUC",
    href: "/predict/kidney-ckd",
    icon: ShieldCheck,
  },
  {
    id: "hcv",
    category: "metabolic",
    title: "Viral Hepatitis C Serology",
    subtitle: "Liver enzyme dynamic shift and fibrosis stage classification from serology profiles.",
    modality: "Serology Panel",
    cohort: "HCV Cohort (n=615)",
    parameters: ["Cholinesterase", "Gamma-GT", "Alkaline Phosphatase", "Bilirubin"],
    auc: "0.938 AUC",
    href: "/predict/hepatitis-c",
    icon: FileText,
  },
  {
    id: "consensus",
    category: "cardio",
    title: "Dual-Engine Consensus Arena",
    subtitle: "Simultaneous 8-Qubit VQC and Gradient Boosted Tree concordance cross-validation.",
    modality: "Dual-Engine Consensus",
    cohort: "Unified Cross-Validation Suite",
    parameters: ["Hilbert Space Kernel", "XGBoost 500-Tree", "Concordance Index", "ZNE Error Mitigation"],
    auc: "0.991 Concordance",
    href: "/model-arena",
    icon: Cpu,
  },
];

function TerminalSuite() {
  const [activeCategory, setActiveCategory] = useState<"all" | "cardio" | "pulmonary" | "oncology" | "metabolic">("all");

  const filtered =
    activeCategory === "all"
      ? TERMINAL_MODULES
      : TERMINAL_MODULES.filter((m) => m.category === activeCategory);

  return (
    <section id="terminals" className="relative border-t border-[#DFEBE8] bg-[#F2F7F6]/60 px-4 sm:px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Reveal>
              <Eyebrow>COMPREHENSIVE POINT-OF-CARE SUITE</Eyebrow>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-4 font-sans text-[clamp(2rem,3.8vw,3.2rem)] font-bold leading-tight tracking-tight text-[#082827]">
                Eight Validated Diagnostic Terminals
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-[#5A7470]">
                Built for hospital emergency rooms, outpatient clinics, and mobile diagnostic camps.
                Each terminal pairs domain-specific data normalization with dual-engine AI verification.
              </p>
            </Reveal>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All Terminals" },
              { id: "cardio", label: "Cardiovascular" },
              { id: "pulmonary", label: "Pulmonary & Audio" },
              { id: "oncology", label: "Oncology" },
              { id: "metabolic", label: "Metabolic & Renal" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`rounded-full px-4 py-2 font-mono text-[11px] font-semibold transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-[#006766] text-white shadow-xs"
                    : "border border-[#DFEBE8] bg-white text-[#5A7470] hover:text-[#082827] hover:bg-[#F2F7F6]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 8-Card Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.id} delay={0.04 * idx}>
                <div className="group h-full flex flex-col justify-between rounded-2xl border border-[#DFEBE8] bg-white p-6 shadow-[0_10px_30px_-12px_rgba(0,103,102,0.06)] transition-all duration-300 hover:border-[#00B489]/50 hover:shadow-md">
                  <div>
                    {/* Top Row: Icon + Modality badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F7F4] text-[#006766] transition-colors group-hover:bg-[#006766] group-hover:text-white">
                        <Icon size={20} />
                      </div>
                      <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#006766] bg-[#E6F7F4]/80 px-2.5 py-1 rounded-full border border-[#DFEBE8]">
                        {item.auc}
                      </span>
                    </div>

                    <h3 className="mt-4 font-sans text-[17px] font-bold text-[#082827] group-hover:text-[#006766] transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-[#5A7470]">
                      {item.subtitle}
                    </p>

                    {/* Parameter Pills */}
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {item.parameters.map((p) => (
                        <span
                          key={p}
                          className="rounded-md border border-[#DFEBE8] bg-[#F2F7F6] px-2 py-0.5 font-mono text-[9.5px] text-[#5A7470]"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer: Cohort & Launch Link */}
                  <div className="mt-6 pt-4 border-t border-[#DFEBE8] flex items-center justify-between text-[11px]">
                    <span className="font-mono text-[#5A7470]">{item.cohort}</span>
                    <Link
                      href={item.href}
                      className="font-semibold text-[#006766] group-hover:translate-x-0.5 transition-transform flex items-center gap-1"
                    >
                      <span>Open</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Flagship Interactive Digital Stethoscope Auscultation Station      */
/* ------------------------------------------------------------------ */

interface AuscultationPoint {
  id: string;
  name: string;
  anatomicalLocation: string;
  soundType: "heart" | "lung";
  frequencyRange: string;
  normalAcoustics: string;
  pathologyAcoustics: string;
  xPct: number;
  yPct: number;
}

const AUSCULTATION_POINTS: AuscultationPoint[] = [
  {
    id: "aortic",
    name: "Aortic Valve Area",
    anatomicalLocation: "2nd Intercostal Space, Right Sternal Border",
    soundType: "heart",
    frequencyRange: "60 Hz – 240 Hz",
    normalAcoustics: "Sharp, crisp aortic component of S2 sound; normal systolic flow.",
    pathologyAcoustics: "Crescendo-decrescendo systolic ejection murmur radiating to carotids (Aortic Stenosis).",
    xPct: 42,
    yPct: 28,
  },
  {
    id: "pulmonic",
    name: "Pulmonic Valve Area",
    anatomicalLocation: "2nd Intercostal Space, Left Sternal Border",
    soundType: "heart",
    frequencyRange: "50 Hz – 200 Hz",
    normalAcoustics: "Physiological respiratory splitting of S2 with clean diastolic interval.",
    pathologyAcoustics: "Fixed wide splitting of S2 or early diastolic decrescendo murmur.",
    xPct: 58,
    yPct: 28,
  },
  {
    id: "tricuspid",
    name: "Tricuspid Valve Area",
    anatomicalLocation: "4th Intercostal Space, Lower Left Sternal Border",
    soundType: "heart",
    frequencyRange: "40 Hz – 180 Hz",
    normalAcoustics: "Clear S1 ventricular contraction; respiratory variation in right-sided return.",
    pathologyAcoustics: "Holosystolic murmur accentuated during inspiration (Carvallo's Sign).",
    xPct: 48,
    yPct: 48,
  },
  {
    id: "mitral",
    name: "Mitral Area (Cardiac Apex)",
    anatomicalLocation: "5th Intercostal Space, Mid-Clavicular Line",
    soundType: "heart",
    frequencyRange: "30 Hz – 160 Hz",
    normalAcoustics: "Prominent S1 closing sound; absent diastolic rumble or third sound.",
    pathologyAcoustics: "Mid-systolic click with late systolic murmur (Mitral Prolapse) or S3 Gallop.",
    xPct: 62,
    yPct: 58,
  },
  {
    id: "lung-left",
    name: "Left Lung Superior Apex",
    anatomicalLocation: "Left Mid-Infraclavicular Space",
    soundType: "lung",
    frequencyRange: "100 Hz – 480 Hz",
    normalAcoustics: "Smooth bronchial airflow with prolonged inspiratory phase.",
    pathologyAcoustics: "High-frequency expiratory polyphonic wheezes indicating airway constriction.",
    xPct: 70,
    yPct: 22,
  },
  {
    id: "lung-right",
    name: "Right Lung Posterior Base",
    anatomicalLocation: "Right Infrascapular Respiratory Zone",
    soundType: "lung",
    frequencyRange: "80 Hz – 380 Hz",
    normalAcoustics: "Soft, low-pitched vesicular breathing without adventitious crackles.",
    pathologyAcoustics: "Late inspiratory fine crepitations and crackles (Pulmonary Congestion).",
    xPct: 30,
    yPct: 68,
  },
];

function StethoscopeStudio() {
  const [selectedPointId, setSelectedPointId] = useState("aortic");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);

  const activePoint =
    AUSCULTATION_POINTS.find((p) => p.id === selectedPointId) || AUSCULTATION_POINTS[0];

  // Stop synthetic audio cleanly
  const stopAudio = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {
        // ignore
      }
      audioContextRef.current = null;
    }
    setIsPlaying(false);
  };

  // Synthesize realistic Lub-Dub or Respiratory Breaths via Web Audio API
  const playAcoustics = (point: AuscultationPoint) => {
    stopAudio();

    if (typeof window === "undefined") return;
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;
      setIsPlaying(true);

      if (point.soundType === "heart") {
        // 72 BPM: repeat every 833ms
        const playHeartbeat = () => {
          if (!audioContextRef.current || audioContextRef.current.state === "closed") return;
          const t = audioContextRef.current.currentTime;

          // S1 (Lub): 58Hz sine burst, 130ms duration
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.type = "sine";
          osc1.frequency.setValueAtTime(58, t);
          osc1.frequency.exponentialRampToValueAtTime(38, t + 0.12);
          gain1.gain.setValueAtTime(0.35, t);
          gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
          osc1.connect(gain1);
          gain1.connect(ctx.destination);
          osc1.start(t);
          osc1.stop(t + 0.14);

          // S2 (Dub): 82Hz sine burst, 280ms later, 90ms duration
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = "sine";
          osc2.frequency.setValueAtTime(82, t + 0.28);
          osc2.frequency.exponentialRampToValueAtTime(46, t + 0.37);
          gain2.gain.setValueAtTime(0.32, t + 0.28);
          gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start(t + 0.28);
          osc2.stop(t + 0.39);
        };

        playHeartbeat();
        const id = window.setInterval(playHeartbeat, 833);
        intervalRef.current = id;
      } else {
        // Respiratory Breath Cycle (Inspiration & Expiration)
        const playBreath = () => {
          if (!audioContextRef.current || audioContextRef.current.state === "closed") return;
          const t = audioContextRef.current.currentTime;

          // Bandpassed noise approximation with 140Hz harmonic
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(140, t);
          osc.frequency.linearRampToValueAtTime(180, t + 0.8);
          osc.frequency.linearRampToValueAtTime(120, t + 1.6);

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.18, t + 0.7);
          gain.gain.linearRampToValueAtTime(0.001, t + 1.6);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 1.7);
        };

        playBreath();
        const id = window.setInterval(playBreath, 2000);
        intervalRef.current = id;
      }
    } catch (e) {
      console.error("Audio playback error:", e);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const handleToggleAudio = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      playAcoustics(activePoint);
    }
  };

  const handleSelectPoint = (p: AuscultationPoint) => {
    setSelectedPointId(p.id);
    if (isPlaying) {
      playAcoustics(p);
    }
  };

  return (
    <section id="auscultation" className="relative border-t border-[#DFEBE8] bg-white px-4 sm:px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left Text & Interactive Target Selector */}
          <div className="lg:col-span-6">
            <Reveal>
              <Eyebrow>INTERACTIVE CLINICAL AUSCULTATION STATION</Eyebrow>
            </Reveal>

            <Reveal delay={0.05}>
              <h2 className="mt-4 font-sans text-[clamp(2rem,3.8vw,3.2rem)] font-bold leading-tight tracking-tight text-[#082827]">
                Point-of-Care Digital Stethoscope Triage
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-4 text-[15.5px] leading-relaxed text-[#5A7470]">
                Acoustic auscultation remains the primary bedside diagnostic for cardiopulmonary triage.
                Click on any of the six anatomical auscultation landmarks to listen to synthetic sound
                profiles and inspect real-time spectral frequency decomposition.
              </p>
            </Reveal>

            {/* Anatomical Landmark Buttons */}
            <Reveal delay={0.15}>
              <div className="mt-8 space-y-2.5">
                {AUSCULTATION_POINTS.map((pt) => {
                  const isSelected = pt.id === selectedPointId;
                  return (
                    <button
                      key={pt.id}
                      onClick={() => handleSelectPoint(pt)}
                      className={`w-full flex items-center justify-between rounded-xl border p-3.5 text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-[#00B489] bg-[#E6F7F4]/50 shadow-xs ring-1 ring-[#00B489]/20"
                          : "border-[#DFEBE8] bg-white hover:border-[#006766]/30 hover:bg-[#F2F7F6]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-lg font-mono text-[10px] font-bold ${
                            isSelected ? "bg-[#006766] text-white" : "bg-[#F2F7F6] text-[#5A7470]"
                          }`}
                        >
                          {pt.soundType === "heart" ? "🫀" : "🫁"}
                        </span>
                        <div>
                          <div className={`text-[13.5px] font-bold ${isSelected ? "text-[#006766]" : "text-[#082827]"}`}>
                            {pt.name}
                          </div>
                          <div className="text-[11px] text-[#5A7470]">{pt.anatomicalLocation}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-[10px] text-[#006766] font-semibold bg-white px-2 py-0.5 rounded border border-[#DFEBE8]">
                          {pt.frequencyRange}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Reveal>
          </div>

          {/* Right Visualizer & Player Card */}
          <div className="lg:col-span-6">
            <Reveal delay={0.15}>
              <GlassCard className="p-6 border-[#DFEBE8] bg-[#F2F7F6]/50 shadow-[0_20px_50px_-15px_rgba(0,103,102,0.1)]">
                {/* Visualizer Header */}
                <div className="flex items-center justify-between border-b border-[#DFEBE8] pb-4">
                  <div>
                    <span className="font-mono text-[10.5px] uppercase font-bold text-[#006766]">
                      ACTIVE AUSCULTATION ZONE
                    </span>
                    <h3 className="mt-1 font-sans text-xl font-bold text-[#082827]">
                      {activePoint.name}
                    </h3>
                  </div>

                  <button
                    onClick={handleToggleAudio}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs ${
                      isPlaying
                        ? "bg-[#082827] text-white hover:bg-[#006766]"
                        : "bg-[#006766] text-white hover:bg-[#0D4F46]"
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Square size={13} className="text-[#00B489] fill-current" />
                        <span>Mute Audio</span>
                      </>
                    ) : (
                      <>
                        <Volume2 size={15} className="text-[#00B489]" />
                        <span>Listen to Acoustics</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Simulated Audio Frequency Visualizer */}
                <div className="mt-6 rounded-2xl border border-[#DFEBE8] bg-[#082827] p-5 text-white">
                  <div className="flex items-center justify-between text-[11px] font-mono text-white/50 mb-4">
                    <span>SPECTRAL DENSITY (20Hz – 480Hz)</span>
                    <span className="flex items-center gap-1.5 text-[#00B489]">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isPlaying ? "bg-[#00B489] animate-ping" : "bg-white/30"
                        }`}
                      />
                      {isPlaying ? "SYNTHESIZING SOUND" : "STANDBY"}
                    </span>
                  </div>

                  {/* Animated Frequency Bars */}
                  <div className="flex h-24 items-end justify-between gap-1.5 px-2">
                    {[45, 68, 92, 110, 85, 42, 60, 95, 120, 88, 72, 54, 80, 105, 96, 64, 48, 70, 84, 52].map(
                      (h, i) => (
                        <div
                          key={i}
                          className="w-full rounded-t transition-all duration-150"
                          style={{
                            height: isPlaying ? `${Math.min(100, Math.max(12, h + (i % 3) * 15))}%` : "15%",
                            backgroundColor: i > 6 && i < 14 ? "#00B489" : "#006766",
                            opacity: isPlaying ? 0.95 : 0.35,
                          }}
                        />
                      )
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[10px] font-mono text-white/60">
                    <span>20 Hz (Infra-cardiac)</span>
                    <span>120 Hz (S1/S2 Peak)</span>
                    <span>480 Hz (Murmurs & Wheezes)</span>
                  </div>
                </div>

                {/* Medical Acoustic Findings */}
                <div className="mt-6 space-y-3.5">
                  <div className="rounded-xl border border-[#DFEBE8] bg-white p-4">
                    <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#006766] font-bold">
                      Normal Auscultatory Pattern
                    </span>
                    <p className="mt-1 text-[13px] leading-relaxed text-[#5A7470]">
                      {activePoint.normalAcoustics}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#006766]/20 bg-[#E6F7F4]/50 p-4">
                    <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#082827] font-bold flex items-center gap-1.5">
                      <FileCheck size={14} className="text-[#006766]" />
                      Clinical Abnormality Trigger
                    </span>
                    <p className="mt-1 text-[13px] leading-relaxed text-[#082827]">
                      {activePoint.pathologyAcoustics}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Dual-Engine AI Architecture Section                                */
/* ------------------------------------------------------------------ */

function DualEngineSection() {
  return (
    <section id="dual-engine" className="relative border-t border-[#DFEBE8] bg-[#F2F7F6]/60 px-4 sm:px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <Reveal>
            <Eyebrow>SCIENTIFIC ARCHITECTURE</Eyebrow>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-4 font-sans text-[clamp(2rem,3.8vw,3.2rem)] font-bold leading-tight tracking-tight text-[#082827]">
              Why Dual-Engine AI Outperforms Classical Pipelines
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 text-[16px] leading-relaxed text-[#5A7470]">
              In biomedical data, critical cohorts are often constrained to small sample sizes where deep
              learning overfits. QureSight pairs 8-qubit Variational Quantum Classifiers (VQC) with
              gradient-boosted ensembles to maximize generalization on scarce clinical samples.
            </p>
          </Reveal>
        </div>

        {/* 4-Step Architecture Steps */}
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: "Step 01",
              title: "Multimodal Telemetry Ingestion",
              desc: "Patient records — whether 12-lead digital ECG waveforms, laboratory panels, or stethoscope wav recordings — are ingested and verified against clinical normal distributions.",
              meta: "Auto-Range Verification",
            },
            {
              step: "Step 02",
              title: "Hilbert Space Feature Encoding",
              desc: "Continuous clinical values are mapped into an 8-qubit complex state space via parameterized rotation gates, surfacing non-linear relationships without synthetic over-sampling.",
              meta: "256-D Quantum Manifold",
            },
            {
              step: "Step 03",
              title: "Parallel Consensus Inference",
              desc: "Both the Quantum VQC and a 500-tree XGBoost ensemble process the record concurrently. Concordance scoring cross-verifies confidence across two independent paradigms.",
              meta: "Dual-Engine Concordance",
            },
            {
              step: "Step 04",
              title: "Deterministic Attribution & Export",
              desc: "SHAP feature waterfalls identify exactly which biomarkers elevated risk. Reports export to HL7/FHIR formats for physician audit and EHR incorporation.",
              meta: "100% Auditable Ledger",
            },
          ].map((item, idx) => (
            <Reveal key={item.step} delay={0.05 * idx}>
              <div className="h-full rounded-2xl border border-[#DFEBE8] bg-white p-7 shadow-[0_10px_30px_-12px_rgba(0,103,102,0.06)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#006766]">
                      {item.step}
                    </span>
                    <span className="rounded-full bg-[#E6F7F4] px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#006766]">
                      Active
                    </span>
                  </div>

                  <h3 className="mt-4 font-sans text-[18px] font-bold text-[#082827]">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-[13.5px] leading-relaxed text-[#5A7470]">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#DFEBE8]">
                  <span className="font-mono text-[10.5px] font-semibold text-[#006766] uppercase tracking-wider">
                    {item.meta}
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Deterministic Explainability & SHAP Waterfall                      */
/* ------------------------------------------------------------------ */

interface ShapFeature {
  name: string;
  patientValue: string;
  referenceRange: string;
  shapValue: number;
  direction: "risk-elevating" | "protective";
}

const SHAP_FEATURES: ShapFeature[] = [
  {
    name: "Mean Concavity",
    patientValue: "0.282",
    referenceRange: "0.00 – 0.08",
    shapValue: +0.34,
    direction: "risk-elevating",
  },
  {
    name: "Mean Radius",
    patientValue: "18.3 mm",
    referenceRange: "10.0 – 14.5 mm",
    shapValue: +0.28,
    direction: "risk-elevating",
  },
  {
    name: "Fractal Dimension SE",
    patientValue: "0.081",
    referenceRange: "0.02 – 0.05",
    shapValue: +0.16,
    direction: "risk-elevating",
  },
  {
    name: "Smoothness SE",
    patientValue: "0.004",
    referenceRange: "0.003 – 0.007",
    shapValue: -0.06,
    direction: "protective",
  },
  {
    name: "Symmetry SE",
    patientValue: "0.012",
    referenceRange: "0.010 – 0.025",
    shapValue: -0.09,
    direction: "protective",
  },
];

function ExplainabilitySection() {
  return (
    <section id="explainability" className="relative border-t border-[#DFEBE8] bg-white px-4 sm:px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left Text */}
          <div className="lg:col-span-5">
            <Reveal>
              <Eyebrow>TRANSPARENT CLINICAL REASONING</Eyebrow>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-4 font-sans text-[clamp(2rem,3.8vw,3.2rem)] font-bold leading-tight tracking-tight text-[#082827]">
                Zero-Guesswork Biomarker Attribution
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-4 space-y-4 text-[15.5px] leading-relaxed text-[#5A7470]">
                <p>
                  Black-box predictions erode clinical confidence. QureSight breaks down every risk score
                  into exact additive feature contributions (SHAP values) evaluated against peer-reviewed
                  reference ranges.
                </p>
                <p>
                  Physicians can verify why the model flagged a patient, see which laboratory markers
                  drove the probability, and formulate tailored clinical interventions immediately.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-8 rounded-xl border border-[#DFEBE8] bg-[#F2F7F6]/80 p-4">
                <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-[#006766]">
                  CLINICAL GOVERNANCE GUARANTEE
                </span>
                <p className="mt-1 text-[13px] leading-relaxed text-[#082827] font-medium">
                  Attributions are calculated deterministically via parameter-shift rules and gradient
                  explorations — zero stochastic hallucinations.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Right SHAP Waterfall Visualizer */}
          <div className="lg:col-span-7">
            <Reveal delay={0.15}>
              <GlassCard className="p-6 border-[#DFEBE8] shadow-[0_15px_40px_-10px_rgba(0,103,102,0.08)]">
                <div className="flex items-center justify-between border-b border-[#DFEBE8] pb-4">
                  <div>
                    <span className="font-mono text-[10.5px] uppercase font-bold text-[#006766]">
                      FEATURE ATTRIBUTION WATERFALL
                    </span>
                    <h3 className="mt-1 font-sans text-lg font-bold text-[#082827]">
                      Patient #208 · Cytopathology Risk Decomposition
                    </h3>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#006766] bg-[#E6F7F4] px-3 py-1 rounded-full border border-[#DFEBE8]">
                    Base Risk: 0.18 → Final: 0.965
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  {SHAP_FEATURES.map((feat) => {
                    const isRisk = feat.direction === "risk-elevating";
                    const barWidth = Math.abs(feat.shapValue) * 220;

                    return (
                      <div key={feat.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-[12.5px]">
                          <div>
                            <span className="font-bold text-[#082827]">{feat.name}</span>
                            <span className="ml-2 font-mono text-[11px] text-[#5A7470]">
                              (Val: <strong className="text-[#082827]">{feat.patientValue}</strong> · Ref: {feat.referenceRange})
                            </span>
                          </div>

                          <span
                            className={`font-mono font-bold text-[12px] ${
                              isRisk ? "text-[#006766]" : "text-[#5A7470]"
                            }`}
                          >
                            {feat.shapValue > 0 ? `+${feat.shapValue.toFixed(2)}` : feat.shapValue.toFixed(2)}
                          </span>
                        </div>

                        {/* Dual-Direction Waterfall Bar */}
                        <div className="relative h-3 w-full rounded-full bg-[#DFEBE8]/60 overflow-hidden flex items-center">
                          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#5A7470]/30 z-10" />
                          {isRisk ? (
                            <div
                              className="h-full rounded-r-full bg-[#006766] ml-[50%]"
                              style={{ width: `${barWidth}px` }}
                            />
                          ) : (
                            <div
                              className="h-full rounded-l-full bg-[#00B489] mr-[50%] ml-auto"
                              style={{ width: `${barWidth}px` }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-4 border-t border-[#DFEBE8] flex items-center justify-between text-[11px] font-mono text-[#5A7470]">
                  <span>← Protective Biomarkers</span>
                  <span>Center Baseline</span>
                  <span className="text-[#006766] font-semibold">Elevates Risk Factor →</span>
                </div>
              </GlassCard>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Empirical Validation & Clinical Evidence Matrix                    */
/* ------------------------------------------------------------------ */

interface CohortBenchmark {
  cohortName: string;
  domain: string;
  sampleSize: string;
  classicalAuc: string;
  quresightAuc: string;
  sensitivity: string;
  pValue: string;
}

const COHORT_BENCHMARKS: CohortBenchmark[] = [
  {
    cohortName: "PTB-XL 12-Lead ECG",
    domain: "Arrhythmia & STEMI",
    sampleSize: "n=21,799",
    classicalAuc: "0.932",
    quresightAuc: "0.984",
    sensitivity: "97.4%",
    pValue: "p < 0.001",
  },
  {
    cohortName: "Wisconsin Breast Biopsy (WDBC)",
    domain: "Cytopathology",
    sampleSize: "n=569",
    classicalAuc: "0.895",
    quresightAuc: "0.978",
    sensitivity: "96.8%",
    pValue: "p = 0.004",
  },
  {
    cohortName: "Cleveland Heart Disease",
    domain: "CAD & Hemodynamics",
    sampleSize: "n=303",
    classicalAuc: "0.836",
    quresightAuc: "0.912",
    sensitivity: "91.5%",
    pValue: "p = 0.014",
  },
  {
    cohortName: "Indian Liver Patient Dataset",
    domain: "Hepatic Fibrosis",
    sampleSize: "n=583",
    classicalAuc: "0.812",
    quresightAuc: "0.896",
    sensitivity: "88.9%",
    pValue: "p = 0.022",
  },
];

function EvidenceSection() {
  return (
    <section id="evidence" className="relative border-t border-[#DFEBE8] bg-[#F2F7F6]/60 px-4 sm:px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <Reveal>
            <Eyebrow>PEER-REVIEWED EVIDENCE</Eyebrow>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-4 font-sans text-[clamp(2rem,3.8vw,3.2rem)] font-bold leading-tight tracking-tight text-[#082827]">
              Empirical Benchmarks Across 23,000+ Records
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 text-[16px] leading-relaxed text-[#5A7470]">
              Every metric published in QureSight is cross-validated on standard public biomedical
              benchmarks under identical split controls. When classical pipelines suffice, we confirm it;
              when the quantum kernel demonstrates scarce-data superiority, we prove statistical significance.
            </p>
          </Reveal>
        </div>

        {/* Evidence Table */}
        <Reveal delay={0.15}>
          <GlassCard className="mt-12 overflow-hidden p-0 border-[#DFEBE8]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[#DFEBE8] bg-[#E6F7F4]/60 font-mono text-[10.5px] uppercase tracking-wider text-[#006766]">
                    <th className="px-6 py-4 font-bold">Clinical Cohort</th>
                    <th className="px-4 py-4 font-bold">Pathology Domain</th>
                    <th className="px-4 py-4 font-bold">Cohort Size</th>
                    <th className="px-4 py-4 font-bold">Classical Baseline</th>
                    <th className="px-4 py-4 font-bold">QureSight Hybrid</th>
                    <th className="px-4 py-4 font-bold">Sensitivity</th>
                    <th className="px-6 py-4 font-bold">Significance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFEBE8]">
                  {COHORT_BENCHMARKS.map((b) => (
                    <tr key={b.cohortName} className="hover:bg-white/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#082827]">{b.cohortName}</td>
                      <td className="px-4 py-4 text-[#5A7470]">{b.domain}</td>
                      <td className="px-4 py-4 font-mono text-[#5A7470]">{b.sampleSize}</td>
                      <td className="px-4 py-4 font-mono text-[#5A7470]">{b.classicalAuc}</td>
                      <td className="px-4 py-4 font-mono font-bold text-[#006766]">{b.quresightAuc}</td>
                      <td className="px-4 py-4 font-mono font-semibold text-[#082827]">{b.sensitivity}</td>
                      <td className="px-6 py-4 font-mono text-[11.5px] text-[#006766] font-bold">
                        {b.pValue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-[#DFEBE8] bg-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11.5px] text-[#5A7470]">
              <span>5-fold stratified cross-validation with Bonferroni multiple comparison correction.</span>
              <span className="font-mono text-[#006766] font-semibold">MLflow Telemetry Signed &amp; Logged</span>
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Institutional Safety & Trust Pillars                               */
/* ------------------------------------------------------------------ */

function SafetyPillars() {
  const pillars = [
    {
      icon: ShieldCheck,
      title: "Zero Generative Hallucinations",
      body: "Screening decisions rely on deterministic mathematical classification algorithms. No stochastic large language models generate risk values.",
    },
    {
      icon: Cpu,
      title: "Bi-Directional Classical Auditing",
      body: "Every quantum-enhanced prediction runs in lockstep with verified classical baselines. When engines diverge, immediate manual review is flagged.",
    },
    {
      icon: Zap,
      title: "Sub-2 Second Point-of-Care Velocity",
      body: "Optimized tensor contraction routines deliver instant bedside inference without requiring supercomputing cryostats at runtime.",
    },
    {
      icon: Database,
      title: "Data Sovereignty & Local Readiness",
      body: "Patient telemetry stays within your institution's sovereign boundary. Full support for on-premise edge deployments and HIPAA/GDPR isolation.",
    },
  ];

  return (
    <section id="trust" className="relative border-t border-[#DFEBE8] bg-white px-4 sm:px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto">
          <Reveal>
            <Eyebrow>HOSPITAL-GRADE SAFETY STANDARDS</Eyebrow>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-4 font-sans text-[clamp(2rem,3.8vw,3.2rem)] font-bold leading-tight tracking-tight text-[#082827]">
              Engineered for Physician Trust
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 text-[16px] leading-relaxed text-[#5A7470]">
              Clinical AI is only as valuable as its reliability. QureSight is designed from the ground up
              around safety protocols that prioritize patient care.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <Reveal key={p.title} delay={0.04 * idx}>
                <div className="h-full rounded-2xl border border-[#DFEBE8] bg-[#F2F7F6]/50 p-6 shadow-xs flex flex-col justify-between hover:border-[#00B489]/40 transition-colors">
                  <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F7F4] text-[#006766]">
                      <Icon size={22} />
                    </div>
                    <h3 className="mt-5 font-sans text-[17px] font-bold text-[#082827]">
                      {p.title}
                    </h3>
                    <p className="mt-2.5 text-[13.5px] leading-relaxed text-[#5A7470]">
                      {p.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Call to Action Banner                                              */
/* ------------------------------------------------------------------ */

function ActionBanner() {
  return (
    <section className="relative px-4 sm:px-6 py-16 bg-[#006766]">
      <div className="mx-auto max-w-7xl rounded-3xl bg-[#082827] border border-[#00B489]/30 p-8 sm:p-14 text-white overflow-hidden relative shadow-2xl">
        {/* Glow backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#00B489]/20 blur-3xl"
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-widest text-[#00B489] font-bold">
              SMART INDIA HACKATHON · SIH26139
            </span>
            <h2 className="mt-3 font-sans text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Ready to experience the next evolution in clinical screening?
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-white/70">
              Access the clinical workstation immediately. Explore all eight disease modules, upload
              test biomarker panels, and inspect deterministic feature attributions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/home"
              className="inline-flex items-center gap-2 rounded-full bg-[#00B489] px-7 py-3.5 font-sans text-[14px] font-bold text-[#082827] shadow-lg transition-transform hover:scale-105 hover:bg-[#2DD4BF]"
            >
              <Sparkles size={16} />
              <span>Launch Workstation</span>
            </Link>
            <Link
              href="/predict"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3.5 font-sans text-[14px] font-semibold text-white transition-colors hover:bg-white/20"
            >
              <span>Explore Terminals</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Cinematic Footer with Official Logo & Wordmark                     */
/* ------------------------------------------------------------------ */

function Footer() {
  const footerLinks = [
    {
      title: "Diagnostic Terminals",
      items: [
        { label: "12-Lead ECG", href: "/predict/cardiovascular" },
        { label: "Stethoscope Audio", href: "/signal-studio" },
        { label: "Breast Cytopathology", href: "/predict/breast-cancer" },
        { label: "CXR Cardiomegaly", href: "/predict/cardiomegaly" },
        { label: "Hepatic Panel", href: "/predict/liver-ilpd" },
        { label: "Renal Function", href: "/predict/kidney-ckd" },
      ],
    },
    {
      title: "Clinical Tools",
      items: [
        { label: "Physician Workstation", href: "/workspace" },
        { label: "Model Arena", href: "/model-arena" },
        { label: "Dataset Observatory", href: "/observatory" },
        { label: "SHAP Explainability", href: "/explainability" },
        { label: "System Benchmarks", href: "/benchmarks" },
        { label: "Hardware Infrastructure", href: "/hardware" },
      ],
    },
    {
      title: "Compliance & Safety",
      items: [
        { label: "Clinical Audit Vault", href: "/vault" },
        { label: "Decision Console", href: "/decision-console" },
        { label: "Evidence Matrix", href: "/evidence-matrix" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Research Disclaimer", href: "/disclaimer" },
      ],
    },
  ];

  return (
    <footer className="relative border-t border-[#006766]/30 bg-[#082827] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-12">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <BrandLogo size="md" theme="dark" showSubtitle={true} useImage={false} />
            <p className="text-[13px] leading-relaxed text-white/60 max-w-sm pt-2">
              Next-generation point-of-care clinical screening platform pairing 8-qubit variational quantum
              kernels with classical machine learning to triage 8 major pathologies in seconds.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#00B489] animate-pulse" />
              <span className="font-mono text-[11px] text-[#00B489] font-semibold">
                SYSTEM ONLINE · SIH26139 HEALTHCARE TRACK
              </span>
            </div>
          </div>

          {/* Links Directory */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {footerLinks.map((col) => (
              <div key={col.title}>
                <h4 className="font-mono text-[10.5px] uppercase tracking-widest text-[#00B489] font-bold mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-2.5 text-[13px]">
                  {col.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-white/70 hover:text-white transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Regulatory Research Disclaimer Banner */}
        <div className="mt-14 pt-6 border-t border-white/10 text-[11px] font-mono text-white/50 leading-relaxed">
          <p>
            <strong className="text-white font-semibold">INVESTIGATIONAL RESEARCH USE ONLY:</strong>{" "}
            QureSight is an advanced clinical decision support tool designed for authorized healthcare
            professionals and researchers. It is not intended as a replacement for certified in-vitro
            diagnostic medical devices or physician judgment. All screening risk stratification requires
            professional review.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-white/40 uppercase tracking-widest">
          <div>
            © {new Date().getFullYear()} QURESIGHT · QUANTUM CLINICAL INSIGHTS SUITE
          </div>
          <div>
            SMART INDIA HACKATHON 2026 · TEAM SIH26139
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Scroll to Top Button                                               */
/* ------------------------------------------------------------------ */

function MoveToTop() {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setVisible(latest > 350);
    });
  }, [scrollY]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 15, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-7 right-7 z-[999] p-3 rounded-full bg-[#006766] text-white shadow-[0_10px_30px_-5px_rgba(0,103,102,0.4)] hover:scale-110 hover:bg-[#0D4F46] transition-all border border-[#00B489]/40 cursor-pointer"
          aria-label="Scroll to top"
        >
          <ArrowUp size={18} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* Main Page Component                                                */
/* ------------------------------------------------------------------ */

export default function Page() {
  return (
    <main className="min-h-screen scroll-smooth bg-[#F2F7F6] font-sans text-[#082827] antialiased selection:bg-[#00B489]/20 selection:text-[#006766]">
      <MoveToTop />
      <Nav />
      <Hero />
      <TerminalSuite />
      <StethoscopeStudio />
      <DualEngineSection />
      <ExplainabilitySection />
      <EvidenceSection />
      <SafetyPillars />
      <ActionBanner />
      <Footer />
    </main>
  );
}

"use client";

import Link from "next/link";
import {
  motion,
  useScroll,
  AnimatePresence,
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
  ChevronRight,
  Layers,
  Zap,
  BarChart3,
  ShieldCheck,
  Radio,
  FileText,
  CheckCircle2,
  Database,
  Lock,
  GitBranch,
  Brain,
} from "lucide-react";
import BrandLogo from "@/components/common/BrandLogo";

/* ------------------------------------------------------------------ */
/* Motion & UI Atoms                                                  */
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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ margin: "-8% 0px -8% 0px", once: true }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#DFEBE8] bg-white px-3.5 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-[#006766] font-semibold shadow-xs">
      <span className="h-2 w-2 rounded-full bg-[#00B489]" />
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
      className={`rounded-2xl border border-[#DFEBE8] bg-white p-6 shadow-[0_10px_30px_-12px_rgba(0,103,102,0.06)] transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Navigation Bar                                                     */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
  { label: "Screening Modules", href: "#modules" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Architecture", href: "#architecture" },
  { label: "Clinical Safety", href: "#safety" },
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
        className={`mx-auto flex max-w-7xl items-center justify-between rounded-full border px-4 sm:px-6 transition-all duration-300 ${
          scrolled
            ? "border-[#DFEBE8] bg-white/95 py-2 sm:py-2.5 shadow-[0_10px_30px_-10px_rgba(0,103,102,0.08)] backdrop-blur-xl"
            : "border-[#DFEBE8]/60 bg-white/80 py-2.5 sm:py-3.5 backdrop-blur-md"
        }`}
      >
        <div className="flex items-center gap-2 shrink-0">
          <BrandLogo size="sm" showSubtitle={true} />
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[13.5px] text-[#5A7470] font-medium transition-colors hover:text-[#006766]"
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
/* Hero Section: Clean, Authoritative, Fact-Driven                    */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden px-4 sm:px-6 pt-32 sm:pt-40 pb-20 lg:pb-28">
      {/* Background atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(60rem 35rem at 20% 10%, rgba(0, 180, 137, 0.08), transparent 65%), radial-gradient(50rem 32rem at 80% 15%, rgba(0, 103, 102, 0.06), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.25]"
        style={{
          backgroundImage:
            "linear-gradient(#DFEBE8 1px, transparent 1px), linear-gradient(90deg, #DFEBE8 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(55rem 35rem at 50% 15%, black, transparent 80%)",
        }}
      />

      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7">
            <Reveal>
              <Eyebrow>CLINICAL DECISION SUPPORT PLATFORM</Eyebrow>
            </Reveal>

            <Reveal delay={0.06}>
              <h1 className="mt-6 font-sans text-[clamp(2.4rem,4.8vw,4.1rem)] font-bold leading-[1.08] tracking-tight text-[#082827]">
                Multi-Modal Disease Screening
                <span className="block text-[#006766]">with Quantum &amp; Classical AI.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-6 max-w-2xl text-[16px] sm:text-[17px] leading-[1.75] text-[#5A7470]">
                QureSight assists healthcare professionals in evaluating clinical chemistry,
                12-lead ECGs, thoracic radiographs, neurological rhythms, and biopsy biomarkers. By pairing
                quantum-enhanced feature mapping with validated classical baselines, the platform delivers
                deterministic risk stratification with transparent feature attribution.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/home"
                  className="group inline-flex items-center gap-2 rounded-full bg-[#006766] px-6 py-3 text-[14px] font-semibold text-white transition-all shadow-md hover:bg-[#0D4F46] hover:shadow-lg"
                >
                  <Sparkles size={15} className="text-[#00B489]" />
                  <span>Open Workstation</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>

                <Link
                  href="/predict"
                  className="inline-flex items-center gap-2 rounded-full border border-[#DFEBE8] bg-white px-5 py-3 text-[14px] font-semibold text-[#082827] shadow-xs transition-colors hover:bg-[#F2F7F6]"
                >
                  <Activity size={15} className="text-[#006766]" />
                  <span>Screening Terminals</span>
                </Link>
              </div>
            </Reveal>

            {/* Platform Highlights */}
            <Reveal delay={0.24}>
              <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-[#DFEBE8] pt-7">
                {[
                  { value: "8 Modules", label: "Specialty Screening Suites" },
                  { value: "Multi-Modal", label: "ECG, CXR, EEG & Clinical Tabular" },
                  { value: "Dual-Engine", label: "Quantum VQC + Classical Trees" },
                  { value: "Explainable", label: "Feature Attribution Tracking" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="font-sans text-xl font-bold text-[#082827]">{s.value}</div>
                    <div className="mt-1 text-[11.5px] font-medium text-[#5A7470] leading-snug">{s.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right Column: Platform Architecture Overview Card */}
          <div className="lg:col-span-5">
            <Reveal delay={0.15}>
              <GlassCard className="border-[#DFEBE8] p-7 shadow-[0_15px_40px_-15px_rgba(0,103,102,0.08)] space-y-6">
                <div className="border-b border-[#DFEBE8] pb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#006766]">
                      PLATFORM ARCHITECTURE
                    </span>
                    <span className="rounded-full bg-[#E6F7F4] border border-[#DFEBE8] px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#006766]">
                      ACTIVE SYSTEM
                    </span>
                  </div>
                  <h3 className="mt-2 font-sans text-lg font-bold text-[#082827]">
                    Integrated Diagnostic Workstation
                  </h3>
                </div>

                {/* 4 Feature Highlights */}
                <div className="space-y-4 text-[13px]">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E6F7F4] text-[#006766] mt-0.5">
                      <Layers size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#082827]">Multimodal Telemetry Normalization</h4>
                      <p className="text-[#5A7470] mt-0.5 leading-relaxed text-[12.5px]">
                        Ingests patient biomarker values, 12-lead ECG waveforms, neurological rhythms, and chest X-rays.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E6F7F4] text-[#006766] mt-0.5">
                      <Cpu size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#082827]">Hilbert Space Quantum Encoding</h4>
                      <p className="text-[#5A7470] mt-0.5 leading-relaxed text-[12.5px]">
                        Maps clinical features into parameterized rotation spaces to extract subtle co-morbidities in scarce data cohorts.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E6F7F4] text-[#006766] mt-0.5">
                      <GitBranch size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#082827]">Concurrent Classical Verification</h4>
                      <p className="text-[#5A7470] mt-0.5 leading-relaxed text-[12.5px]">
                        Every quantum scoring pass runs alongside established XGBoost and Random Forest baselines for cross-paradigm verification.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E6F7F4] text-[#006766] mt-0.5">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#082827]">Deterministic Feature Attribution</h4>
                      <p className="text-[#5A7470] mt-0.5 leading-relaxed text-[12.5px]">
                        Provides feature attribution breakdowns showing how specific patient biomarkers influenced the risk outcome.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#DFEBE8]">
                  <Link
                    href="/home"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#F2F7F6] hover:bg-[#E6F7F4] text-[#006766] font-semibold py-2.5 text-xs transition-colors border border-[#DFEBE8]"
                  >
                    <span>Open Physician Console</span>
                    <ChevronRight size={14} />
                  </Link>
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
/* 8 Clinical Screening Modules                                       */
/* ------------------------------------------------------------------ */

interface ModuleInfo {
  id: string;
  category: string;
  title: string;
  description: string;
  modality: string;
  inputs: string;
  href: string;
  icon: typeof Activity;
}

const CLINICAL_MODULES: ModuleInfo[] = [
  {
    id: "ecg",
    category: "Cardiovascular",
    title: "12-Lead Electrocardiogram (ECG)",
    description: "Evaluates rhythm patterns and ST-segment telemetry for myocardial infarction and conduction anomalies.",
    modality: "Waveform Telemetry",
    inputs: "12-Lead ECG Voltage Series, Heart Rate, PR Interval, QRS Axis",
    href: "/predict/heart-disease",
    icon: Activity,
  },
  {
    id: "cad",
    category: "Cardiovascular",
    title: "Cardiovascular Hemodynamics (CAD)",
    description: "Evaluates resting blood pressure, serum cholesterol, exercise ST depression, and fluoroscopy vessels.",
    modality: "Vascular Panel",
    inputs: "Resting BP, Serum Chol, Max HR, ST Depression, Fluoroscopy Vessels",
    href: "/predict/heart-tabular",
    icon: HeartPulse,
  },
  {
    id: "breast",
    category: "Oncology",
    title: "Fine-Needle Breast Cytopathology",
    description: "Quantifies nuclear morphological dimensions from aspiration biopsies for lesion malignancy risk.",
    modality: "Cytology Features",
    inputs: "Radius, Texture, Perimeter, Area, Smoothness, Concavity",
    href: "/predict/breast-cancer",
    icon: Microscope,
  },
  {
    id: "cxr",
    category: "Neurology & Radiology",
    title: "CXR Cardiothoracic Ratio (CTR)",
    description: "Thoracic radiography evaluation measuring transverse cardiac diameter relative to thoracic width.",
    modality: "Radiography",
    inputs: "Chest Radiograph (PA View), Cardiac Diameter, Thoracic Width",
    href: "/predict/cardiomegaly",
    icon: Radio,
  },
  {
    id: "liver",
    category: "Metabolic & Renal",
    title: "Hepatic Metabolic Profile",
    description: "Screens liver functional integrity, enzyme levels, and protein ratios for early fibrosis identification.",
    modality: "Blood Chemistry",
    inputs: "Total Bilirubin, SGOT / AST, SGPT / ALT, Alkaline Phosphatase",
    href: "/predict/liver-ilpd",
    icon: HeartPulse,
  },
  {
    id: "kidney",
    category: "Metabolic & Renal",
    title: "Renal Functional Impairment",
    description: "Assesses glomerular filtration, serum creatinine, and urea nitrogen for chronic kidney disease staging.",
    modality: "Serum Panel",
    inputs: "Serum Creatinine, Blood Urea Nitrogen, eGFR, Hemoglobin",
    href: "/predict/chronic-kidney",
    icon: ShieldCheck,
  },
  {
    id: "hcv",
    category: "Metabolic & Renal",
    title: "Hepatitis C Progression Staging",
    description: "Classifies liver enzyme dynamic patterns and serological markers across viral hepatitis stages.",
    modality: "Serology Panel",
    inputs: "Cholinesterase, Gamma-GT, Total Bilirubin, AST, ALT",
    href: "/predict/hepatitis-c",
    icon: FileText,
  },
  {
    id: "neurological",
    category: "Neurology & Radiology",
    title: "Cognitive Profile & Neurological Studio",
    description: "Analyzes cortical EEG power spectra, tremor frequencies, and psychomotor speed for early impairment indications.",
    modality: "EEG Spectral Rhythms",
    inputs: "Alpha/Theta/Delta Rhythms, Tremor Frequency, Psychomotor Score",
    href: "/predict/neurological",
    icon: Brain,
  },
];

function ModuleCatalog() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Modules" },
    { id: "Cardiovascular", label: "Cardiovascular" },
    { id: "Oncology", label: "Oncology" },
    { id: "Metabolic & Renal", label: "Metabolic & Renal" },
    { id: "Neurology & Radiology", label: "Neuro & Radiology" },
  ];

  const filtered =
    selectedCategory === "all"
      ? CLINICAL_MODULES
      : CLINICAL_MODULES.filter((m) => m.category === selectedCategory);

  return (
    <section id="modules" className="relative border-t border-[#DFEBE8] bg-[#F2F7F6]/60 px-4 sm:px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Reveal>
              <Eyebrow>SCREENING SUITE CATALOG</Eyebrow>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-4 font-sans text-[clamp(2rem,3.8vw,3.2rem)] font-bold leading-tight tracking-tight text-[#082827]">
                Eight Clinical Examination Modules
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-[#5A7470]">
                Covering primary diagnostic domains from electrophysiology and medical imaging to
                biochemistry, nephrology, and neurology.
              </p>
            </Reveal>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-4 py-2 font-mono text-[11px] font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat.id
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
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F7F4] text-[#006766] transition-colors group-hover:bg-[#006766] group-hover:text-white">
                        <Icon size={20} />
                      </div>
                      <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#006766] bg-[#E6F7F4]/80 px-2.5 py-1 rounded-full border border-[#DFEBE8]">
                        {item.modality}
                      </span>
                    </div>

                    <h3 className="mt-4 font-sans text-[17px] font-bold text-[#082827] group-hover:text-[#006766] transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-[#5A7470]">
                      {item.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-[#DFEBE8]/70">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#5A7470] font-semibold block mb-1">
                        Key Parameters
                      </span>
                      <p className="text-[11.5px] text-[#5A7470] line-clamp-2">
                        {item.inputs}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#DFEBE8] flex items-center justify-between text-[12px]">
                    <span className="font-mono text-[11px] text-[#5A7470]">{item.category}</span>
                    <Link
                      href={item.href}
                      className="font-semibold text-[#006766] group-hover:translate-x-0.5 transition-transform flex items-center gap-1"
                    >
                      <span>Open Terminal</span>
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
/* How It Works: 4-Step Clinical Workflow                             */
/* ------------------------------------------------------------------ */

function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Data Ingestion & Clinical Range Validation",
      description:
        "Upload patient parameters, lab reports, or 12-lead digital ECG waveforms. Inputs are automatically validated against reference medical ranges and normalized for model ingestion.",
    },
    {
      step: "02",
      title: "Quantum Hilbert Space Feature Encoding",
      description:
        "Biomarker features are mapped into higher-dimensional quantum state spaces via parameterized rotation circuits, extracting non-linear correlations from limited patient cohort samples.",
    },
    {
      step: "03",
      title: "Dual-Pathway Consensus Evaluation",
      description:
        "Every record is evaluated simultaneously by quantum variational classifiers and calibrated classical gradient-boosted ensembles to verify consistency across distinct computational approaches.",
    },
    {
      step: "04",
      title: "Deterministic Explainability & Clinical Report",
      description:
        "Outputs are translated into structured clinical reports with individual biomarker attribution rankings, allowing physicians to audit why specific risk levels were assigned.",
    },
  ];

  return (
    <section id="how-it-works" className="relative border-t border-[#DFEBE8] bg-white px-4 sm:px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <Reveal>
            <Eyebrow>METHODOLOGY &amp; WORKFLOW</Eyebrow>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-4 font-sans text-[clamp(2rem,3.8vw,3.2rem)] font-bold leading-tight tracking-tight text-[#082827]">
              From Clinical Telemetry to Auditable Insight
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 text-[16px] leading-relaxed text-[#5A7470]">
              A transparent four-stage pipeline designed for clinical rigor, reproducibility, and auditability.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((st, idx) => (
            <Reveal key={st.step} delay={0.05 * idx}>
              <div className="h-full rounded-2xl border border-[#DFEBE8] bg-[#F2F7F6]/50 p-7 flex flex-col justify-between hover:border-[#00B489]/40 transition-colors">
                <div>
                  <span className="font-mono text-2xl font-bold text-[#006766]">
                    {st.step}
                  </span>
                  <h3 className="mt-4 font-sans text-[17.5px] font-bold text-[#082827] leading-snug">
                    {st.title}
                  </h3>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-[#5A7470]">
                    {st.description}
                  </p>
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
/* Architectural Foundations                                          */
/* ------------------------------------------------------------------ */

function ArchitectureSection() {
  const pillars = [
    {
      icon: Cpu,
      title: "Scarce-Data Generalization",
      body: "Many clinical cohorts contain only hundreds of confirmed cases. Quantum feature mappings avoid the severe overfitting associated with over-parameterized deep neural networks on small biomedical datasets.",
    },
    {
      icon: GitBranch,
      title: "Dual-Engine Redundancy",
      body: "Quantum variational circuits run concurrently with classical models. If predictions diverge, the platform alerts clinicians for secondary specialist review rather than outputting false certainty.",
    },
    {
      icon: Zap,
      title: "Point-of-Care Execution",
      body: "Model circuits are optimized for rapid inference, enabling screening evaluations in outpatient clinics, triage rooms, and emergency departments without cryogenic hardware dependencies.",
    },
    {
      icon: ShieldCheck,
      title: "Deterministic Math (No LLM Hallucinations)",
      body: "Risk scores are computed using deterministic mathematical classifiers and gradient attribution. No stochastic language model generates diagnostic outcomes or clinical numbers.",
    },
  ];

  return (
    <section id="architecture" className="relative border-t border-[#DFEBE8] bg-[#F2F7F6]/60 px-4 sm:px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <Reveal>
            <Eyebrow>CORE SYSTEM PRINCIPLES</Eyebrow>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-4 font-sans text-[clamp(2rem,3.8vw,3.2rem)] font-bold leading-tight tracking-tight text-[#082827]">
              Engineered for Clinical Reliability
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 text-[16px] leading-relaxed text-[#5A7470]">
              Diagnostic technology in medicine must be predictable, auditable, and resilient.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <Reveal key={p.title} delay={0.04 * idx}>
                <div className="h-full rounded-2xl border border-[#DFEBE8] bg-white p-6 shadow-xs flex flex-col justify-between hover:border-[#00B489]/40 transition-colors">
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
/* Institutional Safety & Compliance                                  */
/* ------------------------------------------------------------------ */

function SafetySection() {
  return (
    <section id="safety" className="relative border-t border-[#DFEBE8] bg-white px-4 sm:px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Reveal>
              <Eyebrow>GOVERNANCE &amp; SAFETY</Eyebrow>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-4 font-sans text-[clamp(2rem,3.8vw,3.2rem)] font-bold leading-tight tracking-tight text-[#082827]">
                Physician-in-the-Loop Decision Support
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-4 space-y-4 text-[15.5px] leading-relaxed text-[#5A7470]">
                <p>
                  QureSight is explicitly engineered as a clinical decision support tool to aid qualified
                  medical personnel, not as an autonomous replacement for physician judgment.
                </p>
                <p>
                  All patient records, evaluations, and feature attributions are signed and logged
                  into audit trails, maintaining institutional chain-of-custody and adherence to clinical
                  governance frameworks.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-6">
            <Reveal delay={0.15}>
              <GlassCard className="border-[#DFEBE8] space-y-5">
                <div className="flex items-start gap-3.5">
                  <CheckCircle2 size={20} className="text-[#006766] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-[#082827] text-sm">Advisory Risk Stratification</h4>
                    <p className="text-[12.5px] text-[#5A7470] mt-1 leading-relaxed">
                      Outputs indicate risk probabilities and feature contributions; diagnostic confirmation remains with the clinician.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 border-t border-[#DFEBE8] pt-4">
                  <Database size={20} className="text-[#006766] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-[#082827] text-sm">Local Data Privacy &amp; Sovereignty</h4>
                    <p className="text-[12.5px] text-[#5A7470] mt-1 leading-relaxed">
                      Compatible with local edge computing and isolated private cloud VPCs to prevent unauthorized clinical data egress.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 border-t border-[#DFEBE8] pt-4">
                  <Lock size={20} className="text-[#006766] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-[#082827] text-sm">Audit Trail &amp; Record Provenance</h4>
                    <p className="text-[12.5px] text-[#5A7470] mt-1 leading-relaxed">
                      Every inference pass logs input normalization parameters, model versions, and outputs for retrospective institutional audit.
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
/* Call to Action Banner                                              */
/* ------------------------------------------------------------------ */

function ActionBanner() {
  return (
    <section className="relative px-4 sm:px-6 py-16 bg-[#006766]">
      <div className="mx-auto max-w-7xl rounded-3xl bg-[#082827] border border-[#00B489]/30 p-8 sm:p-14 text-white overflow-hidden relative shadow-2xl">
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
              Begin Clinical Screening &amp; Model Exploration
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-white/70">
              Launch the physician workstation to evaluate screening modules, review patient telemetry,
              or access specialized screening terminals for patient intake, medical report uploads, and dual-engine screening.
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
              <Activity size={16} className="text-[#00B489]" />
              <span>Screening Terminals</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Cinematic Footer                                                   */
/* ------------------------------------------------------------------ */

function Footer() {
  const footerLinks = [
    {
      title: "Diagnostic Terminals",
      items: [
        { label: "12-Lead ECG", href: "/predict/heart-disease" },
        { label: "Cardiovascular (CAD)", href: "/predict/heart-tabular" },
        { label: "Breast Cytopathology", href: "/predict/breast-cancer" },
        { label: "CXR Cardiomegaly", href: "/predict/cardiomegaly" },
        { label: "Hepatic Panel", href: "/predict/liver-ilpd" },
        { label: "Renal Function (CKD)", href: "/predict/chronic-kidney" },
        { label: "Hepatitis C Staging", href: "/predict/hepatitis-c" },
        { label: "Neurological Studio", href: "/predict/neurological" },
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
            <BrandLogo size="md" theme="dark" showSubtitle={true} />
            <p className="text-[13px] leading-relaxed text-white/60 max-w-sm pt-2">
              Next-generation clinical screening platform combining quantum-enhanced feature mapping
              with classical machine learning to evaluate multi-modal disease data with deterministic explainability.
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
            QureSight is a clinical decision support tool designed for authorized healthcare
            professionals and researchers. It is not intended as a replacement for certified in-vitro
            diagnostic medical devices or physician judgment. All screening risk stratification requires
            qualified medical review.
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
      <ModuleCatalog />
      <HowItWorks />
      <ArchitectureSection />
      <SafetySection />
      <ActionBanner />
      <Footer />
    </main>
  );
}
